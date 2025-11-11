#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para testar a busca de lançamentos por período
"""
import models
import database

print("=" * 60)
print("TESTE DE BUSCA POR PERÍODO")
print("=" * 60)

user_id = 1

# 1. Listar TODOS os lançamentos do usuário
print("\n1. Listando TODOS os lançamentos do usuário 1:")
supabase = database.conectar()
response = supabase.table('lancamentos').select('*').eq('usuario_id', user_id).order('data').execute()

print(f"\n   Total de lançamentos: {len(response.data)}")

if response.data:
    print("\n   Lançamentos encontrados:")
    for lanc in response.data:
        print(f"   - ID: {lanc['id']} | Data: {lanc['data']} | Descrição: {lanc['descricao']} | Valor: R$ {lanc['valor']:.2f}")
    
    # Pegar primeira e última data
    datas = [l['data'] for l in response.data]
    data_min = min(datas)
    data_max = max(datas)
    
    print(f"\n   Data mais antiga: {data_min}")
    print(f"   Data mais recente: {data_max}")
    
    # 2. Testar função listar_lancamentos_periodo
    print(f"\n2. Testando listar_lancamentos_periodo({data_min}, {data_max}):")
    lancamentos = models.listar_lancamentos_periodo(user_id, data_min, data_max)
    
    print(f"\n   Resultado da função: {len(lancamentos)} lançamento(s)")
    
    if lancamentos:
        print("\n   Lançamentos retornados:")
        for lanc in lancamentos:
            categoria = lanc.get('categorias', {})
            cat_nome = categoria.get('nome', '-') if categoria else '-'
            print(f"   - {lanc['data']} | {lanc['descricao']} | {cat_nome} | R$ {lanc['valor']:.2f}")
    else:
        print("\n   ⚠ NENHUM lançamento retornado pela função!")
    
    # 3. Testar com período específico (novembro/2025)
    print("\n3. Testando com período específico (01/11/2025 a 30/11/2025):")
    lancamentos_nov = models.listar_lancamentos_periodo(user_id, '2025-11-01', '2025-11-30')
    
    print(f"\n   Resultado: {len(lancamentos_nov)} lançamento(s) em novembro/2025")
    
    if lancamentos_nov:
        for lanc in lancamentos_nov:
            print(f"   - {lanc['data']} | {lanc['descricao']} | R$ {lanc['valor']:.2f}")
    
    # 4. Testar query direta com filtros
    print("\n4. Testando query SQL direta:")
    response_direto = supabase.table('lancamentos')\
        .select('*, categorias(nome)')\
        .eq('usuario_id', user_id)\
        .gte('data', '2025-11-01')\
        .lte('data', '2025-11-30')\
        .order('data')\
        .execute()
    
    print(f"\n   Query direta retornou: {len(response_direto.data)} lançamento(s)")
    
    if response_direto.data:
        for lanc in response_direto.data:
            print(f"   - {lanc['data']} | {lanc['descricao']}")
else:
    print("\n   ⚠ Nenhum lançamento encontrado para este usuário!")
    print("\n   Possíveis causas:")
    print("   - Usuário sem lançamentos no banco")
    print("   - user_id incorreto")
    print("   - Problema de conexão com Supabase")

print("\n" + "=" * 60)
print("TESTE CONCLUÍDO")
print("=" * 60)
