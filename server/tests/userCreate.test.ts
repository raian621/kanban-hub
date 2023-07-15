import { createServer, app } from '../src/app';
import { PrismaClient } from '@prisma/client';
import http from 'http';
import request from 'supertest';
import { createFakeUserData, createUsers } from './mockUsers';

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
  
  afterAll(async() => {
    process.env = OLD_ENV;
    await prisma.$disconnect();
  });

  test('Create new User', async () => {
    const userData = createFakeUserData();

    const res = await request(httpServer)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ ...userData });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body?.firstName).toEqual(userData.firstName);
    expect(res.body?.lastName).toEqual(userData.lastName);
    expect(res.body?.email).toEqual(userData.email);
    expect(res.body?.username).toEqual(userData.username);

    console.log(res.body);

    // remove test user
    if (res.body?.userId)
      await prisma.user.delete({ where: { id: res.body.userId }});
  });

  test('Attempt to create existing User', async() => {
    const user = (await createUsers(1, prisma))[0];

    const res = await request(httpServer)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ 
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        password: user.password
      });
    try {
      expect(res.statusCode).toEqual(204);
      expect(res.body?.firstName).toBeUndefined();
      expect(res.body?.lastName).toBeUndefined();
      expect(res.body?.email).toBeUndefined();
      expect(res.body?.username).toBeUndefined();
      expect(res.body?.password).toBeUndefined();
    } finally {
      // remove test users
      if (res.body?.id) {
        await prisma.user.delete({
          where: { id: res.body.id }
        });
      }
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Missing data for User creation', async() => {
    // only provide a name
    const res = await request(httpServer)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ 
        firstName: 'Bob'
      });

    expect(res.statusCode).toEqual(400);
  });
});