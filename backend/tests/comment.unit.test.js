import request from "supertest";
import app from "../src/app.js";
import { User, Post, Comment } from "../src/models/associations.js";
import bcrypt from "bcrypt";

// Helper to create a user
async function createUser(email, nom = "Test", prenom = "User", password = "Test123!", niveau = "3A", secretCode = 1234) {
  const hashed = await bcrypt.hash(password, 10);
  return User.create({ nom, prenom, email, password: hashed, niveau, secretCode });
}

// Helper to create a post
async function createPost(iduser, titre = "Test Post", contenu = "Post content", typeContenu = "TEXTE") {
  return Post.create({ titre, contenu, iduser, typeContenu });
}

describe("Comment Controller Unit", () => {
  let user, token, post, commentId;
  beforeEach(async () => {
    // Clean up before each test
    await Comment.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await User.destroy({ where: { email: "commentuser@example.com" } });
    user = await createUser("commentuser@example.com");
    post = await createPost(user.iduser);
    // Login and get cookie
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "commentuser@example.com", password: "Test123!" });
    if (res.status !== 200) throw new Error(`Login failed: ${res.status} ${res.text}`);
    token = res.headers["set-cookie"];
    commentId = undefined;
  });
  afterAll(async () => {
    await Comment.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await User.destroy({ where: { email: "commentuser@example.com" } });
  });

  it("should create a comment (text only)", async () => {
    const res = await request(app)
      .post("/api/comments")
      .set("Cookie", token)
      .send({ idpost: post.idpost, contenu: "Hello comment!", isAnonymat: false })
      .expect(201);
    expect(res.body.contenu).toBe("Hello comment!");
    expect(res.body.idpost).toBe(post.idpost);
    commentId = res.body.idcomment;
  });

  describe("with an existing comment", () => {
    beforeEach(async () => {
      // Create a comment for tests that need it
      const res = await request(app)
        .post("/api/comments")
        .set("Cookie", token)
        .send({ idpost: post.idpost, contenu: "Hello comment!", isAnonymat: false });
      commentId = res.body.idcomment;
    });

    it("should get comment by ID", async () => {
      const res = await request(app)
        .get(`/api/comments/${commentId}`)
        .set("Cookie", token)
        .expect(200);
      expect(res.body.idcomment).toBe(commentId);
      expect(res.body.contenu).toBeDefined();
    });

    it("should reply to a comment", async () => {
      const res = await request(app)
        .post(`/api/comments/comment/reply/${commentId}`)
        .set("Cookie", token)
        .send({ contenu: "Reply!", isAnonymat: false })
        .expect(201);
      expect(res.body.idparent).toBe(commentId);
      expect(res.body.contenu).toBe("Reply!");
    });

    it("should get comments by post", async () => {
      const res = await request(app)
        .get(`/api/comments/post/${post.idpost}`)
        .set("Cookie", token)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should update a comment", async () => {
      const res = await request(app)
        .patch(`/api/comments/${commentId}`)
        .set("Cookie", token)
        .send({ contenu: "Updated comment!" })
        .expect(200);
      expect(res.body.contenu).toBe("Updated comment!");
    });

    it("should delete a comment", async () => {
      const res = await request(app)
        .delete(`/api/comments/${commentId}`)
        .set("Cookie", token)
        .expect(200);
      expect(res.body.message).toMatch(/Commentaire supprimé/);
    });
  });
});
