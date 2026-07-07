import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    email: string;
    iat: number;
    exp: number;
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Read token from cookies instead of Authorization header
  const token = (req as any).cookies?.admin_token;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const generateToken = (email: string) => {
  const expiresIn = process.env.JWT_EXPIRY || "30d";
  return jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn } as any);
};
