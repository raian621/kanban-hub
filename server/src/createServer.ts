import { readFileSync } from 'fs';
import https from 'https';
import http from 'http';
import express, { Express } from 'express';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import helmet from 'helmet';
import useRoutes from './routes';

type ServerKit = {
  app: Express, 
  server: http.Server|https.Server, 
  prisma: PrismaClient, 
  prismaSessionStore: PrismaSessionStore
};

export default function createServer(serverProtocol:string): ServerKit {
  const app = express();

  let server:https.Server|http.Server|undefined = undefined;
  if (serverProtocol === 'https') {
    const key = readFileSync(process.env.SSL_KEY_PATH as string);
    const cert = readFileSync(process.env.SSL_CRT_PATH as string);
    const options = {
      key: key,
      cert: cert
    };
    server = https.createServer(options, app);
  } else if (serverProtocol === 'http') {
    server = http.createServer({}, app);
  }

  const prisma = new PrismaClient();
  const prismaSessionStore = new PrismaSessionStore(prisma, {
    checkPeriod: 1000,
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  });

  app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: true,
    saveUninitialized: false,
    rolling: true,
    store: prismaSessionStore,
    cookie: {
      path: '/',
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 5,
      secure: 'auto',
      sameSite: true
    }
  }));

  app.use(helmet());
  app.use(cors({
    origin: 'https://localhost:3000',
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.disable('x-powered-by');

  useRoutes(app, prisma);

  return { 
    app, 
    server: server as http.Server|https.Server, 
    prisma, 
    prismaSessionStore
  };
}

export type { ServerKit };