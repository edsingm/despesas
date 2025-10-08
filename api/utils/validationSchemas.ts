import Joi from 'joi';

// Schema base para ObjectId - aceita strings vazias e as converte para undefined
const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .allow('')
  .custom((value, helpers) => {
    if (value === '') {
      return undefined;
    }
    return value;
  })
  .message('ID deve ser um ObjectId válido');

// Schemas para User
export const userRegisterSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
});

export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Senha é obrigatória'
    })
});

export const userUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
  
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Email deve ter um formato válido'
    })
});

export const userChangePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Senha atual é obrigatória'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Nova senha deve ter pelo menos 6 caracteres',
      'any.required': 'Nova senha é obrigatória'
    })
});

// Agrupamento dos schemas de usuário
export const userSchemas = {
  register: userRegisterSchema,
  login: userLoginSchema,
  update: userUpdateSchema,
  changePassword: userChangePasswordSchema
};

// Schemas para Categoria
export const createCategoriaSchema = Joi.object({
  nome: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 50 caracteres'
  }),
  tipo: Joi.string().valid('receita', 'despesa').required().messages({
    'any.only': 'Tipo deve ser receita ou despesa',
    'any.required': 'Tipo é obrigatório'
  }),
  descricao: Joi.string().max(200).allow('').messages({
    'string.max': 'Descrição deve ter no máximo 200 caracteres'
  }),
  cor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).messages({
    'string.pattern.base': 'Cor deve estar no formato hexadecimal (#RRGGBB)'
  }),
  icone: Joi.string().default('tag').messages({
    'string.base': 'Ícone deve ser uma string'
  })
});

export const updateCategoriaSchema = Joi.object({
  nome: Joi.string().min(2).max(50).messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 50 caracteres'
  }),
  tipo: Joi.string().valid('receita', 'despesa').messages({
    'any.only': 'Tipo deve ser receita ou despesa'
  }),
  descricao: Joi.string().max(200).allow('').messages({
    'string.max': 'Descrição deve ter no máximo 200 caracteres'
  }),
  cor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).messages({
    'string.pattern.base': 'Cor deve estar no formato hexadecimal (#RRGGBB)'
  }),
  icone: Joi.string().messages({
    'string.base': 'Ícone deve ser uma string'
  })
});

// Agrupamento dos schemas de categoria
export const categoriaSchemas = {
  create: createCategoriaSchema,
  update: updateCategoriaSchema
};

// Schemas para Banco
export const bancoCreateSchema = Joi.object({
  nome: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome do banco é obrigatório'
    }),
  
  tipo: Joi.string()
    .valid('conta_corrente', 'conta_poupanca', 'conta_investimento')
    .required()
    .messages({
      'any.only': 'Tipo deve ser "conta_corrente", "conta_poupanca" ou "conta_investimento"',
      'any.required': 'Tipo da conta é obrigatório'
    }),
  
  saldoInicial: Joi.number()
    .required()
    .messages({
      'number.base': 'Saldo inicial deve ser um número',
      'any.required': 'Saldo inicial é obrigatório'
    }),
  
  ativo: Joi.boolean().default(true)
});

export const bancoUpdateSchema = Joi.object({
  nome: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
  
  tipo: Joi.string()
    .valid('conta_corrente', 'conta_poupanca', 'conta_investimento')
    .messages({
      'any.only': 'Tipo deve ser "conta_corrente", "conta_poupanca" ou "conta_investimento"'
    }),
  
  saldoInicial: Joi.number()
    .messages({
      'number.base': 'Saldo inicial deve ser um número'
    }),
  
  ativo: Joi.boolean()
});

// Schemas para Cartao
export const cartaoCreateSchema = Joi.object({
  nome: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome do cartão é obrigatório'
    }),
  
  bandeira: Joi.string()
    .valid('visa', 'mastercard', 'elo', 'american express', 'hipercard', 'outros')
    .required()
    .messages({
      'any.only': 'Bandeira deve ser: visa, mastercard, elo, american express, hipercard ou outros',
      'any.required': 'Bandeira do cartão é obrigatória'
    }),
  
  limite: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Limite deve ser um número',
      'number.min': 'Limite deve ser maior ou igual a zero',
      'any.required': 'Limite do cartão é obrigatório'
    }),
  
  diaVencimento: Joi.number()
    .integer()
    .min(1)
    .max(31)
    .required()
    .messages({
      'number.base': 'Dia de vencimento deve ser um número',
      'number.integer': 'Dia de vencimento deve ser um número inteiro',
      'number.min': 'Dia de vencimento deve estar entre 1 e 31',
      'number.max': 'Dia de vencimento deve estar entre 1 e 31',
      'any.required': 'Dia de vencimento é obrigatório'
    }),
  
  diaFechamento: Joi.number()
    .integer()
    .min(1)
    .max(31)
    .required()
    .messages({
      'number.base': 'Dia de fechamento deve ser um número',
      'number.integer': 'Dia de fechamento deve ser um número inteiro',
      'number.min': 'Dia de fechamento deve estar entre 1 e 31',
      'number.max': 'Dia de fechamento deve estar entre 1 e 31',
      'any.required': 'Dia de fechamento é obrigatório'
    }),
  
  ativo: Joi.boolean().default(true)
});

