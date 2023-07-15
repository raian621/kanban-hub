import { createUsers } from "./mockUsers";
import http from 'http';
import { PrismaClient } from "@prisma/client";
import request from 'supertest';
import { app, createServer } from "../src/app";

describe('User `read` API routes', () => {
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

  test('Get existing User', async() => {
    const user = (await createUsers(1, prisma))[0];
    try {
      const res = await request(httpServer)
        .get(`/users/${user.username}`);
  
      expect(res.statusCode).toBe(200);
      expect(res.body.firstName).toBe(user.firstName);
      expect(res.body.lastName).toBe(user.lastName);
      expect(res.body.email).toBe(user.email);
      expect(res.body.username).toBe(user.username);
      expect(res.body?.passhash).toBeUndefined();
    } finally {
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Get existing User (API proxy test /api/* -> /*)', async() => {
    const user = (await createUsers(1, prisma))[0];
    try {
      const res = await request(httpServer)
        .get(`/api/users/${user.username}`)
        .redirects(1);
  
      expect(res.statusCode).toBe(200);
      expect(res.body.firstName).toBe(user.firstName);
      expect(res.body.lastName).toBe(user.lastName);
      expect(res.body.email).toBe(user.email);
      expect(res.body.username).toBe(user.username);
      expect(res.body?.passhash).toBeUndefined();
    } finally {
      await prisma.user.delete({ where: { id: user.id }});
    }
  });
  
  test('Get nonexistent User', async() => {
    const res = await request(httpServer)
      .get('/users/jeff');
  
    expect(res.statusCode).toBe(204);
    expect(res.body?.firstName).toBeUndefined();
    expect(res.body?.lastName).toBeUndefined();
    expect(res.body?.email).toBeUndefined();
    expect(res.body?.username).toBeUndefined();
    expect(res.body?.passhash).toBeUndefined();
  });
});