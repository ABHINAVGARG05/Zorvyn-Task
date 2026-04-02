import pool from './db'
import fs from 'fs'
import path from 'path'

import logger from '../utils/logger'

const run = async () => {
  const migrationDir = path.join(process.cwd(), 'migrations')
  const files = fs.readdirSync(migrationDir).sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8')
    await pool.query(sql)
    logger.info(`Ran: ${file}`)
  }

  await pool.end()
  process.exit(0)
}

run().catch((err) => {
  logger.info(`Migration failed:, ${err}`)
  process.exit(1)
})