# 💰 Finanças em Dia - PWA (PostgreSQL Local)

Sistema completo de controle financeiro pessoal desenvolvido com Flask e PostgreSQL.  
**Agora como Progressive Web App (PWA)!** 📱  
**✨ Versão 100% LOCAL - Sem dependências de nuvem!**

![Python](https://img.shields.io/badge/Python-3.14-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-success)

## 🚀 Funcionalidades

- ✅ **Gestão de Lançamentos**: Cadastro de receitas e despesas com suporte a parcelamento
- ✅ **Parcelamento Automático**: Cria automaticamente todas as parcelas em meses diferentes
- ✅ **Contas Fixas**: Lançamentos recorrentes gerados automaticamente
- ✅ **Quitação de Parcelas**: Quitação integral ou parcial com desconto opcional
- ✅ **Categorização**: Organize seus lançamentos por categorias personalizadas
- ✅ **Relatórios**: Visualize e exporte relatórios em PDF por período
- ✅ **Multi-usuário**: Sistema de login com senhas criptografadas (bcrypt)
- ✅ **Dashboard**: Resumo mensal com totais de receitas, despesas e saldo
- ✅ **Banco Local**: Dados armazenados localmente em PostgreSQL

## 🌟 Recursos PWA

- 📱 **Instalável**: Funciona como app nativo em qualquer dispositivo
- 🔌 **Offline**: Páginas visitadas funcionam sem internet
- ⚡ **Rápido**: Cache inteligente para carregamento instantâneo
- 🎨 **Responsivo**: Interface otimizada para mobile e desktop
- 🔔 **Indicador de Status**: Mostra quando está online/offline
- 💾 **Cache Automático**: Service Worker gerencia recursos automaticamente

## 📋 Pré-requisitos

- Python 3.10 ou superior
- PostgreSQL 12 ou superior instalado localmente
- pip (gerenciador de pacotes Python)

## 🔧 Instalação Rápida

### 1. Instale o PostgreSQL
- Download: https://www.postgresql.org/download/windows/
- Durante a instalação, **anote a senha do usuário postgres**

### 2. Clone o repositório
```bash
git clone https://github.com/gui130699/Financeiro-em-dia.git
cd Financeiro-em-dia
```

### 3. Configure o banco de dados

**Crie o banco no PostgreSQL:**
```sql
-- Abra o SQL Shell (psql) ou pgAdmin
CREATE DATABASE financas_em_dia;
\c financas_em_dia
\i 'C:/caminho/completo/para/criar_tabelas.sql'
```

### 4. Configure as credenciais

```bash
# Copie o arquivo de exemplo
copy .env.example .env

# Edite .env com a senha do seu PostgreSQL:
DB_PASSWORD=sua_senha_do_postgres
```

### 5. Instale as dependências e execute
```bash
pip install -r requirements.txt
python app.py
```

Acesse: http://127.0.0.1:5000

## 📖 Documentação Completa

- **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** - Guia de 5 minutos
- **[RESUMO_MIGRACAO.md](RESUMO_MIGRACAO.md)** - Detalhes da migração e configuração
- **[INSTRUCOES_MIGRACAO_POSTGRESQL.md](INSTRUCOES_MIGRACAO_POSTGRESQL.md)** - Guia completo passo a passo
- **[COMANDOS_POSTGRESQL.md](COMANDOS_POSTGRESQL.md)** - Comandos úteis do PostgreSQL

## 📱 Instalando como PWA

### No Desktop (Chrome/Edge):
1. Abra o app no navegador
2. Clique no ícone de instalação (+) na barra de endereço
3. Ou use o botão "Instalar App" que aparece na tela

### No Android:
1. Abra no Chrome
2. Menu > "Instalar app" ou "Adicionar à tela inicial"

### No iOS:
1. Abra no Safari
2. Compartilhar > "Adicionar à Tela Inicial"

## 📁 Estrutura do Projeto

```
Financas-em-dia-PWA/
├── app.py                    # Aplicação Flask principal
├── database.py               # Gerenciamento do PostgreSQL
├── models.py                 # Lógica de negócio
├── models_supabase.py        # Modelos específicos Supabase
├── config.py                 # Configurações (URL e Key)
├── requirements.txt          # Dependências
├── iniciar.bat              # Script para iniciar (Windows)
├── Procfile                 # Deploy Heroku
├── PWA_GUIA.md             # Guia detalhado do PWA
│
├── templates/               # Templates HTML
│   ├── base.html           # Template base com PWA
│   ├── home.html           # Dashboard
│   ├── lancamentos.html    # Lançamentos
│   ├── categorias.html     # Categorias
├── models.py                 # Lógica de negócio (PostgreSQL)
├── config.py                 # Configurações do banco
├── criar_tabelas.sql         # Script SQL para criar tabelas
├── configurar.bat            # Script de configuração automática
├── requirements.txt          # Dependências Python
├── .env.example              # Exemplo de variáveis de ambiente
│
├── templates/                # Templates HTML (Jinja2)
│   ├── base.html
│   ├── dashboard.html
│   ├── lancamentos.html
│   ├── contas_fixas.html
│   ├── contas_parceladas.html
│   ├── relatorios.html
│   ├── offline.html          # Página offline PWA
│   └── ...
│
├── static/                   # Arquivos estáticos
│   ├── manifest.json         # Configuração PWA
│   ├── service-worker.js     # Service Worker
│   ├── icons/                # Ícones PWA (todos os tamanhos)
│   ├── css/estilo.css
│   └── js/
│       ├── scripts.js
│       └── pwa-install.js    # Lógica de instalação
│
└── docs/                     # Documentação
    ├── INICIO_RAPIDO.md
    ├── RESUMO_MIGRACAO.md
    ├── INSTRUCOES_MIGRACAO_POSTGRESQL.md
    └── COMANDOS_POSTGRESQL.md
```

## 🎯 Como Usar

### 1. Primeiro Acesso
- Clique em "Criar nova conta"
- Cadastre usuário e senha
- Faça login
- Categorias padrão serão criadas automaticamente

### 2. Lançamentos
- **Simples**: Preencha data, tipo, valor e descrição
- **Parcelado**: Defina número de parcelas (geração automática)
- **Conta Fixa**: Relacione com uma conta fixa cadastrada

### 3. Contas Fixas
- Gerencie contas recorrentes (aluguel, internet, etc.)
- Use "Gerar p/ Mês" para criar lançamentos automaticamente

### 4. Quitação de Parcelados
- **Integral**: Quita todas as parcelas (com desconto opcional)
- **Parcial**: Escolha quais parcelas quitar

### 5. Relatórios
- Selecione período
- Visualize totais e análise por categoria
- Exporte para PDF

## 🔒 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Sessões seguras do Flask
- ✅ Validações no backend
- ✅ Proteção contra SQL Injection
- ✅ HTTPS obrigatório em produção

## 🛠️ Tecnologias

- **Backend**: Python 3.14, Flask 3.0.0
- **Banco de Dados**: PostgreSQL via Supabase 2.24.0
- **Frontend**: HTML5, CSS3, JavaScript
- **Framework CSS**: Bootstrap 5
- **PWA**: Service Worker, Manifest, Cache API
- **Relatórios**: ReportLab 4.0.7
- **Segurança**: BCrypt 4.1.1

## 🌐 Deploy

### Heroku
```bash
git push heroku main
```

### Vercel/Netlify
Configure para servir com Flask/WSGI

**Importante**: HTTPS é obrigatório para PWA funcionar em produção!

## 📊 PWA - Teste de Qualidade

Use o Lighthouse no Chrome DevTools:
1. F12 > Lighthouse
2. Selecione "Progressive Web App"
3. Execute análise

**Meta**: Score 90+ para PWA ✅

## 🌐 Acessando via GitHub Pages

A aplicação está disponível como PWA estática em:
**https://gui130699.github.io/Finan-as-em-dia-PWA/**

Para configurar seu próprio repositório:

1. **Vá para Settings > Pages**
2. **Source**: Selecione "Deploy from a branch"
3. **Branch**: Escolha `main` e pasta `/root`
4. **Save** e aguarde o deploy (2-3 minutos)

**Nota**: A aplicação é 100% cliente (JavaScript + Supabase), não precisa de servidor Python!

## 🔍 Solução de Problemas

### Service Worker não registra
- ✅ Use HTTPS ou localhost
- ✅ Limpe cache: DevTools > Application > Clear Storage

### App não instala
- ✅ Navegue pelo site por 30s primeiro
- ✅ Verifique manifest: DevTools > Application > Manifest

### Offline não funciona
- ✅ Navegue pelas páginas online primeiro (para cachear)
- ✅ Verifique Service Worker ativo: DevTools > Application

### Porta 5000 em uso
```python
# Em app.py, mude a porta:
app.run(debug=True, port=5001)
```

## 📈 Roadmap Futuro

- [ ] Push Notifications para alertas de vencimento
- [ ] Background Sync para dados offline
- [ ] Gráficos interativos avançados
- [ ] Exportar para Excel
- [ ] Metas e orçamentos
- [ ] Integração com Open Banking

## 📖 Documentação Adicional

- **PWA_GUIA.md** - Guia completo sobre o PWA e recursos avançados

## 👨‍💻 Desenvolvimento

Desenvolvido com ❤️ usando Python, Flask e tecnologias PWA.

**Versão**: 2.0.0 - PWA Edition  
**Data**: Novembro 2025

## 📄 Licença

Este projeto é de uso pessoal e educacional.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

💰 **Mantenha suas finanças em dia - em qualquer lugar, online ou offline!** 💰 📱
