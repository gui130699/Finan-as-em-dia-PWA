# 🚀 Guia de Publicação no GitHub

## Passo 1: Preparar o Repositório Local

```bash
# Navegue até a pasta do projeto
cd "c:\Users\guilh\OneDrive\HP Guilherme Notebook\Área de Trabalho\Fin"

# Inicialize o repositório Git (se ainda não foi feito)
git init

# Configure seu nome e email (se ainda não fez)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

## Passo 2: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **"New repository"** (botão verde)
3. Preencha:
   - **Repository name**: `financas-em-dia`
   - **Description**: `Sistema de controle financeiro pessoal com Flask e Supabase`
   - **Public** ou **Private** (sua escolha)
   - **NÃO** marque "Initialize with README" (já temos um)
4. Clique em **"Create repository"**

## Passo 3: Fazer o Primeiro Commit

```bash
# Adicione todos os arquivos
git add .

# Faça o commit inicial
git commit -m "feat: primeira versão do sistema Finanças em Dia"
```

## Passo 4: Conectar ao GitHub

```bash
# Adicione o remote (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/financas-em-dia.git

# Renomeie a branch para main (se necessário)
git branch -M main

# Faça o push
git push -u origin main
```

## Passo 5: Ativar GitHub Pages (para criar uma página)

### Opção 1: Página Automática do README

O GitHub automaticamente mostra o README.md como página inicial do repositório.

### Opção 2: GitHub Pages (se quiser uma página web customizada)

1. Vá no repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em **Source**, selecione:
   - Branch: `main`
   - Folder: `/ (root)`
5. Clique em **Save**
6. Aguarde alguns minutos
7. Sua página estará disponível em: `https://SEU_USUARIO.github.io/financas-em-dia/`

## Passo 6: Adicionar Topics (Tags)

No repositório do GitHub:
1. Clique em **⚙️** ao lado de "About"
2. Adicione topics:
   - `flask`
   - `python`
   - `supabase`
   - `postgresql`
   - `finance`
   - `personal-finance`
   - `financial-management`
   - `bootstrap`
   - `web-application`

## Passo 7: Atualizar README com Badges

Adicione badges ao README.md:

```markdown
![Python](https://img.shields.io/badge/Python-3.14-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![Supabase](https://img.shields.io/badge/Supabase-2.24.0-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-active-success)
```

## 📝 Comandos Úteis para Manutenção

```bash
# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline

# Criar nova branch
git checkout -b nome-da-branch

# Voltar para main
git checkout main

# Atualizar com mudanças locais
git add .
git commit -m "mensagem do commit"
git push

# Baixar mudanças do GitHub
git pull
```

## 🔒 Proteger Dados Sensíveis

**IMPORTANTE**: O arquivo `config.py` está no `.gitignore` para não expor suas credenciais do Supabase.

Certifique-se de que:
- ✅ `.gitignore` contém `config.py`
- ✅ `config.py.example` está versionado (sem credenciais reais)
- ✅ Nunca commite o `config.py` real

## 📸 Adicionar Screenshots

1. Tire screenshots da aplicação rodando
2. Crie uma pasta `screenshots/` no repositório
3. Adicione as imagens
4. Atualize o README.md com as imagens:

```markdown
## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Lançamentos
![Lançamentos](screenshots/lancamentos.png)
```

## 🎉 Pronto!

Seu projeto agora está no GitHub e pode ser:
- ✅ Compartilhado com outras pessoas
- ✅ Clonado em outros computadores
- ✅ Versionado e com histórico completo
- ✅ Acessível via web

URL do seu repositório: `https://github.com/SEU_USUARIO/financas-em-dia`

---

**Dica**: Atualize o README.md substituindo `SEU_USUARIO` pelo seu username real do GitHub!
