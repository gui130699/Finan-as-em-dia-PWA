# 🛠️ COMANDOS ÚTEIS - PostgreSQL

## Gerenciamento do Serviço

### Verificar status do PostgreSQL
```powershell
Get-Service postgresql*
```

### Iniciar o PostgreSQL
```powershell
Start-Service postgresql-x64-16  # Substitua 16 pela sua versão
```

### Parar o PostgreSQL
```powershell
Stop-Service postgresql-x64-16
```

### Reiniciar o PostgreSQL
```powershell
Restart-Service postgresql-x64-16
```

---

## Comandos SQL Shell (psql)

### Conectar ao PostgreSQL
```bash
psql -U postgres
```

### Conectar a um banco específico
```bash
psql -U postgres -d financas_em_dia
```

### Listar todos os bancos
```sql
\l
```

### Conectar a um banco
```sql
\c financas_em_dia
```

### Listar todas as tabelas
```sql
\dt
```

### Ver estrutura de uma tabela
```sql
\d usuarios
\d lancamentos
\d categorias
```

### Ver todas as colunas de uma tabela
```sql
\d+ usuarios
```

### Listar usuários do PostgreSQL
```sql
\du
```

### Sair do psql
```sql
\q
```

---

## Queries Úteis

### Ver todos os usuários do sistema
```sql
SELECT * FROM usuarios;
```

### Ver total de lançamentos
```sql
SELECT COUNT(*) FROM lancamentos;
```

### Ver lançamentos por tipo
```sql
SELECT tipo, COUNT(*), SUM(valor) 
FROM lancamentos 
GROUP BY tipo;
```

### Ver categorias mais usadas
```sql
SELECT c.nome, COUNT(l.id) as total
FROM categorias c
LEFT JOIN lancamentos l ON c.id = l.categoria_id
GROUP BY c.id, c.nome
ORDER BY total DESC;
```

### Ver lançamentos do mês atual
```sql
SELECT l.descricao, l.valor, l.data, c.nome as categoria
FROM lancamentos l
JOIN categorias c ON l.categoria_id = c.id
WHERE EXTRACT(MONTH FROM l.data) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM l.data) = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY l.data DESC;
```

### Ver saldo total por usuário
```sql
SELECT u.nome,
       SUM(CASE WHEN l.tipo = 'receita' AND l.status = 'pago' THEN l.valor ELSE 0 END) as receitas,
       SUM(CASE WHEN l.tipo = 'despesa' AND l.status = 'pago' THEN l.valor ELSE 0 END) as despesas,
       SUM(CASE WHEN l.tipo = 'receita' AND l.status = 'pago' THEN l.valor ELSE 0 END) -
       SUM(CASE WHEN l.tipo = 'despesa' AND l.status = 'pago' THEN l.valor ELSE 0 END) as saldo
FROM usuarios u
LEFT JOIN lancamentos l ON u.id = l.usuario_id
GROUP BY u.id, u.nome;
```

---

## Backup e Restauração

### Fazer backup do banco completo
```powershell
pg_dump -U postgres -d financas_em_dia -f backup_financas.sql
```

### Fazer backup apenas dos dados (sem estrutura)
```powershell
pg_dump -U postgres -d financas_em_dia --data-only -f backup_dados.sql
```

### Fazer backup apenas da estrutura (sem dados)
```powershell
pg_dump -U postgres -d financas_em_dia --schema-only -f backup_estrutura.sql
```

### Restaurar backup completo
```powershell
psql -U postgres -d financas_em_dia -f backup_financas.sql
```

### Fazer backup compactado
```powershell
pg_dump -U postgres -d financas_em_dia -Fc -f backup_financas.dump
```

### Restaurar backup compactado
```powershell
pg_restore -U postgres -d financas_em_dia backup_financas.dump
```

---

## Manutenção do Banco

### Ver tamanho do banco
```sql
SELECT pg_size_pretty(pg_database_size('financas_em_dia'));
```

