import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { readFileSync } from 'fs';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';
import { prisma } from './prismaClient';
import { 
  hash as argonHash, 
  verify as argonVerfiy 
} from 'argon2';

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.json());
app.disable('x-powered-by');

let serverProtocol:string;

function createServer():https.Server|http.Server {
  let server:https.Server|http.Server;
  if (process.env.HTTPS === 'true') {
    const key = readFileSync(process.env.SSL_KEY_PATH as string);
    const cert = readFileSync(process.env.SSL_CRT_PATH as string);
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
  return server;
}
const server = createServer();

app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify('The API is live!'));
  next();
});

app.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');

  const firstName = req.body?.firstName;
  const lastName =  req.body?.lastName;
  const email =     req.body?.email;
  const username =  req.body?.username;
  const password =  req.body?.password;
  
  // if any of the required data is missing, return a 400 status
  if (
    firstName === undefined ||
    lastName === undefined ||
    email === undefined ||
    username === undefined ||
    password === undefined
  ) {
    res.status(400).end();
    next();
    return;
  }

  console.log(password);
  const passhash = await argonHash(password);

  try {
    const user = await prisma.user.create({data: {
      firstName, lastName, email, username, passhash
    }});
    res.status(201).json({
      username:  user.username,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email
    });
  } catch(e) {
    // console.error((e as Error).message);
    res.status(204).end();
  }
  next();
});

app.get('/users/:username', async(req: Request, res: Response) => {
  const username = req.params.username;
  
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: { username: username }
    });

    return res.status(200).json({
      username:  user.username,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email
    });
  } catch (e) {
    console.error((e as Error).message);
    return res.status(204).end();
  }
});

export { server, serverProtocol, createServer };