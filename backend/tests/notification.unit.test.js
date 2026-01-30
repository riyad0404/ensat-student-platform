import request from "supertest";
import app from "../src/app.js";
import { User, Post, Comment } from "../src/models/associations.js";
import { Notification } from "../src/models/notification.js";
import bcrypt from "bcrypt";

describe("Notification Controller Unit", () => {
  let user, user2, token, token2, post, comment, notificationId;
  beforeEach(async () => {
    await Notification.destroy({ where: {} });
    await Comment.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await User.destroy({ where: { email: ["notifuser@example.com", "notifuser2@example.com"] } });
    user = await User.create({ nom: "Notif", prenom: "User", email: "notifuser@example.com", password: await bcrypt.hash("Test123!", 10), niveau: "3A", secretCode: 1234 });
    user2 = await User.create({ nom: "Notif2", prenom: "User2", email: "notifuser2@example.com", password: await bcrypt.hash("Test123!", 10), niveau: "3A", secretCode: 1234 });
    // Login both users
    const res1 = await request(app)
      .post("/api/auth/login")
      .send({ email: "notifuser@example.com", password: "Test123!" });
    token = res1.headers["set-cookie"];
    const res2 = await request(app)
      .post("/api/auth/login")
      .send({ email: "notifuser2@example.com", password: "Test123!" });
    token2 = res2.headers["set-cookie"];
    // Create a post and comment by user2
    const postRes = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", token2)
      .send({ contenu: "Post for notif", typeContenu: "TEXTE" });
    post = postRes.body.post;
    const commentRes = await request(app)
      .post("/api/comments")
      .set("Cookie", token2)
      .send({ idpost: post.idpost, contenu: "Comment for notif", isAnonymat: false });
    comment = commentRes.body;
    notificationId = undefined;
  });
  afterAll(async () => {
    await Notification.destroy({ where: {} });
    await Comment.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await User.destroy({ where: { email: ["notifuser@example.com", "notifuser2@example.com"] } });
  });

  it("should create a like post notification", async () => {
    const res = await request(app)
      .post(`/api/notifications/like/${post.idpost}`)
      .set("Cookie", token)
      .send({ typeReaction: "LIKE" })
      .expect(200);
    expect(res.body.type).toBeDefined();
    expect(res.body.type).toMatch(/REACTION_PUB/);
  });

  it("should create a comment post notification", async () => {
    const res = await request(app)
      .post(`/api/notifications/comment/${post.idpost}`)
      .set("Cookie", token)
      .send({ idcomment: comment.idcomment })
      .expect(200);
    expect(res.body.type).toMatch(/COMMENT_PUB/);
  });

  it("should create a reply to comment notification", async () => {
    const replyRes = await request(app)
      .post(`/api/comments/comment/reply/${comment.idcomment}`)
      .set("Cookie", token)
      .send({ contenu: "Reply!", isAnonymat: false });
    const replyId = replyRes.body.idcomment;
    const res = await request(app)
      .post(`/api/notifications/reply/${comment.idcomment}`)
      .set("Cookie", token)
      .send({ replyId })
      .expect(200);
    expect(res.body.type).toMatch(/REPLY_COMMENT/);
  });

  it("should create a private message notification", async () => {
    const res = await request(app)
      .post(`/api/notifications/message`)
      .set("Cookie", token)
      .send({ recipientId: user2.iduser, conversationId: 1 })
      .expect(200);
    expect(res.body.type).toMatch(/MESSAGE/);
  });

  it("should create a group invite notification", async () => {
    const res = await request(app)
      .post(`/api/notifications/group-invite/1234`)
      .set("Cookie", token)
      .send({ recipientId: user2.iduser })
      .expect(200);
    expect(res.body.type).toMatch(/GROUP_INVITE/);
  });

  it("should create a group invite accepted notification", async () => {
    const res = await request(app)
      .post(`/api/notifications/group-invite/accepted/1234`)
      .set("Cookie", token)
      .send({ recipientId: user2.iduser })
      .expect(200);
    expect(res.body.type).toMatch(/GROUP_INVITE_ACCEPTED/);
  });

  it("should create a group invite declined notification", async () => {
    const res = await request(app)
      .post(`/api/notifications/group-invite/declined/1234`)
      .set("Cookie", token)
      .send({ recipientId: user2.iduser })
      .expect(200);
    expect(res.body.type).toMatch(/GROUP_INVITE_DECLINED/);
  });


  it("should get notifications for user2", async () => {
    // Create a notification for user2
    await request(app)
      .post(`/api/notifications/like/${post.idpost}`)
      .set("Cookie", token)
      .send({ typeReaction: "LIKE" });
    const res = await request(app)
      .get(`/api/notifications/`)
      .set("Cookie", token2)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    notificationId = res.body[0].idNotif;
  });

  it("should mark notification as read", async () => {
    // Create a notification for user2
    await request(app)
      .post(`/api/notifications/like/${post.idpost}`)
      .set("Cookie", token)
      .send({ typeReaction: "LIKE" });
    const res = await request(app)
      .get(`/api/notifications/`)
      .set("Cookie", token2)
      .expect(200);
    notificationId = res.body[0].idNotif;
    const markRes = await request(app)
      .put(`/api/notifications/mark-as-read/${notificationId}`)
      .set("Cookie", token2)
      .expect(200);
    expect(markRes.body.isRead).toBe(true);
  });
});
