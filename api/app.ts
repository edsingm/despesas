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
// CORS mais permissivo para permitir health checks
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (origin, callback) => {
        // Permitir health checks sem origin e domínios específicos
        if (!origin || origin.includes('despesas.halz.com.br') || origin.includes('halz.com.br')) {
          callback(null, true);
        } else {
          callback(null, true); // Temporariamente permitir todos para debug
        }
      }
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Middleware para logs de requisições
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Servir arquivos estáticos (uploads)
// Em produção: __dirname = /app/dist/server/api, então ../../../uploads = /app/uploads
app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')))

/**
 * API Routes
 */
app.use('/api', apiRoutes)

/**
 * health checks - must be before catch-all routes
 */
app.get('/health', (req: Request, res: Response) => {
  const dbStatus = {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  };
  
  // Return 200 even if DB is not connected yet (graceful startup)
  res.status(200).json({
    success: true,
    message: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  })
})

app.get('/api/health', (req: Request, res: Response) => {
  const dbStatus = {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState
  };
  
  res.status(200).json({
    success: true,
    message: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  })
})

/**
 * error handler middleware (must be before catch-all route)
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

// Serving do Frontend React em Prod
// Em produção: __dirname = /workspace/dist/server/api, então ../.. = /workspace/dist
// Este deve ser o ÚLTIMO handler para catch-all de rotas não encontradas
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../..');
  const indexPath = path.join(__dirname, '../../index.html');
  
  console.log(`📁 Frontend path: ${frontendPath}`);
  console.log(`📄 Index.html path: ${indexPath}`);
  console.log(`📂 __dirname: ${__dirname}`);
  
  // Serve static files with proper configuration
  app.use(express.static(frontendPath, { 
    maxAge: '1d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set correct MIME types for JS modules
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
      console.log(`📦 Serving static file: ${filePath}`);
    }
  }));
  
  // SPA catch-all - serve index.html for all non-api, non-file routes
  app.get('*', (req: Request, res: Response) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ 
        success: false, 
        error: 'API endpoint not found' 
      });
    }
    
    // For file requests that weren't found by static middleware
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
      console.log(`❌ Static file not found: ${req.path}`);
      return res.status(404).send('File not found');
    }
    
    // Serve index.html for SPA routes
    console.log(`📍 SPA catch-all serving index.html for: ${req.path}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('❌ Error serving index.html:', err);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to load application',
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    });
  });
} else {
  // Em desenvolvimento, retornar 404 para rotas não encontradas
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    })
  })
}

export default app