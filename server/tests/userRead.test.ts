import { createUsers } from "./mockUsers";
import http from 'http';
import request from 'supertest';
import createServer, { ServerKit } from "../src/createServer";
import cleanUpServer from "./cleanUpServer";

describe('User `read` API routes', () => {
  const OLD_ENV = process.env;
  let serverKit:ServerKit;

  beforeEach(() => {
    // ensure we use HTTP for these tests
    jest.resetModules(); // clears cache?
    process.env = { 
      ...OLD_ENV,
      HTTPS: 'false'
    };
    serverKit = createServer('http');
  });
  
  afterEach(async() => {
    await cleanUpServer(serverKit);
  })

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('Get existing User', async() => {
    const { server, prisma } = serverKit;
    const user = (await createUsers(1, prisma))[0];
    try {
      const res = await request(server)
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
    const { server, prisma } = serverKit;
    const user = (await createUsers(1, prisma))[0];
    try {
      const res = await request(server)
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
    const { server } = serverKit;
    const res = await request(server)
      .get('/users/jeff');
  
    expect(res.statusCode).toBe(204);
    expect(res.body?.firstName).toBeUndefined();
    expect(res.body?.lastName).toBeUndefined();
    expect(res.body?.email).toBeUndefined();
    expect(res.body?.username).toBeUndefined();
    expect(res.body?.passhash).toBeUndefined();
  });
});