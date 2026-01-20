import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.js";
import bcrypt from "bcrypt";
import { Post } from "../src/models/post.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Post Integration", () => {
  let userA, tokenA;

  beforeEach(async () => {
    // Créer un utilisateur
    const password = await bcrypt.hash("Password123!", 10);
    userA = await User.create({
      nom: "Test",
      prenom: "User",
      email: "testuser@example.com",
      password,
      niveau: "3A",
      secretCode: 1234,
    });

    // Connexion de l'utilisateur pour obtenir son token
    const login = async (email) => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email, password: "Password123!" });
      return res.headers["set-cookie"];
    };

    tokenA = await login("testuser@example.com");
  });

  it("should create a post with a single file and store it in the database", async () => {
    const postPayload = {
      contenu: "This is a test post with a single file.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      niveau: "3A"
    };

    // Mocking file upload
    const filePath = path.join(__dirname, 'testfile.txt');
    fs.writeFileSync(filePath, "Test content for file.");

    const res = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", tokenA)
      .attach("file", filePath)
      .field("contenu", postPayload.contenu)
      .field("typeContenu", postPayload.typeContenu)
      .field("isAnonymat", postPayload.isAnonymat)
      .field("niveau", postPayload.niveau)
      .expect(201);

    expect(res.body.post.idpost).toBeDefined();
    expect(res.body.post.contenu).toBe(postPayload.contenu);
    expect(res.body.post.typeContenu).toBe("DOCUMENT");
    expect(res.body.post.isAnonymat).toBe(postPayload.isAnonymat);

    const postInDb = await Post.findOne({ where: { idpost: res.body.post.idpost } });
    expect(postInDb).not.toBeNull();
    expect(postInDb.contenu).toBe(postPayload.contenu);
    
    // Clean up the file after test
    fs.unlinkSync(filePath);
  });

  it("should create a post with multiple files and store it in the database", async () => {
    const postPayload = {
      contenu: "This is a test post with multiple files.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      niveau: "3A"
    };

    // Mocking file upload
    const filePath1 = path.join(__dirname, 'testfile1.txt');
    const filePath2 = path.join(__dirname, 'testfile2.txt');
    fs.writeFileSync(filePath1, "Test content for file 1.");
    fs.writeFileSync(filePath2, "Test content for file 2.");

    const res = await request(app)
      .post("/api/posts/pldoc")
      .set("Cookie", tokenA)
      .attach("files", filePath1)
      .attach("files", filePath2)
      .field("contenu", postPayload.contenu)
      .field("typeContenu", postPayload.typeContenu)
      .field("isAnonymat", postPayload.isAnonymat)
      .field("niveau", postPayload.niveau)
      .expect(201);

    expect(res.body.post.idpost).toBeDefined();
    expect(res.body.post.contenu).toBe(postPayload.contenu);
    expect(res.body.post.typeContenu).toBe(postPayload.typeContenu);
    expect(res.body.post.isAnonymat).toBe(postPayload.isAnonymat);

    const postInDb = await Post.findOne({ where: { idpost: res.body.post.idpost } });
    expect(postInDb).not.toBeNull();
    expect(postInDb.contenu).toBe(postPayload.contenu);

    // Clean up the files after test
    fs.unlinkSync(filePath1);
    fs.unlinkSync(filePath2);
  });

  it("should get all posts", async () => {
    const postPayload = {
      contenu: "Another test post for getting all posts.",
      typeContenu: "TEXTE",
      isAnonymat: false,
    };

    await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", tokenA)
      .send(postPayload)
      .expect(201);

    const res = await request(app)
      .get("/api/posts")
      .set("Cookie", tokenA)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].contenu).toBe(postPayload.contenu);
  });

  it("should get a specific post by its ID", async () => {
    const postPayload = {
      contenu: "Test post to fetch.",
      typeContenu: "TEXTE",
      isAnonymat: false,
    };

    const createdPost = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", tokenA)
      .send(postPayload)
      .expect(201);

    const res = await request(app)
      .get(`/api/posts/${createdPost.body.post.idpost}`)
      .set("Cookie", tokenA)
      .expect(200);

    expect(res.body.idpost).toBe(createdPost.body.post.idpost);
    expect(res.body.contenu).toBe(postPayload.contenu);
  });

  it("should update a post", async () => {
    const postPayload = {
      contenu: "Test post to update.",
      typeContenu: "TEXTE",
      isAnonymat: false,
    };

    const createdPost = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", tokenA)
      .send(postPayload)
      .expect(201);

    const updatedPostPayload = {
      contenu: "Updated content for post.",
      typeContenu: "TEXTE",
      isAnonymat: true,
    };

    const res = await request(app)
      .patch(`/api/posts/${createdPost.body.post.idpost}`)
      .set("Cookie", tokenA)
      .send(updatedPostPayload)
      .expect(200);

    expect(res.body.contenu).toBe(updatedPostPayload.contenu);
    expect(res.body.isAnonymat).toBe(updatedPostPayload.isAnonymat);
  });

  it("should delete a post", async () => {
    const postPayload = {
      contenu: "Test post to delete.",
      typeContenu: "TEXTE",
      isAnonymat: false,
    };

    const createdPost = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", tokenA)
      .send(postPayload)
      .expect(201);

    await request(app)
      .delete(`/api/posts/${createdPost.body.post.idpost}`)
      .set("Cookie", tokenA)
      .expect(200);

    const postInDb = await Post.findByPk(createdPost.body.post.idpost);
    expect(postInDb).toBeNull();
  });

  it("should reject post creation without content", async () => {
    const postPayload = {
      contenu: "", // Pas de contenu
      typeContenu: "TEXTE",
      isAnonymat: false,
    };

    const res = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", tokenA)
      .send(postPayload)
      .expect(400);

   expect(res.body.message).toBe("Contenu ou fichier obligatoire");
  });

  it("should reject post creation without token", async () => {
    const postPayload = {
      contenu: "Post without token.",
      typeContenu: "TEXTE",
      isAnonymat: false,
    };

    const res = await request(app)
      .post("/api/posts/pubdoc")
      .send(postPayload)
      .expect(401);

    expect(res.body.message).toBe("Not authenticated");
  });
});
