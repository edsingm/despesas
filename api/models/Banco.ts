import mongoose, { Document, Schema } from 'mongoose';

export interface IBanco extends Document {
  userId: mongoose.Types.ObjectId;
  nome: string;
  tipo: 'conta_corrente' | 'conta_poupanca' | 'conta_investimento';
  saldoInicial: number;
  saldoAtual: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bancoSchema = new Schema<IBanco>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório']
  },
  nome: {
    type: String,
    required: [true, 'Nome do banco é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  tipo: {
    type: String,
    enum: {
      values: ['conta_corrente', 'conta_poupanca', 'conta_investimento'],
      message: 'Tipo deve ser "conta_corrente", "conta_poupanca" ou "conta_investimento"'
    },
    required: [true, 'Tipo da conta é obrigatório']
  },
  saldoInicial: {
    type: Number,
    required: [true, 'Saldo inicial é obrigatório'],
    default: 0,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value);
      },
      message: 'Saldo inicial deve ser um número válido'
    }
  },
  saldoAtual: {
    type: Number,
    required: [true, 'Saldo atual é obrigatório'],
    default: 0,
    validate: {
      validator: function(value: number) {
        return !isNaN(value) && isFinite(value);
      },
      message: 'Saldo atual deve ser um número válido'
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
bancoSchema.index({ userId: 1, ativo: 1 });
bancoSchema.index({ userId: 1, nome: 1 }, { unique: true });

// Middleware para definir saldo atual igual ao inicial na criação
bancoSchema.pre('save', function(next) {
  if (this.isNew && this.saldoAtual === 0) {
    this.saldoAtual = this.saldoInicial;
  }
  next();
});

// Middleware para validar unicidade do nome por usuário
bancoSchema.pre('save', async function(next) {
  if (!this.isModified('nome') && !this.isNew) return next();
  
  const existingBank = await mongoose.model('Banco').findOne({
    userId: this.userId,
    nome: this.nome,
    _id: { $ne: this._id }
  });
  
  if (existingBank) {
    const error = new Error('Já existe um banco com este nome');
    return next(error);
  }
  
  next();
});

export const Banco = mongoose.model<IBanco>('Banco', bancoSchema);