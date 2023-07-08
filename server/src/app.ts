import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import fs from 'fs';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(helmet());
app.disable('x-powered-by');

let server:https.Server|http.Server;
let serverProtocol:string;
if (process.env.HTTPS === 'true') {
  const key = fs.readFileSync(process.env.SSL_KEY_PATH as string);
  const cert = fs.readFileSync(process.env.SSL_CRT_PATH as string);
  const options = {
    key: key,
    cert: cert
  };
  server = https.createServer(options, app);
  serverProtocol = 'https';
} else {
  server = http.createServer({}, app);
  serverProtocol = 'http';
}

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify('The API is live!'));
  next();
});

export { server, serverProtocol };