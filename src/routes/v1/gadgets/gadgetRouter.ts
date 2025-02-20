import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../../db";
import { GadgetStatus, Prisma } from "@prisma/client";
import {
  addKey,
  deleteGadgetCache,
  getData,
  getUniqueName,
} from "../../../utils/redisHelper";
import {
  authenticate,
  AuthenticatedRequest,
} from "../../../middleware/authMiddleware";
import createHttpError from "http-errors";
import z from "zod";
import { idSchema, updateGadgetBodySchema } from "./schema";
import { GadgetsType } from "./type";
const router = Router();

// Helper for handling Prisma errors
const handlePrismaError = (error: unknown, next: NextFunction) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025":
        return next(createHttpError.NotFound("Record not found"));
      case "P2002":
        return next(createHttpError.Conflict("Unique constraint violation"));
      default:
        return next(createHttpError(500, "Database error occurred"));
    }
  }
  next(error);
};

// Adding the succcess probability
function addSuccessProbability(gadgets: GadgetsType[]) {
  return gadgets.map((gadget) => ({
    ...gadget,
    missionSuccessProbability: Math.floor(Math.random() * 100) + 1,
  }));
}

router.get(
  "/",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query;
      // Validate status parameter
      if (
        status &&
        !Object.values(GadgetStatus).includes(status as GadgetStatus)
      ) {
        return next(createHttpError.BadRequest("Invalid status parameter"));
      }

      //Getting the all the gadgets from redis
      const cacheKey = status ? `gadgets:${status}` : "gadgets";

      const cachedData = await getData(cacheKey);
      if (cachedData) {
        const gadgets = JSON.parse(cachedData);
        res.json(addSuccessProbability(gadgets));
        return;
      }
      const gadgets = await prisma.gadget.findMany({
        where: status ? { status: status as GadgetStatus } : undefined,
      });
      await addKey("gadgets", JSON.stringify(gadgets));
      const response = addSuccessProbability(gadgets);

      res.status(200).json(response);
    } catch (error) {
      handlePrismaError(error, next);
    }
  }
);

router.post(
  "/",
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const codename = await getUniqueName();
      const gadget = await prisma.gadget.create({
        data: {
          userId: req.userId!,
          codename,
          status: "Available",
        },
      }); 
      await deleteGadgetCache();
      res.status(201).json(gadget);
    } catch (error) {
      handlePrismaError(error, next);
    }
  }
);

router.patch(
  "/:id",
  authenticate, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const validationErrors = idSchema.safeParse(id);

      // Parsing the id
      if (!validationErrors.success) {
        return next(
          createHttpError.BadRequest(validationErrors.error?.errors[0].message)
        );
      }

      //Validating the body
      const validateBody = updateGadgetBodySchema.safeParse(body);
      console.log("validate body", validateBody);
      if (!validateBody.success) {
        return next(
          createHttpError.BadRequest(validateBody.error?.errors[0].message)
        );
      }
      const gadget = await prisma.gadget.update({
        where: { id },
        data: req.body,
      });
      await deleteGadgetCache();

      if (!gadget) {
        return next(createHttpError.NotFound("Gadget not found"));
      }

      res.json(gadget);
    } catch (error) {
      handlePrismaError(error, next);
    }
  }
);

// Deleting : Overriding the status
router.delete(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const existingGadget = await prisma.gadget.findUnique({
        where: { id },
      });

      if (!existingGadget) {
        return next(createHttpError.NotFound("Gadget not found"));
      }

      if (existingGadget.status === "Decommissioned") {
        return next(
          createHttpError.BadRequest("Gadget already decommissioned")
        );
      }

      const gadget = await prisma.gadget.update({
        where: { id },
        data: {
          status: "Decommissioned",
          decommissionedAt: new Date(),
        },
      });

      res.json(gadget);
    } catch (error) {
      handlePrismaError(error, next);
    }
  }
);

// Central error handler
router.use(
  (error: unknown, req: Request, res: Response, next: NextFunction) => {
    if (createHttpError.isHttpError(error)) {
      res.status(error.statusCode).json({
        error: {
          message: error.message,
        },
      });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({
        error: {
          message: "Internal Server Error",
        },
      });
    }
  }
);

export default router;
