# 🔒 GUIA DE SEGURANÇA - Finanças em Dia PWA

## ✅ MELHORIAS DE SEGURANÇA IMPLEMENTADAS

### 1. Remoção de Credenciais do Código Fonte

**ANTES (❌ INSEGURO):**
```javascript
// Credenciais expostas no código
const SUPABASE_URL = 'https://...';
const SUPABASE_KEY = 'eyJhbG...';
```

**DEPOIS (✅ SEGURO):**
```javascript
// Credenciais carregadas de arquivo externo
const SUPABASE_URL = window.SUPABASE_CONFIG?.url || '';
const SUPABASE_KEY = window.SUPABASE_CONFIG?.key || '';
```

---

## 📁 ESTRUTURA DE CONFIGURAÇÃO

### Frontend (JavaScript)

```
static/js/
├── config.js                    # Carregador de configuração (commitado)
├── config.local.js              # Suas credenciais (NÃO commitado)
└── config.local.example.js      # Exemplo (commitado)
```

**Como configurar:**
1. Copie `config.local.example.js` para `config.local.js`
2. Edite `config.local.js` com suas credenciais reais
3. O arquivo `.gitignore` garante que não será commitado

### Backend (Python/Flask)

```
/
├── .env                         # Suas credenciais (NÃO commitado)
└── .env.example                 # Exemplo (commitado)
```

**Como configurar:**
1. Copie `.env.example` para `.env`
2. Edite `.env` com suas credenciais reais
3. O arquivo `.gitignore` garante que não será commitado

---

## 🚀 CONFIGURAÇÃO PARA PRODUÇÃO

### Opção 1: GitHub Pages (Frontend Apenas)

Adicione as credenciais diretamente no HTML (apenas para GitHub Pages público):

```html
<script>
  window.SUPABASE_CONFIG = {
    url: 'SUA_URL',
    key: 'SUA_CHAVE_ANON'  // Chave anon é segura com RLS ativo
  };
</script>
<script src="static/js/config.js"></script>
```

### Opção 2: Heroku / Vercel / Netlify

Configure as variáveis de ambiente na plataforma:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SECRET_KEY`

### Opção 3: Servidor Próprio

```bash
# Linux/Mac
export SUPABASE_URL="sua_url"
export SUPABASE_KEY="sua_chave"

# Windows (PowerShell)
$env:SUPABASE_URL="sua_url"
$env:SUPABASE_KEY="sua_chave"
```

---

## 🛡️ BOAS PRÁTICAS DE SEGURANÇA

### ✅ O QUE FAZER

1. **Sempre use variáveis de ambiente em produção**
2. **Configure RLS (Row Level Security) no Supabase**
3. **Rotacione chaves periodicamente**
4. **Use HTTPS sempre**
5. **Mantenha backups das credenciais em local seguro**

### ❌ O QUE NÃO FAZER

1. **Nunca commite credenciais no Git**
2. **Nunca compartilhe chaves em código público**
3. **Nunca use a mesma chave em dev e produção**
4. **Nunca desative RLS no Supabase**
5. **Nunca exponha a chave `service_role`**

---

## 🔍 VERIFICAÇÃO DE SEGURANÇA

### Antes de Commitar

```bash
# Verifique se há credenciais expostas
git diff | grep -i "supabase\|password\|secret"

# Verifique o que será commitado
git status

# Confirme que .env e config.local.js estão ignorados
cat .gitignore | grep -E "\.env|config\.local"
```

### Auditoria de Segurança

- [ ] `.env` está no `.gitignore`
- [ ] `config.local.js` está no `.gitignore`
- [ ] Credenciais não aparecem em nenhum arquivo commitado
- [ ] RLS está ativo no Supabase
- [ ] Políticas de RLS estão configuradas corretamente
- [ ] Chaves são diferentes entre dev e produção

---

## 📞 SUPORTE

### Se você expôs credenciais acidentalmente:

1. **IMEDIATAMENTE** rotacione as chaves no Supabase
2. Limpe o histórico do Git (use BFG Repo-Cleaner)
3. Force push do repositório limpo
4. Notifique usuários afetados

### Para obter novas credenciais:

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie `URL` e `anon public`

---

## 🎯 CHECKLIST DE DEPLOY

Antes de fazer deploy em produção:

- [ ] Variáveis de ambiente configuradas
- [ ] `.env` e `config.local.js` não commitados
- [ ] RLS ativo no Supabase
- [ ] Políticas de segurança testadas
- [ ] Backups configurados
- [ ] Monitoramento ativo
- [ ] HTTPS configurado
- [ ] Domínio personalizado (opcional)

---

## 📚 RECURSOS ADICIONAIS

- [Documentação Supabase - RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [12 Factor App - Config](https://12factor.net/config)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Data da última atualização:** 01/12/2025
**Versão:** 1.0
