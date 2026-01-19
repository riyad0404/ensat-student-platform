import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.js";
import bcrypt from "bcrypt";
import { Comment } from "../src/models/comment.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Comment Integration", () => {
  let userA, tokenA, postId;

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

    // Créer un post pour les tests de commentaire
    const postPayload = {
      contenu: "Post for comment tests",
      typeContenu: "TEXTE",
      isAnonymat: false,
      niveau: "3A"
    };
    const postRes = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", tokenA)
      .field("contenu", postPayload.contenu)
      .field("typeContenu", postPayload.typeContenu)
      .field("isAnonymat", postPayload.isAnonymat)
      .field("niveau", postPayload.niveau)
      .expect(201);
    postId = postRes.body.post.idpost;
  });

  it("should create a comment with a single file and store it in the database", async () => {
    const commentPayload = {
      contenu: "This is a test comment with a single file.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      niveau: "3A",
      idpost: postId
    };

    // Mocking file upload
    const filePath = path.join(__dirname, '..', 'uploads', 'testfile.txt');
    fs.writeFileSync(filePath, "Test content for file.");

    const res = await request(app)
      .post("/api/comments/")
      .set("Cookie", tokenA)
      .attach("file", filePath)
      .field("contenu", commentPayload.contenu)
      .field("typeContenu", commentPayload.typeContenu)
      .field("isAnonymat", commentPayload.isAnonymat)
      .field("niveau", commentPayload.niveau)
      .field("idpost", commentPayload.idpost)
      .expect(201);

    expect(res.body.comment.idcomment).toBeDefined();
    expect(res.body.comment.contenu).toBe(commentPayload.contenu);
    expect(res.body.comment.typeContenu).toBe(commentPayload.typeContenu);
    expect(res.body.comment.isAnonymat).toBe(commentPayload.isAnonymat);

    const commentInDb = await Comment.findOne({ where: { idcomment: res.body.comment.idcomment } });
    expect(commentInDb).not.toBeNull();
    expect(commentInDb.contenu).toBe(commentPayload.contenu);
    
    // Clean up the file after test
    fs.unlinkSync(filePath);
  });

  it("should create a comment with multiple files and store it in the database", async () => {
    const commentPayload = {
      contenu: "This is a test comment with multiple files.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      niveau: "3A",
      idpost: postId
    };

    // Mocking file upload
    const filePath1 = path.join(__dirname, '..', 'uploads', 'testfile1.txt');
    const filePath2 = path.join(__dirname, '..', 'uploads', 'testfile2.txt');
    fs.writeFileSync(filePath1, "Test content for file 1.");
    fs.writeFileSync(filePath2, "Test content for file 2.");

    const res = await request(app)
      .post("/api/comments/")
      .set("Cookie", tokenA)
      .attach("files", filePath1)
      .attach("files", filePath2)
      .field("contenu", commentPayload.contenu)
      .field("typeContenu", commentPayload.typeContenu)
      .field("isAnonymat", commentPayload.isAnonymat)
      .field("niveau", commentPayload.niveau)
      .field("idpost", commentPayload.idpost)
      .expect(201);

    expect(res.body.comment.idcomment).toBeDefined();
    expect(res.body.comment.contenu).toBe(commentPayload.contenu);
    expect(res.body.comment.typeContenu).toBe(commentPayload.typeContenu);
    expect(res.body.comment.isAnonymat).toBe(commentPayload.isAnonymat);

    const commentInDb = await Comment.findOne({ where: { idcomment: res.body.comment.idcomment } });
    expect(commentInDb).not.toBeNull();
    expect(commentInDb.contenu).toBe(commentPayload.contenu);

    // Clean up the files after test
    fs.unlinkSync(filePath1);
    fs.unlinkSync(filePath2);
  });

  it("should get all comments", async () => {
    const commentPayload = {
      contenu: "Another test comment for getting all comments.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      idpost: postId
    };

    await request(app)
      .post("/api/comments/")
      .set("Cookie", tokenA)
      .send(commentPayload)
      .expect(201);

    const res = await request(app)
      .get(`/api/comments/post/${postId}`)
      .set("Cookie", tokenA)
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[res.body.length - 1].contenu).toBe(commentPayload.contenu);
  });

  it("should get a specific comment by its ID", async () => {
    const commentPayload = {
      contenu: "Test comment to fetch.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      idpost: postId
    };

    const createdComment = await request(app)
      .post("/api/comments/")
      .set("Cookie", tokenA)
      .send(commentPayload)
      .expect(201);

    const res = await request(app)
      .get(`/api/comments/${createdComment.body.comment.idcomment}`)
      .set("Cookie", tokenA)
      .expect(200);

    expect(res.body.idcomment).toBe(createdComment.body.comment.idcomment);
    expect(res.body.contenu).toBe(commentPayload.contenu);
  });

  it("should update a comment", async () => {
    const commentPayload = {
      contenu: "Test comment to update.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      idpost: postId
    };

    const createdComment = await request(app)
      .post("/api/comments/")
      .set("Cookie", tokenA)
      .send(commentPayload)
      .expect(201);

    const updatedCommentPayload = {
      contenu: "Updated content for comment.",
      typeContenu: "TEXTE",
      isAnonymat: true,
    };

    const res = await request(app)
      .patch(`/api/comments/${createdComment.body.comment.idcomment}`)
      .set("Cookie", tokenA)
      .send(updatedCommentPayload)
      .expect(200);

    expect(res.body.contenu).toBe(updatedCommentPayload.contenu);
    expect(res.body.isAnonymat).toBe(updatedCommentPayload.isAnonymat);
  });

  it("should delete a comment", async () => {
    const commentPayload = {
      contenu: "Test comment to delete.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      idpost: postId
    };

    const createdComment = await request(app)
      .post("/api/comments/")
      .set("Cookie", tokenA)
      .send(commentPayload)
      .expect(201);

    await request(app)
      .delete(`/api/comments/${createdComment.body.comment.idcomment}`)
      .set("Cookie", tokenA)
      .expect(200);

    const commentInDb = await Comment.findByPk(createdComment.body.comment.idcomment);
    expect(commentInDb).toBeNull();
  });

  it("should reject comment creation without content", async () => {
    const commentPayload = {
      contenu: "", // Pas de contenu
      typeContenu: "TEXTE",
      isAnonymat: false,
      idpost: postId
    };

    const res = await request(app)
      .post("/api/comments/")
      .set("Cookie", tokenA)
      .send(commentPayload)
      .expect(400);

    expect(res.body.message).toBe("Un commentaire doit contenir texte, lien ou fichier.");
  });

  it("should reject comment creation without token", async () => {
    const commentPayload = {
      contenu: "Comment without token.",
      typeContenu: "TEXTE",
      isAnonymat: false,
    };

    const res = await request(app)
      .post("/api/comments/")
      .send(commentPayload)
      .expect(401);

    expect(res.body.message).toBe("Not authenticated");
  });
});
