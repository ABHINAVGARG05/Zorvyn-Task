import { registerUser, loginUser } from "./auth.service"
import pool from "../../config/db"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

jest.mock("../../config/db", () => ({ query: jest.fn() }))
jest.mock("bcrypt")
jest.mock("jsonwebtoken")

const mockQuery = pool.query as jest.Mock
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe("AuthService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("registerUser", () => {
    it("should register a new user", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [{ id: "1", name: "Abhinav", email: "test@test.com", role: "viewer", status: "active" }],
        })

      ;(mockBcrypt.hash as jest.Mock).mockResolvedValueOnce("hashed_password")

      const user = await registerUser("Abhinav", "test@test.com", "password123")

      expect(user.email).toBe("test@test.com")
      expect(user.role).toBe("viewer")
      expect(user.status).toBe("active")
    })

    it("should throw EMAIL_TAKEN if email exists", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: "1" }] })

      await expect(registerUser("Abhinav", "test@test.com", "password123"))
        .rejects.toThrow("EMAIL_TAKEN")
    })

    it("should hash password before storing", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: "1" }] })

      ;(mockBcrypt.hash as jest.Mock).mockResolvedValueOnce("hashed_password")

      await registerUser("Abhinav", "test@test.com", "password123")

      expect(mockBcrypt.hash).toHaveBeenCalledWith("password123", 10)
    })
  })

  describe("loginUser", () => {
    const mockUser = {
      id: "1",
      name: "Abhinav",
      email: "test@test.com",
      password_hash: "hashed_password",
      role: "viewer",
      status: "active",
    }

    it("should login with correct credentials", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] })
      ;(mockBcrypt.compare as jest.Mock).mockResolvedValueOnce(true)
      ;(mockJwt.sign as jest.Mock).mockReturnValueOnce("mock_token")

      const result = await loginUser("test@test.com", "password123")

      expect(result.token).toBe("mock_token")
      expect(result.user.email).toBe("test@test.com")
    })

    it("should throw INVALID_CREDENTIALS if user not found", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] })

      await expect(loginUser("wrong@test.com", "password123"))
        .rejects.toThrow("INVALID_CREDENTIALS")
    })

    it("should throw INVALID_CREDENTIALS if password is wrong", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] })
      ;(mockBcrypt.compare as jest.Mock).mockResolvedValueOnce(false)

      await expect(loginUser("test@test.com", "wrongpassword"))
        .rejects.toThrow("INVALID_CREDENTIALS")
    })

    it("should throw ACCOUNT_INACTIVE if user is inactive", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ ...mockUser, status: "inactive" }] })
      ;(mockBcrypt.compare as jest.Mock).mockResolvedValueOnce(true)

      await expect(loginUser("test@test.com", "password123"))
        .rejects.toThrow("ACCOUNT_INACTIVE")
    })

    it("should not return password_hash in response", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] })
      ;(mockBcrypt.compare as jest.Mock).mockResolvedValueOnce(true)
      ;(mockJwt.sign as jest.Mock).mockReturnValueOnce("mock_token")

      const result = await loginUser("test@test.com", "password123")

      expect(result.user).not.toHaveProperty("password_hash")
    })

    it("should generate JWT with id and role", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] })
      ;(mockBcrypt.compare as jest.Mock).mockResolvedValueOnce(true)
      ;(mockJwt.sign as jest.Mock).mockReturnValueOnce("mock_token")

      await loginUser("test@test.com", "password123")

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, role: mockUser.role },
        expect.any(String),
        expect.any(Object),
      )
    })
  })
})