export const cartaoUpdateSchema = Joi.object({
  nome: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    }),
  
  bandeira: Joi.string()
    .valid('visa', 'mastercard', 'elo', 'american express', 'hipercard', 'outros')
    .messages({
      'any.only': 'Bandeira deve ser: visa, mastercard, elo, american express, hipercard ou outros'
    }),
  
  limite: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Limite deve ser maior ou igual a zero'
    }),
  
  diaVencimento: Joi.number()
    .integer()
    .min(1)
    .max(31)
    .messages({
      'number.min': 'Dia de vencimento deve estar entre 1 e 31',
      'number.max': 'Dia de vencimento deve estar entre 1 e 31'
    }),
  
  diaFechamento: Joi.number()
    .integer()
    .min(1)
    .max(31)
    .messages({
      'number.min': 'Dia de fechamento deve estar entre 1 e 31',
      'number.max': 'Dia de fechamento deve estar entre 1 e 31'
    }),
  
  ativo: Joi.boolean()
});

// Agrupamento dos schemas de banco
export const bancoSchemas = {
  create: bancoCreateSchema,
  update: bancoUpdateSchema
};

// Agrupamento dos schemas de cartão
export const cartaoSchemas = {
  create: cartaoCreateSchema,
  update: cartaoUpdateSchema
};

// Schemas comuns
export const commonSchemas = {
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'ID deve ser um ObjectId válido'
  }),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

// Schemas para Receita
export const receitaCreateSchema = Joi.object({
  categoriaId: objectIdSchema.required().messages({
    'any.required': 'ID da categoria é obrigatório'
  }),
  
  bancoId: objectIdSchema.required().messages({
    'any.required': 'ID do banco é obrigatório'
  }),
  
  descricao: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Descrição deve ter pelo menos 2 caracteres',
      'string.max': 'Descrição deve ter no máximo 200 caracteres',
      'any.required': 'Descrição é obrigatória'
    }),
  
  valor: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Valor deve ser um número',
      'number.positive': 'Valor deve ser maior que zero',
      'any.required': 'Valor é obrigatório'
    }),
  
  data: Joi.alternatives()
    .try(
      Joi.date(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    )
    .required()
    .messages({
      'alternatives.match': 'Data deve ser uma data válida no formato YYYY-MM-DD',
      'any.required': 'Data é obrigatória'
    }),
  
  recorrente: Joi.boolean().default(false),
  
  tipoRecorrencia: Joi.string()
    .valid('mensal', 'anual')
    .when('recorrente', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.only': 'Tipo de recorrência deve ser "mensal" ou "anual"'
    }),
  
  observacoes: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Observações devem ter no máximo 500 caracteres'
    })
});

export const receitaUpdateSchema = Joi.object({
  categoriaId: objectIdSchema,
  bancoId: objectIdSchema,
  
  descricao: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .messages({
      'string.min': 'Descrição deve ter pelo menos 2 caracteres',
      'string.max': 'Descrição deve ter no máximo 200 caracteres'
    }),
  
  valor: Joi.number()
    .positive()
    .messages({
      'number.base': 'Valor deve ser um número',
      'number.positive': 'Valor deve ser maior que zero'
    }),
  
  data: Joi.alternatives()
    .try(
      Joi.date(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    )
    .messages({
      'alternatives.match': 'Data deve ser uma data válida no formato YYYY-MM-DD'
    }),
  
  recorrente: Joi.boolean(),
  
  tipoRecorrencia: Joi.string()
    .valid('mensal', 'anual')
    .messages({
      'any.only': 'Tipo de recorrência deve ser "mensal" ou "anual"'
    }),
  
  observacoes: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Observações devem ter no máximo 500 caracteres'
    })
});

