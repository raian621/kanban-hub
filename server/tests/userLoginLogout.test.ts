import { app, createServer } from '../src/app';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import { createUsers } from './mockUsers';

describe('User `create` API routes', () => {
  const OLD_ENV = process.env;
  let httpServer:http.Server;
  const prisma = new PrismaClient();

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

  test('Login a User', async() => {
    const user = (await createUsers(1, prisma))[0];
    
  });
});