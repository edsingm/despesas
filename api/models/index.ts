// Exportação centralizada de todos os modelos
export { User, IUser } from './User.ts';
export { Categoria, ICategoria } from './Categoria.ts';
export { Banco, IBanco } from './Banco.ts';
export { Cartao, ICartao } from './Cartao.ts';
export { Receita, IReceita } from './Receita.ts';
export { Despesa, IDespesa, IParcela } from './Despesa.ts';

// Função para inicializar todos os modelos
export const initializeModels = () => {
  // Os modelos são inicializados automaticamente quando importados
  // Esta função pode ser usada para garantir que todos os modelos sejam carregados
  console.log('Modelos Mongoose inicializados');
};