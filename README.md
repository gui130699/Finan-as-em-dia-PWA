# 💰 Finanças em Dia

Sistema completo de controle financeiro pessoal desenvolvido com Flask e Supabase (PostgreSQL).

![Python](https://img.shields.io/badge/Python-3.14-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![Supabase](https://img.shields.io/badge/Supabase-2.24.0-orange)

## 🚀 Funcionalidades

- ✅ **Gestão de Lançamentos**: Cadastro de receitas e despesas com suporte a parcelamento
- ✅ **Parcelamento Automático**: Cria automaticamente todas as parcelas em meses diferentes
- ✅ **Contas Fixas**: Lançamentos recorrentes gerados automaticamente
- ✅ **Quitação de Parcelas**: Quitação integral ou parcial com desconto opcional
- ✅ **Categorização**: Organize seus lançamentos por categorias personalizadas
- ✅ **Relatórios**: Visualize e exporte relatórios em PDF por período
- ✅ **Multi-usuário**: Sistema de login com senhas criptografadas (bcrypt)
- ✅ **Dashboard**: Resumo mensal com totais de receitas, despesas e saldo
- ✅ **Banco em Nuvem**: Dados armazenados no Supabase (PostgreSQL)

## 📋 Pré-requisitos

- Python 3.10 ou superior
- Conta no [Supabase](https://supabase.com) (gratuita)
- pip (gerenciador de pacotes Python)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/financas-em-dia.git
cd financas-em-dia
```

### 2. Crie e ative um ambiente virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Configure o Supabase

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o script `criar_tabelas_supabase.sql`
4. Execute também o script `corrigir_rls_supabase.sql` para desabilitar RLS
5. Copie a **URL** e **anon key** do seu projeto (Settings > API)

### 5. Configure as credenciais

Edite o arquivo `config.py`:
```python
SUPABASE_URL = 'https://seu-projeto.supabase.co'
SUPABASE_KEY = 'sua-chave-anon-aqui'
```

## ▶️ Como Executar

### 1. Inicie o servidor Flask

```powershell
python app.py
```

### 2. Acesse no navegador

Abra seu navegador e acesse:
```
http://127.0.0.1:5000
```

## 👤 Primeiro Acesso

1. Ao acessar pela primeira vez, clique em **"Criar nova conta"**
2. Cadastre seu usuário e senha
3. Faça login com as credenciais criadas
4. O sistema criará automaticamente categorias padrão para você

## 📁 Estrutura do Projeto

```
Fin/
├── app.py                    # Aplicação Flask principal
├── database.py               # Gerenciamento do banco de dados
├── models.py                 # Funções CRUD e lógica de negócio
├── requirements.txt          # Dependências do projeto
├── README.md                # Este arquivo
│
├── templates/               # Templates HTML
│   ├── base.html           # Template base
│   ├── login.html          # Tela de login
│   ├── registrar.html      # Tela de registro
│   ├── home.html           # Dashboard principal
│   ├── lancamentos.html    # Gestão de lançamentos
│   ├── categorias.html     # Gestão de categorias
│   ├── contas_fixas.html   # Gestão de contas fixas
│   ├── contas_parceladas.html  # Gestão de parcelados
│   ├── relatorios.html     # Relatórios e exportação
│   ├── editar_lancamento.html
│   ├── editar_conta_fixa.html
│   └── quitar_parcelado.html
│
├── static/                  # Arquivos estáticos
│   ├── css/
│   │   └── estilo.css      # Estilos personalizados
│   └── js/
│       └── scripts.js      # Scripts JavaScript
│
├── relatorios/             # PDFs gerados (criado automaticamente)
└── financas_em_dia.db      # Banco de dados SQLite (criado automaticamente)
```

## 🎨 Recursos Visuais

### Cores dos Lançamentos
- **Despesa Pendente**: Vermelho
- **Despesa Paga**: Verde
- **Receita A Receber**: Laranja
- **Receita Recebida**: Preto

### Interface
- Design moderno com Bootstrap 5
- Responsivo (funciona em dispositivos móveis)
- Ícones do Bootstrap Icons
- Animações suaves

## 📊 Como Usar

### Lançamentos

1. **Criar Lançamento Simples**:
   - Vá em "Lançamentos"
   - Preencha data, tipo, valor, descrição e categoria
   - Clique em "Salvar Lançamento"

2. **Criar Lançamento Parcelado**:
   - Preencha os dados do lançamento
   - Defina o número de parcelas (ex: 12)
   - O sistema criará automaticamente as parcelas mensais

3. **Criar Conta Fixa**:
   - Preencha os dados do lançamento
   - Marque "Conta Fixa"
   - Defina o dia de vencimento
   - Use o botão "Gerar p/ Mês" para criar lançamentos automaticamente

### Contas Fixas

- Gerencie suas contas recorrentes (aluguel, internet, etc.)
- Ative/desative conforme necessário
- Gere lançamentos automaticamente para qualquer mês

### Contas Parceladas

- Visualize todos os contratos com parcelas pendentes
- **Quitação Integral**: Quita todas as parcelas de uma vez (com desconto opcional)
- **Quitação Parcial**: Escolha quais parcelas quitar

### Relatórios

- Selecione um período (data inicial e final)
- Visualize totais de receitas, despesas e saldo
- Veja análise por categoria
- Exporte para PDF

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Sessões seguras do Flask
- Validações no backend
- Proteção contra SQL Injection (via parametrização)

## 🛠️ Tecnologias Utilizadas

- **Backend**: Python 3.14, Flask 3.0.0
- **Banco de Dados**: PostgreSQL via Supabase 2.24.0
- **Frontend**: HTML5, CSS3, JavaScript
- **Framework CSS**: Bootstrap 5
- **Ícones**: Bootstrap Icons
- **Relatórios**: ReportLab 4.0.7 (PDF)
- **Segurança**: BCrypt 4.1.1
- **Datas**: python-dateutil 2.9.0

## 📝 Dicas de Uso

1. **Gerar Contas Fixas**: No início de cada mês, vá em "Lançamentos" e clique em "Gerar p/ Mês"
2. **Filtros**: Use os filtros por categoria e status para encontrar lançamentos específicos
3. **Alterar Status**: Clique no botão de alternar status para marcar receitas/despesas como pagas
4. **Backup**: Faça backup do arquivo `financas_em_dia.db` periodicamente

## 🐛 Solução de Problemas

### Erro ao instalar dependências
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### Porta 5000 já em uso
Edite `app.py` e altere a porta:
```python
app.run(debug=True, host='127.0.0.1', port=5001)
```

### Banco de dados corrompido
1. Faça backup do arquivo `financas_em_dia.db`
2. Delete o arquivo
3. Execute `python app.py` novamente para criar um novo banco

## 📈 Próximas Melhorias (Futuro)

- [ ] Gráficos interativos
- [ ] Metas financeiras
- [ ] Integração com bancos
- [ ] App mobile
- [ ] Notificações de vencimento
- [ ] Backup automático em nuvem

## 👨‍💻 Desenvolvimento

Desenvolvido com ❤️ usando Python e Flask.

**Versão**: 1.0.0  
**Data**: Novembro 2025

## 📄 Licença

Este projeto é de uso pessoal e educacional.

---

**Dúvidas?** Consulte a documentação ou abra uma issue no repositório.

💰 **Mantenha suas finanças em dia!** 💰
