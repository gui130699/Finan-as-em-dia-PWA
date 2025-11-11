# 🚀 Deploy da Aplicação Flask

## ❌ Por que o GitHub Pages não funciona?

O GitHub Pages serve apenas **arquivos estáticos** (HTML, CSS, JS).  
Sua aplicação Flask precisa de um **servidor Python rodando**.

---

## ✅ **Soluções Gratuitas para Hospedar:**

### **1. Render.com** (RECOMENDADO) ⭐

**Plano Gratuito:**
- ✅ Grátis para sempre
- ✅ HTTPS automático
- ✅ Deploy automático do GitHub
- ⚠️ Suspende após 15 minutos sem uso (reativa automaticamente)

**Passo a passo:**

1. **Acesse**: https://render.com
2. **Cadastre-se** com sua conta do GitHub
3. **New** → **Web Service**
4. **Conecte** seu repositório `Financeiro-em-dia`
5. **Configure**:
   - **Name**: `financeiro-em-dia`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: `Free`
6. **Environment Variables** (Adicione):
   - `SUPABASE_URL` = `sua-url-do-supabase`
   - `SUPABASE_KEY` = `sua-chave-do-supabase`
7. **Create Web Service**

**Pronto!** Sua app estará em: `https://financeiro-em-dia.onrender.com`

---

### **2. Railway.app** (Alternativa)

**Plano Gratuito:**
- ✅ $5 de crédito por mês
- ✅ Deploy fácil
- ✅ HTTPS

**Passo a passo:**

1. **Acesse**: https://railway.app
2. **Start a New Project**
3. **Deploy from GitHub repo**
4. Selecione `Financeiro-em-dia`
5. Adicione variáveis de ambiente
6. Deploy automático!

---

### **3. PythonAnywhere** (Alternativa)

**Plano Gratuito:**
- ✅ Sempre ativo
- ⚠️ Configuração mais manual

**Passo a passo:**

1. **Acesse**: https://www.pythonanywhere.com
2. **Cadastre-se** (conta gratuita)
3. **Web** → **Add a new web app**
4. **Manual configuration** → **Python 3.10**
5. Clone seu repositório via Console
6. Configure o WSGI file
7. Reload

---

### **4. Heroku** (Pago agora)

⚠️ Heroku removeu o plano gratuito. Mínimo: $7/mês

---

## 📝 **Arquivos Criados para Deploy:**

✅ **Procfile** - Instrui como iniciar a aplicação  
✅ **requirements.txt** - Atualizado com `gunicorn`

---

## 🔧 **Configuração de Variáveis de Ambiente:**

Para produção, use variáveis de ambiente em vez de `config.py`:

No Render/Railway, adicione:
```
SUPABASE_URL=https://otyekylihpzscqwxeoiy.supabase.co
SUPABASE_KEY=sua-chave-anon
```

---

## 🎯 **Recomendação:**

**Use o Render.com** - É o mais fácil e gratuito!

Após o deploy, sua aplicação estará disponível 24/7 na internet com um link como:
`https://financeiro-em-dia.onrender.com`

---

## 🆘 **Precisa de Ajuda?**

Se tiver dúvidas no deploy, me avise que eu te ajudo passo a passo! 😊