// Schemas para Despesa
export const despesaCreateSchema = Joi.object({
  categoriaId: objectIdSchema.required().messages({
    'any.required': 'ID da categoria é obrigatório'
  }),
  
  bancoId: objectIdSchema.when('formaPagamento', {
    is: Joi.string().valid('dinheiro', 'debito', 'pix', 'transferencia'),
    then: Joi.required().messages({
      'any.required': 'Banco é obrigatório para este tipo de pagamento'
    }),
    otherwise: Joi.optional()
  }),
  
  cartaoId: objectIdSchema.when('formaPagamento', {
    is: 'credito',
    then: Joi.required().messages({
      'any.required': 'Cartão é obrigatório para pagamento no crédito'
    }),
    otherwise: Joi.optional()
  }),
  
  descricao: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Descrição deve ter pelo menos 2 caracteres',
      'string.max': 'Descrição deve ter no máximo 200 caracteres',
      'any.required': 'Descrição é obrigatória'
    }),
  
  valorTotal: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Valor total deve ser um número',
      'number.positive': 'Valor deve ser maior que zero',
      'any.required': 'Valor total é obrigatório'
    }),
  
  data: Joi.alternatives()
    .try(
      Joi.date(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    )
    .required()
    .messages({
      'alternatives.match': 'Data deve ser uma data válida no formato YYYY-MM-DD',
      'any.required': 'Data é obrigatória'
    }),
  
  formaPagamento: Joi.string()
    .valid('dinheiro', 'debito', 'credito', 'pix', 'transferencia')
    .required()
    .messages({
      'any.only': 'Forma de pagamento deve ser: dinheiro, debito, credito, pix ou transferencia',
      'any.required': 'Forma de pagamento é obrigatória'
    }),
  
  parcelado: Joi.boolean().default(false),
  
  numeroParcelas: Joi.when('parcelado', {
    is: true,
    then: Joi.number()
      .integer()
      .min(2)
      .max(60)
      .required()
      .messages({
        'number.base': 'Número de parcelas deve ser um número',
        'number.integer': 'Número de parcelas deve ser um número inteiro',
        'number.min': 'Número de parcelas deve ser pelo menos 2',
        'number.max': 'Número de parcelas deve ser no máximo 60',
        'any.required': 'Número de parcelas é obrigatório quando parcelado'
      }),
    otherwise: Joi.number().integer().optional().strip()
  }),
  
  recorrente: Joi.boolean().default(false),
  
  tipoRecorrencia: Joi.string()
    .valid('mensal', 'anual')
    .when('recorrente', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.only': 'Tipo de recorrência deve ser "mensal" ou "anual"'
    }),
  
  observacoes: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Observações devem ter no máximo 500 caracteres'
    })
});

export const despesaUpdateSchema = Joi.object({
  categoriaId: objectIdSchema,
  bancoId: objectIdSchema,
  cartaoId: objectIdSchema,
  
  descricao: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .messages({
      'string.min': 'Descrição deve ter pelo menos 2 caracteres',
      'string.max': 'Descrição deve ter no máximo 200 caracteres'
    }),
  
  valorTotal: Joi.number()
    .positive()
    .messages({
      'number.base': 'Valor total deve ser um número',
      'number.positive': 'Valor deve ser maior que zero'
    }),
  
  data: Joi.alternatives()
    .try(
      Joi.date(),
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    )
    .messages({
      'alternatives.match': 'Data deve ser uma data válida no formato YYYY-MM-DD'
    }),
  
  formaPagamento: Joi.string()
    .valid('dinheiro', 'debito', 'credito', 'pix', 'transferencia')
    .messages({
      'any.only': 'Forma de pagamento deve ser: dinheiro, debito, credito, pix ou transferencia'
    }),
  
  recorrente: Joi.boolean(),
  
  tipoRecorrencia: Joi.string()
    .valid('mensal', 'anual')
    .messages({
      'any.only': 'Tipo de recorrência deve ser "mensal" ou "anual"'
    }),
  
  observacoes: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Observações devem ter no máximo 500 caracteres'
    })
});

// Schema para atualizar parcela
export const parcelaUpdateSchema = Joi.object({
  paga: Joi.boolean().required(),
  dataPagamento: Joi.date().when('paga', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

// Schemas para filtros e consultas
export const filterSchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  categoriaId: objectIdSchema,
  bancoId: objectIdSchema,
  cartaoId: objectIdSchema,
  formaPagamento: Joi.string().valid('dinheiro', 'debito', 'credito', 'pix', 'transferencia'),
  recorrente: Joi.boolean(),
  parcelado: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('asc', 'desc').default('desc'),
  sortBy: Joi.string().default('data')
});

// Agrupamento dos schemas de receita
export const receitaSchemas = {
  create: receitaCreateSchema,
  update: receitaUpdateSchema
};

// Agrupamento dos schemas de despesa
export const despesaSchemas = {
  create: despesaCreateSchema,
  update: despesaUpdateSchema,
  updateParcela: parcelaUpdateSchema
};