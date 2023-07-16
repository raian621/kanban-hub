import request from 'supertest';
import { createFakeUserData, createUsers } from './mockUsers';
import createServer, { ServerKit } from '../src/createServer';
import cleanUpServer from './cleanUpServer';

describe('User `create` API routes', () => {
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

  afterAll(async() => {
    process.env = OLD_ENV;
  });


  test('Create new User', async () => {
    const { server, prisma } = serverKit;
    const userData = createFakeUserData();

    const res = await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ ...userData });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body?.firstName).toEqual(userData.firstName);
    expect(res.body?.lastName).toEqual(userData.lastName);
    expect(res.body?.email).toEqual(userData.email);
    expect(res.body?.username).toEqual(userData.username);

    // remove test user
    if (res.body?.userId)
      await prisma.user.delete({ where: { id: res.body.userId }});
  });


  test('Attempt to create existing User', async() => {
    const { server, prisma } = serverKit;
    const user = (await createUsers(1, prisma))[0];

    const res = await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ 
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        username:  user.username,
        password:  user.password
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
    const { server } = serverKit;
    // only provide a name
    const res = await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ 
        firstName: 'Bob'
      });

    expect(res.statusCode).toEqual(400);
  });
});