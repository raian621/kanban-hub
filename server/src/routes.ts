import { Express, NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import useUserRoutes from "./userRoutes";

export default function useRoutes(app:Express, prisma:PrismaClient) {
  useUserRoutes(app, prisma);

  /**
   * ROUTE: [ANY] /
   * -------------------------
   * Base route for API
   * 
   * - Just used to check if the API is online
   */
  app.all('/', (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'application/json');
    res.json('The API is live!');
    next();
  });

  /**
   * ROUTE: [ANY] /api
   * ----------------------------
   * Proxy for the API; /api -> /
   */
  app.all('/api', (req: Request, res: Response, next: NextFunction) => {
    res.redirect('/');
    next();
    return;
  });

  /**
   * ROUTE: [ANY] /api/*
   * ----------------------------
   * Proxy for the API; /api/% -> /%
   * 
   * - Any following route in this file should be able to be prefixed with
   * `/api` and be proxied toward the proper route.
   */
  app.all('/api/*', (req: Request, res: Response, next: NextFunction) => {
    res.redirect(req.url.replace(/^\/api\//, '/'));
    next();
    return;
  });
}