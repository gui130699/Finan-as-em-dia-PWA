-- ============================================
-- SQL para criar tabelas no PostgreSQL Local
-- Finanças em Dia - Versão Local
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

-- 3. TABELA DE CONTAS FIXAS
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

-- 4. TABELA DE LANÇAMENTOS
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
    
    -- Campo para agrupamento
    is_grupo BOOLEAN DEFAULT FALSE,
    
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

-- 5. TABELA DE CONFIGURAÇÕES DO APP
CREATE TABLE IF NOT EXISTS app_config (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    chave VARCHAR(50) NOT NULL,
    valor TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, chave)
);

-- 6. TABELA DE CONTROLE DE IMPORTAÇÕES OFX
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

-- 7. TABELA DE CONCILIAÇÕES BANCÁRIAS
CREATE TABLE IF NOT EXISTS conciliacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    lancamento_id INTEGER NOT NULL,
    fitid VARCHAR(255),
    data_extrato DATE NOT NULL,
    valor_extrato DECIMAL(10, 2) NOT NULL,
    descricao_extrato TEXT,
    data_conciliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (lancamento_id) REFERENCES lancamentos(id) ON DELETE CASCADE
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_conciliacoes_usuario ON conciliacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_lancamento ON conciliacoes(lancamento_id);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_fitid ON conciliacoes(fitid);

-- 8. TABELA DE AGRUPAMENTO DE LANÇAMENTOS
CREATE TABLE IF NOT EXISTS lancamentos_agrupados (
    id SERIAL PRIMARY KEY,
    grupo_id INTEGER NOT NULL,
    lancamento_id INTEGER NOT NULL,
    data_agrupamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (grupo_id) REFERENCES lancamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (lancamento_id) REFERENCES lancamentos(id) ON DELETE CASCADE,
    UNIQUE(grupo_id, lancamento_id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_lancamentos_agrupados_grupo ON lancamentos_agrupados(grupo_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_agrupados_lancamento ON lancamentos_agrupados(lancamento_id);

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
-- OBSERVAÇÕES IMPORTANTES
-- ============================================

-- DIFERENÇAS DO SUPABASE:
-- 1. Removido Row Level Security (RLS) - não necessário para banco local
-- 2. Sem políticas de segurança automatizadas
-- 3. A aplicação gerencia a segurança através do Flask session
-- 4. Backup deve ser feito manualmente usando pg_dump

-- Para executar este script:
-- 1. Abra o SQL Shell (psql) ou pgAdmin
-- 2. Conecte ao banco 'financas_em_dia'
-- 3. Execute este script completo
-- 4. Verifique se todas as tabelas foram criadas

-- Para verificar as tabelas criadas:
-- \dt

-- Para ver a estrutura de uma tabela:
-- \d nome_da_tabela

-- ============================================
-- FIM DO SCRIPT
-- ============================================
