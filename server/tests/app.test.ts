import request from "supertest";
import { server } from "../src/app";

describe("API online test", () => {
  test("API should be online", async () => {
    const res = await request(server).get('/api');
    expect(res.body).toEqual("Hello World");
    expect(res.statusCode).toEqual(200);
  });
});