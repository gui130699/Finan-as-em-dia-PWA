#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para testar a função listar_categorias
"""
import models

print("=" * 60)
print("TESTE DA FUNÇÃO listar_categorias()")
print("=" * 60)

# Testar com user_id = 1
user_id = 1

print(f"\nTestando listar_categorias(user_id={user_id})...")

try:
    categorias = models.listar_categorias(user_id)
    
    print(f"\n✓ Função executada com sucesso!")
    print(f"Total de categorias retornadas: {len(categorias)}")
    
    if categorias:
        print("\nCategorias encontradas:")
        for cat in categorias:
            print(f"  - ID: {cat['id']} | Nome: {cat['nome']} | Tipo: {cat['tipo']}")
    else:
        print("\n⚠ LISTA VAZIA - Nenhuma categoria foi retornada!")
        
        # Vamos verificar direto no Supabase
        print("\nVerificando diretamente no Supabase...")
        import database
        supabase = database.conectar()
        
        # Buscar todas as categorias (sem filtro de usuário)
        print("\n1. Buscando TODAS as categorias (sem filtro):")
        response = supabase.table('categorias').select('*').execute()
        print(f"   Total: {len(response.data)}")
        if response.data:
            for cat in response.data:
                print(f"   - ID: {cat['id']} | Nome: {cat['nome']} | Usuario: {cat['usuario_id']}")
        
        # Buscar categorias do usuário 1
        print(f"\n2. Buscando categorias do usuario_id = {user_id}:")
        response = supabase.table('categorias').select('*').eq('usuario_id', user_id).execute()
        print(f"   Total: {len(response.data)}")
        if response.data:
            for cat in response.data:
                print(f"   - ID: {cat['id']} | Nome: {cat['nome']}")
        else:
            print("   ⚠ Nenhuma categoria encontrada para este usuário!")
        
except Exception as e:
    print(f"\n✗ ERRO: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TESTE CONCLUÍDO")
print("=" * 60)
