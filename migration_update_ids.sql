-- Script de migração para adicionar geração automática de IDs em tabelas existentes
-- Este script não remove dados, apenas altera a definição das colunas ID

-- Garante que a extensão para geração de UUID está habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela: bancos
ALTER TABLE IF EXISTS public.bancos 
ALTER COLUMN id SET DEFAULT (gen_random_uuid())::text;

-- Tabela: cartoes
ALTER TABLE IF EXISTS public.cartoes 
ALTER COLUMN id SET DEFAULT (gen_random_uuid())::text;

-- Tabela: categorias
ALTER TABLE IF EXISTS public.categorias 
ALTER COLUMN id SET DEFAULT (gen_random_uuid())::text;

-- Tabela: receitas
ALTER TABLE IF EXISTS public.receitas 
ALTER COLUMN id SET DEFAULT (gen_random_uuid())::text;

-- Tabela: despesas
ALTER TABLE IF EXISTS public.despesas 
ALTER COLUMN id SET DEFAULT (gen_random_uuid())::text;

-- Nota: A tabela despesa_parcelas já possui o default definido no schema original.
