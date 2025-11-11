# 🚀 MIGRAÇÃO PARA SUPABASE - Guia Completo

## ✅ Arquivos Criados

1. **`config.py`** - Configurações do Supabase (URL e chave API)
2. **`criar_tabelas_supabase.sql`** - Script SQL para criar todas as tabelas
3. **`instalar_supabase.bat`** - Script de instalação das dependências
4. **`database.py`** - ATUALIZADO para usar Supabase
5. **`models.py`** - ATUALIZADO com todas as funções adaptadas para PostgreSQL
6. **`requirements.txt`** - ATUALIZADO com supabase==2.3.0

## 📋 PASSO A PASSO - Configurar Banco de Dados

### 1️⃣ Acessar o Painel do Supabase

1. Abra seu navegador
2. Acesse: **https://app.supabase.com/**
3. Faça login com suas credenciais
4. Selecione seu projeto: **otyekylihpzscqwxeoiy**

### 2️⃣ Criar as Tabelas no Banco

1. No painel lateral esquerdo, clique em **"SQL Editor"** (ícone de código)
2. Clique no botão **"New Query"** (+ New Query)
3. Abra o arquivo `criar_tabelas_supabase.sql` nesta pasta
4. **COPIE TODO O CONTEÚDO** do arquivo SQL
5. **COLE** no editor SQL do Supabase
6. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
7. Aguarde a mensagem de sucesso

### 3️⃣ Verificar se as Tabelas Foram Criadas

1. No painel lateral, clique em **"Table Editor"** (ícone de tabela)
2. Você deve ver 5 tabelas criadas:
   - ✅ `usuarios`
   - ✅ `categorias`
   - ✅ `lancamentos`
   - ✅ `contas_fixas`
   - ✅ `app_config`

3. Clique em cada tabela para ver sua estrutura

## 🔧 PASSO A PASSO - Configurar Aplicação

### 4️⃣ Instalar Dependências (JÁ FEITO ✓)

```bash
# As dependências do Supabase já foram instaladas!
# supabase==2.3.0
# postgrest==0.13.2
```

### 5️⃣ Iniciar a Aplicação

1. **FECHE** o servidor Flask se estiver rodando (Ctrl+C no terminal)
2. Execute o script de inicialização:

```bash
iniciar.bat
```

3. A aplicação irá:
   - ✅ Ativar o ambiente virtual
   - ✅ Conectar ao Supabase
   - ✅ Iniciar o servidor Flask
   - ✅ Abrir no navegador

### 6️⃣ Criar Primeiro Usuário

1. No navegador, acesse: **http://127.0.0.1:5000**
2. Clique em **"Registrar"**
3. Preencha os dados:
   - Nome: `Seu Nome`
   - Email: `seu@email.com`
   - Senha: `sua_senha`
4. Clique em **"Registrar"**
5. Faça login com suas credenciais

## 📊 O Que Mudou?

### ❌ SQLite (Antes)
- Banco local: `financas_em_dia.db`
- Queries SQL diretas
- Conexão por arquivo

### ✅ Supabase/PostgreSQL (Agora)
- Banco online na nuvem
- API REST do Supabase
- Conexão por HTTPS
- Segurança com Row Level Security (RLS)
- Backup automático
- Acesso de qualquer lugar

## 🔐 Segurança

O script SQL já configurou:

✅ **Row Level Security (RLS)** - Usuários só veem seus próprios dados
✅ **Políticas de acesso** - Cada tabela tem políticas específicas
✅ **Criptografia** - Senhas com bcrypt
✅ **Validações** - Constraints no banco de dados

## 📁 Estrutura das Tabelas

### 1. `usuarios`
```sql
- id (SERIAL PRIMARY KEY)
- nome (VARCHAR 100)
- email (VARCHAR 100 UNIQUE)
- senha (VARCHAR 255) -- bcrypt hash
- data_criacao (TIMESTAMP)
```

