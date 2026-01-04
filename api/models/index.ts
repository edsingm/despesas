// Exportação centralizada de todos os modelos
export { User } from './User.js';
export type { IUser } from './User.js';
export { Categoria } from './Categoria.js';
export type { ICategoria } from './Categoria.js';
export { Banco } from './Banco.js';
export type { IBanco } from './Banco.js';
export { Cartao } from './Cartao.js';
export type { ICartao } from './Cartao.js';
export { Receita } from './Receita.js';
export type { IReceita } from './Receita.js';
export { Despesa } from './Despesa.js';
export type { IDespesa, IParcela } from './Despesa.js';

// Função para inicializar todos os modelos
export const initializeModels = () => {
  // Os modelos são inicializados automaticamente quando importados
  // Esta função pode ser usada para garantir que todos os modelos sejam carregados
  console.log('Modelos Mongoose inicializados');
};