@echo off
chcp 65001 >nul
echo ============================================
echo   Finanças em Dia - Configuração Inicial
echo   PostgreSQL Local
echo ============================================
echo.

echo [1/5] Verificando se o PostgreSQL está instalado...
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL não encontrado!
    echo.
    echo Por favor, instale o PostgreSQL primeiro:
    echo https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)
echo ✓ PostgreSQL encontrado

echo.
echo [2/5] Verificando arquivo .env...
if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado. Criando a partir do exemplo...
    copy .env.example .env >nul
    echo ✓ Arquivo .env criado
    echo.
    echo ⚠️  IMPORTANTE: Edite o arquivo .env e configure sua senha do PostgreSQL!
    echo    Abra o arquivo .env e altere a linha:
    echo    DB_PASSWORD=SUA_SENHA_AQUI
    echo.
    pause
) else (
    echo ✓ Arquivo .env já existe
)

echo.
echo [3/5] Verificando ambiente virtual Python...
if not exist ".venv" (
    echo ⚠️  Ambiente virtual não encontrado. Criando...
    python -m venv .venv
    echo ✓ Ambiente virtual criado
)
echo ✓ Ambiente virtual existe

echo.
echo [4/5] Instalando dependências Python...
call .venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)
echo ✓ Dependências instaladas

echo.
echo [5/5] Verificando conexão com PostgreSQL...
python -c "import database; database.inicializar_banco()" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Conexão com PostgreSQL OK
    echo.
    echo ============================================
    echo   ✓ Configuração concluída com sucesso!
    echo ============================================
    echo.
    echo Para iniciar o sistema, execute:
    echo   iniciar.bat
    echo.
) else (
    echo ❌ Erro ao conectar com PostgreSQL
    echo.
    echo Possíveis causas:
    echo 1. PostgreSQL não está rodando
    echo 2. Senha incorreta no arquivo .env
    echo 3. Banco 'financas_em_dia' não foi criado
    echo 4. Tabelas não foram criadas
    echo.
    echo Consulte o arquivo RESUMO_MIGRACAO.md para instruções detalhadas.
    echo.
)

pause
