# -*- coding: utf-8 -*-
# database.py - Gerenciamento do banco de dados PostgreSQL local

import psycopg2
import psycopg2.extras
from psycopg2 import pool
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
import os

# Pool de conexões para melhor desempenho
_connection_pool = None

def criar_pool():
    """Cria um pool de conexões com o PostgreSQL"""
    global _connection_pool
    if _connection_pool is None:
        try:
            _connection_pool = psycopg2.pool.SimpleConnectionPool(
                1,  # Mínimo de conexões
                10, # Máximo de conexões
                host=DB_HOST,
                port=int(DB_PORT),
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD
            )
            print("[OK] Pool de conexões PostgreSQL criado com sucesso!")
        except Exception as e:
            print(f"[ERRO] Erro ao criar pool de conexões: {e}")
            raise
    return _connection_pool

def conectar():
    """Retorna uma conexão do pool"""
    try:
        pool = criar_pool()
        conn = pool.getconn()
        return conn
    except Exception as e:
        print(f"[ERRO] Erro ao obter conexão: {e}")
        raise

def fechar_conexao(conn):
    """Retorna a conexão ao pool"""
    try:
        pool = criar_pool()
        pool.putconn(conn)
    except Exception as e:
        print(f"[ERRO] Erro ao retornar conexão ao pool: {e}")

def inicializar_banco():
    """
    Inicializa a conexão com o PostgreSQL local.
    As tabelas devem ser criadas usando o arquivo criar_tabelas.sql
    """
    try:
        conn = conectar()
        cursor = conn.cursor()
        
        # Testa a conexão fazendo uma query simples
        cursor.execute("SELECT 1")
        cursor.close()
        fechar_conexao(conn)
        
        print("[OK] Conexão com PostgreSQL estabelecida com sucesso!")
        return True
    except Exception as e:
        print(f"[ERRO] Erro ao conectar com PostgreSQL: {e}")
        print("\n[IMPORTANTE] Verifique se:")
        print("1. O PostgreSQL está instalado e rodando")
        print("2. O banco de dados 'financas_em_dia' foi criado")
        print("3. As credenciais no arquivo .env estão corretas")
        print("4. Execute o SQL em 'criar_tabelas.sql' no PostgreSQL\n")
        return False

def executar_query(query, params=(), commit=False, fetch=True):
    """
    Executa uma query SQL e retorna os resultados
    
    Args:
        query: String SQL a ser executada
        params: Tupla de parâmetros para a query
        commit: Se True, faz commit da transação
        fetch: Se True, retorna os resultados (para SELECT)
    
    Returns:
        Lista de dicionários com os resultados (se fetch=True)
        ou None (se fetch=False)
    """
    conn = None
    cursor = None
    try:
        conn = conectar()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(query, params)
        
        if commit:
            conn.commit()
        
        if fetch:
            resultado = cursor.fetchall()
            return [dict(row) for row in resultado]
        
        return None
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"[ERRO] Erro ao executar query: {e}")
        print(f"Query: {query}")
        print(f"Params: {params}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            fechar_conexao(conn)

def executar_many(query, params_list):
    """
    Executa múltiplas queries com diferentes parâmetros (inserção em lote)
    
    Args:
        query: String SQL a ser executada
        params_list: Lista de tuplas de parâmetros
    """
    conn = None
    cursor = None
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.executemany(query, params_list)
        conn.commit()
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"[ERRO] Erro ao executar queries em lote: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if conn:
            fechar_conexao(conn)

