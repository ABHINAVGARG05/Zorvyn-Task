import { getSummary, getByCategory, getTrends, getRecent } from "./dashboard.service"
import pool from "../../config/db"

jest.mock("../../config/db", () => ({ query: jest.fn() }))

const mockQuery = pool.query as jest.Mock

describe("DashboardService", () => {
  afterEach(() => jest.clearAllMocks())

  describe("getSummary", () => {
    it("should return total income, expenses and net balance", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ total_income: "5000", total_expenses: "2000", net_balance: "3000" }],
      })

      const summary = await getSummary()

      expect(summary.total_income).toBe("5000")
      expect(summary.total_expenses).toBe("2000")
      expect(summary.net_balance).toBe("3000")
    })

    it("should return zeros if no records", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ total_income: "0", total_expenses: "0", net_balance: "0" }],
      })

      const summary = await getSummary()

      expect(summary.total_income).toBe("0")
      expect(summary.total_expenses).toBe("0")
      expect(summary.net_balance).toBe("0")
    })

    it("should calculate net balance as income minus expenses", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ total_income: "3000", total_expenses: "1000", net_balance: "2000" }],
      })

      const summary = await getSummary()

      const net = parseFloat(summary.net_balance)
      const income = parseFloat(summary.total_income)
      const expenses = parseFloat(summary.total_expenses)
      expect(net).toBe(income - expenses)
    })
  })

  describe("getByCategory", () => {
    it("should return category wise totals", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { category: "salary", type: "income", total: "5000", count: "1" },
          { category: "food", type: "expense", total: "1000", count: "3" },
        ],
      })

      const result = await getByCategory()

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      expect(result[0].category).toBe("salary")
    })

    it("should return empty array if no records", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] })

      const result = await getByCategory()

      expect(result).toHaveLength(0)
    })

    it("should separate income and expense for same category", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { category: "freelance", type: "income", total: "2000", count: "2" },
          { category: "freelance", type: "expense", total: "500", count: "1" },
        ],
      })

      const result = await getByCategory()

      expect(result).toHaveLength(2)
      expect(result[0].type).toBe("income")
      expect(result[1].type).toBe("expense")
    })
  })

  describe("getTrends", () => {
    it("should return monthly trends", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { month: "2026-04", total_income: "5000", total_expenses: "2000", net_balance: "3000" },
          { month: "2026-03", total_income: "4000", total_expenses: "1500", net_balance: "2500" },
        ],
      })

      const result = await getTrends()

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      expect(result[0].month).toBe("2026-04")
    })

    it("should return most recent month first", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { month: "2026-04", total_income: "5000", total_expenses: "2000", net_balance: "3000" },
          { month: "2026-03", total_income: "4000", total_expenses: "1500", net_balance: "2500" },
        ],
      })

      const result = await getTrends()

      expect(result[0].month > result[1].month).toBe(true)
    })

    it("should return empty array if no records", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] })

      const result = await getTrends()

      expect(result).toHaveLength(0)
    })
  })

  describe("getRecent", () => {
    it("should return at most 10 records", async () => {
      const mockRecords = Array.from({ length: 10 }, (_, i) => ({ id: `${i + 1}` }))
      mockQuery.mockResolvedValueOnce({ rows: mockRecords })

      const result = await getRecent()

      expect(result.length).toBeLessThanOrEqual(10)
    })

    it("should return empty array if no records", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] })

      const result = await getRecent()

      expect(result).toHaveLength(0)
    })

    it("should return complete record fields", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: "1",
          user_id: "user1",
          amount: "1000",
          type: "income",
          category: "salary",
          date: "2026-04-01",
          notes: "April salary",
          created_at: new Date(),
          updated_at: new Date(),
        }],
      })

      const result = await getRecent()

      expect(result[0]).toHaveProperty("id")
      expect(result[0]).toHaveProperty("amount")
      expect(result[0]).toHaveProperty("type")
      expect(result[0]).toHaveProperty("category")
    })
  })
})