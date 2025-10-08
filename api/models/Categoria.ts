import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoria extends Document {
  userId: mongoose.Types.ObjectId;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: string;
  ativa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categoriaSchema = new Schema<ICategoria>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório']
  },
  nome: {
    type: String,
    required: [true, 'Nome da categoria é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
  },
  tipo: {
    type: String,
    enum: {
      values: ['receita', 'despesa'],
      message: 'Tipo deve ser "receita" ou "despesa"'
    },
    required: [true, 'Tipo da categoria é obrigatório']
  },
  cor: {
    type: String,
    required: [true, 'Cor da categoria é obrigatória'],
    match: [/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)']
  },
  icone: {
    type: String,
    required: [true, 'Ícone da categoria é obrigatório'],
    default: 'tag'
  },
  ativa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Índices para performance
categoriaSchema.index({ userId: 1, tipo: 1 });
categoriaSchema.index({ userId: 1, ativa: 1 });
categoriaSchema.index({ userId: 1, nome: 1 }, { unique: true });

// Middleware para validar unicidade do nome por usuário
categoriaSchema.pre('save', async function(next) {
  if (!this.isModified('nome') && !this.isNew) return next();
  
  const existingCategory = await mongoose.model('Categoria').findOne({
    userId: this.userId,
    nome: this.nome,
    _id: { $ne: this._id }
  });
  
  if (existingCategory) {
    const error = new Error('Já existe uma categoria com este nome');
    return next(error);
  }
  
  next();
});

export const Categoria = mongoose.model<ICategoria>('Categoria', categoriaSchema);