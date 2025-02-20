import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { prisma } from "../db";
import createHttpError from 'http-errors'
import { redisUserExists } from "../utils/redisHelper";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticate = async (req : AuthenticatedRequest, res: Response, next : NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(createHttpError[401]('Not validated'))
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    //find user in redis
    const userExists = await redisUserExists(decoded.userId)
    if(userExists){
      req.userId = decoded.userId
      next();
      return
    }
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId || ''
      }
    });
    if (!user) {
      return next(createHttpError[404]('User Not Found'))
    }
    req.userId = decoded.userId
    next();
  } catch (error){
    return next(createHttpError[403]('Invalid token'))
  }
};
