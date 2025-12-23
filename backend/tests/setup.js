import sequelize from "../src/database.js";
import { execSync } from "child_process";

beforeAll(() => {
  // Run migrations on the TEST database
  execSync("npm run migrate:test", { stdio: "inherit" });
});

beforeEach(async () => {
  // Start simple: clean users table before every test
  await sequelize.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;');
});

afterAll(async () => {
  await sequelize.close();
});
