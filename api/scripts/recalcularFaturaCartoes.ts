import mongoose from 'mongoose';
import { Cartao } from '../models/Cartao.ts';
import { Despesa } from '../models/Despesa.ts';
import 'dotenv/config';

/**
 * Script para recalcular a fatura atual de todos os cartões
 * baseado nas despesas de crédito existentes
 */
async function recalcularFaturaCartoes() {
  try {
    console.log('🔄 Iniciando recálculo de faturas dos cartões...');

    // Conectar ao banco de dados
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-despesas';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao banco de dados');

    // Buscar todos os cartões
    const cartoes = await Cartao.find({});
    console.log(`📊 Encontrados ${cartoes.length} cartões para processar`);

    let cartoesAtualizados = 0;
    let erros = 0;

    for (const cartao of cartoes) {
      try {
        // Calcular total de despesas de crédito para este cartão
        const resultado = await Despesa.aggregate([
          {
            $match: {
              cartaoId: cartao._id,
              formaPagamento: 'credito'
            }
          },
          {
            $group: {
              _id: null,
              totalFatura: { $sum: '$valorTotal' }
            }
          }
        ]);

        const faturaAtual = resultado[0]?.totalFatura || 0;

        // Atualizar cartão se o valor for diferente
        if (cartao.faturaAtual !== faturaAtual) {
          await Cartao.updateOne(
            { _id: cartao._id },
            { $set: { faturaAtual } }
          );
          
          console.log(`  ✓ Cartão "${cartao.nome}": R$ ${cartao.faturaAtual?.toFixed(2) || '0.00'} → R$ ${faturaAtual.toFixed(2)}`);
          cartoesAtualizados++;
        } else {
          console.log(`  - Cartão "${cartao.nome}": R$ ${faturaAtual.toFixed(2)} (já estava correto)`);
        }
      } catch (error) {
        console.error(`  ✗ Erro ao processar cartão "${cartao.nome}":`, error);
        erros++;
      }
    }

    console.log('\n📈 Resumo:');
    console.log(`  • Total de cartões: ${cartoes.length}`);
    console.log(`  • Cartões atualizados: ${cartoesAtualizados}`);
    console.log(`  • Erros: ${erros}`);
    console.log('\n✅ Recálculo concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao recalcular faturas:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com banco de dados fechada');
  }
}

// Executar script
recalcularFaturaCartoes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

