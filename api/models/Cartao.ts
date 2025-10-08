import mongoose, { Document, Schema } from 'mongoose';

export interface ICartao extends Document {
  userId: mongoose.Types.ObjectId;
  nome: string;
  bandeira: string;
  limite: number;
  faturaAtual: number;
  diaVencimento: number;
  diaFechamento: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cartaoSchema = new Schema<ICartao>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório']
  },
  nome: {
    type: String,
    required: [true, 'Nome do cartão é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  bandeira: {
    type: String,
    required: [true, 'Bandeira do cartão é obrigatória'],
    enum: {
      values: ['visa', 'mastercard', 'elo', 'american express', 'hipercard', 'outros'],
      message: 'Bandeira deve ser: visa, mastercard, elo, american express, hipercard ou outros'
    }
  },
  limite: {
    type: Number,
    required: [true, 'Limite do cartão é obrigatório'],
    min: [0, 'Limite deve ser maior ou igual a zero'],
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value >= 0;
      },
      message: 'Limite deve ser um número válido maior ou igual a zero'
    }
  },
  faturaAtual: {
    type: Number,
    default: 0,
    min: [0, 'Fatura atual deve ser maior ou igual a zero'],
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value >= 0;
      },
      message: 'Fatura atual deve ser um número válido maior ou igual a zero'
    }
  },
  diaVencimento: {
    type: Number,
    required: [true, 'Dia de vencimento é obrigatório'],
    min: [1, 'Dia de vencimento deve estar entre 1 e 31'],
    max: [31, 'Dia de vencimento deve estar entre 1 e 31'],
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value >= 1 && value <= 31;
      },
      message: 'Dia de vencimento deve ser um número inteiro entre 1 e 31'
    }
  },
  diaFechamento: {
    type: Number,
    required: [true, 'Dia de fechamento é obrigatório'],
    min: [1, 'Dia de fechamento deve estar entre 1 e 31'],
    max: [31, 'Dia de fechamento deve estar entre 1 e 31'],
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value >= 1 && value <= 31;
      },
      message: 'Dia de fechamento deve ser um número inteiro entre 1 e 31'
    }
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para performance
cartaoSchema.index({ userId: 1, ativo: 1 });
cartaoSchema.index({ userId: 1, nome: 1 }, { unique: true });

// Middleware para validar que dia de fechamento seja diferente do vencimento
cartaoSchema.pre('save', function(next) {
  if (this.diaFechamento === this.diaVencimento) {
    const error = new Error('Dia de fechamento deve ser diferente do dia de vencimento');
    return next(error);
  }
  next();
});

// Middleware para validar unicidade do nome por usuário
cartaoSchema.pre('save', async function(next) {
  if (!this.isModified('nome') && !this.isNew) return next();
  
  const existingCard = await mongoose.model('Cartao').findOne({
    userId: this.userId,
    nome: this.nome,
    _id: { $ne: this._id }
  });
  
  if (existingCard) {
    const error = new Error('Já existe um cartão com este nome');
    return next(error);
  }
  
  next();
});

// Middleware para garantir valores default em documentos antigos
cartaoSchema.post('find', function(docs) {
  if (Array.isArray(docs)) {
    docs.forEach(doc => {
      if (doc && typeof doc.faturaAtual === 'undefined') {
        doc.faturaAtual = 0;
      }
    });
  }
});

cartaoSchema.post('findOne', function(doc) {
  if (doc && typeof doc.faturaAtual === 'undefined') {
    doc.faturaAtual = 0;
  }
});

export const Cartao = mongoose.model<ICartao>('Cartao', cartaoSchema);