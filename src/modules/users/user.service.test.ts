import { getAllUsers, updateUserRole, updateUserStatus } from "./user.service"
import pool from "../../config/db"

jest.mock("../../config/db", () => ({ query: jest.fn() }))

const mockQuery = pool.query as jest.Mock

describe("UserService", () => {
  afterEach(() => jest.clearAllMocks())

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [
        { id: "1", name: "Abhinav", email: "test@test.com", role: "admin", status: "active", created_at: new Date() },
        { id: "2", name: "John", email: "john@test.com", role: "viewer", status: "active", created_at: new Date() },
      ]
      mockQuery.mockResolvedValueOnce({ rows: mockUsers })

      const users = await getAllUsers()

      expect(Array.isArray(users)).toBe(true)
      expect(users).toHaveLength(2)
    })

    it("should not return password_hash", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: "1", name: "Abhinav", email: "test@test.com", role: "admin", status: "active", created_at: new Date() }],
      })

      const users = await getAllUsers()

      expect(users[0]).not.toHaveProperty("password_hash")
    })

    it("should return empty array if no users", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] })

      const users = await getAllUsers()

      expect(users).toHaveLength(0)
    })
  })

  describe("updateUserRole", () => {
    it("should update user role to analyst", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: "1", name: "Abhinav", email: "test@test.com", role: "analyst", status: "active" }],
      })

      const user = await updateUserRole("1", "analyst")

      expect(user.role).toBe("analyst")
    })

    it("should update user role to admin", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: "1", role: "admin" }],
      })

      const user = await updateUserRole("1", "admin")

      expect(user.role).toBe("admin")
    })

    it("should update user role to viewer", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: "1", role: "viewer" }],
      })

      const user = await updateUserRole("1", "viewer")

      expect(user.role).toBe("viewer")
    })

    it("should throw USER_NOT_FOUND if user does not exist", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] })

      await expect(updateUserRole("nonexistent", "analyst"))
        .rejects.toThrow("USER_NOT_FOUND")
    })
  })

  describe("updateUserStatus", () => {
    it("should update user status to active", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: "1", status: "active" }],
      })

      const user = await updateUserStatus("1", "active")

      expect(user.status).toBe("active")
    })

    it("should update user status to inactive", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: "1", status: "inactive" }],
      })

      const user = await updateUserStatus("1", "inactive")

      expect(user.status).toBe("inactive")
    })

    it("should throw USER_NOT_FOUND if user does not exist", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] })

      await expect(updateUserStatus("nonexistent", "inactive"))
        .rejects.toThrow("USER_NOT_FOUND")
    })
  })
})