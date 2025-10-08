import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDatabase = async (): Promise<void> => {
  try {
    // Usar MongoDB URI do ambiente
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI não está definida nas variáveis de ambiente');
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: 'sistema_financas'
    });
    console.log('✅ Conectado ao MongoDB com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    console.error('Verifique se o servidor MongoDB está rodando e as credenciais estão corretas');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ Desconectado do MongoDB');
  } catch (error) {
    console.error('❌ Erro ao desconectar do MongoDB:', error);
  }
};

// Configurações do Mongoose
mongoose.set('strictQuery', false);

// Event listeners para conexão
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose conectado ao MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro na conexão do Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado do MongoDB');
});

export default mongoose;