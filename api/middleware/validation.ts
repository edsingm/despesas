import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Middleware genérico de validação usando Joi
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos os erros, não apenas o primeiro
      stripUnknown: true // Remove campos não definidos no schema
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errorDetails
      });
      return;
    }

    // Substitui req.body pelos dados validados e limpos
    req.body = value;
    next();
  };
};

// Alias para compatibilidade
export const validateBody = validate;

/**
 * Middleware de validação para parâmetros da URL
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: errorDetails
      });
      return;
    }

    req.params = value;
    next();
  };
};

/**
 * Middleware de validação para query parameters
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        message: 'Parâmetros de consulta inválidos',
        errors: errorDetails
      });
      return;
    }

    req.query = value;
    next();
  };
};

// Schemas de validação comuns

/**
 * Schema para validação de ObjectId do MongoDB
 */
export const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .message('ID deve ser um ObjectId válido');

/**
 * Schema para validação de parâmetros com ID
 */
export const idParamSchema = Joi.object({
  id: objectIdSchema.required()
});

/**
 * Schema para validação de paginação
 */
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('asc', 'desc').default('desc'),
  sortBy: Joi.string().default('createdAt')
});

/**
 * Schema para validação de filtros de data
 */
export const dateFilterSchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

/**
 * Schema para validação de upload de arquivo
 */
export const fileUploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().valid(
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ).required(),
  size: Joi.number().max(5 * 1024 * 1024) // 5MB máximo
});

/**
 * Middleware para validar se o usuário é o proprietário do recurso
 */
export const validateOwnership = (resourceUserIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];
    const requestUserId = req.userId;

    if (!requestUserId) {
      res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
      return;
    }

    if (resourceUserId && resourceUserId !== requestUserId) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado - recurso não pertence ao usuário'
      });
      return;
    }

    next();
  };
};