// Exportação centralizada de todos os modelos
export { User, IUser } from './User.js';
export { Categoria, ICategoria } from './Categoria.js';
export { Banco, IBanco } from './Banco.js';
export { Cartao, ICartao } from './Cartao.js';
export { Receita, IReceita } from './Receita.js';
export { Despesa, IDespesa, IParcela } from './Despesa.js';

// Função para inicializar todos os modelos
export const initializeModels = () => {
  // Os modelos são inicializados automaticamente quando importados
  // Esta função pode ser usada para garantir que todos os modelos sejam carregados
  console.log('Modelos Mongoose inicializados');
};