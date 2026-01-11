-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Table: bancos
CREATE TABLE IF NOT EXISTS bancos (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    user_id TEXT NOT NULL, -- FK removed to allow migration of legacy data. Update to UUID REFERENCES auth.users(id) after data migration.
    nome TEXT NOT NULL,
    tipo TEXT,
    saldo_inicial DECIMAL(10, 2) DEFAULT 0,
    saldo_atual DECIMAL(10, 2) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: cartoes
CREATE TABLE IF NOT EXISTS cartoes (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    user_id TEXT NOT NULL, -- FK removed
    banco_id TEXT REFERENCES bancos(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    bandeira TEXT,
    limite DECIMAL(10, 2) NOT NULL,
    fatura_atual DECIMAL(10, 2) DEFAULT 0,
    dia_fechamento INTEGER NOT NULL,
    dia_vencimento INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: categorias
CREATE TABLE IF NOT EXISTS categorias (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    user_id TEXT NOT NULL, -- FK removed
    nome TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
    cor TEXT,
    icone TEXT,
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: receitas
CREATE TABLE IF NOT EXISTS receitas (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    user_id TEXT NOT NULL, -- FK removed
    categoria_id TEXT REFERENCES categorias(id) ON DELETE SET NULL,
    banco_id TEXT REFERENCES bancos(id) ON DELETE SET NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data TIMESTAMP WITH TIME ZONE NOT NULL,
    recorrente BOOLEAN DEFAULT FALSE,
    tipo_recorrencia TEXT,
    observacoes TEXT,
    comprovante TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: despesas
CREATE TABLE IF NOT EXISTS despesas (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
    user_id TEXT NOT NULL, -- FK removed
    categoria_id TEXT REFERENCES categorias(id) ON DELETE SET NULL,
    banco_id TEXT REFERENCES bancos(id) ON DELETE SET NULL,
    cartao_id TEXT REFERENCES cartoes(id) ON DELETE SET NULL,
    descricao TEXT NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    data TIMESTAMP WITH TIME ZONE NOT NULL,
    forma_pagamento TEXT NOT NULL,
    parcelado BOOLEAN DEFAULT FALSE,
    numero_parcelas INTEGER,
    recorrente BOOLEAN DEFAULT FALSE,
    tipo_recorrencia TEXT,
    observacoes TEXT,
    comprovante TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: despesa_parcelas
CREATE TABLE IF NOT EXISTS despesa_parcelas (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    despesa_id TEXT NOT NULL REFERENCES despesas(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
    paga BOOLEAN DEFAULT FALSE,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    UNIQUE(despesa_id, numero)
);

-- Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bancos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesa_parcelas ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Policies)

-- Profiles: Usuários só podem ver e editar seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Bancos
CREATE POLICY "Usuários podem ver seus próprios bancos" 
    ON bancos FOR SELECT 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem criar bancos" 
    ON bancos FOR INSERT 
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem atualizar seus próprios bancos" 
    ON bancos FOR UPDATE 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem deletar seus próprios bancos" 
    ON bancos FOR DELETE 
    USING (user_id = auth.uid()::text);

-- Cartoes
CREATE POLICY "Usuários podem ver seus próprios cartoes" 
    ON cartoes FOR SELECT 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem criar cartoes" 
    ON cartoes FOR INSERT 
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem atualizar seus próprios cartoes" 
    ON cartoes FOR UPDATE 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem deletar seus próprios cartoes" 
    ON cartoes FOR DELETE 
    USING (user_id = auth.uid()::text);

-- Categorias
CREATE POLICY "Usuários podem ver suas próprias categorias" 
    ON categorias FOR SELECT 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem criar categorias" 
    ON categorias FOR INSERT 
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem atualizar suas próprias categorias" 
    ON categorias FOR UPDATE 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem deletar suas próprias categorias" 
    ON categorias FOR DELETE 
    USING (user_id = auth.uid()::text);

-- Receitas
CREATE POLICY "Usuários podem ver suas próprias receitas" 
    ON receitas FOR SELECT 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem criar receitas" 
    ON receitas FOR INSERT 
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem atualizar suas próprias receitas" 
    ON receitas FOR UPDATE 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem deletar suas próprias receitas" 
    ON receitas FOR DELETE 
    USING (user_id = auth.uid()::text);

-- Despesas
CREATE POLICY "Usuários podem ver suas próprias despesas" 
    ON despesas FOR SELECT 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem criar despesas" 
    ON despesas FOR INSERT 
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem atualizar suas próprias despesas" 
    ON despesas FOR UPDATE 
    USING (user_id = auth.uid()::text);

CREATE POLICY "Usuários podem deletar suas próprias despesas" 
    ON despesas FOR DELETE 
    USING (user_id = auth.uid()::text);

-- Despesa Parcelas
-- Parcelas herdam a permissão da despesa pai. 
-- Como parcelas não tem user_id direto, fazemos join com despesas.
CREATE POLICY "Usuários podem ver parcelas de suas despesas" 
    ON despesa_parcelas FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM despesas 
        WHERE despesas.id = despesa_parcelas.despesa_id 
        AND despesas.user_id = auth.uid()::text
    ));

CREATE POLICY "Usuários podem criar parcelas em suas despesas" 
    ON despesa_parcelas FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM despesas 
        WHERE despesas.id = despesa_parcelas.despesa_id 
        AND despesas.user_id = auth.uid()::text
    ));

CREATE POLICY "Usuários podem atualizar parcelas de suas despesas" 
    ON despesa_parcelas FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM despesas 
        WHERE despesas.id = despesa_parcelas.despesa_id 
        AND despesas.user_id = auth.uid()::text
    ));

CREATE POLICY "Usuários podem deletar parcelas de suas despesas" 
    ON despesa_parcelas FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM despesas 
        WHERE despesas.id = despesa_parcelas.despesa_id 
        AND despesas.user_id = auth.uid()::text
    ));

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_bancos_user_id ON bancos(user_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_user_id ON cartoes(user_id);
CREATE INDEX IF NOT EXISTS idx_categorias_user_id ON categorias(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_user_id ON despesas(user_id);

CREATE INDEX IF NOT EXISTS idx_cartoes_banco_id ON cartoes(banco_id);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria_id ON receitas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_receitas_banco_id ON receitas(banco_id);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria_id ON despesas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_despesas_banco_id ON despesas(banco_id);
CREATE INDEX IF NOT EXISTS idx_despesas_cartao_id ON despesas(cartao_id);
CREATE INDEX IF NOT EXISTS idx_despesa_parcelas_despesa_id ON despesa_parcelas(despesa_id);

