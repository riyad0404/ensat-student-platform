import request from "supertest";
import app from "../src/app.js";

describe("GET /api/health", () => {
  it("should return ok + env=test", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.env).toBe("test");
  });
});
