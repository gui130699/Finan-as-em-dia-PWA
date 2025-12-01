@echo off
echo ======================================
echo  Financas em Dia - Versao Web
echo ======================================
echo.

REM Verificar se o ambiente virtual existe
if not exist "venv\" (
    echo [1/4] Criando ambiente virtual...
    python -m venv venv
    if errorlevel 1 (
        echo ERRO: Falha ao criar ambiente virtual
        pause
        exit /b 1
    )
)

echo [2/4] Ativando ambiente virtual...
call venv\Scripts\activate.bat

echo [3/4] Instalando/Atualizando dependencias...
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)

echo [4/4] Iniciando aplicacao Flask...
echo.
echo ======================================
echo  Servidor iniciado com sucesso!
echo ======================================
echo.
echo Acesse no navegador:
echo   http://127.0.0.1:5000
echo.
echo Pressione Ctrl+C para parar o servidor
echo ======================================
echo.

python app.py
