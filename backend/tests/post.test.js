import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.js";
import { generateTokens } from "../src/utils/generateTokens.js"; // Import de la fonction pour générer les tokens

describe("POST - Create Post", () => {
  let user;
  let accessToken;

  beforeAll(async () => {
    // Recherche l'utilisateur avec ID 1
    user = await User.findByPk(1);  // Recherche l'utilisateur avec ID 1

    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new Error("User with id 1 not found in the database");
    }

    // Générer un accessToken pour cet utilisateur
    const tokens = generateTokens(user);
    accessToken = tokens.accessToken;  // Récupère l'accessToken
  });

  it("should create a post with text content", async () => {
    const payload = {
      contenu: "Test post content",
      typeContenu: "TEXTE",
      isAnonymat: false,
      niveau: "GINF2",
    };

    const res = await request(app)
      .post("/api/posts/pubdoc")  // Route de création de post
      .set("Cookie", [`accessToken=${accessToken}`]) // Utilisation du token généré
      .send(payload)
      .expect(201);  // On s'attend à un statut HTTP 201 (création réussie)

    // Vérification des propriétés du post créé
    expect(res.body.post).toBeDefined();
    expect(res.body.post.contenu).toBe(payload.contenu);
    expect(res.body.post.typeContenu).toBe(payload.typeContenu);
  });

  it("should create a post with a document", async () => {
    const payload = {
      contenu: "Test post with a document",
      typeContenu: "DOCUMENT",
      isAnonymat: false,
      niveau: "GINF2",
    };

    const file = Buffer.from("test document content", "utf-8");  // Contenu du fichier (simulé)
    
    const res = await request(app)
      .post("/api/posts/pldoc")  // Route de création de post avec plusieurs fichiers
      .set("Cookie", [`accessToken=${accessToken}`])  // Utilisation du token généré
      .attach("files", file, "testfile.txt")  // Attachement du fichier
      .send(payload)
      .expect(201);  // On s'attend à un statut HTTP 201 (création réussie)

    // Vérification que le post et le fichier ont été créés
    expect(res.body.post).toBeDefined();
    expect(res.body.document).toBeDefined();
    expect(res.body.document.filename).toBe("testfile.txt");
  });

  afterAll(async () => {
    // Nettoyer après les tests si nécessaire (par exemple, supprimer l'utilisateur ou les données associées)
    // await User.destroy({ where: { iduser: user.iduser } });
  });
});
