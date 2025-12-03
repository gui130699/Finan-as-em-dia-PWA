-- ============================================
-- SQL para criar tabelas no Supabase (PostgreSQL)
-- Finanças em Dia - Versão Web
-- ============================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para email (otimiza login)
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- 2. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    nome VARCHAR(50) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índice para usuário (otimiza consultas)
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias(usuario_id);

-- 3. TABELA DE CONTAS FIXAS (movida para antes de lancamentos)
CREATE TABLE IF NOT EXISTS contas_fixas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria_id INTEGER NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
    ativa BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

-- Índice para otimização
CREATE INDEX IF NOT EXISTS idx_contas_fixas_usuario ON contas_fixas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_contas_fixas_ativa ON contas_fixas(ativa);

-- 4. TABELA DE LANÇAMENTOS (movida para depois de contas_fixas)
CREATE TABLE IF NOT EXISTS lancamentos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria_id INTEGER NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    status VARCHAR(10) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
    observacoes TEXT,
    
    -- Campos para parcelamento
    eh_parcelado BOOLEAN DEFAULT FALSE,
    parcela_atual INTEGER,
    total_parcelas INTEGER,
    numero_contrato VARCHAR(50),
    
    -- Campo para relacionar com contas fixas
    conta_fixa_id INTEGER,
    
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    FOREIGN KEY (conta_fixa_id) REFERENCES contas_fixas(id) ON DELETE SET NULL
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_lancamentos_usuario ON lancamentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON lancamentos(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_contrato ON lancamentos(numero_contrato);
CREATE INDEX IF NOT EXISTS idx_lancamentos_conta_fixa ON lancamentos(conta_fixa_id);
CREATE TABLE IF NOT EXISTS contas_fixas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria_id INTEGER NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
    ativa BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

-- Índice para otimização
CREATE INDEX IF NOT EXISTS idx_contas_fixas_usuario ON contas_fixas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_contas_fixas_ativa ON contas_fixas(ativa);

-- 5. TABELA DE CONFIGURAÇÕES DO APP
CREATE TABLE IF NOT EXISTS app_config (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    chave VARCHAR(50) NOT NULL,
    valor TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, chave)
);

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Você pode descomentar as linhas abaixo para criar um usuário padrão
-- A senha já está em formato bcrypt hash para 'admin123'

-- INSERT INTO usuarios (nome, email, senha) 
-- VALUES (
--     'Administrador', 
--     'admin@financas.com', 
--     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5oDWPXvKp5M0W'
-- );

-- ============================================
-- PERMISSÕES E SEGURANÇA
-- ============================================

-- Habilitar Row Level Security (RLS) para segurança adicional
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_fixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (Row Level Security)
-- Os usuários só podem acessar seus próprios dados

-- Política para usuarios (cada usuário vê apenas seu próprio registro)
CREATE POLICY usuarios_policy ON usuarios
    FOR ALL
    USING (id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Política para categorias
CREATE POLICY categorias_policy ON categorias
    FOR ALL
    USING (usuario_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Política para lancamentos
CREATE POLICY lancamentos_policy ON lancamentos
    FOR ALL
    USING (usuario_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Política para contas_fixas
CREATE POLICY contas_fixas_policy ON contas_fixas
    FOR ALL
    USING (usuario_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Política para app_config
CREATE POLICY app_config_policy ON app_config
    FOR ALL
    USING (usuario_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- ============================================
-- TABELA DE CONTROLE DE IMPORTAÇÕES OFX
-- ============================================

CREATE TABLE IF NOT EXISTS ofx_importados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    fitid VARCHAR(255) NOT NULL,
    data_importacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE (usuario_id, fitid)
);

-- Índice para otimização
CREATE INDEX IF NOT EXISTS idx_ofx_importados_usuario ON ofx_importados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ofx_importados_fitid ON ofx_importados(fitid);

-- Política RLS para ofx_importados
ALTER TABLE ofx_importados ENABLE ROW LEVEL SECURITY;

CREATE POLICY ofx_importados_policy ON ofx_importados
    FOR ALL
    USING (usuario_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para executar este script no Supabase:
-- 1. Acesse o painel do Supabase (https://app.supabase.com)
-- 2. Selecione seu projeto
-- 3. Vá em "SQL Editor" no menu lateral
-- 4. Cole este script completo
-- 5. Clique em "Run" para executar
-- 6. Verifique se as tabelas foram criadas em "Table Editor"
