import mongoose, { Document, Schema } from 'mongoose';

export interface IReceita extends Document {
  userId: mongoose.Types.ObjectId;
  categoriaId: mongoose.Types.ObjectId;
  bancoId: mongoose.Types.ObjectId;
  descricao: string;
  valor: number;
  data: Date;
  recorrente: boolean;
  tipoRecorrencia?: 'diaria' | 'semanal' | 'mensal' | 'anual';
  observacoes?: string;
  comprovante?: string;
  createdAt: Date;
  updatedAt: Date;
}

const receitaSchema = new Schema<IReceita>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório']
  },
  categoriaId: {
    type: Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'ID da categoria é obrigatório']
  },
  bancoId: {
    type: Schema.Types.ObjectId,
    ref: 'Banco',
    required: [true, 'ID do banco é obrigatório']
  },
  descricao: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    minlength: [2, 'Descrição deve ter pelo menos 2 caracteres'],
    maxlength: [200, 'Descrição deve ter no máximo 200 caracteres']
  },
  valor: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    min: [0.01, 'Valor deve ser maior que zero'],
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value) && value > 0;
      },
      message: 'Valor deve ser um número válido maior que zero'
    }
  },
  data: {
    type: Date,
    required: [true, 'Data é obrigatória'],
    validate: {
      validator: function(value: Date) {
        return value instanceof Date && !isNaN(value.getTime());
      },
      message: 'Data deve ser uma data válida'
    }
  },
  recorrente: {
    type: Boolean,
    default: false
  },
  tipoRecorrencia: {
    type: String,
    enum: {
      values: ['diaria', 'semanal', 'mensal', 'anual'],
      message: 'Tipo de recorrência deve ser "diaria", "semanal", "mensal" ou "anual"'
    },
    required: function(this: IReceita) {
      return this.recorrente;
    }
  },
  observacoes: {
    type: String,
    trim: true,
    maxlength: [500, 'Observações devem ter no máximo 500 caracteres']
  },
  comprovante: {
    type: String,
    trim: true,
    validate: {
      validator: function(value: string) {
        if (!value) return true;
        // Validar se é um caminho de arquivo válido
        return /^[a-zA-Z0-9._/-]+\.(jpg|jpeg|png|pdf)$/i.test(value);
      },
      message: 'Comprovante deve ser um arquivo válido (jpg, jpeg, png, pdf)'
    }
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
receitaSchema.index({ userId: 1, data: -1 });
receitaSchema.index({ userId: 1, categoriaId: 1 });
receitaSchema.index({ userId: 1, bancoId: 1 });
receitaSchema.index({ userId: 1, recorrente: 1 });

// Middleware para validar se categoria é do tipo receita
receitaSchema.pre('save', async function(next) {
  if (!this.isModified('categoriaId') && !this.isNew) return next();
  
  const categoria = await mongoose.model('Categoria').findOne({
    _id: this.categoriaId,
    userId: this.userId,
    tipo: 'receita'
  });
  
  if (!categoria) {
    const error = new Error('Categoria deve ser do tipo receita e pertencer ao usuário');
    return next(error);
  }
  
  next();
});

// Middleware para validar se banco pertence ao usuário
receitaSchema.pre('save', async function(next) {
  if (!this.isModified('bancoId') && !this.isNew) return next();
  
  const banco = await mongoose.model('Banco').findOne({
    _id: this.bancoId,
    userId: this.userId
  });
  
  if (!banco) {
    const error = new Error('Banco deve pertencer ao usuário');
    return next(error);
  }
  
  next();
});

export const Receita = mongoose.model<IReceita>('Receita', receitaSchema);