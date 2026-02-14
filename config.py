# -*- coding: utf-8 -*-
"""
Configurações do Banco de Dados PostgreSQL Local
"""
import os
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

# Configurações do PostgreSQL Local
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'financas_em_dia')
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')

# String de conexão PostgreSQL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

if not DB_PASSWORD:
    print('[AVISO] Configure a senha do PostgreSQL na variável DB_PASSWORD')
    print('Crie um arquivo .env na raiz do projeto ou configure as variáveis de ambiente')

