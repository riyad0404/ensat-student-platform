import sequelize from "../src/database.js";
import { execSync } from "child_process";

beforeAll(async () => {
  // 1) Drop everything in the test DB (schema reset)
  await sequelize.query("DROP SCHEMA public CASCADE;");
  await sequelize.query("CREATE SCHEMA public;");

  // 2) Run migrations from scratch
  execSync("npm run migrate:test", { stdio: "inherit" });
});

beforeEach(async () => {
  // Clean users table before every test
  await sequelize.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;');
});

afterAll(async () => {
  await sequelize.close();
});
