import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.js";
import bcrypt from "bcrypt";
import { Post } from "../src/models/post.js";
import { Comment } from "../src/models/comment.js";

describe("Reaction Routes", () => {
  let userA, tokenA, postId, commentId;

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

    // Créer un post pour tester les réactions sur le commentaire
    const postPayload = {
      contenu: "Post for reaction on comments",
      typeContenu: "TEXTE",
      isAnonymat: false,
      niveau: "3A",
    };
    const postRes = await request(app)
      .post("/api/posts/pubdoc")
      .set("Cookie", tokenA)
      .send(postPayload)
      .expect(201);
    postId = postRes.body.post.idpost;

    // Créer un commentaire sur le post
    const commentPayload = {
      contenu: "Test comment for reactions.",
      typeContenu: "TEXTE",
      isAnonymat: false,
      idpost: postId,
    };
    const commentRes = await request(app)
      .post("/api/comments")
      .set("Cookie", tokenA)
      .send(commentPayload)
      .expect(201);
    commentId = commentRes.body.idcomment;
  });

  // Test de l'ajout d'une réaction LIKE sur un post
  it("should create a LIKE reaction on a post", async () => {
    const res = await request(app)
      .post("/api/reactions/toggle")
      .set("Cookie", tokenA)
      .send({ typeReaction: "LIKE", idpost: postId })
      .expect(201);  // Attente de 201 Created

    expect(res.body.typeReaction).toBe("LIKE");
  });

  // Test de la récupération du nombre de réactions sur un post
  it("should get reaction counts for a post", async () => {
    await request(app)
      .post("/api/reactions/toggle")
      .set("Cookie", tokenA)
      .send({ typeReaction: "LIKE", idpost: postId })
      .expect(201);  // Ajouter une réaction LIKE

    const res = await request(app)
      .get(`/api/reactions/post/${postId}/counts`)
      .set("Cookie", tokenA)
      .expect(200);

    expect(res.body.likes).toBe(1);
    expect(res.body.loves).toBe(0);
  });

  // Test de la récupération des réactions de l'utilisateur sur un post
  it("should get user's reactions on a post", async () => {
    await request(app)
      .post("/api/reactions/toggle")
      .set("Cookie", tokenA)
      .send({ typeReaction: "LOVE", idpost: postId })
      .expect(201);  // Ajouter une réaction LOVE

    const res = await request(app)
      .get(`/api/reactions/post/${postId}/mes`)
      .set("Cookie", tokenA)
      .expect(200);

    expect(res.body.hasLike).toBe(false);
    expect(res.body.hasLove).toBe(true);
  });

  // Test de l'ajout d'une réaction LIKE sur un commentaire
  it("should create a LIKE reaction on a comment", async () => {
    const res = await request(app)
      .post("/api/reactions/comment")
      .set("Cookie", tokenA)
      .send({ typeReaction: "LIKE", idcomment: commentId })
      .expect(201);

    expect(res.body.typeReaction).toBe("LIKE");
  });

  // Test de la récupération du nombre de réactions sur un commentaire
  it("should get reaction counts for a comment", async () => {
    await request(app)
      .post("/api/reactions/comment")
      .set("Cookie", tokenA)
      .send({ typeReaction: "LOVE", idcomment: commentId })
      .expect(201);  // Ajouter une réaction LOVE

    const res = await request(app)
      .get(`/api/reactions/comment/${commentId}/counts`)
      .set("Cookie", tokenA)
      .expect(200);

    expect(res.body.likes).toBe(0);
    expect(res.body.loves).toBe(1);
  });

  // Test de la récupération des réactions de l'utilisateur sur un commentaire
  it("should get user's reactions on a comment", async () => {
    await request(app)
      .post("/api/reactions/comment")
      .set("Cookie", tokenA)
      .send({ typeReaction: "LIKE", idcomment: commentId })
      .expect(201);

    const res = await request(app)
      .get(`/api/reactions/comment/${commentId}/mes`)
      .set("Cookie", tokenA)
      .expect(200);

    expect(res.body.hasLike).toBe(true);
    expect(res.body.hasLove).toBe(false);
  });

  // Test de la suppression de la réaction (toggle off) sur un commentaire
  it("should remove the reaction if already exists on a comment", async () => {
    await request(app)
      .post("/api/reactions/comment")
      .set("Cookie", tokenA)
      .send({ typeReaction: "LIKE", idcomment: commentId })
      .expect(201);  // Ajouter une réaction LIKE

    const res = await request(app)
      .post("/api/reactions/comment")
      .set("Cookie", tokenA)
      .send({ typeReaction: "LIKE", idcomment: commentId })
      .expect(200);  // Réaction supprimée

    expect(res.body.message).toBe("Réaction supprimée");
    expect(res.body.removed).toBe(true);
  });
});
