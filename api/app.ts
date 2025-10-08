/**
 * Sistema de Finanças Pessoais - API Server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'  // Mantenha pra ESM
import { connectDatabase } from './config/database.js'
import apiRoutes from './routes/index.js'

// Fix: __dirname compatível ESM/CJS
let __filename: string;
if (import.meta.url) {
  __filename = fileURLToPath(import.meta.url);
} else {
  __filename = (global as any).__filename;  // Fallback CJS
}
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

// Conectar ao banco de dados
connectDatabase()

const app: express.Application = express()

// Middlewares globais
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://despesas-app.seudominio.com']  // Ajuste pro seu domínio EasyPanel
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Middleware para logs de requisições
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

/**
 * API Routes
 */
app.use('/api', apiRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

// Serving do Frontend React em Prod (mantenha como está)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app