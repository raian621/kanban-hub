import { User } from "@prisma/client";
import createServer, { ServerKit } from "../src/createServer";
import cleanUpServer from "./cleanUpServer";
import { createFakeUserData, createUsers } from "./mockUsers";
import request from 'supertest';


describe('Resource CRUD API routes', () => {
  let serverKit:ServerKit;

  beforeEach(() => {
    jest.resetModules();
    serverKit = createServer('http');
  });

  afterEach(async() => {
    await cleanUpServer(serverKit);
  });

  test('Create new Card', async() => {
    const { server, prisma } = serverKit;
    const userData = (await createUsers(1, prisma))[0];
    // const body = {
    //   userId: userData.id,
    //   title: 'Title',
    //   description: 'Lorem ipsum',
    //   boardId, pipelineId
    // }
    // const res = await request(server);
  });
});