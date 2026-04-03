import request from "supertest";
import app from "../app";
import pool from "../config/db";

afterAll(async () => {
  await pool.query("DELETE FROM records");
  await pool.query("DELETE FROM users");
  await pool.end();
});

describe("Integration Tests", () => {
  let adminToken: string;
  let analystToken: string;
  let viewerToken: string;
  let adminId: string;
  let recordId: string;

  describe("Auth Flow", () => {
    it("should register an admin user", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          name: "Admin User",
          email: "admin@test.com",
          password: "password123",
        })
        .expect(201);

      expect(res.body.data.id).toBeDefined();
      adminId = res.body.data.id;

      await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [
        adminId,
      ]);
    });

    it("should register an analyst user", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          name: "Analyst User",
          email: "analyst@test.com",
          password: "password123",
        })
        .expect(201);

      await pool.query("UPDATE users SET role = 'analyst' WHERE id = $1", [
        res.body.data.id,
      ]);
    });

    it("should register a viewer user", async () => {
      await request(app)
        .post("/auth/register")
        .send({
          name: "Viewer User",
          email: "viewer@test.com",
          password: "password123",
        })
        .expect(201);
    });

    it("should login as admin and get token", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "admin@test.com", password: "password123" })
        .expect(200);

      expect(res.body.data.token).toBeDefined();
      adminToken = res.body.data.token;
    });

    it("should login as analyst and get token", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "analyst@test.com", password: "password123" })
        .expect(200);

      analystToken = res.body.data.token;
    });

    it("should login as viewer and get token", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "viewer@test.com", password: "password123" })
        .expect(200);

      viewerToken = res.body.data.token;
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "admin@test.com", password: "wrongpassword" })
        .expect(401);

      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("should reject duplicate email registration", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          name: "Duplicate",
          email: "admin@test.com",
          password: "password123",
        })
        .expect(409);

      expect(res.body.error.code).toBe("EMAIL_TAKEN");
    });
  });

  describe("Records Flow", () => {
    it("should create a record as admin", async () => {
      const res = await request(app)
        .post("/records")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          amount: 1500,
          type: "income",
          category: "Salary",
          date: "2026-04-01",
          notes: "April salary",
        })
        .expect(201);

      expect(res.body.data.id).toBeDefined();
      recordId = res.body.data.id;
    });

    it("should create a record as analyst", async () => {
      const res = await request(app)
        .post("/records")
        .set("Authorization", `Bearer ${analystToken}`)
        .send({
          amount: 200,
          type: "expense",
          category: "Food",
          date: "2026-04-02",
        })
        .expect(201);

      expect(res.body.data.type).toBe("expense");
    });

    it("should reject record creation as viewer", async () => {
      const res = await request(app)
        .post("/records")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({
          amount: 100,
          type: "income",
          category: "Other",
          date: "2026-04-01",
        })
        .expect(403);

      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should list records with pagination", async () => {
      const res = await request(app)
        .get("/records?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it("should filter records by type", async () => {
      const res = await request(app)
        .get("/records?type=income")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      res.body.data.forEach((record: any) => {
        expect(record.type).toBe("income");
      });
    });

    it("should filter records by category", async () => {
      const res = await request(app)
        .get("/records?category=salary")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should update a record as admin", async () => {
      const res = await request(app)
        .patch(`/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ notes: "Updated notes" })
        .expect(200);

      expect(res.body.data.notes).toBe("Updated notes");
    });

    it("should reject update with no fields", async () => {
      const res = await request(app)
        .patch(`/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(res.body.error.code).toBe("NO_FIELDS");
    });

    it("should reject update on non-existent record", async () => {
      const res = await request(app)
        .patch("/records/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ amount: 2000 })
        .expect(404);

      expect(res.body.error.code).toBe("RECORD_NOT_FOUND");
    });

    it("should reject delete as analyst", async () => {
      const res = await request(app)
        .delete(`/records/${recordId}`)
        .set("Authorization", `Bearer ${analystToken}`)
        .expect(403);

      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should soft delete a record as admin", async () => {
      await request(app)
        .delete(`/records/${recordId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const listRes = await request(app)
        .get("/records")
        .set("Authorization", `Bearer ${adminToken}`);

      const deleted = listRes.body.data.find((r: any) => r.id === recordId);
      expect(deleted).toBeUndefined();
    });
  });

  describe("Dashboard Flow", () => {
    it("should return summary for admin", async () => {
      const res = await request(app)
        .get("/dashboard/summary")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.total_income).toBeDefined();
      expect(res.body.data.total_expenses).toBeDefined();
      expect(res.body.data.net_balance).toBeDefined();
    });

    it("should return category breakdown", async () => {
      const res = await request(app)
        .get("/dashboard/by-category")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return monthly trends", async () => {
      const res = await request(app)
        .get("/dashboard/trends")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return recent records", async () => {
      const res = await request(app)
        .get("/dashboard/recent")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Auth Middleware", () => {
    it("should reject request without token", async () => {
      const res = await request(app).get("/records").expect(401);

      expect(res.body.error.code).toBe("TOKEN_MISSING");
    });

    it("should reject invalid token", async () => {
      const res = await request(app)
        .get("/records")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);

      expect(res.body.error.code).toBe("TOKEN_INVALID");
    });
  });

  describe("User Management Flow", () => {
    it("should list users as admin", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should reject user list as analyst", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${analystToken}`)
        .expect(403);

      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should update user role as admin", async () => {
      const res = await request(app)
        .patch(`/users/${adminId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "analyst" })
        .expect(200);

      expect(res.body.data.role).toBe("analyst");

      await pool.query("UPDATE users SET role = 'admin' WHERE id = $1", [
        adminId,
      ]);
    });

    it("should update user status as admin", async () => {
      const res = await request(app)
        .patch(`/users/${adminId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "inactive" })
        .expect(200);

      expect(res.body.data.status).toBe("inactive");

      await pool.query("UPDATE users SET status = 'active' WHERE id = $1", [
        adminId,
      ]);
    });
  });
});
