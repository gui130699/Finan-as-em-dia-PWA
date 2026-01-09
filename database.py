# -*- coding: utf-8 -*-
# database.py - Gerenciamento do banco de dados Supabase (PostgreSQL)

from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

# Cliente Supabase global
_supabase_client = None

def conectar():
    """Cria e retorna o cliente Supabase"""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase_client

def inicializar_banco():
    """
    Inicializa a conexão com o Supabase.
    As tabelas devem ser criadas diretamente no Supabase usando o arquivo criar_tabelas_supabase.sql 
    """
    try:
        supabase = conectar()
        # Testa a conexão fazendo uma query simples
        supabase.table('usuarios').select('id').limit(1).execute()
        print("[OK] Conexão com Supabase estabelecida com sucesso!")
        return True
    except Exception as e:
        print(f"[ERRO] Erro ao conectar com Supabase: {e}")
        print("\n[IMPORTANTE] Execute o SQL em criar_tabelas_supabase.sql no painel do Supabase primeiro!")
        return False

def executar_query(query, params=(), commit=False):
    """
    Função mantida para compatibilidade com código legado.
    Para Supabase, use diretamente os métodos do cliente: supabase.table().select/insert/update/delete()
    """
    raise NotImplementedError(
        "executar_query() não é mais utilizado com Supabase. "
        "Use supabase.table('nome_tabela').select/insert/update/delete() diretamente."
    )

def executar_many(query, params_list):
    """
    Função mantida para compatibilidade com código legado.
    Para Supabase, use diretamente os métodos do cliente com insert em lote.
    """
    raise NotImplementedError(
        "executar_many() não é mais utilizado com Supabase. "
        "Use supabase.table('nome_tabela').insert(lista_de_dicts) para inserções em lote."
    )
