import request from "supertest";
import app from "../src/app";

describe("API online test", () => {
  test("API should be online", async () => {
    const res = await request(app).get('/api');
    expect(res.body).toEqual("Hello World")
    expect(res.statusCode).toEqual(200)
  })
})