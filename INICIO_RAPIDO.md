# 🚀 INÍCIO RÁPIDO - PostgreSQL Local

## Para quem tem pressa!

### 1. Instale o PostgreSQL
- Download: https://www.postgresql.org/download/windows/
- Anote a senha do usuário `postgres`

### 2. Crie o banco de dados

Abra o **SQL Shell (psql)** e execute:
```sql
CREATE DATABASE financas_em_dia;
\c financas_em_dia
\i 'C:/caminho/para/criar_tabelas.sql'  -- Use o caminho completo!
```

### 3. Configure o .env

Crie o arquivo `.env` (copie do `.env.example`):
```env
DB_PASSWORD=SUA_SENHA_DO_POSTGRES
```

### 4. Instale e rode

```powershell
# Execute o script de configuração
.\configurar.bat

# OU manualmente:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### 5. Acesse
http://localhost:5000

---

## ⚡ Script Automático

Execute apenas:
```powershell
.\configurar.bat
```

Ele vai:
- ✅ Verificar PostgreSQL
- ✅ Criar .env
- ✅ Instalar dependências
- ✅ Testar conexão

---

## 🆘 Problemas?

### Erro de senha
Edite `.env` e corrija `DB_PASSWORD`

### PostgreSQL não conecta
```powershell
Get-Service postgresql*
Start-Service postgresql-x64-*
```

### Banco não existe
```sql
-- No psql:
CREATE DATABASE financas_em_dia;
```

### Tabelas não existem
```sql
-- No psql:
\c financas_em_dia
\i 'caminho/para/criar_tabelas.sql'
```

---

## 📖 Mais detalhes

Leia: `RESUMO_MIGRACAO.md` ou `INSTRUCOES_MIGRACAO_POSTGRESQL.md`

---

**Pronto! Seu sistema está 100% local! 🎉**
