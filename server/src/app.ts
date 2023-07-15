import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import createServer from './createServer';
import userRoutes from './userRoutes';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(helmet());
app.use(cors({
  origin: 'https://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');

const sessionStore = new PrismaSessionStore(prisma, {
  checkPeriod: 1000,
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});

app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: true,
  saveUninitialized: false,
  rolling: true,
  store: sessionStore,
  cookie: {
    path: '/',
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 5,
    secure: 'auto',
    sameSite: true
  }
}));

app.use('/users', userRoutes);
// app.use('/workspaces', workspaceRoutes);
// app.use('/boards', boardRoutes);

const serverProtocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const server = createServer(app, serverProtocol);

/**
 * ROUTE: [ANY] /
 * -------------------------
 * Base route for API
 * 
 * - Just used to check if the API is online
 */
app.all('/', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify('The API is live!'));
  next();
});

/**
 * ROUTE: [ANY] /api
 * ----------------------------
 * Proxy for the API; /api -> /
 */
app.all('/api', (req: Request, res: Response, next: NextFunction) => {
  res.redirect('/');
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
});

export { server, serverProtocol, createServer, app, prisma };