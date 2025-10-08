import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Categoria } from '../models/Categoria';
import { Banco } from '../models/Banco';
import { Cartao } from '../models/Cartao';
import { Receita } from '../models/Receita';
import { Despesa } from '../models/Despesa';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seeder para popular o banco de dados com dados iniciais
 */
class DatabaseSeeder {
  private userId!: mongoose.Types.ObjectId;
  private categorias: any[] = [];
  private bancos: any[] = [];
  private cartoes: any[] = [];

  // Referências aos modelos
  private Categoria = Categoria;
  private Banco = Banco;
  private Cartao = Cartao;

  async run() {
    try {
      console.log('🌱 Iniciando seeder...');
      
      // Conectar ao banco
      await connectDatabase();
      
      // Limpar dados existentes
      await this.clearDatabase();
      
      // Criar usuário de teste
      await this.createTestUser();
      
      // Criar categorias padrão
      await this.createDefaultCategories();
      
      // Criar bancos de exemplo
      await this.createSampleBanks();
      
      // Criar cartões de exemplo
      await this.createSampleCards();
      
      // Criar receitas de exemplo
      await this.createSampleReceitas();
      
      // Criar despesas de exemplo
      await this.createSampleDespesas();
      
      console.log('✅ Seeder executado com sucesso!');
      console.log('📧 Email de teste: admin@teste.com');
      console.log('🔑 Senha de teste: 123456');
      
    } catch (error) {
      console.error('❌ Erro ao executar seeder:', error);
    } finally {
      await mongoose.disconnect();
    }
  }

  private async clearDatabase() {
    console.log('🧹 Limpando banco de dados...');
    
    await Promise.all([
      User.deleteMany({}),
      Categoria.deleteMany({}),
      Banco.deleteMany({}),
      Cartao.deleteMany({}),
      Receita.deleteMany({}),
      Despesa.deleteMany({})
    ]);
    
    console.log('✅ Banco de dados limpo');
  }

  private async createTestUser() {
    console.log('👤 Criando usuário de teste...');
    
    const user = new User({
      name: 'Administrador',
      email: 'admin@teste.com',
      passwordHash: '123456'
    });
    
    await user.save();
    this.userId = user._id as mongoose.Types.ObjectId;
    
    console.log('✅ Usuário de teste criado');
  }


  private async createDefaultCategories() {
    console.log('📂 Criando categorias padrão...');
    if (!this.userId) throw new Error('userId não inicializado');

    const categoriasData = [
      // Categorias de Receita
      { nome: 'Salário', tipo: 'receita', cor: '#10B981', icone: 'briefcase' },
      { nome: 'Freelance', tipo: 'receita', cor: '#3B82F6', icone: 'dollar-sign' },
      { nome: 'Investimentos', tipo: 'receita', cor: '#8B5CF6', icone: 'trending-up' },
      { nome: 'Vendas', tipo: 'receita', cor: '#F59E0B', icone: 'shopping-bag' },
      { nome: 'Bônus', tipo: 'receita', cor: '#8B5CF6', icone: 'gift' },
      { nome: 'Renda Extra', tipo: 'receita', cor: '#10B981', icone: 'dollar-sign' },
      { nome: 'Outros', tipo: 'receita', cor: '#6B7280', icone: 'tag' },

      // Categorias de Despesa
      { nome: 'Alimentação', tipo: 'despesa', cor: '#EF4444', icone: 'utensils' },
      { nome: 'Transporte', tipo: 'despesa', cor: '#F97316', icone: 'car' },
      { nome: 'Moradia', tipo: 'despesa', cor: '#84CC16', icone: 'home' },
      { nome: 'Saúde', tipo: 'despesa', cor: '#06B6D4', icone: 'heart' },
      { nome: 'Educação', tipo: 'despesa', cor: '#8B5CF6', icone: 'book' },
      { nome: 'Lazer', tipo: 'despesa', cor: '#EC4899', icone: 'film' },
      { nome: 'Compras', tipo: 'despesa', cor: '#F59E0B', icone: 'shopping-cart' },
      { nome: 'Contas', tipo: 'despesa', cor: '#6B7280', icone: 'zap' },
      { nome: 'Combustível', tipo: 'despesa', cor: '#F97316', icone: 'fuel' },
      { nome: 'Mercado', tipo: 'despesa', cor: '#EF4444', icone: 'banana' },
      { nome: 'Restaurante', tipo: 'despesa', cor: '#EC4899', icone: 'coffee' },
      { nome: 'Cinema', tipo: 'despesa', cor: '#EC4899', icone: 'film' },
      { nome: 'Academia', tipo: 'despesa', cor: '#8B5CF6', icone: 'dumbbell' },
      { nome: 'Telefone', tipo: 'despesa', cor: '#6B7280', icone: 'phone' },
      { nome: 'Internet', tipo: 'despesa', cor: '#6B7280', icone: 'wifi' },
      { nome: 'Energia', tipo: 'despesa', cor: '#F59E0B', icone: 'zap' },
      { nome: 'Água', tipo: 'despesa', cor: '#06B6D4', icone: 'droplet' },
      { nome: 'Roupas', tipo: 'despesa', cor: '#EC4899', icone: 'shirt' },
      { nome: 'Manutenção', tipo: 'despesa', cor: '#6B7280', icone: 'wrench' },
      { nome: 'Viagem', tipo: 'despesa', cor: '#3B82F6', icone: 'plane' },
      { nome: 'Presente', tipo: 'despesa', cor: '#8B5CF6', icone: 'gift' },
      { nome: 'Música', tipo: 'despesa', cor: '#EC4899', icone: 'music' },
      { nome: 'Jogos', tipo: 'despesa', cor: '#8B5CF6', icone: 'gamepad' },
      { nome: 'Cartão', tipo: 'despesa', cor: '#6B7280', icone: 'credit-card' }
    ];
    
    // Inserir todas as categorias de uma vez para evitar problemas de middleware
    const categoriasComUserId = categoriasData.map(cat => ({
      ...cat,
      userId: this.userId
    }));
    
    const categoriasInseridas = await Categoria.insertMany(categoriasComUserId);
    this.categorias = categoriasInseridas;
    
    console.log(`✅ ${this.categorias.length} categorias criadas`);
  }

