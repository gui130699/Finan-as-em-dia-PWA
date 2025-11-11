#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para testar e corrigir lançamentos parcelados
"""
import models
import database
import uuid

print("=" * 60)
print("CORREÇÃO DE LANÇAMENTOS PARCELADOS")
print("=" * 60)

supabase = database.conectar()

# 1. Listar lançamentos parcelados existentes
print("\n1. Lançamentos parcelados existentes:")
response = supabase.table('lancamentos').select('*').eq('eh_parcelado', True).execute()

if response.data:
    print(f"   Encontrados {len(response.data)} lançamento(s) parcelado(s)")
    for lanc in response.data:
        print(f"   - ID: {lanc['id']} | {lanc['descricao']} | Parcela {lanc['parcela_atual']}/{lanc['total_parcelas']} | Contrato: {lanc['numero_contrato'][:8]}")
else:
    print("   Nenhum lançamento parcelado encontrado")

# 2. Contar quantas parcelas existem por contrato
print("\n2. Análise de contratos:")
contratos = {}
for lanc in response.data:
    contrato = lanc['numero_contrato']
    if contrato not in contratos:
        contratos[contrato] = {
            'descricao': lanc['descricao'],
            'total_esperado': lanc['total_parcelas'],
            'parcelas_criadas': 0,
            'ids': []
        }
    contratos[contrato]['parcelas_criadas'] += 1
    contratos[contrato]['ids'].append(lanc['id'])

for contrato, info in contratos.items():
    print(f"\n   Contrato: {contrato[:8]}...")
    print(f"   - Descrição: {info['descricao']}")
    print(f"   - Esperado: {info['total_esperado']} parcelas")
    print(f"   - Criadas: {info['parcelas_criadas']} parcelas")
    if info['parcelas_criadas'] < info['total_esperado']:
        print(f"   ⚠ INCOMPLETO! Faltam {info['total_esperado'] - info['parcelas_criadas']} parcelas")

# 3. Perguntar se deseja excluir e recriar
print("\n3. Deseja excluir os lançamentos parcelados existentes e recriá-los corretamente?")
print("   Digite 's' para SIM ou 'n' para NÃO:")
resposta = input("   > ").strip().lower()

if resposta == 's':
    print("\n4. Excluindo lançamentos antigos...")
    for lanc in response.data:
        supabase.table('lancamentos').delete().eq('id', lanc['id']).execute()
        print(f"   ✓ Excluído: ID {lanc['id']}")
    
    print("\n5. Criando novos lançamentos parcelados corrigidos...")
    
    # Exemplos para testar
    user_id = 1
    
    # Exemplo 1: Bicicleta - 4 parcelas de R$ 400
    print("\n   Criando: Bicicleta - 4x R$ 400,00")
    models.inserir_lancamento(
        user_id=user_id,
        tipo='despesa',
        categoria_id=10,  # Transporte
        descricao='Bicicleta',
        valor=400.00,
        data='2025-11-11',
        status='pendente',
        observacoes='Compra parcelada',
        eh_parcelado=True,
        parcela_atual=1,
        total_parcelas=4,
        numero_contrato=str(uuid.uuid4())
    )
    print("   ✓ Criado com sucesso!")
    
    # Exemplo 2: Test1 - 3 parcelas de R$ 480
    print("\n   Criando: Test1 - 3x R$ 480,00")
    models.inserir_lancamento(
        user_id=user_id,
        tipo='despesa',
        categoria_id=10,  # Transporte
        descricao='Test1',
        valor=480.00,
        data='2025-11-11',
        status='pendente',
        observacoes='Teste parcelado',
        eh_parcelado=True,
        parcela_atual=1,
        total_parcelas=3,
        numero_contrato=str(uuid.uuid4())
    )
    print("   ✓ Criado com sucesso!")
    
    # 6. Verificar resultado
    print("\n6. Verificando lançamentos criados:")
    response_novo = supabase.table('lancamentos').select('*').eq('eh_parcelado', True).order('data, parcela_atual').execute()
    
    print(f"\n   Total de parcelas criadas: {len(response_novo.data)}")
    
    contratos_novos = {}
    for lanc in response_novo.data:
        contrato = lanc['numero_contrato']
        if contrato not in contratos_novos:
            contratos_novos[contrato] = []
        contratos_novos[contrato].append(lanc)
    
    for contrato, parcelas in contratos_novos.items():
        print(f"\n   Contrato: {contrato[:8]}...")
        print(f"   Descrição: {parcelas[0]['descricao']}")
        print(f"   Total: {len(parcelas)} parcelas")
        for p in parcelas:
            print(f"      - Parcela {p['parcela_atual']}/{p['total_parcelas']} | R$ {p['valor']:.2f} | Data: {p['data']}")
    
    print("\n✓ CORREÇÃO CONCLUÍDA COM SUCESSO!")
else:
    print("\n   Operação cancelada.")

print("\n" + "=" * 60)
print("SCRIPT FINALIZADO")
print("=" * 60)
