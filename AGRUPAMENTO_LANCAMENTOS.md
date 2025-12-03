# Funcionalidade de Agrupamento de Lançamentos

## 📦 O que foi implementado?

Agora você pode selecionar múltiplos lançamentos da mesma categoria e agrupá-los em um único lançamento.

## 🔧 Como configurar

### 1. Executar SQL no Supabase

Acesse o painel do Supabase e execute o SQL abaixo (também está no arquivo `criar_tabelas_supabase.sql`):

```sql
-- Criar tabela de agrupamento
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

-- Adicionar coluna is_grupo na tabela lancamentos
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS is_grupo BOOLEAN DEFAULT FALSE;

-- Política RLS
ALTER TABLE lancamentos_agrupados ENABLE ROW LEVEL SECURITY;

CREATE POLICY lancamentos_agrupados_policy ON lancamentos_agrupados
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM lancamentos 
            WHERE lancamentos.id = lancamentos_agrupados.grupo_id 
            AND lancamentos.usuario_id = current_setting('app.current_user_id', TRUE)::INTEGER
        )
    );
```

## 📖 Como usar

### Agrupar Lançamentos

1. Vá para a aba **Lançamentos**
2. Marque os checkboxes dos lançamentos que deseja agrupar
   - ⚠️ **Importante:** Todos devem ser da mesma categoria
3. Clique no botão **"Agrupar Selecionados"** que aparecerá
4. Digite uma descrição para o agrupamento (ex: "Compras do Mês", "Gastos com Combustível")
5. O sistema criará um lançamento agrupado com:
   - Ícone 📦 na descrição
   - Valor total (soma dos valores)
   - Os lançamentos individuais ficam ocultos da lista

### Ver Detalhes do Grupo

- Clique no botão **azul com ícone de seta** no lançamento agrupado
- Uma modal mostrará:
  - Descrição do grupo
  - Valor total
  - Categoria
  - Tabela com todos os lançamentos agrupados

### Desagrupar

- Clique no botão **vermelho (lixeira)** no lançamento agrupado
- Confirme a ação
- Os lançamentos individuais voltam a aparecer na lista
- O lançamento agrupado é removido

## ✨ Funcionalidades

- ✅ Checkbox em cada linha de lançamento
- ✅ Checkbox "Selecionar Todos" no cabeçalho
- ✅ Contador de itens selecionados
- ✅ Validação: apenas lançamentos da mesma categoria
- ✅ Validação: mínimo de 2 lançamentos
- ✅ Cálculo automático do valor total
- ✅ Lançamentos agrupados aparecem com ícone 📦
- ✅ Lançamentos individuais ficam ocultos quando agrupados
- ✅ Modal para visualizar detalhes do grupo
- ✅ Função de desagrupar restaura lançamentos individuais
- ✅ Não é possível editar/alterar status de lançamentos agrupados (só excluir/desagrupar)

## 🎯 Casos de Uso

### Exemplo 1: Agrupar compras do supermercado
- Selecione todos os lançamentos de "Alimentação" do mês
- Agrupe como "Compras do Mês de Janeiro"
- Visualize o gasto total de alimentação

### Exemplo 2: Agrupar gastos com transporte
- Selecione todos os lançamentos de "Combustível"
- Agrupe como "Transporte Dezembro/2024"
- Simplifique a visualização mensal

### Exemplo 3: Agrupar receitas extras
- Selecione todas as receitas de "Freelance"
- Agrupe como "Trabalhos Freelance Q4"
- Veja o total ganho no período

## 🔍 Detalhes Técnicos

### Estrutura do Banco de Dados

**Tabela `lancamentos_agrupados`:**
- `id`: ID do registro
- `grupo_id`: ID do lançamento que representa o grupo
- `lancamento_id`: ID do lançamento individual agrupado
- `data_agrupamento`: Data/hora do agrupamento

**Nova coluna em `lancamentos`:**
- `is_grupo`: Boolean que indica se é um lançamento de grupo

### Comportamento

1. Ao agrupar:
   - Cria um novo lançamento com `is_grupo = true`
   - Insere registros em `lancamentos_agrupados` ligando os IDs
   - Lançamentos individuais são mantidos no banco (não deletados)
   - Filtro no `loadLancamentos()` oculta lançamentos agrupados

2. Ao desagrupar:
   - Deleta registros de `lancamentos_agrupados`
   - Deleta o lançamento de grupo
   - Lançamentos individuais voltam a aparecer automaticamente
