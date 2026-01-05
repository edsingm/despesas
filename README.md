# Sistema de Finanças Pessoais

Um sistema completo para gerenciamento de finanças pessoais desenvolvido com React + TypeScript no frontend e Node.js + Express no backend.

## 🚀 Funcionalidades

- **Autenticação de usuários** com JWT
- **Dashboard** com métricas e gráficos
- **Gestão de receitas e despesas**
- **Sistema de parcelas** para cartão de crédito
- **Upload de comprovantes**
- **Gestão de bancos e cartões**
- **Categorização** de transações
- **Relatórios e filtros**
- **Alertas de vencimento***

## 🛠️ Tecnologias

### Frontend
- React 18 + TypeScript
- Vite
- Redux Toolkit (gerenciamento de estado)
- React Router DOM
- Tailwind CSS
- Chart.js (gráficos)
- Lucide React (ícones)
- Sonner (notificações)

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (autenticação)
- Multer (upload de arquivos)
- Bcrypt (hash de senhas)
- Joi (validação)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou pnpm

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd sistema-financas-pessoais
```

2. Instale as dependências:
```bash
npm install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Execute o seeder para popular o banco com dados de teste:
```bash
npx tsx api/seeders/index.ts
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3001`.

## 🔑 Credenciais de Teste

Após executar o seeder, você pode fazer login com:

- **Email:** admin@teste.com
- **Senha:** 123456

## 📊 Dados de Teste

O seeder cria automaticamente:

### Categorias
- **Receitas:** Salário, Freelance, Investimentos, Vendas, Outros
- **Despesas:** Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Compras, Contas

### Bancos
- Conta Corrente Principal (R$ 5.000)
- Poupança (R$ 15.000)
- Investimentos (R$ 25.000)

### Cartões
- Cartão Principal (Limite: R$ 5.000)
- Cartão Reserva (Limite: R$ 3.000)

### Transações de Exemplo
- Receitas: Salários e freelances
- Despesas: Supermercado, combustível, contas
- Despesa parcelada: Notebook Dell (12x de R$ 300)

## 🏗️ Estrutura do Projeto

```
├── api/                    # Backend
│   ├── controllers/        # Controladores
│   ├── middleware/         # Middlewares
│   ├── models/            # Modelos Mongoose
│   ├── routes/            # Rotas da API
│   ├── seeders/           # Seeders para dados iniciais
│   └── server.ts          # Servidor principal
├── src/                   # Frontend
│   ├── components/        # Componentes React
│   ├── hooks/            # Hooks customizados
│   ├── pages/            # Páginas da aplicação
│   ├── store/            # Redux store e slices
│   └── utils/            # Utilitários
└── uploads/              # Arquivos de upload
```

## 🔄 Scripts Disponíveis

- `npm run dev` - Inicia frontend e backend em modo desenvolvimento
- `npm run client:dev` - Inicia apenas o frontend
- `npm run server:dev` - Inicia apenas o backend
- `npm run build` - Build de produção
- `npm run check` - Verificação de tipos TypeScript

## 📝 Variáveis de Ambiente

Consulte o arquivo `.env.example` para ver todas as variáveis necessárias:

- `MONGODB_URI` - String de conexão do MongoDB
- `JWT_SECRET` - Chave secreta para JWT
- `JWT_EXPIRES_IN` - Tempo de expiração do token
- `PORT` - Porta do servidor backend
- `NODE_ENV` - Ambiente de execução
- `UPLOAD_PATH` - Caminho para uploads
- `MAX_FILE_SIZE` - Tamanho máximo de arquivo

## 🎯 Como Usar

1. **Login:** Acesse a aplicação e faça login com as credenciais de teste
2. **Dashboard:** Visualize o resumo das suas finanças
3. **Receitas:** Cadastre suas fontes de renda
4. **Despesas:** Registre seus gastos (à vista ou parcelado)
5. **Bancos:** Gerencie suas contas bancárias
6. **Cartões:** Configure seus cartões de crédito
7. **Relatórios:** Analise seus gastos por categoria e período

## 🔒 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Validação de dados com Joi
- Middleware de autenticação em rotas protegidas
- Upload seguro de arquivos

## 🐛 Solução de Problemas

### Erro de conexão com MongoDB
- Verifique se a variável `MONGODB_URI` está configurada corretamente
- O sistema usa MongoDB em memória para desenvolvimento por padrão

### Problemas com uploads
- Verifique se a pasta `uploads` existe
- Confirme as permissões de escrita na pasta

### Erros de autenticação
- Verifique se o `JWT_SECRET` está configurado
- Confirme se o token não expirou

## 📄 Licença

Este projeto está sob a licença MIT.