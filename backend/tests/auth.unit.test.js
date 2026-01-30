import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.js";
import bcrypt from "bcrypt";

describe("Auth Controller Unit", () => {
  let testUser;
  const testEmail = "unituser@example.com";
  const testPassword = "UnitTest123!";

  beforeAll(async () => {
    // Clean up any existing user
    await User.destroy({ where: { email: testEmail } });
  });

  beforeEach(async () => {
    // Ensure test user exists before each test that needs it
    const existing = await User.findOne({ where: { email: testEmail } });
    if (!existing) {
      const hashed = await bcrypt.hash(testPassword, 10);
      testUser = await User.create({
        nom: "Unit",
        prenom: "Test",
        email: testEmail,
        password: hashed,
        niveau: "3A",
        secretCode: 4321,
      });
    } else {
      testUser = existing;
    }
  });

  afterAll(async () => {
    await User.destroy({ where: { email: testEmail } });
    await User.destroy({ where: { email: "unitregister@example.com" } });
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        nom: "Unit",
        prenom: "Register",
        email: "unitregister@example.com",
        password: "UnitTest123!",
        niveau: "3A",
        secretCode: 1234,
      })
      .expect(201);
    expect(res.body.user.email).toBe("unitregister@example.com");
    // Clean up is handled in afterAll
  });

  it("should not register with existing email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        nom: "Unit",
        prenom: "Test",
        email: testEmail,
        password: testPassword,
        niveau: "3A",
        secretCode: 4321,
      })
      .expect(400);
    expect(res.body.message).toBe("L'email est déjà utilisé.");
  });

  it("should login with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword })
      .expect(200);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.message).toMatch(/Connexion réussie/);
  });

  it("should not login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "WrongPassword!" })
      .expect(401);
    expect(res.body.message).toMatch(/Mot de passe incorrect|Email ou mot de passe incorrect/);
  });

  it("should not login with unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "unknown@example.com", password: testPassword })
      .expect(404);
    expect(res.body.message).toBe("Utilisateur non trouvé");
  });

  it("should logout and clear cookies", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .expect(200);
    expect(res.body.message).toMatch(/Logged out successfully/);
  });
});
