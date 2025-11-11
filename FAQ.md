# ❓ FAQ - Perguntas Frequentes

## 📥 Instalação e Configuração

### P: Preciso instalar algum software antes?
**R:** Sim, apenas o Python 3.8 ou superior. Baixe em: https://www.python.org/downloads/

Durante a instalação, marque a opção **"Add Python to PATH"**.

---

### P: Como faço para instalar o projeto?
**R:** Duplo-clique em `iniciar.bat` (Windows) ou siga o guia em `INSTALACAO.md`.

---

### P: Dá erro ao executar o iniciar.bat
**R:** Possíveis soluções:
```powershell
# Verificar se Python está instalado
python --version

# Se não reconhecer, reinstale Python marcando "Add to PATH"

# Ou execute manualmente:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

### P: Como sei que está funcionando?
**R:** Você verá no terminal:
```
* Running on http://127.0.0.1:5000
```
Abra esse endereço no navegador.

---

## 👤 Usuários e Login

### P: Como crio o primeiro usuário?
**R:** 
1. Acesse http://127.0.0.1:5000
2. Clique em "Criar nova conta"
3. Preencha usuário e senha
4. Faça login

---

### P: Esqueci minha senha, o que faço?
**R:** Atualmente não há recuperação de senha. Você pode:
- Criar um novo usuário
- OU deletar o banco de dados e começar do zero (perde os dados)

---

### P: Posso ter vários usuários?
**R:** Sim! Cada usuário tem seus dados completamente separados.

---

### P: Os dados de um usuário aparecem para outro?
**R:** Não. Cada usuário vê apenas seus próprios dados.

---

## 💰 Lançamentos

### P: Como cadastro uma receita?
**R:** 
1. Vá em "Lançamentos"
2. Preencha os dados
3. Selecione Tipo = "Receita"
4. Escolha uma categoria de receita
5. Salvar

---

### P: Como marco que recebi/paguei?
**R:** Clique no botão 🔄 ao lado do lançamento na tabela.

---

### P: Como faço um lançamento parcelado?
**R:** 
1. Cadastre normalmente
2. No campo "Parcelas", digite o número (ex: 12)
3. O sistema cria automaticamente 12 parcelas mensais

---

### P: Posso editar uma parcela individual?
**R:** Sim! Cada parcela é um lançamento independente. Clique em ✏️ para editar.

---

### P: Como excluo um parcelamento inteiro?
**R:** Você precisa excluir parcela por parcela, OU use a tela "Contas Parceladas" para quitação.

---

## 🔄 Contas Fixas

### P: O que são contas fixas?
**R:** São despesas/receitas que se repetem todo mês (aluguel, internet, salário, etc.).

---

### P: Como crio uma conta fixa?
**R:** 
1. Vá em "Lançamentos"
2. Preencha os dados
3. Marque "Conta Fixa"
4. Defina o dia de vencimento
5. Salvar

---

### P: Como gero os lançamentos das contas fixas?
**R:** 
1. Vá em "Lançamentos"
2. Selecione o mês/ano desejado
3. Clique em "Gerar p/ Mês"
4. Pronto! Lançamentos criados automaticamente

---

### P: Posso desativar uma conta fixa temporariamente?
**R:** Sim! Vá em "Contas Fixas" → Editar → Desmarque "Conta Ativa".

---

### P: A conta fixa é criada automaticamente todo mês?
**R:** Não. Você precisa clicar em "Gerar p/ Mês" quando quiser criar.

---

## 💳 Contas Parceladas

### P: Qual a diferença entre lançamento parcelado e conta parcelada?
**R:** São a mesma coisa! "Contas Parceladas" é apenas a tela para gerenciar esses lançamentos.

---

### P: O que é "quitar" um parcelado?
**R:** É pagar antecipadamente várias (ou todas) as parcelas de uma vez.

---

### P: Como funciona a quitação integral?
**R:** 
1. Clique em "Quitar"
2. Escolha "Quitação Integral"
3. Digite o desconto (se houver)
4. Confirma
5. Sistema cria 1 lançamento com o total e apaga as parcelas

---

### P: E a quitação parcial?
**R:** 
1. Clique em "Quitar"
2. Escolha "Quitação Parcial"
3. Selecione quais parcelas quer quitar
4. Digite o desconto
5. Confirma

---

### P: Depois de quitar, posso desfazer?
**R:** Não automaticamente. As parcelas são excluídas. Você teria que criar os lançamentos novamente.

---

## 🏷️ Categorias

### P: Preciso criar categorias manualmente?
**R:** Não! O sistema já cria 12 categorias padrão ao criar seu usuário.

---

### P: Posso criar minhas próprias categorias?
**R:** Sim! Vá em "Categorias" e adicione quantas quiser.

---

### P: Posso excluir categorias?
**R:** Atualmente não há opção de excluir pelo sistema. Apenas crie novas quando precisar.

---

### P: Posso ter categorias com o mesmo nome?
**R:** Apenas se forem de tipos diferentes (uma Receita e outra Despesa).

---

## 📊 Relatórios

### P: Como gero um relatório?
**R:** 
1. Vá em "Relatórios"
2. Selecione data inicial e final
3. Clique em "Buscar"
4. Veja os resultados na tela

---

### P: Como exporto para PDF?
**R:** Depois de buscar, clique em "Exportar PDF". O arquivo será baixado.

---

### P: Onde ficam salvos os PDFs?
**R:** Na pasta `relatorios/` dentro do projeto.

---

### P: O relatório mostra apenas lançamentos pagos?
**R:** O relatório mostra TODOS os lançamentos do período, mas os totais consideram apenas pagos/recebidos.

---

## 🎨 Interface

### P: O que significam as cores na tabela?
**R:**
- 🔴 **Vermelho** = Despesa pendente (não paga ainda)
- 🟢 **Verde** = Despesa paga
- 🟠 **Laranja** = Receita a receber
- ⚫ **Preto** = Receita recebida

---

### P: Funciona no celular?
**R:** Sim! O design é responsivo e funciona em qualquer dispositivo.

---

### P: Como volto para o mês atual na Home?
**R:** Basta clicar em "Home" no menu superior (ou deixe os campos vazios e busque).

---

## 💾 Banco de Dados

### P: Onde ficam meus dados?
**R:** No arquivo `financas_em_dia.db` na raiz do projeto.

---

### P: Como faço backup?
**R:** Copie o arquivo `financas_em_dia.db` para um local seguro (pendrive, nuvem, etc.).

---

### P: Como restauro um backup?
**R:** 
1. Pare o servidor (Ctrl+C)
2. Substitua o arquivo `financas_em_dia.db` pelo backup
3. Inicie novamente o servidor

---

### P: Posso usar MySQL ou PostgreSQL?
**R:** Atualmente o projeto usa SQLite. Para outros bancos, seria necessário modificar o código.

---

### P: Os dados ficam salvos quando fecho o navegador?
**R:** Sim! Os dados estão no banco de dados, não no navegador.

---

## 🔧 Problemas Comuns

### P: Erro "Port 5000 is already in use"
**R:** A porta já está em uso. Soluções:
```python
# Opção 1: Edite app.py e mude a porta
app.run(debug=True, host='127.0.0.1', port=5001)