### 2. `categorias`
```sql
- id (SERIAL PRIMARY KEY)
- usuario_id (INTEGER FK)
- nome (VARCHAR 50)
- tipo (VARCHAR 10) -- 'receita' ou 'despesa'
```

### 3. `lancamentos`
```sql
- id (SERIAL PRIMARY KEY)
- usuario_id (INTEGER FK)
- tipo (VARCHAR 10)
- categoria_id (INTEGER FK)
- descricao (VARCHAR 200)
- valor (DECIMAL 10,2)
- data (DATE)
- status (VARCHAR 10) -- 'pendente' ou 'pago'
- observacoes (TEXT)
- eh_parcelado (BOOLEAN)
- parcela_atual (INTEGER)
- total_parcelas (INTEGER)
- numero_contrato (VARCHAR 50)
- conta_fixa_id (INTEGER FK)
- data_criacao (TIMESTAMP)
```

### 4. `contas_fixas`
```sql
- id (SERIAL PRIMARY KEY)
- usuario_id (INTEGER FK)
- tipo (VARCHAR 10)
- categoria_id (INTEGER FK)
- descricao (VARCHAR 200)
- valor (DECIMAL 10,2)
- dia_vencimento (INTEGER)
- ativa (BOOLEAN)
- observacoes (TEXT)
- data_criacao (TIMESTAMP)
```

### 5. `app_config`
```sql
- id (SERIAL PRIMARY KEY)
- usuario_id (INTEGER FK)
- chave (VARCHAR 50)
- valor (TEXT)
- UNIQUE(usuario_id, chave)
```

## 🛠️ Alterações no Código

### `database.py`
```python
# ANTES (SQLite)
conn = sqlite3.connect('financas_em_dia.db')

# AGORA (Supabase)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
```

### `models.py`
```python
# ANTES (SQLite)
query = "INSERT INTO usuarios (username, password) VALUES (?, ?)"
database.executar_query(query, (username, senha_hash), commit=True)

# AGORA (Supabase)
response = supabase.table('usuarios').insert({
    'nome': nome,
    'email': email,
    'senha': senha_hash
}).execute()
```

## 🧪 Testar a Aplicação

Após iniciar, teste:

1. ✅ Registro de novo usuário
2. ✅ Login/Logout
3. ✅ Criar categorias
4. ✅ Adicionar lançamentos
5. ✅ Criar contas fixas
6. ✅ Parcelamentos
7. ✅ Relatórios PDF

## 🐛 Solução de Problemas

### Erro: "Não foi possível conectar ao Supabase"
**Solução:** Verifique se executou o SQL no painel do Supabase

### Erro: "Tabela não existe"
**Solução:** Execute o `criar_tabelas_supabase.sql` novamente no SQL Editor

### Erro ao registrar usuário
**Solução:** Verifique se RLS está configurado (está no SQL script)

### Aplicação lenta
**Normal:** O Supabase pode ter latência por estar na nuvem (especialmente no plano gratuito)

## 📞 Credenciais do Supabase

```
URL: https://otyekylihpzscqwxeoiy.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Senha Admin: 9331077093.Gui
```

**⚠️ IMPORTANTE:** Estas credenciais estão em `config.py`. Nunca compartilhe este arquivo!

## 🎯 Próximos Passos

Após tudo funcionando:

1. ✅ Testar todas as funcionalidades
2. 📱 Considerar criar versão mobile futuramente
3. 🔄 Configurar backups automáticos no Supabase
4. 📊 Explorar dashboards do Supabase para monitoramento
5. 🚀 Deploy em produção (Vercel, Heroku, etc.)

## 📚 Documentação

- Supabase: https://supabase.com/docs
- PostgreSQL: https://www.postgresql.org/docs/
- Supabase Python: https://github.com/supabase-community/supabase-py

---

✨ **Migração completa! Seu Finanças em Dia agora está na nuvem!** ✨
