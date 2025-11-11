# 🚀 GUIA RÁPIDO DE INSTALAÇÃO

## ⚡ Método Rápido (Windows)

**Duplo-clique no arquivo `iniciar.bat`**

O script irá automaticamente:
1. Criar o ambiente virtual
2. Instalar as dependências
3. Iniciar o servidor Flask

Depois, acesse: **http://127.0.0.1:5000**

---

## 📝 Método Manual

### 1. Criar ambiente virtual

```powershell
python -m venv venv
```

### 2. Ativar ambiente virtual

```powershell
venv\Scripts\activate
```

### 3. Instalar dependências

```powershell
pip install -r requirements.txt
```

### 4. Executar aplicação

```powershell
python app.py
```

### 5. Acessar no navegador

```
http://127.0.0.1:5000
```

---

## ✅ Primeiro Acesso

1. Clique em **"Criar nova conta"**
2. Crie seu usuário e senha
3. Faça login
4. Comece a usar!

---

## 🛑 Parar o Servidor

Pressione **Ctrl + C** no terminal

---

## ❓ Problemas?

### Erro: "python não é reconhecido"
- Instale Python: https://www.python.org/downloads/
- Marque a opção "Add Python to PATH" durante instalação

### Erro: "pip não é reconhecido"
```powershell
python -m pip install --upgrade pip
```

### Porta 5000 já em uso
Edite `app.py` e mude a porta:
```python
app.run(debug=True, host='127.0.0.1', port=5001)
```

---

## 📞 Suporte

Consulte o arquivo **README.md** para documentação completa.

💰 **Boas finanças!**
