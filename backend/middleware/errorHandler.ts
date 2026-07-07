import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[${status}] ${message}`);

  res.status(status).json({
    error: message,
    status,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    status: 404,
  });
};
