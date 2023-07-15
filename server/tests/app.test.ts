import request from 'supertest';
import http from 'http';
import https from 'https';
import { PrismaClient } from '@prisma/client';
import { app, createServer } from '../src/app';

describe('API routes test', () => {
  const OLD_ENV = process.env;
  let httpServer:http.Server;
  const prisma = new PrismaClient();
  // const prisma = new PrismaClient({
  //   log: [
  //     {
  //       emit: "event",
  //       level: "query",
  //     },
  //   ],
  // });
  
  // prisma.$on("query", async (e) => {
  //   console.log(`${e.query} ${e.params}`);
  // });

  beforeEach(() => {
    // ensure we use HTTP for these tests
    jest.resetModules(); // clears cache?
    process.env = { 
      ...OLD_ENV,
      HTTPS: 'false'
    };
    httpServer = createServer(app, 'http') as http.Server;
  });
  
  afterAll(() => {
    process.env = OLD_ENV;
    prisma.$disconnect();
  });

  test('API should be online', async () => {
    const res = await request(httpServer).get('/');
    expect(res.body).toEqual('The API is live!');
    expect(res.statusCode).toEqual(200);
  });
});

describe('API HTTPS test', () => {
  const OLD_ENV = process.env;
  let httpsServer:https.Server;
  
  beforeAll(() => {
    jest.resetModules(); // clears cache?
  });

  beforeEach(() => {
    jest.resetModules(); // clears cache?
    process.env = { 
      ...OLD_ENV,
      HTTPS: 'true',
      SSL_CRT_PATH: 'certs/selfsigned.crt',
      SSL_KEY_PATH: 'certs/selfsigned.key'
    };
    httpsServer = createServer(app, 'https') as https.Server;
  });
  
  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('API should be able to use HTTPS', async() => {
    const res = await request(httpsServer).get('/').trustLocalhost();
    expect(res.statusCode).toEqual(200);
  });
});