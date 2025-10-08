import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Configuração do storage em memória
const storage = multer.memoryStorage();

// Filtro para tipos de arquivo permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos MIME permitidos
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];

  // Extensões permitidas
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use apenas JPG, JPEG, PNG ou PDF.'));
  }
};

// Configuração do multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB por padrão
    files: 1 // Apenas um arquivo por vez
  }
});

/**
 * Middleware para upload de comprovante
 */
export const uploadComprovante = upload;

// Alias para compatibilidade
export const uploadMiddleware = upload;

/**
 * Middleware para upload opcional - só processa se for multipart/form-data
 */
export const optionalUpload = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    
    // Se é multipart/form-data, usar o multer
    if (contentType && contentType.includes('multipart/form-data')) {
      upload.single(fieldName)(req, res, next);
    } else {
      // Se não é multipart, pular o multer
      next();
    }
  };
};

/**
 * Middleware para tratar erros de upload
 */
export const handleUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(400).json({
          success: false,
          message: 'Arquivo muito grande. Tamanho máximo: 5MB'
        });
        return;
      
      case 'LIMIT_FILE_COUNT':
        res.status(400).json({
          success: false,
          message: 'Muitos arquivos. Envie apenas um arquivo por vez'
        });
        return;
      
      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400).json({
          success: false,
          message: 'Campo de arquivo inesperado'
        });
        return;
      
      default:
        res.status(400).json({
          success: false,
          message: 'Erro no upload do arquivo'
        });
        return;
    }
  }

  if (error.message.includes('Tipo de arquivo não permitido')) {
    res.status(400).json({
      success: false,
      message: error.message
    });
    return;
  }

  // Outros erros
  console.error('Erro no upload:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno no upload do arquivo'
  });
};

/**
 * Middleware para processar arquivo uploadado
 */
export const processUploadedFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.file) {
    next();
    return;
  }

  try {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${timestamp}_${randomString}${fileExtension}`;
    
    // Adicionar informações do arquivo processado ao request
    req.body.uploadedFile = {
      originalName: req.file.originalname,
      fileName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer
    };

    next();
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar arquivo'
    });
  }
};

/**
 * Função utilitária para salvar arquivo no sistema de arquivos
 */
export const saveFileToSystem = async (
  buffer: Buffer,
  fileName: string,
  uploadPath: string = process.env.UPLOAD_PATH || './uploads'
): Promise<string> => {
  const fs = await import('fs/promises');
  const fullPath = path.join(uploadPath, fileName);
  
  try {
    // Criar diretório se não existir
    await fs.mkdir(uploadPath, { recursive: true });
    
    // Salvar arquivo
    await fs.writeFile(fullPath, buffer);
    
    return fileName;
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    throw new Error('Erro ao salvar arquivo no sistema');
  }
};

/**
 * Função utilitária para deletar arquivo do sistema
 */
export const deleteFileFromSystem = async (
  fileName: string,
  uploadPath: string = process.env.UPLOAD_PATH || './uploads'
): Promise<void> => {
  const fs = await import('fs/promises');
  const fullPath = path.join(uploadPath, fileName);
  
  try {
    await fs.unlink(fullPath);
  } catch (error) {
    // Não lançar erro se arquivo não existir
    if ((error as any).code !== 'ENOENT') {
      console.error('Erro ao deletar arquivo:', error);
    }
  }
};

/**
 * Middleware para validar se arquivo é obrigatório
 */
export const requireFile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'Arquivo é obrigatório'
    });
    return;
  }
  
  next();
};