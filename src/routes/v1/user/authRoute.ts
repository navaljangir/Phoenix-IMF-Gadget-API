import { Router } from "express";
import bcrypt from 'bcrypt'
import { prisma } from "../../../db";
import jwt from 'jsonwebtoken'
import { addUser } from "../../../utils/redisHelper";
const router = Router();

router.post('/register' , async(req , res , next)=>{
  const JWT_SECRET = process.env.JWT_SECRET || 'YOURTOPSECRETPASSWORD';
    console.log(req.ip)
    try {
        const { email, password } = req.body;
        console.log(email)
        const hashedPassword = await bcrypt.hash(password, 10);
        const userExists = await prisma.user.findUnique({
          where : {
            email : email
          }
        })
        if(userExists){
          res.status(409).json({
            message : 'User already exists'
          })
          return
        }
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword
          }
        });
    
        res.status(200).json({ id: user.id, email: user.email });
      } catch (error) {
        next(error);
      }
})

router.post('/login' , async(req , res , next ) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: {email}});

      if (!user || !(await bcrypt.compare(password, user.password))) {
         res.status(401).json({ message: 'Invalid credentials' });
         return
      }
  
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '10d' }
      );  
      const key = 'active_users'
      await addUser(key , user.id)
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  });
  
  export default router;