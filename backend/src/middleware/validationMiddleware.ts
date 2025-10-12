import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateData = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error 
      });
    }
  };
};