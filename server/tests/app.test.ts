import request from 'supertest';
import createServer, { ServerKit } from '../src/createServer';
import cleanUpServer from './cleanUpServer';

describe('API routes test', () => {
  const OLD_ENV = process.env;
  let serverKit:ServerKit;

  beforeEach(() => {
    // ensure we use HTTP for these tests
    jest.resetModules(); // clears cache?
    serverKit = createServer('http');
  });
  
  afterEach(async() => {
    await cleanUpServer(serverKit);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('API should be online', async () => {
    const { server } = serverKit;
    const res = await request(server).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('The API is live!');
    return;
  });

  test ('Requests to /api route should be proxied to / route', async() => {
    const { server } = serverKit;
    const res = await request(server).get('/api').redirects(1);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('The API is live!');
    return;
  });
});

describe('API HTTPS test', () => {
  const OLD_ENV = process.env;
  let serverKit:ServerKit;
  
  beforeAll(() => {
    jest.resetModules(); // clears cache?
  });

  beforeEach(() => {
    jest.resetModules(); // clears cache?
    process.env = { 
      ...OLD_ENV,
      HTTPS: 'true',
      SSL_CRT_PATH: 'certs/selfsigned.crt',
      SSL_KEY_PATH: 'certs/selfsigned.key'
    };
    serverKit = createServer('https');
  });
  
  afterAll(async() => {
    process.env = OLD_ENV;
    await cleanUpServer(serverKit);
  });

  test('API should be able to use HTTPS', async() => {
    const { server } = serverKit;
    const res = await request(server).get('/').trustLocalhost();
    expect(res.statusCode).toEqual(200);
  });
});