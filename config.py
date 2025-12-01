"""
Configurações do Supabase
Usa variáveis de ambiente em produção ou valores padrão em desenvolvimento
"""
import os

# Credenciais do Supabase (usar variáveis de ambiente)
# Para desenvolvimento local, crie um arquivo .env na raiz do projeto
# Para produção, configure as variáveis de ambiente no servidor
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    print('⚠️  AVISO: Configure as variáveis SUPABASE_URL e SUPABASE_KEY')
    print('Crie um arquivo .env ou configure as variáveis de ambiente do sistema')
