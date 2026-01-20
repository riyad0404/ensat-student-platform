import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/user.js";
import bcrypt from "bcrypt";

describe("Auth - Login", () => {
  it("logs in user and sets cookies", async () => {
    const hashed = await bcrypt.hash("Password123!", 10);

    await User.create({
      nom: "Test",
      prenom: "User",
      email: "login@example.com",
      password: hashed,
      niveau: "3A",
      secretCode: 1234,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "Password123!" })
      .expect(200);

    expect(res.body.message).toBe("Connexion réussie");
    expect(res.body.user.email).toBe("login@example.com");
    expect(res.body.user.password).toBeUndefined();

    const cookies = res.headers["set-cookie"] || [];
    expect(cookies.join(";")).toContain("accessToken=");
    expect(cookies.join(";")).toContain("refreshToken=");
  });

  it("returns 401 for wrong password", async () => {
    const hashed = await bcrypt.hash("Password123!", 10);

    await User.create({
      nom: "Test",
      prenom: "User",
      email: "wrongpass@example.com",
      password: hashed,
      niveau: "3A",
      secretCode: 1234,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "wrongpass@example.com", password: "WrongPassword!" })
      .expect(401);

    expect(res.body.message).toBe("Mot de passe incorrect");
  });

  it("returns 404 if user not found", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "notfound@example.com", password: "Password123!" })
      .expect(404);

    expect(res.body.message).toBe("Utilisateur non trouvé");
  });
});
