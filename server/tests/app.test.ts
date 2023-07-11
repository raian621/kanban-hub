import request from 'supertest';
import http from 'http';
import https from 'https';
import { createServer } from '../src/app';
import { PrismaClient, User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { 
  hash as argonHash, 
  verify as argonVerify 
} from 'argon2';

type TestUser = {
  id: number,
  firstName:string,
  lastName:string,
  email:string,
  username:string,
  password:string,
  passhash: string
}

describe('API routes test', () => {
  const OLD_ENV = process.env;
  let httpServer:http.Server;
  const prismaLog = []
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

  function fakeUserData() {
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const username = faker.internet.userName({ firstName, lastName });
    const password = faker.internet.password();

    return { firstName, lastName, email, username, password };
  }

  async function createUsers(numUsers:number): Promise<TestUser[]> {
    const users:TestUser[] = [];

    for (let i = 0; i < numUsers; i++) {
      const { firstName, lastName, email, username, password } = fakeUserData();
      const passhash = await argonHash(password);

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          username,
          passhash
        }
      });

      users.push({ 
        id: user.id, firstName, lastName, email, username, password, passhash
      });
    }
    return users;
  }

  beforeEach(() => {
    // ensure we use HTTP for these tests
    jest.resetModules(); // clears cache?
    process.env = { 
      ...OLD_ENV,
      HTTPS: 'false'
    };
    httpServer = createServer() as http.Server;
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

  test('Create new User', async () => {
    const userData = fakeUserData();

    const res = await request(httpServer)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ ...userData });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body?.firstName).toEqual(userData.firstName);
    expect(res.body?.lastName).toEqual(userData.lastName);
    expect(res.body?.email).toEqual(userData.email);
    expect(res.body?.username).toEqual(userData.username);

    console.log("user object returned by server:");
    console.log(res.body);

    // remove test user
    if (res.body?.id) {
      await prisma.user.delete({
        where: {
          id: res.body.id
        }
      });
    }
  });

  test('Attempt to create existing User', async() => {
    const user = (await createUsers(1))[0];

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

describe('API HTTPS test', () => {
  const OLD_ENV = process.env;
  let httpsServer:https.Server;
  
  beforeAll(() => {
    jest.resetModules(); // clears cache?
  })

  beforeEach(() => {
    jest.resetModules(); // clears cache?
    process.env = { 
      ...OLD_ENV,
      HTTPS: 'true',
      SSL_CRT_PATH: 'certs/selfsigned.crt',
      SSL_KEY_PATH: 'certs/selfsigned.key'
    };
    httpsServer = createServer() as https.Server;
  });
  
  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('API should be able to use HTTPS', async() => {
    const res = await request(httpsServer).get('/').trustLocalhost();
    expect(res.statusCode).toEqual(200);
  });
});