# Opção 2: Mate o processo que usa a porta 5000
# Windows: netstat -ano | findstr :5000
# Depois: taskkill /PID <número> /F
```

---

### P: Erro "Module not found"
**R:** Reinstale as dependências:
```powershell
venv\Scripts\activate
pip install -r requirements.txt
```

---

### P: Página não carrega (erro 404)
**R:** Verifique se o servidor está rodando e se você está acessando `http://127.0.0.1:5000`

---

### P: Erro ao criar PDF
**R:** Certifique-se de que instalou o reportlab:
```powershell
pip install reportlab
```

---

### P: "Database is locked"
**R:** Alguém está acessando o banco. Soluções:
- Feche outras janelas/abas do sistema
- Reinicie o servidor
- Em último caso, delete o `.db` e comece novamente

---

## 🚀 Performance

### P: O sistema fica lento com muitos dados?
**R:** SQLite suporta bem até ~100.000 registros. Para uso pessoal, não terá problemas.

---

### P: Posso acessar de outros computadores na rede?
**R:** Sim! Edite app.py:
```python
app.run(debug=True, host='0.0.0.0', port=5000)
```
Depois acesse via `http://IP_DO_COMPUTADOR:5000`

---

## 🔐 Segurança

### P: As senhas são seguras?
**R:** Sim! São criptografadas com bcrypt (hash irreversível).

---

### P: Outras pessoas podem ver meus dados?
**R:** Se executar na sua máquina local, não. Mas não exponha na internet sem medidas de segurança adicionais.

---

### P: É seguro usar em produção/internet?
**R:** O projeto é para uso local/pessoal. Para internet pública, seria necessário:
- HTTPS
- Servidor adequado
- Mais camadas de segurança
- Firewall
- Backup automático

---

## 📱 Desenvolvimento

### P: Posso modificar o código?
**R:** Sim! O código é todo aberto e comentado. Modifique à vontade.

---

### P: Como adiciono uma nova funcionalidade?
**R:** 
1. Adicione rota em `app.py`
2. Crie função em `models.py` (se precisar)
3. Crie template em `templates/`
4. Atualize navbar em `base.html`

---

### P: Tem documentação da API?
**R:** Não há API REST atualmente. O sistema usa renderização de templates.

---

### P: Posso contribuir?
**R:** Claro! Faça suas modificações e compartilhe melhorias.

---

## 📞 Suporte

### P: Onde tiro mais dúvidas?
**R:** Consulte os arquivos:
- `README.md` - Documentação completa
- `COMO_USAR.md` - Tutorial passo a passo
- `ESTRUTURA.md` - Detalhes técnicos

---

### P: Encontrei um bug, o que faço?
**R:** Anote:
1. O que você estava fazendo
2. A mensagem de erro (se houver)
3. Como reproduzir o problema

---

### P: Posso sugerir melhorias?
**R:** Sim! Toda sugestão é bem-vinda.

---

## 🎓 Aprendizado

### P: Preciso saber programar para usar?
**R:** Não! O sistema está pronto para usar. Basta seguir o guia.

---

### P: Como aprendo mais sobre Flask?
**R:** 
- Documentação oficial: https://flask.palletsprojects.com/
- Tutorial: https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world

---

### P: Posso usar isso como projeto de estudo?
**R:** Sim! O código é bem estruturado e comentado, ótimo para aprender.

---

## 💡 Dicas Finais

### P: Qual a melhor forma de usar o sistema?
**R:** 
1. Configure suas contas fixas uma vez
2. Todo início de mês, gere as contas fixas
3. Lance receitas e despesas conforme acontecem
4. Marque como pago/recebido imediatamente
5. No fim do mês, gere relatório para análise

---

### P: Como não esquecer de lançar algo?
**R:** Crie o hábito de lançar no mesmo dia. Dica: deixe o navegador sempre aberto na aba do sistema.

---

### P: Vale a pena usar isso?
**R:** Se você quer controle total, 100% privado e gratuito, sim! Sem mensalidades, sem limites, sem dependência de internet.

---

**Não encontrou sua pergunta?** Consulte os outros arquivos de documentação! 📚
