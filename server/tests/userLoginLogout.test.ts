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
    // ensure we use HTTP for these tests (setting up HTTPS for testing would
    // be a nightmare)
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

    await prisma.user.delete({ where: { id: user.id }});
    await prisma.session.delete({ where: { id: res.body?.sessionId }});
    return;
  });

  // test('Log out user', async() => {
  //   const user = (await createUsers(1, prisma))[0];
  //   let sessionId = '';
  //   try {
  //     // unauthenicated log out
  //     const agent = request.agent(httpServer);
  //     let res = await agent.post('/users/logout');
  //     expect(res.statusCode).toBe(404);

  //     // authenticated log out
  //     res = await agent.post('/users/login')
  //       .set('Content-Type', 'application/json')
  //       .send({
  //         username: user.username,
  //         password: user.password
  //       });
  //     sessionId = res.body.sessionId;
  //     expect(res.statusCode).toBe(200);
  //     res = await agent.post('/users/logout');
  //     expect(res.statusCode).toBe(200);
  //   } finally {
  //     await prisma.user.delete({ where: { id: user.id }});
  //   }
  // });

  // test('Get a User\'s pertinent information', async() => {
  //   const user = (await createUsers(1, prisma))[0];
  //   const agent = request.agent(httpServer);

  //   // unauthenticated call
  //   let res = await agent.get('/users');
  //   expect(res.statusCode).toBe(204);
  //   expect(res.body).toEqual({});

  //   res = await agent.post('/users/login').send({
  //     username: user.username,
  //     password: user.password
  //   });
  
  //   // authenticated call
  //   res = await agent.get('/users');
  //   console.log(res.body);
  //   expect(res.statusCode).toBe(200);

  //   await prisma.user.delete({ where: { id: user.id }});
  //   await prisma.session.delete({ where: { id: res.body?.sessionId }});
  // });
});