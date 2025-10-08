import mongoose from 'mongoose';
import { Categoria } from '../models/Categoria';

/**
 * Cria dados padrão (categorias) para um usuário recém-criado.
 * Idempotente: se o usuário já tiver categorias, não duplica.
 */
export async function seedDefaultsForUser(userId: mongoose.Types.ObjectId): Promise<void> {
  // Verifica se já existem categorias para este usuário
  const existing = await Categoria.countDocuments({ userId });
  if (existing > 0) {
    return; // já possui dados, não semear novamente
  }

  // Mapeamento de nomes para ícones
  const iconMapping: Record<string, string> = {
    // Receitas
    'Salário': 'briefcase',
    'Freelance': 'dollar-sign',
    'Investimentos': 'trending-up',
    'Vendas': 'shopping-bag',
    'Outros': 'tag',

    // Despesas
    'Alimentação': 'utensils',
    'Transporte': 'car',
    'Moradia': 'home',
    'Saúde': 'heart',
    'Educação': 'book',
    'Lazer': 'film',
    'Compras': 'shopping-cart',
    'Contas': 'zap'
  };

  const categoriasData = [
    // Categorias de Receita
    { nome: 'Salário', tipo: 'receita', cor: '#10B981', icone: 'briefcase', ativa: true },
    { nome: 'Freelance', tipo: 'receita', cor: '#3B82F6', icone: 'dollar-sign', ativa: true },
    { nome: 'Investimentos', tipo: 'receita', cor: '#8B5CF6', icone: 'trending-up', ativa: true },
    { nome: 'Vendas', tipo: 'receita', cor: '#F59E0B', icone: 'shopping-bag', ativa: true },
    { nome: 'Outros', tipo: 'receita', cor: '#6B7280', icone: 'tag', ativa: true },

    // Categorias de Despesa
    { nome: 'Alimentação', tipo: 'despesa', cor: '#EF4444', icone: 'utensils', ativa: true },
    { nome: 'Transporte', tipo: 'despesa', cor: '#F97316', icone: 'car', ativa: true },
    { nome: 'Moradia', tipo: 'despesa', cor: '#84CC16', icone: 'home', ativa: true },
    { nome: 'Saúde', tipo: 'despesa', cor: '#06B6D4', icone: 'heart', ativa: true },
    { nome: 'Educação', tipo: 'despesa', cor: '#8B5CF6', icone: 'book', ativa: true },
    { nome: 'Lazer', tipo: 'despesa', cor: '#EC4899', icone: 'film', ativa: true },
    { nome: 'Compras', tipo: 'despesa', cor: '#F59E0B', icone: 'shopping-cart', ativa: true },
    { nome: 'Contas', tipo: 'despesa', cor: '#6B7280', icone: 'zap', ativa: true }
  ].map((cat) => ({ ...cat, userId }));

  await Categoria.insertMany(categoriasData);
}

export default seedDefaultsForUser;