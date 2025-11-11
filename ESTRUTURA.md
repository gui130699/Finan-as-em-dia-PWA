# 📁 ESTRUTURA DO PROJETO - FINANÇAS EM DIA

```
📦 Fin/
│
├── 📄 app.py                      # ⚙️ Aplicação Flask principal com todas as rotas
├── 📄 database.py                 # 💾 Conexão e criação das tabelas SQLite
├── 📄 models.py                   # 🔧 Funções CRUD e lógica de negócio
├── 📄 requirements.txt            # 📦 Dependências do projeto
├── 📄 .gitignore                  # 🚫 Arquivos ignorados pelo Git
│
├── 📖 README.md                   # 📚 Documentação principal completa
├── 📖 INSTALACAO.md              # 🚀 Guia rápido de instalação
├── 📖 COMO_USAR.md               # 💡 Tutorial de uso passo a passo
│
├── 🚀 iniciar.bat                 # ⚡ Script de inicialização rápida
├── 🧪 criar_dados_exemplo.py     # 📊 Script para criar dados de teste
│
├── 📁 templates/                  # 🎨 Templates HTML (Jinja2)
│   ├── 📄 base.html              # 🏗️ Template base com navbar e layout
│   ├── 📄 login.html             # 🔐 Tela de login
│   ├── 📄 registrar.html         # ✍️ Tela de registro de usuário
│   ├── 📄 home.html              # 🏠 Dashboard com resumo mensal
│   ├── 📄 lancamentos.html       # 📝 Gestão completa de lançamentos
│   ├── 📄 editar_lancamento.html # ✏️ Edição de lançamento
│   ├── 📄 categorias.html        # 🏷️ Gestão de categorias
│   ├── 📄 contas_fixas.html      # 🔄 Gestão de contas fixas
│   ├── 📄 editar_conta_fixa.html # ✏️ Edição de conta fixa
│   ├── 📄 contas_parceladas.html # 💳 Gestão de parcelados
│   ├── 📄 quitar_parcelado.html  # 💰 Quitação integral/parcial
│   └── 📄 relatorios.html        # 📊 Relatórios e análises
│
└── 📁 static/                     # 🎨 Arquivos estáticos
    ├── 📁 css/
    │   └── 📄 estilo.css         # 🎨 Estilos personalizados
    └── 📁 js/
        └── 📄 scripts.js         # ⚡ Scripts JavaScript

📁 (Gerados automaticamente ao usar)
├── 💾 financas_em_dia.db         # Banco de dados SQLite
└── 📁 relatorios/                # PDFs exportados
```

---

## 🔑 Arquivos Principais

### Backend (Python/Flask)

| Arquivo | Descrição | Linhas | Responsabilidade |
|---------|-----------|--------|------------------|
| `app.py` | Aplicação Flask | ~350 | Rotas, sessões, controllers |
| `database.py` | Banco de dados | ~100 | Conexão, tabelas, queries |
| `models.py` | Modelos de dados | ~600 | CRUD, lógica de negócio |

### Frontend (HTML/CSS/JS)

| Arquivo | Descrição | Funcionalidade |
|---------|-----------|----------------|
| `base.html` | Template base | Navbar, layout, imports |
| `home.html` | Dashboard | Resumo mensal, totais |
| `lancamentos.html` | Lançamentos | Formulário completo, filtros |
| `categorias.html` | Categorias | Listagem, criação |
| `contas_fixas.html` | Contas fixas | Gestão de recorrências |
| `contas_parceladas.html` | Parcelados | Contratos, quitações |
| `relatorios.html` | Relatórios | Análises, export PDF |
| `estilo.css` | Estilos | Cores, layout, responsivo |
| `scripts.js` | JavaScript | Validações, animações |

### Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `README.md` | Documentação completa do projeto |
| `INSTALACAO.md` | Guia de instalação passo a passo |
| `COMO_USAR.md` | Tutorial de uso com exemplos |

### Utilitários

| Arquivo | Utilidade |
|---------|-----------|
| `iniciar.bat` | Inicialização automática (Windows) |
| `criar_dados_exemplo.py` | Popula BD com dados de teste |
| `requirements.txt` | Dependências Python |
| `.gitignore` | Arquivos ignorados pelo Git |

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas

