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
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import { connectDatabase } from './config/database.js'
import apiRoutes from './routes/index.js'

// __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

// Conectar ao banco de dados
connectDatabase()

const app: express.Application = express()

// Middlewares globais
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (origin, callback) => {
        if (!origin || origin.includes('despesas.halz.com.br') || origin.includes('halz.com.br')) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      }
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Middleware para logs de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
  })
}

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')))

/**
 * API Routes
 */
app.use('/api', apiRoutes)

/**
 * health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ok',
    timestamp: new Date().toISOString()
  })
})

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'ok',
    timestamp: new Date().toISOString()
  })
})

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

// Serving do Frontend React em Prod
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../..');
  const indexPath = path.join(__dirname, '../../index.html');
  
  // Serve static files
  app.use(express.static(frontendPath));
  
  // SPA catch-all - must be last
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(indexPath);
  });
}

export default app