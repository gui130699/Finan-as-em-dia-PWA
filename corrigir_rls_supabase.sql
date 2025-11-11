-- ============================================
-- SQL CORRETIVO - DESABILITAR RLS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Desabilitar Row Level Security (RLS) em todas as tabelas
-- Isso permite que a aplicação Flask acesse o banco diretamente

ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE contas_fixas DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_config DISABLE ROW LEVEL SECURITY;

-- Remover políticas RLS (opcional, mas recomendado)
DROP POLICY IF EXISTS usuarios_policy ON usuarios;
DROP POLICY IF EXISTS categorias_policy ON categorias;
DROP POLICY IF EXISTS lancamentos_policy ON lancamentos;
DROP POLICY IF EXISTS contas_fixas_policy ON contas_fixas;
DROP POLICY IF EXISTS app_config_policy ON app_config;

-- ============================================
-- PRONTO!
-- ============================================

-- Agora a aplicação Flask pode inserir, atualizar e deletar dados
-- A segurança é gerenciada pela própria aplicação Flask através de:
-- - Autenticação com bcrypt
-- - Sessões Flask
-- - Verificação de usuario_id em todas as queries
