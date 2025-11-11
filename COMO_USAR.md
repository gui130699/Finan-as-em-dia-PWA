# 🎯 COMO COMEÇAR A USAR

## 🚀 Início Rápido em 3 Passos

### Passo 1: Instalar e Iniciar
```powershell
# Duplo-clique em: iniciar.bat
# OU execute manualmente:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Passo 2: Criar Conta
1. Acesse http://127.0.0.1:5000
2. Clique em "Criar nova conta"
3. Escolha usuário e senha
4. Faça login

### Passo 3: Começar a Usar!
O sistema já vem com categorias padrão criadas automaticamente.

---

## 💡 OU: Usar Dados de Exemplo

Se quiser **testar rapidamente** com dados já prontos:

```powershell
python criar_dados_exemplo.py
python app.py
```

**Login de teste:**
- Usuário: `admin`
- Senha: `admin123`

Os dados de exemplo incluem:
- ✅ 1 Salário recebido
- ✅ 4 Despesas variadas
- ✅ 1 Compra parcelada (3x)
- ✅ 1 Conta fixa (Internet)

---

## 📚 Primeiros Passos Após Login

### 1. Home - Visão Geral 🏠
- Veja seu resumo mensal
- Total de receitas e despesas
- Saldo do mês
- Lista de lançamentos

### 2. Lançamentos - Cadastro 📝
**Lançamento Simples:**
1. Preencha data, tipo, valor, descrição
2. Escolha a categoria
3. Clique em "Salvar"

**Lançamento Parcelado:**
1. Preencha os dados normalmente
2. No campo "Parcelas", digite o número (ex: 12)
3. Salve - o sistema cria as 12 parcelas automaticamente!

**Conta Fixa:**
1. Preencha os dados do lançamento
2. Marque "Conta Fixa"
3. Defina o dia de vencimento (ex: 15)
4. Salve - a conta fica cadastrada!

### 3. Categorias - Organização 🏷️
- Veja as categorias padrão
- Crie novas categorias personalizadas
- Organize receitas e despesas

### 4. Contas Fixas - Recorrências 🔄
**Ver suas contas fixas:**
- Lista todas as contas cadastradas
- Ative/desative conforme necessário

**Gerar lançamentos do mês:**
1. Vá em "Lançamentos"
2. Selecione o mês desejado
3. Clique em "Gerar p/ Mês"
4. Pronto! Todos os lançamentos fixos são criados

### 5. Contas Parceladas - Gestão 💳
**Visualizar:**
- Veja contratos com parcelas pendentes
- Total pendente de cada contrato

**Quitar Integral:**
1. Clique em "Quitar"
2. Escolha "Quitação Integral"
3. Digite o desconto (se houver)
4. Confirme

**Quitar Parcial:**
1. Clique em "Quitar"
2. Escolha "Quitação Parcial"
3. Selecione as parcelas desejadas
4. Digite o desconto (se houver)
5. Confirme

### 6. Relatórios - Análise 📊
1. Selecione período (data inicial e final)
2. Clique em "Buscar"
3. Veja análise completa:
   - Totais do período
   - Lista de lançamentos
   - Análise por categoria
4. Exporte para PDF se desejar

---

## 🎨 Dicas de Interface

### Cores dos Lançamentos
Na tabela, observe as cores:
- 🔴 **Vermelho** = Despesa pendente (não paga)
- 🟢 **Verde** = Despesa paga
- 🟠 **Laranja** = Receita a receber
- ⚫ **Preto** = Receita recebida

### Alternar Status Rapidamente
Clique no botão 🔄 ao lado do lançamento para:
- Despesa: Pendente ⟷ Pago
- Receita: A receber ⟷ Recebido

### Filtros Úteis
Na aba "Lançamentos", use os filtros para:
- Ver apenas despesas pendentes
- Filtrar por categoria específica
- Buscar por descrição

---

## 💰 Fluxo de Trabalho Mensal Recomendado

### Início do Mês
1. Vá em "Lançamentos"
2. Clique em "Gerar p/ Mês" (cria contas fixas automaticamente)
3. Lance sua receita principal (salário, etc.)

### Durante o Mês
1. Cadastre despesas conforme acontecem
2. Marque como "Pago" quando efetuar o pagamento
3. Use filtros para ver pendências

### Fim do Mês
1. Vá em "Relatórios"
2. Selecione o mês todo
3. Analise seus gastos por categoria
4. Exporte PDF para seus registros

---

## ⚡ Atalhos e Produtividade

### Navegação Rápida
Use a barra superior para alternar entre seções rapidamente.

### Edição Rápida
- Clique em ✏️ para editar
- Clique em 🗑️ para excluir
- Clique em 🔄 para alterar status

### Informações em Tempo Real
A Home sempre mostra o resumo atualizado do mês atual.

---

## ❓ Dúvidas Comuns

**P: Como crio categorias personalizadas?**
R: Vá em "Categorias" → Preencha nome e tipo → "Adicionar"

**P: Como funciona o parcelamento?**
R: Ao cadastrar com N parcelas, o sistema cria N lançamentos mensais automaticamente.

**P: Posso editar um lançamento parcelado?**
R: Sim! Cada parcela é um lançamento independente que pode ser editado.

**P: Como funciona a conta fixa?**
R: Cadastre uma vez, depois use "Gerar p/ Mês" para criar lançamentos automaticamente.

**P: Posso ter vários usuários?**
R: Sim! Cada usuário tem seus dados separados e independentes.

**P: Como fazer backup?**
R: Copie o arquivo `financas_em_dia.db` para local seguro.

---

## 🎓 Exemplo Prático

**Cenário:** João recebe R$ 5.000 de salário e tem despesas fixas e variadas.

### 1. Primeiro Acesso (Configuração)
```
→ Criar conta: joao / senha123
→ Login
→ Sistema já criou categorias padrão ✓
```

### 2. Cadastrar Contas Fixas (Fazer 1x)
```
Lançamentos → Novo Lançamento:
├─ Aluguel: R$ 1.200 | Dia 5 | Conta Fixa ✓
├─ Internet: R$ 100 | Dia 10 | Conta Fixa ✓
└─ Academia: R$ 80 | Dia 15 | Conta Fixa ✓
```

### 3. Todo Mês (Rotina)
```
Início do mês:
├─ "Gerar p/ Mês" → Cria aluguel, internet e academia ✓
└─ Lançar salário: R$ 5.000 → Recebido ✓

Durante o mês:
├─ Supermercado: R$ 500
├─ Combustível: R$ 200
├─ Restaurante: R$ 150
└─ Marcar como "Pago" conforme paga

Fim do mês:
└─ Relatório → Ver análise e exportar PDF
```

### 4. Resultado
```
Home mostra:
├─ Receitas: R$ 5.000
├─ Despesas: R$ 2.230
└─ Saldo: R$ 2.770 💰
```

---

## 🎉 Pronto para Começar!

Agora é só usar e manter suas finanças organizadas! 💰

**Lembre-se:**
- Cadastre tudo que acontece
- Use as contas fixas para economizar tempo
- Consulte os relatórios para análise
- Faça backup periodicamente

**Bom controle financeiro!** 🚀
