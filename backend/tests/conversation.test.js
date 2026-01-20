import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.js";
import { Conversation, ConversationMember, Message } from "../src/models/associations.js";
import bcrypt from "bcrypt";

describe("Conversation Integration", () => {
  let userA, userB, userC, tokenA, tokenB, tokenC;

  beforeEach(async () => {
    // Create users
    const password = await bcrypt.hash("Password123!", 10);
    userA = await User.create({ nom: "A", prenom: "A", email: "a@a.com", password, niveau: "3A", secretCode: 1 });
    userB = await User.create({ nom: "B", prenom: "B", email: "b@b.com", password, niveau: "3A", secretCode: 2 });
    userC = await User.create({ nom: "C", prenom: "C", email: "c@c.com", password, niveau: "3A", secretCode: 3 });
    // Login users
    const login = async (email) => {
      const res = await request(app).post("/api/auth/login").send({ email, password: "Password123!" });
      return res.headers["set-cookie"];
    };
    tokenA = await login("a@a.com");
    tokenB = await login("b@b.com");
    tokenC = await login("c@c.com");
  });

  it("creates and fetches a direct conversation", async () => {
    const res = await request(app)
      .post("/api/conversations/direct")
      .set("Cookie", tokenA)
      .send({ otherUserId: userB.iduser })
      .expect(201);
    expect(res.body.idconversation).toBeDefined();
    expect(res.body.type).toBe("DIRECT");
    // Fetch for both users
    const listA = await request(app).get("/api/conversations").set("Cookie", tokenA);
    const listB = await request(app).get("/api/conversations").set("Cookie", tokenB);
    expect(listA.body.length).toBe(1);
    expect(listB.body.length).toBe(1);
  });

  it("creates and fetches a group conversation", async () => {
    const res = await request(app)
      .post("/api/conversations/group")
      .set("Cookie", tokenA)
      .send({ name: "Test Group", memberIds: [userB.iduser, userC.iduser] })
      .expect(201);
    expect(res.body.idconversation).toBeDefined();
    // Fetch for all users
    const listA = await request(app).get("/api/conversations").set("Cookie", tokenA);
    const listB = await request(app).get("/api/conversations").set("Cookie", tokenB);
    const listC = await request(app).get("/api/conversations").set("Cookie", tokenC);
    expect(listA.body.length).toBe(1);
    expect(listB.body.length).toBe(1);
    expect(listC.body.length).toBe(1);
  });

  it("sends and fetches messages in a group", async () => {
    const group = await request(app)
      .post("/api/conversations/group")
      .set("Cookie", tokenA)
      .send({ name: "Test Group", memberIds: [userB.iduser] });
    const convId = group.body.idconversation;
    await request(app)
      .post(`/api/conversations/${convId}/messages`)
      .set("Cookie", tokenA)
      .send({ content: "Hello group!" })
      .expect(201);
    const msgs = await request(app)
      .get(`/api/conversations/${convId}/messages`)
      .set("Cookie", tokenB)
      .expect(200);
    expect(msgs.body.length).toBe(1);
    expect(msgs.body[0].content).toBe("Hello group!");
  });

  it("adds and removes a member", async () => {
    const group = await request(app)
      .post("/api/conversations/group")
      .set("Cookie", tokenA)
      .send({ name: "Test Group", memberIds: [userB.iduser] });
    const convId = group.body.idconversation;
    // Add userC
    await request(app)
      .post(`/api/conversations/${convId}/members`)
      .set("Cookie", tokenA)
      .send({ userId: userC.iduser })
      .expect(201);
    // Remove userB
    await request(app)
      .delete(`/api/conversations/${convId}/members/${userB.iduser}`)
      .set("Cookie", tokenA)
      .expect(200);
    // userB should not see the group
    const listB = await request(app).get("/api/conversations").set("Cookie", tokenB);
    expect(listB.body.length).toBe(0);
  });

  it("owner can transfer ownership", async () => {
    const group = await request(app)
      .post("/api/conversations/group")
      .set("Cookie", tokenA)
      .send({ name: "Test Group", memberIds: [userB.iduser] });
    const convId = group.body.idconversation;
    await request(app)
      .post(`/api/conversations/${convId}/transfer`)
      .set("Cookie", tokenA)
      .send({ newOwnerId: userB.iduser })
      .expect(200);
    // Now userB should be owner
    const member = await ConversationMember.findOne({ where: { idconversation: convId, iduser: userB.iduser } });
    expect(member.role).toBe("OWNER");
  });

  it("owner can delete group conversation", async () => {
    const group = await request(app)
      .post("/api/conversations/group")
      .set("Cookie", tokenA)
      .send({ name: "Test Group", memberIds: [userB.iduser] });
    const convId = group.body.idconversation;
    await request(app)
      .delete(`/api/conversations/${convId}`)
      .set("Cookie", tokenA)
      .expect(200);
    const conv = await Conversation.findByPk(convId);
    expect(conv).toBeNull();
  });

  it("can hide and unhide a conversation", async () => {
    const group = await request(app)
      .post("/api/conversations/group")
      .set("Cookie", tokenA)
      .send({ name: "Test Group", memberIds: [userB.iduser] });
    const convId = group.body.idconversation;
    await request(app)
      .post(`/api/conversations/${convId}/hide`)
      .set("Cookie", tokenA)
      .expect(200);
    // Fetch hidden conversations
    let listA = await request(app)
      .get("/api/conversations?includeHidden=true")
      .set("Cookie", tokenA);
    expect(listA.body[0].isHidden).toBe(true);
    await request(app)
      .post(`/api/conversations/${convId}/unhide`)
      .set("Cookie", tokenA)
      .expect(200);
    // Fetch again, should not be hidden
    listA = await request(app)
      .get("/api/conversations?includeHidden=true")
      .set("Cookie", tokenA);
    expect(listA.body[0].isHidden).toBe(false);
  });

  it("can mark conversation as read", async () => {
    const group = await request(app)
      .post("/api/conversations/group")
      .set("Cookie", tokenA)
      .send({ name: "Test Group", memberIds: [userB.iduser] });
    const convId = group.body.idconversation;
    await request(app)
      .post(`/api/conversations/${convId}/messages`)
      .set("Cookie", tokenB)
      .send({ content: "Hi!" });
    await request(app)
      .post(`/api/conversations/${convId}/read`)
      .set("Cookie", tokenA)
      .expect(200);
    const member = await ConversationMember.findOne({ where: { idconversation: convId, iduser: userA.iduser } });
    expect(member.lastReadAt).not.toBeNull();
  });
});
