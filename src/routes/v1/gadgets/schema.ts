import z from "zod";

export const idSchema = z.string().min(5 , {message : 'Enter a valid id'})

export const updateGadgetBodySchema=  z.object({
    status : z.enum(['Available' , 'Deployed' , 'Destroyed' , 'Decommissioned']).optional()
}).strict()

