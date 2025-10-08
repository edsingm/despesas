import mongoose from 'mongoose';
import { Categoria } from '../models/Categoria.ts';
import { connectDatabase } from '../config/database.ts';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para atualizar categorias existentes com ícones padrão
 */

// Mapeamento de nomes de categorias para ícones
const iconMapping: Record<string, string> = {
  // Receitas
  'Salário': 'briefcase',
  'Freelance': 'dollar-sign',
  'Investimentos': 'trending-up',
  'Vendas': 'shopping-bag',
  'Outros': 'tag',
  'Bônus': 'gift',
  'Renda Extra': 'dollar-sign',
  
  // Despesas
  'Alimentação': 'utensils',
  'Transporte': 'car',
  'Moradia': 'home',
  'Saúde': 'heart',
  'Educação': 'book',
  'Lazer': 'film',
  'Compras': 'shopping-cart',
  'Contas': 'zap',
  'Combustível': 'fuel',
  'Mercado': 'banana',
  'Restaurante': 'coffee',
  'Cinema': 'film',
  'Academia': 'dumbbell',
  'Telefone': 'phone',
  'Internet': 'wifi',
  'Energia': 'zap',
  'Água': 'droplet',
  'Roupas': 'shirt',
  'Manutenção': 'wrench',
  'Viagem': 'plane',
  'Presente': 'gift',
  'Música': 'music',
  'Jogos': 'gamepad',
  'Cartão': 'credit-card'
};

// Função para determinar ícone baseado no nome ou tipo da categoria
function getIconForCategory(nome: string, tipo: string): string {
  // Tentar match exato primeiro
  if (iconMapping[nome]) {
    return iconMapping[nome];
  }
  
  // Tentar match parcial (case insensitive)
  const nomeUpper = nome.toUpperCase();
  for (const [key, icon] of Object.entries(iconMapping)) {
    if (nomeUpper.includes(key.toUpperCase()) || key.toUpperCase().includes(nomeUpper)) {
      return icon;
    }
  }
  
  // Ícones padrão por tipo
  return tipo === 'receita' ? 'dollar-sign' : 'tag';
}

async function updateCategoriesWithIcons() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await connectDatabase();
    
    console.log('🔍 Buscando categorias sem ícone...');
    
    // Buscar todas as categorias
    const categorias = await Categoria.find({});
    
    console.log(`📊 Total de categorias encontradas: ${categorias.length}`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const categoria of categorias) {
      // Se já tem ícone, pular
      if (categoria.icone && categoria.icone !== '') {
        skipped++;
        continue;
      }
      
      // Determinar ícone baseado no nome
      const icone = getIconForCategory(categoria.nome, categoria.tipo);
      
      // Atualizar categoria
      categoria.icone = icone;
      await categoria.save();
      
      console.log(`✅ Categoria "${categoria.nome}" atualizada com ícone "${icone}"`);
      updated++;
    }
    
    console.log('\n📊 Resumo:');
    console.log(`   ✅ Categorias atualizadas: ${updated}`);
    console.log(`   ⏭️  Categorias já tinham ícone: ${skipped}`);
    console.log(`   📦 Total: ${categorias.length}`);
    console.log('\n✅ Atualização concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar categorias:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do banco de dados');
  }
}

// Executar o script
updateCategoriesWithIcons();

