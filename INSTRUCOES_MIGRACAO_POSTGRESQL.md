# Instruções de Migração para PostgreSQL Local

## Passo 1: Instalar PostgreSQL

### Windows:
1. Baixe o PostgreSQL do site oficial: https://www.postgresql.org/download/windows/
2. Execute o instalador e siga as instruções
3. **IMPORTANTE**: Anote a senha que você definir para o usuário `postgres`
4. Certifique-se de que o serviço PostgreSQL está rodando

### Verificar se o PostgreSQL está rodando:
```powershell
# No PowerShell
Get-Service postgresql*
```

Se não estiver rodando, inicie com:
```powershell
Start-Service postgresql-x64-XX  # (substitua XX pela versão)
```

## Passo 2: Criar o Banco de Dados

Abra o **SQL Shell (psql)** que foi instalado com o PostgreSQL:

```sql
-- Conecte com o usuário postgres (será pedida a senha)
-- Depois execute:

CREATE DATABASE financas_em_dia;

-- Conectar ao novo banco:
\c financas_em_dia

-- Criar as tabelas (execute o arquivo criar_tabelas.sql)
```

OU use o **pgAdmin** (interface gráfica) que vem com o PostgreSQL:
1. Abra o pgAdmin
2. Conecte ao servidor local
3. Clique com botão direito em "Databases" > "Create" > "Database"
4. Nome: `financas_em_dia`
5. Salve

## Passo 3: Executar o Script SQL

No **SQL Shell (psql)**:
```sql
\c financas_em_dia
\i 'C:/caminho/completo/para/criar_tabelas.sql'
```

OU no **pgAdmin**:
1. Selecione o banco `financas_em_dia`
2. Clique em "Query Tool"
3. Abra o arquivo `criar_tabelas.sql`
4. Execute (F5)

## Passo 4: Configurar as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Configurações do PostgreSQL Local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financas_em_dia
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui  # A senha que você definiu na instalação

# Chave secreta da aplicação (pode deixar como está)
SECRET_KEY=financas_em_dia_2025_seguro_web_app
```

**IMPORTANTE**: Substitua `sua_senha_aqui` pela senha real do PostgreSQL!

## Passo 5: Instalar as Dependências Python

No terminal do VS Code (com o ambiente virtual ativado):

```powershell
# Se o ambiente virtual não estiver ativado:
.\.venv\Scripts\Activate.ps1

# Instalar as dependências atualizadas:
pip install -r requirements.txt
```

## Passo 6: Testar a Conexão

Execute o aplicativo:

```powershell
python app.py
```

Você deve ver a mensagem:
```
[OK] Pool de conexões PostgreSQL criado com sucesso!
[OK] Conexão com PostgreSQL estabelecida com sucesso!
```

## Solução de Problemas

### Erro: "password authentication failed"
- Verifique se a senha no arquivo `.env` está correta
- Tente redefinir a senha do PostgreSQL

### Erro: "could not connect to server"
- Verifique se o serviço PostgreSQL está rodando
- Verifique se a porta 5432 não está bloqueada pelo firewall

### Erro: "database does not exist"
- Certifique-se de que criou o banco `financas_em_dia`
- Execute: `CREATE DATABASE financas_em_dia;` no psql

### Erro ao instalar psycopg2-binary
```powershell
# Tente instalar com:
pip install psycopg2-binary --no-cache-dir
```

## Diferenças do Supabase

1. **Sem Row Level Security (RLS)**: Removemos as políticas RLS do SQL local
2. **Conexão direta**: Não há mais cliente Supabase, apenas psycopg2
3. **Queries SQL**: Agora usando SQL puro com parametrização
4. **Backup manual**: Você precisa fazer backup do banco manualmente

## Backup do Banco de Dados

Para fazer backup:
```powershell
pg_dump -U postgres -d financas_em_dia -f backup_financas.sql
```

Para restaurar:
```powershell
psql -U postgres -d financas_em_dia -f backup_financas.sql
```

## Próximos Passos

Após a migração estar completa:
1. Teste todas as funcionalidades do sistema
2. Configure backups automáticos se necessário
3. Considere usar pgAdmin para gerenciar o banco visualmente