  private async createSampleBanks() {
    console.log('🏦 Criando bancos de exemplo...');
    if (!this.userId) throw new Error('userId não inicializado');
    
    const bancosData = [
      { nome: 'Conta Corrente Principal', tipo: 'conta_corrente', saldoInicial: 5000 },
      { nome: 'Poupança', tipo: 'conta_poupanca', saldoInicial: 15000 },
      { nome: 'Investimentos', tipo: 'conta_investimento', saldoInicial: 25000 }
    ];
    
    for (const bancoData of bancosData) {
      const banco = new Banco({
        ...bancoData,
        userId: this.userId
      });
      
      await banco.save();
      this.bancos.push(banco);
    }
    
    console.log(`✅ ${this.bancos.length} bancos criados`);
  }

  private async createSampleCards() {
    console.log('💳 Criando cartões de exemplo...');
    if (!this.userId) throw new Error('userId não inicializado');
    
    const cartoesData = [
      { nome: 'Cartão Principal', bandeira: 'visa', limite: 5000, faturaAtual: 0, diaVencimento: 10, diaFechamento: 5 },
      { nome: 'Cartão Reserva', bandeira: 'mastercard', limite: 3000, faturaAtual: 0, diaVencimento: 15, diaFechamento: 10 }
    ];
    
    for (const cartaoData of cartoesData) {
      const cartao = new Cartao({
        ...cartaoData,
        userId: this.userId
      });
      
      await cartao.save();
      this.cartoes.push(cartao);
    }
    
    console.log(`✅ ${this.cartoes.length} cartões criados`);
  }

  private async createSampleReceitas() {
    console.log('💰 Criando receitas de exemplo...');
    if (!this.userId) throw new Error('userId não inicializado');

    const categoriasSalario = this.categorias.filter(c => c.nome === 'Salário');
    const categoriasFreelance = this.categorias.filter(c => c.nome === 'Freelance');
    const categoriasBonus = this.categorias.filter(c => c.nome === 'Bônus');
    const bancoCorrente = this.bancos.find(b => b.tipo === 'conta_corrente');

    const receitasData = [
      {
        categoriaId: categoriasSalario[0]._id,
        bancoId: bancoCorrente._id,
        descricao: 'Salário Janeiro 2024',
        valor: 8000,
        data: new Date('2024-01-05'),
        recorrente: true,
        tipoRecorrencia: 'mensal'
      },
      {
        categoriaId: categoriasFreelance[0]._id,
        bancoId: bancoCorrente._id,
        descricao: 'Projeto Website',
        valor: 2500,
        data: new Date('2024-01-15'),
        recorrente: false
      },
      {
        categoriaId: categoriasBonus[0]._id,
        bancoId: bancoCorrente._id,
        descricao: 'Bônus Natal',
        valor: 2000,
        data: new Date('2023-12-20'),
        recorrente: false
      },
      {
        categoriaId: categoriasSalario[0]._id,
        bancoId: bancoCorrente._id,
        descricao: 'Salário Dezembro 2023',
        valor: 8000,
        data: new Date('2023-12-05'),
        recorrente: true,
        tipoRecorrencia: 'mensal'
      }
    ];
    
    for (const receitaData of receitasData) {
      const receita = new Receita({
        ...receitaData,
        userId: this.userId
      });
      
      await receita.save();
    }
    
    console.log(`✅ ${receitasData.length} receitas criadas`);
  }

