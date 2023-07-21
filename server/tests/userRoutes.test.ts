import { createFakeUserData, createUsers } from "./mockUsers";
import request from 'supertest';
import createServer, { ServerKit } from "../src/createServer";
import cleanUpServer from "./cleanUpServer";


// =====================================
//        CREATE USER API TESTS
// =====================================
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
  });

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

// =====================================
//        READ USER API TESTS
// =====================================
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
  });

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


// =====================================
//        USER AUTH API TESTS
// =====================================
describe('Login and logout routes', () => {
  const OLD_ENV = process.env;
  let serverKit:ServerKit;

  beforeEach(() => {
    // ensure we use HTTP for these tests (setting up HTTPS for testing would
    // be a nightmare)
    jest.resetModules(); // clears cache?
    process.env = {
      ...OLD_ENV,
      HTTPS: 'false'
    };
    serverKit = createServer('http');
  });
  
  afterEach(async() => {
    await cleanUpServer(serverKit);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('Login a User', async() => {
    const { server, prisma } = serverKit;
    const user = (await createUsers(1, prisma))[0];
    let res = await request(server).post('/users/login').send({});
    expect(res.statusCode).toBe(400);

    res = await request(server).post('/users/login').send({
      username: user.username,
      password: user.password + '1'
    });
    expect(res.statusCode).toBe(400);

    res = await request(server).post('/users/login').send({
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

  test('Log out user', async() => {
    const { server, prisma } = serverKit;
    const user = (await createUsers(1, prisma))[0];
    
    try {
      // unauthenicated log out
      const agent = request.agent(server);
      let res = await agent.post('/users/logout');
      expect(res.statusCode).toBe(404);

      // authenticated log out
      res = await agent.post('/users/login')
        .set('Content-Type', 'application/json')
        .send({
          username: user.username,
          password: user.password
        });

      expect(res.statusCode).toBe(200);
      res = await agent.post('/users/logout');
      expect(res.statusCode).toBe(200);
    } finally {
      await prisma.user.delete({ where: { id: user.id }});
    }
  });

  test('Get a User\'s pertinent information', async() => {
    const { server, prisma } = serverKit;
    const user = (await createUsers(1, prisma))[0];
    const agent = request.agent(server);

    // unauthenticated call
    let res = await agent.get('/users');
    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});

    res = await agent.post('/users/login').send({
      username: user.username,
      password: user.password
    });
  
    // authenticated call
    res = await agent.get('/users');
    console.log(res.body);
    expect(res.statusCode).toBe(200);

    await prisma.user.delete({ where: { id: user.id }});
    await prisma.session.delete({ where: { id: res.body?.sessionId }});
  });
});

// =====================================
//        USER DELETE API TESTS
// =====================================
describe('Given the user exists', () => {
  const OLD_ENV = process.env;
  let serverKit:ServerKit;

  beforeEach(() => {
    // ensure we use HTTP for these tests (setting up HTTPS for testing would
    // be a nightmare)
    jest.resetModules(); // clears cache?
    process.env = {
      ...OLD_ENV,
      HTTPS: 'false'
    };
    serverKit = createServer('http');
  });
  
  afterEach(async() => {
    await cleanUpServer(serverKit);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });


  test('Try to delete the user without valid authentication', async() => {
    const { prisma, server } = serverKit;
    const user = (await createUsers(1, prisma))[0];
    try {
      const res = await request(server).delete('/users');
      expect(res.statusCode).toBe(401);
    } finally {
      await prisma.user.delete({ where: { id: user.id }})
    }
  });

  test('Delete the user with proper authentication', async() => {
    const { prisma, server } = serverKit;
    const user = (await createUsers(1, prisma))[0];
    let deleteSuccess = false;
    try {
      const agent = request.agent(server);
      let res = await agent.post('/users/login')
        .send({
          username: user.username,
          password: user.password
        });
      expect(res.statusCode).toBe(200);
      expect(res.header).toHaveProperty('set-cookie');
      res = await agent.delete('/users');
      expect(res.statusCode).toBe(200);
      if (await prisma.user.count({ where: { id: user.id }}) === 0)
        deleteSuccess = true;
    } finally {
      // if user wasn't deleted, make sure to delete it to clean up
      if (!deleteSuccess)
        await prisma.user.delete({ where: { id: user.id }})
    }
  });
});