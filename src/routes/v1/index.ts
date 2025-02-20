import { Router } from "express";
import authRouter from "./user/authRoute";
import gadgetRouter from "./gadgets/gadgetRouter";
const router = Router();

router.use('/user', authRouter);
router.use('/gadgets' , gadgetRouter)
export default router