```sql
┌─────────────────┐
│    usuarios     │
├─────────────────┤
│ id (PK)         │
│ username        │
│ password (hash) │
│ criado_em       │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│   categorias    │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ nome            │
│ tipo            │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐      ┌──────────────────┐
│  lancamentos    │      │  contas_fixas    │
├─────────────────┤      ├──────────────────┤
│ id (PK)         │      │ id (PK)          │
│ user_id (FK)    │      │ user_id (FK)     │
│ data            │      │ descricao        │
│ tipo            │      │ categoria_id(FK) │
│ valor           │      │ tipo             │
│ descricao       │      │ valor            │
│ categoria_id(FK)│      │ dia_vencimento   │
│ status          │      │ ativa            │
│ parcela_atual   │      │ observacao       │
│ parcela_total   │      └──────────────────┘
│ contrato_id     │
│ observacao      │
└─────────────────┘

┌─────────────────┐
│   app_config    │
├─────────────────┤
│ chave (PK)      │
│ valor           │
└─────────────────┘
```

---

## 🔄 Fluxo de Dados

### Login
```
Usuario → app.py (login) → models.autenticar() → database
                            ↓
                        Session criada
                            ↓
                      Redirect → Home
```

### Criar Lançamento
```
Formulário → app.py (lancamentos POST)
                ↓
        models.inserir_lancamento()
                ↓
           database.executar_query()
                ↓
            Lançamento(s) criados
                ↓
        Redirect → Lista atualizada
```

### Gerar Contas Fixas
```
Botão "Gerar p/ Mês"
        ↓
models.gerar_lancamentos_contas_fixas_mes()
        ↓
Busca contas fixas ativas
        ↓
Cria lançamento para cada uma
        ↓
Evita duplicatas (verifica se já existe)
```

### Quitar Parcelado
```
Seleção de parcelas
        ↓
models.quitar_parcelado_integral/parcial()
        ↓
Calcula total - desconto
        ↓
Cria lançamento de quitação
        ↓
Exclui parcelas quitadas
```

---

## 🎨 Componentes de UI

### Bootstrap 5
- Grid system (responsivo)
- Cards
- Forms
- Tables
- Navbar
- Alerts
- Badges
- Buttons

### Bootstrap Icons
- bi-cash-coin (logo)
- bi-house-door (home)
- bi-journal-text (lançamentos)
- bi-tags (categorias)
- bi-arrow-repeat (contas fixas)
- bi-credit-card (parcelados)
- bi-file-earmark-bar-graph (relatórios)

### Estilos Personalizados
- Cores dos lançamentos (vermelho/verde/laranja/preto)
- Animações de fade-in
- Hover effects
- Shadows e borders

---

## 📊 Métricas do Projeto

### Linhas de Código (aproximado)
- Python: ~1.050 linhas
  - app.py: ~350
  - models.py: ~600
  - database.py: ~100

- HTML: ~1.500 linhas
  - 12 templates

- CSS: ~300 linhas
- JavaScript: ~250 linhas

**Total: ~3.100 linhas de código**

### Funcionalidades
- ✅ 15 rotas principais
- ✅ 30+ funções de modelo
- ✅ 12 telas completas
- ✅ 5 tabelas de banco de dados
- ✅ Autenticação completa
- ✅ CRUD completo para todas entidades
- ✅ Sistema de parcelamento
- ✅ Sistema de contas fixas
- ✅ Relatórios e exportação PDF

---

## 🔐 Segurança

### Implementado
- ✅ Senhas hasheadas (bcrypt)
- ✅ Sessões do Flask
- ✅ Decorator @login_required
- ✅ SQL parametrizado (anti-injection)
- ✅ Validação de formulários
- ✅ Secret key do Flask

### Recomendações Futuras
- [ ] Rate limiting
- [ ] CSRF tokens
- [ ] HTTPS em produção
- [ ] Backup automático

---

## 🚀 Próximas Melhorias Possíveis

### Funcionalidades
- [ ] Gráficos interativos (Chart.js)
- [ ] Metas financeiras mensais
- [ ] Notificações de vencimento
- [ ] Import/Export CSV
- [ ] Dashboard com widgets
- [ ] Histórico de alterações

### Técnico
- [ ] API REST
- [ ] Testes automatizados
- [ ] Docker
- [ ] Deploy em cloud
- [ ] App mobile (React Native)
- [ ] Integração com bancos

---

**Estrutura criada e pronta para uso!** 🎉

Para começar: Execute `iniciar.bat` ou consulte `INSTALACAO.md`
