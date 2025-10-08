import mongoose, { Document, Schema } from 'mongoose';

export interface IParcela {
  numero: number;
  valor: number;
  dataVencimento: Date;
  paga: boolean;
  dataPagamento?: Date;
}

export interface IDespesa extends Document {
  userId: mongoose.Types.ObjectId;
  categoriaId: mongoose.Types.ObjectId;
  bancoId?: mongoose.Types.ObjectId;
  cartaoId?: mongoose.Types.ObjectId;
  descricao: string;
  valorTotal: number;
  data: Date;
  formaPagamento: 'dinheiro' | 'debito' | 'credito' | 'pix' | 'transferencia';
  parcelado: boolean;
  numeroParcelas?: number;
  parcelas?: IParcela[];
  recorrente: boolean;
  tipoRecorrencia?: 'diaria' | 'semanal' | 'mensal' | 'anual';
  observacoes?: string;
  comprovante?: string;
  createdAt: Date;
  updatedAt: Date;
}

const parcelaSchema = new Schema<IParcela>({
  numero: {
    type: Number,
    required: true,
    min: 1
  },
  valor: {
    type: Number,
    required: true,
    min: 0.01
  },
  dataVencimento: {
    type: Date,
    required: true
  },
  paga: {
    type: Boolean,
    default: false
  },
  dataPagamento: {
    type: Date
  }
}, { _id: false });

const despesaSchema = new Schema<IDespesa>({
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
    required: function(this: IDespesa) {
      return ['dinheiro', 'debito', 'pix', 'transferencia'].includes(this.formaPagamento);
    }
  },
  cartaoId: {
    type: Schema.Types.ObjectId,
    ref: 'Cartao',
    required: function(this: IDespesa) {
      return this.formaPagamento === 'credito';
    }
  },
  descricao: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    minlength: [2, 'Descrição deve ter pelo menos 2 caracteres'],
    maxlength: [200, 'Descrição deve ter no máximo 200 caracteres']
  },
  valorTotal: {
    type: Number,
    required: [true, 'Valor total é obrigatório'],
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
  formaPagamento: {
    type: String,
    enum: {
      values: ['dinheiro', 'debito', 'credito', 'pix', 'transferencia'],
      message: 'Forma de pagamento deve ser: dinheiro, debito, credito, pix ou transferencia'
    },
    required: [true, 'Forma de pagamento é obrigatória']
  },
  parcelado: {
    type: Boolean,
    default: false
  },
  numeroParcelas: {
    type: Number,
    min: [2, 'Número de parcelas deve ser pelo menos 2'],
    max: [60, 'Número de parcelas deve ser no máximo 60'],
    required: function(this: IDespesa) {
      return this.parcelado;
    },
    validate: {
      validator: function(value: number) {
        if (!value) return true;
        return Number.isInteger(value) && value >= 2 && value <= 60;
      },
      message: 'Número de parcelas deve ser um número inteiro entre 2 e 60'
    }
  },
  parcelas: [parcelaSchema],
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
    required: function(this: IDespesa) {
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
        return /^[a-zA-Z0-9._/-]+\.(jpg|jpeg|png|pdf)$/i.test(value);
      },
      message: 'Comprovante deve ser um arquivo válido (jpg, jpeg, png, pdf)'
    }
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
despesaSchema.index({ userId: 1, data: -1 });
despesaSchema.index({ userId: 1, categoriaId: 1 });
despesaSchema.index({ userId: 1, bancoId: 1 });
despesaSchema.index({ userId: 1, cartaoId: 1 });
despesaSchema.index({ userId: 1, formaPagamento: 1 });
despesaSchema.index({ userId: 1, parcelado: 1 });
despesaSchema.index({ userId: 1, recorrente: 1 });
despesaSchema.index({ 'parcelas.dataVencimento': 1, 'parcelas.paga': 1 });

// Middleware para gerar parcelas automaticamente
despesaSchema.pre('save', function(next) {
  if (this.parcelado && this.numeroParcelas && (!this.parcelas || this.parcelas.length === 0)) {
    const valorParcela = this.valorTotal / this.numeroParcelas;
    const parcelas: IParcela[] = [];
    
    for (let i = 1; i <= this.numeroParcelas; i++) {
      const dataVencimento = new Date(this.data);
      dataVencimento.setMonth(dataVencimento.getMonth() + i - 1);
      
      parcelas.push({
        numero: i,
        valor: i === this.numeroParcelas ? 
          this.valorTotal - (valorParcela * (this.numeroParcelas - 1)) : // Última parcela ajusta diferenças de centavos
          Math.round(valorParcela * 100) / 100,
        dataVencimento,
        paga: false
      });
    }
    
    this.parcelas = parcelas;
  }
  
  next();
});

// Middleware para validar se categoria é do tipo despesa
despesaSchema.pre('save', async function(next) {
  if (!this.isModified('categoriaId') && !this.isNew) return next();
  
  const categoria = await mongoose.model('Categoria').findOne({
    _id: this.categoriaId,
    userId: this.userId,
    tipo: 'despesa'
  });
  
  if (!categoria) {
    const error = new Error('Categoria deve ser do tipo despesa e pertencer ao usuário');
    return next(error);
  }
  
  next();
});

// Middleware para validar se banco pertence ao usuário (quando necessário)
despesaSchema.pre('save', async function(next) {
  if (!this.bancoId || (!this.isModified('bancoId') && !this.isNew)) return next();
  
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

// Middleware para validar se cartão pertence ao usuário (quando necessário)
despesaSchema.pre('save', async function(next) {
  if (!this.cartaoId || (!this.isModified('cartaoId') && !this.isNew)) return next();
  
  const cartao = await mongoose.model('Cartao').findOne({
    _id: this.cartaoId,
    userId: this.userId
  });
  
  if (!cartao) {
    const error = new Error('Cartão deve pertencer ao usuário');
    return next(error);
  }
  
  next();
});

// Middleware para validar consistência entre parcelado e recorrente
despesaSchema.pre('save', function(next) {
  if (this.parcelado && this.recorrente) {
    const error = new Error('Despesa não pode ser parcelada e recorrente ao mesmo tempo');
    return next(error);
  }
  next();
});

export const Despesa = mongoose.model<IDespesa>('Despesa', despesaSchema);