  private async createSampleDespesas() {
    console.log('💸 Criando despesas de exemplo...');
    if (!this.userId) throw new Error('userId não inicializado');
    
    const categoriaAlimentacao = this.categorias.find(c => c.nome === 'Alimentação');
    const categoriaTransporte = this.categorias.find(c => c.nome === 'Transporte');
    const categoriaMoradia = this.categorias.find(c => c.nome === 'Moradia');
    const categoriaCompras = this.categorias.find(c => c.nome === 'Compras');
    const categoriaRestaurante = this.categorias.find(c => c.nome === 'Restaurante');
    const categoriaCombustivel = this.categorias.find(c => c.nome === 'Combustível');
    const categoriaTelefone = this.categorias.find(c => c.nome === 'Telefone');
    const categoriaEnergia = this.categorias.find(c => c.nome === 'Energia');
    
    const bancoCorrente = this.bancos.find(b => b.tipo === 'conta_corrente');
    const cartaoPrincipal = this.cartoes.find(c => c.nome === 'Cartão Principal');
    
    const despesasData = [
      // Despesas no débito
      {
        categoriaId: categoriaAlimentacao._id,
        bancoId: bancoCorrente._id,
        descricao: 'Supermercado',
        valorTotal: 350,
        formaPagamento: 'debito',
        data: new Date('2024-01-10'),
        parcelado: false
      },
      {
        categoriaId: categoriaCombustivel._id,
        bancoId: bancoCorrente._id,
        descricao: 'Posto de Gasolina',
        valorTotal: 200,
        formaPagamento: 'debito',
        data: new Date('2024-01-08'),
        parcelado: false
      },
      {
        categoriaId: categoriaTelefone._id,
        bancoId: bancoCorrente._id,
        descricao: 'Conta de Celular',
        valorTotal: 80,
        formaPagamento: 'debito',
        data: new Date('2024-01-05'),
        parcelado: false,
        recorrente: true,
        tipoRecorrencia: 'mensal'
      },

      // Despesas no crédito
      {
        categoriaId: categoriaRestaurante._id,
        cartaoId: cartaoPrincipal._id,
        descricao: 'Jantar Romântico',
        valorTotal: 120,
        formaPagamento: 'credito',
        data: new Date('2024-01-14'),
        parcelado: false
      },
      {
        categoriaId: categoriaEnergia._id,
        cartaoId: cartaoPrincipal._id,
        descricao: 'Conta de Luz',
        valorTotal: 180,
        formaPagamento: 'credito',
        data: new Date('2024-01-12'),
        parcelado: false
      },

      // Despesa parcelada
      {
        categoriaId: categoriaCompras._id,
        cartaoId: cartaoPrincipal._id,
        descricao: 'Notebook Dell',
        valorTotal: 3600,
        formaPagamento: 'credito',
        data: new Date('2024-01-05'),
        parcelado: true,
        numeroParcelas: 12
      },

      // Despesas recorrentes
      {
        categoriaId: categoriaMoradia._id,
        bancoId: bancoCorrente._id,
        descricao: 'Aluguel',
        valorTotal: 1200,
        formaPagamento: 'debito',
        data: new Date('2024-01-01'),
        parcelado: false,
        recorrente: true,
        tipoRecorrencia: 'mensal'
      }
    ];
    
    for (const despesaData of despesasData) {
      const despesa = new Despesa({
        ...despesaData,
        userId: this.userId
      });
      
      await despesa.save();
    }
    
    console.log(`✅ ${despesasData.length} despesas criadas`);
  }
}

// Executar seeder
const seeder = new DatabaseSeeder();
seeder.run();

export default DatabaseSeeder;