### Ver tamanho de cada tabela
```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Limpar dados antigos (exemplo: lançamentos de mais de 5 anos)
```sql
DELETE FROM lancamentos 
WHERE data < CURRENT_DATE - INTERVAL '5 years';
```

### Vacuum (otimização e limpeza)
```sql
VACUUM ANALYZE;
```

### Reindexar o banco
```sql
REINDEX DATABASE financas_em_dia;
```

---

## Gerenciamento de Usuários e Permissões

### Criar novo usuário do PostgreSQL
```sql
CREATE USER novo_usuario WITH PASSWORD 'senha123';
```

### Dar permissões ao usuário
```sql
GRANT ALL PRIVILEGES ON DATABASE financas_em_dia TO novo_usuario;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO novo_usuario;
```

### Revogar permissões
```sql
REVOKE ALL PRIVILEGES ON DATABASE financas_em_dia FROM novo_usuario;
```

### Mudar senha de usuário
```sql
ALTER USER postgres WITH PASSWORD 'nova_senha';
```

---

## Troubleshooting

### Ver conexões ativas
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'financas_em_dia';
```

### Matar conexão específica
```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'financas_em_dia' 
  AND pid <> pg_backend_pid();
```

### Ver logs de erro
```powershell
# Localização típica dos logs:
notepad "C:\Program Files\PostgreSQL\16\data\log\postgresql-*.log"
```

### Verificar configuração do PostgreSQL
```sql
SHOW ALL;
SHOW max_connections;
SHOW shared_buffers;
```

### Resetar sequências (IDs auto-incremento)
```sql
-- Se os IDs estiverem dessincronizados
SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));
SELECT setval('lancamentos_id_seq', (SELECT MAX(id) FROM lancamentos));
SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));
```

---

## pgAdmin (Interface Gráfica)

### Abrir pgAdmin
```powershell
# Procure no menu iniciar: "pgAdmin"
# Ou acesse: http://localhost:5050
```

### Funções úteis no pgAdmin:
- **Dashboard**: Visão geral do servidor
- **Query Tool**: Executar queries SQL (ícone de raio)
- **Backup**: Ferramentas → Backup
- **Restore**: Ferramentas → Restore
- **EXPLAIN**: Analisar performance de queries
- **Grant Wizard**: Gerenciar permissões facilmente

---

## Dicas de Performance

### Ver queries lentas
```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Ver índices não utilizados
```sql
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### Analisar uma query específica
```sql
EXPLAIN ANALYZE
SELECT * FROM lancamentos WHERE usuario_id = 1;
```

---

## Atalhos psql

| Comando | Descrição |
|---------|-----------|
| `\?` | Lista todos os comandos |
| `\h` | Ajuda SQL |
| `\l` | Lista bancos de dados |
| `\c` | Conecta a um banco |
| `\dt` | Lista tabelas |
| `\d tabela` | Descreve tabela |
| `\du` | Lista usuários |
| `\q` | Sair |
| `\i arquivo.sql` | Executa arquivo SQL |
| `\o arquivo.txt` | Salva output em arquivo |
| `\timing` | Mostra tempo de execução |

---

## Script de Backup Automático

Crie um arquivo `backup_automatico.bat`:

```batch
@echo off
set DATA=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%
set HORA=%time:~0,2%-%time:~3,2%
set ARQUIVO=backup_financas_%DATA%_%HORA%.sql

echo Iniciando backup...
pg_dump -U postgres -d financas_em_dia -f "backups\%ARQUIVO%"

if %ERRORLEVEL% EQU 0 (
    echo Backup criado com sucesso: %ARQUIVO%
) else (
    echo Erro ao criar backup!
)

pause
```

Configure no Agendador de Tarefas do Windows para executar diariamente.

---

## Links Úteis

- **Documentação PostgreSQL**: https://www.postgresql.org/docs/
- **pgAdmin Docs**: https://www.pgadmin.org/docs/
- **Tutorial SQL**: https://www.postgresql.org/docs/current/tutorial.html
- **Psycopg2 Docs**: https://www.psycopg.org/docs/

---

**Dica**: Salve este arquivo para referência rápida! 📚
