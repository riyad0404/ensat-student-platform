import request from "supertest";
import app from "../src/app.js";
import { User, Post, Document } from "../src/models/associations.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to create a user
async function createUser(email, nom = "Test", prenom = "User", password = "Test123!", niveau = "3A", secretCode = 1234) {
  const hashed = await bcrypt.hash(password, 10);
  return User.create({ nom, prenom, email, password: hashed, niveau, secretCode });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const testFilePath = path.join(uploadsDir, "testfile.txt");
const testFileContent = "This is a test file.";

// Write a small test file before tests
beforeAll(() => {
  fs.writeFileSync(testFilePath, testFileContent);
});

// Remove test file after tests
afterAll(() => {
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
});

describe("Post Controller Unit", () => {
  let user, token, postId;
  beforeEach(async () => {
    await Document.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await User.destroy({ where: { email: "postuser@example.com" } });
    user = await createUser("postuser@example.com");
    // Login and get cookie
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "postuser@example.com", password: "Test123!" });
    if (res.status !== 200) throw new Error(`Login failed: ${res.status} ${res.text}`);
    token = res.headers["set-cookie"];
    postId = undefined;
  });
  afterAll(async () => {
    await Document.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await User.destroy({ where: { email: "postuser@example.com" } });
  });

  it("should create a text-only post", async () => {
    const res = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", token)
      .send({ contenu: "Hello post!", typeContenu: "TEXTE" })
      .expect(201);
    expect(res.body.post.contenu).toBe("Hello post!");
    expect(res.body.post.typeContenu).toBe("TEXTE");
    postId = res.body.post.idpost;
  });

  it("should create a post with a small text file", async () => {
    const res = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", token)
      .field("contenu", "File post!")
      .field("niveau", "3A")
      .field("typeContenu", "DOCUMENT")
      .attach("file", testFilePath)
      .expect(201);
    expect(res.body.post.typeContenu).toBe("DOCUMENT");
    expect(res.body.documents).toBeDefined();
    expect(Array.isArray(res.body.documents)).toBe(true);
    expect(res.body.documents.length).toBeGreaterThan(0);
    postId = res.body.post.idpost;
  });

  describe("with an existing post", () => {
    beforeEach(async () => {
      const res = await request(app)
        .post("/api/posts/pubdoc")
        .set("Cookie", token)
        .send({ contenu: "Hello post!", typeContenu: "TEXTE" });
      postId = res.body.post.idpost;
    });

    it("should get all posts", async () => {
      const res = await request(app)
        .get("/api/posts/")
        .set("Cookie", token)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should get post by ID", async () => {
      const res = await request(app)
        .get(`/api/posts/${postId}`)
        .set("Cookie", token)
        .expect(200);
      expect(res.body.idpost).toBe(postId);
      expect(res.body.contenu).toBeDefined();
    });

    it("should get my posts", async () => {
      const res = await request(app)
        .get("/api/posts/mesposts")
        .set("Cookie", token)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].iduser).toBe(user.iduser);
    });

    it("should update a post", async () => {
      const res = await request(app)
        .patch(`/api/posts/${postId}`)
        .set("Cookie", token)
        .send({ contenu: "Updated post!" })
        .expect(200);
      expect(res.body.contenu).toBe("Updated post!");
    });

    it("should delete a post", async () => {
      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set("Cookie", token)
        .expect(200);
      expect(res.body.message).toMatch(/Post supprimé/);
    });
  });
});
