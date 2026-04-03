import { createRecord, getRecords, updateRecord, deleteRecord } from "./record.service"
import pool from "../../config/db"

jest.mock("../../config/db", () => ({ query: jest.fn() }))

const mockQuery = pool.query as jest.Mock

describe("RecordService", () => {
  afterEach(() => jest.clearAllMocks())

  describe("createRecord", () => {
    it("should create a record with valid data", async () => {
      const mockRecord = {
        id: "1",
        user_id: "user1",
        amount: 1500.5,
        type: "income",
        category: "Salary",
        date: "2026-04-03",
        notes: "Monthly salary",
      }
      mockQuery.mockResolvedValueOnce({ rows: [mockRecord] })

      const result = await createRecord("user1", {
        amount: 1500.5,
        type: "income",
        category: "Salary",
        date: "2026-04-03",
        notes: "Monthly salary",
      })

      expect(result.user_id).toBe("user1")
      expect(result.amount).toBe(1500.5)
      expect(result.type).toBe("income")
    })

    it("should store null for missing notes", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: "1", notes: null }],
      })

      const result = await createRecord("user1", {
        amount: 500,
        type: "expense",
        category: "Food",
        date: "2026-04-03",
      })

      expect(result.notes).toBeNull()
    })
  })

  describe("getRecords", () => {
    it("should return records with pagination", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "2" }] })
        .mockResolvedValueOnce({ rows: [{ id: "1" }, { id: "2" }] })

      const result = await getRecords({ page: 1, limit: 10 })

      expect(result.records).toHaveLength(2)
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.totalPages).toBe(1)
    })

    it("should filter by type", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "1", type: "income" }] })

      const result = await getRecords({ type: "income" })

      expect(result.records[0].type).toBe("income")
    })

    it("should filter by category", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "1", category: "salary" }] })

      const result = await getRecords({ category: "salary" })

      expect(result.records[0].category).toBe("salary")
    })

    it("should filter by date range", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "1" }] })
        .mockResolvedValueOnce({ rows: [{ id: "1", date: "2026-03-15" }] })

      const result = await getRecords({ from: "2026-01-01", to: "2026-03-31" })

      expect(result.records[0].date).toBe("2026-03-15")
    })

    it("should return empty records if none match", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "0" }] })
        .mockResolvedValueOnce({ rows: [] })

      const result = await getRecords({ type: "expense" })

      expect(result.records).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })

    it("should default to page 1 and limit 10", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "0" }] })
        .mockResolvedValueOnce({ rows: [] })

      const result = await getRecords({})

      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
    })
  })

  describe("updateRecord", () => {
    it("should update a record", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: "1", amount: 2000 }] })

      const result = await updateRecord("1", { amount: 2000 })

      expect(result.amount).toBe(2000)
    })

    it("should throw NO_FIELDS if no fields provided", async () => {
      await expect(updateRecord("1", {}))
        .rejects.toThrow("NO_FIELDS")
    })

    it("should throw RECORD_NOT_FOUND if record does not exist", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] })

      await expect(updateRecord("nonexistent", { amount: 2000 }))
        .rejects.toThrow("RECORD_NOT_FOUND")
    })

    it("should allow partial updates", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: "1", amount: 1000, category: "Updated" }],
      })

      const result = await updateRecord("1", { category: "Updated" })

      expect(result.category).toBe("Updated")
    })
  })

  describe("deleteRecord", () => {
    it("should soft delete a record", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: "1" }] })

      await expect(deleteRecord("1")).resolves.not.toThrow()
    })

    it("should throw RECORD_NOT_FOUND if record does not exist", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] })

      await expect(deleteRecord("nonexistent"))
        .rejects.toThrow("RECORD_NOT_FOUND")
    })

    it("should not return deleted records in getRecords", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "0" }] })
        .mockResolvedValueOnce({ rows: [] })

      const result = await getRecords({})

      expect(result.records).toHaveLength(0)
    })
  })
})