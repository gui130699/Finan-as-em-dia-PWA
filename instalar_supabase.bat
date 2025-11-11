@echo off
chcp 65001 >nul
echo ================================================
echo   INSTALAÇÃO - Finanças em Dia (Versão Supabase)
echo ================================================
echo.

REM Ativar ambiente virtual
if exist venv (
    echo [1/2] Ativando ambiente virtual...
    call venv\Scripts\activate
) else (
    echo [1/2] Criando ambiente virtual...
    python -m venv venv
    call venv\Scripts\activate
)

echo.
echo [2/2] Instalando dependências do Supabase...
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo ================================================
echo   INSTALAÇÃO CONCLUÍDA!
echo ================================================
echo.
echo PRÓXIMOS PASSOS:
echo.
echo 1. Acesse o painel do Supabase:
echo    https://app.supabase.com/
echo.
echo 2. Vá em "SQL Editor" no menu lateral
echo.
echo 3. Abra o arquivo: criar_tabelas_supabase.sql
echo.
echo 4. Cole o SQL no editor e clique em "Run"
echo.
echo 5. Verifique se as tabelas foram criadas em "Table Editor"
echo.
echo 6. Execute: iniciar.bat
echo.
echo ================================================
pause
