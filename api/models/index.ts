// Exportação centralizada de todos os modelos
export { User, IUser } from './User';
export { Categoria, ICategoria } from './Categoria';
export { Banco, IBanco } from './Banco';
export { Cartao, ICartao } from './Cartao';
export { Receita, IReceita } from './Receita';
export { Despesa, IDespesa, IParcela } from './Despesa';

// Função para inicializar todos os modelos
export const initializeModels = () => {
  // Os modelos são inicializados automaticamente quando importados
  // Esta função pode ser usada para garantir que todos os modelos sejam carregados
  console.log('Modelos Mongoose inicializados');
};