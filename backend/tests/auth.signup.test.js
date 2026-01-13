import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.js";

describe("Auth - Signup", () => {
  it("creates a user and sets auth cookies", async () => {
    const payload = {
      nom: "Test",
      prenom: "User",
      email: "testuser@example.com",
      password: "Password123!",
      niveau: "3A",
      secretCode: 1234,
    };

    const res = await request(app)
      .post("/api/auth/signup")
      .send(payload)
      .expect(201);

    // Response checks
    expect(res.body.message).toBe("Utilisateur créé avec succès");
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(payload.email);

    // Should not return password
    expect(res.body.user.password).toBeUndefined();

    // Cookies should be set
    const cookies = res.headers["set-cookie"] || [];
    expect(cookies.join(";")).toContain("accessToken=");
    expect(cookies.join(";")).toContain("refreshToken=");

    // DB check
    const userInDb = await User.findOne({ where: { email: payload.email } });
    expect(userInDb).not.toBeNull();

    // Password should be hashed
    expect(userInDb.password).not.toBe(payload.password);
  });

  it("rejects duplicate email", async () => {
    // Seed existing user
    await User.create({
      nom: "Seed",
      prenom: "User",
      email: "exists@example.com",
      password: "hashed_fake",
      niveau: "3A",
      secretCode: 1111,
    });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        nom: "New",
        prenom: "User",
        email: "exists@example.com",
        password: "Password123!",
        niveau: "3A",
        secretCode: 2222,
      })
      .expect(400);

    expect(res.body.message).toBe("L'email est déjà utilisé.");
  });
});
