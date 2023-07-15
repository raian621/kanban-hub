import { app, createServer } from '../src/app';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import http from 'http';
import { createUsers } from './mockUsers';

describe('Login and logout routes', () => {
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
    let res = await request(httpServer).post('/users/login').send({});
    expect(res.statusCode).toBe(400);

    res = await request(httpServer).post('/users/login').send({
      username: user.username,
      password: user.password + '1'
    });
    expect(res.statusCode).toBe(400);

    res = await request(httpServer).post('/users/login').send({
      username: user.username,
      password: user.password
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers).toHaveProperty('set-cookie');
    expect(res.headers['set-cookie'][0]).toMatch(/^connect\.sid=.*/);

    console.log(res.body);

    await prisma.user.delete({ where: { id: user.id }});
    await prisma.session.delete({ where: { id: res.body?.sessionId }});
  });

  test('Get a User\'s pertinent information', async() => {
    // const agent = request.agent(httpServer).post('set-cookie')
    console.log('THis test isn\'t implemented yet');
  });
});