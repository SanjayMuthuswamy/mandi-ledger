import 'dotenv/config'
import { app } from './app.js'
import { logger } from './lib/logger.js'

const PORT = Number(process.env.PORT ?? 8000)

app.listen(PORT, () => {
  logger.info(`🌾 Mandi Ledger API running on http://localhost:${PORT}`)
})

