import request from "supertest";
import app from "../src/app.js";
// ...existing code...
import { Conversation, ConversationMember, Message, User } from "../src/models/associations.js";
import bcrypt from "bcrypt";

// Helper to create a user
async function createUser(email, nom = "Test", prenom = "User", password = "Test123!", niveau = "3A", secretCode = 1234) {
  const hashed = await bcrypt.hash(password, 10);
  return User.create({ nom, prenom, email, password: hashed, niveau, secretCode });
}

describe("Conversation Controller Unit", () => {
  let userA, userB, tokenA;
  beforeAll(async () => {
    await User.destroy({ where: { email: ["convA@example.com", "convB@example.com"] } });
    userA = await createUser("convA@example.com");
    userB = await createUser("convB@example.com");
  });
  afterAll(async () => {
    await User.destroy({ where: { email: ["convA@example.com", "convB@example.com"] } });
    await Conversation.destroy({ where: {} });
    await ConversationMember.destroy({ where: {} });
    await Message.destroy({ where: {} });
  });

  // Helper to login and get cookie
  async function loginAndGetCookie(email, password = "Test123!") {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    return res.headers["set-cookie"];
  }

  beforeEach(async () => {
    // Ensure users exist before each test
    const existingA = await User.findOne({ where: { email: "convA@example.com" } });
    if (!existingA) await createUser("convA@example.com");
    const existingB = await User.findOne({ where: { email: "convB@example.com" } });
    if (!existingB) await createUser("convB@example.com");
    // Login and get cookie
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "convA@example.com", password: "Test123!" });
    if (res.status !== 200) throw new Error(`Login failed: ${res.status} ${res.text}`);
    tokenA = res.headers["set-cookie"];
  });

  it("should create or get a direct conversation", async () => {
    const res = await request(app)
      .post("/api/conversations/direct")
      .set("Cookie", tokenA)
      .send({ otherUserId: userB.iduser })
      .expect(201);
    expect(res.body.type).toBe("DIRECT");
    expect(res.body.idconversation).toBeDefined();
    // Fetch conversation to verify members
    const convRes = await request(app)
      .get(`/api/conversations/${res.body.idconversation}`)
      .set("Cookie", tokenA)
      .expect(200);
    expect(convRes.body.members.length).toBe(2);
  });

  it("should create a group conversation", async () => {
    const res = await request(app)
      .post("/api/conversations/group")
      .set("Cookie", tokenA)
      .send({ name: "Test Group", memberIds: [userA.iduser, userB.iduser] })
      .expect(201);
    expect(res.body.type).toBe("GROUP");
    expect(res.body.idconversation).toBeDefined();
    // Fetch conversation to verify members
    const convRes = await request(app)
      .get(`/api/conversations/${res.body.idconversation}`)
      .set("Cookie", tokenA)
      .expect(200);
    expect(convRes.body.members.length).toBe(2);
  });

  it("should list my conversations", async () => {
    const res = await request(app)
      .get("/api/conversations")
      .set("Cookie", tokenA)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should send and fetch messages in a conversation", async () => {
    // Create direct conversation
    const convRes = await request(app)
      .post("/api/conversations/direct")
      .set("Cookie", tokenA)
      .send({ otherUserId: userB.iduser });
    const convId = convRes.body.idconversation;
    // Send a message
    await request(app)
      .post(`/api/conversations/${convId}/messages`)
      .set("Cookie", tokenA)
      .send({ content: "Hello!" })
      .expect(201);
    // Fetch messages
    const msgRes = await request(app)
      .get(`/api/conversations/${convId}/messages`)
      .set("Cookie", tokenA)
      .expect(200);
    expect(Array.isArray(msgRes.body)).toBe(true);
    expect(msgRes.body.length).toBeGreaterThan(0);
  });
});
