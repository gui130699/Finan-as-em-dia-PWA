#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script para testar quitação integral
"""
import models
import database

print("=" * 60)
print("TESTE DE QUITAÇÃO INTEGRAL")
print("=" * 60)

supabase = database.conectar()

# 1. Listar contratos parcelados
print("\n1. Contratos parcelados disponíveis:")
user_id = 1
contratos = models.listar_parcelados_pendentes(user_id)

if not contratos:
    print("   Nenhum contrato parcelado encontrado!")
    exit()

for i, c in enumerate(contratos, 1):
    print(f"\n   [{i}] Contrato: {c['numero_contrato'][:8]}...")
    print(f"       Descrição: {c['descricao']}")
    print(f"       Parcelas: {c['parcelas_pagas']}/{c['total_parcelas']} pagas")
    print(f"       Pendente: R$ {c['valor_parcela'] * c['parcelas_pendentes']:.2f}")

# 2. Escolher contrato
print("\n2. Escolha um contrato para quitar (digite o número):")
escolha = int(input("   > "))

if escolha < 1 or escolha > len(contratos):
    print("   Escolha inválida!")
    exit()

contrato_escolhido = contratos[escolha - 1]
numero_contrato = contrato_escolhido['numero_contrato']

# 3. Mostrar parcelas
print(f"\n3. Parcelas do contrato {numero_contrato[:8]}:")
parcelas = models.listar_parcelas_contrato(numero_contrato)

total_pendente = 0
for p in parcelas:
    status_emoji = "✓" if p['status'] == 'pago' else "○"
    print(f"   {status_emoji} Parcela {p['parcela_atual']}/{p['total_parcelas']} - {p['data_formatada']} - {p['valor_formatado']} ({p['status']})")
    if p['status'] == 'pendente':
        total_pendente += p['valor']

print(f"\n   TOTAL PENDENTE: R$ {total_pendente:.2f}")

# 4. Perguntar desconto
print("\n4. Deseja aplicar desconto? Digite o valor (0 para sem desconto):")
desconto = float(input("   R$ "))

if desconto > total_pendente:
    print("   Desconto não pode ser maior que o total!")
    exit()

valor_final = total_pendente - desconto

print(f"\n   Valor original: R$ {total_pendente:.2f}")
if desconto > 0:
    print(f"   Desconto: R$ {desconto:.2f}")
print(f"   Valor final: R$ {valor_final:.2f}")

# 5. Confirmar
print("\n5. Confirma quitação integral? (s/n)")
confirma = input("   > ").strip().lower()

if confirma != 's':
    print("   Operação cancelada.")
    exit()

# 6. Executar quitação
print("\n6. Executando quitação integral...")
if models.quitar_parcelado_integral(user_id, numero_contrato, desconto):
    print("   ✓ Quitação realizada com sucesso!")
    
    # 7. Verificar resultado
    print("\n7. Verificando resultado...")
    
    # Buscar o lançamento de quitação criado
    response = supabase.table('lancamentos')\
        .select('*')\
        .eq('usuario_id', user_id)\
        .eq('status', 'pago')\
        .is_('numero_contrato', 'null')\
        .order('data_criacao', desc=True)\
        .limit(1)\
        .execute()
    
    if response.data:
        quitacao = response.data[0]
        print(f"\n   Lançamento de quitação criado:")
        print(f"   - ID: {quitacao['id']}")
        print(f"   - Descrição: {quitacao['descricao']}")
        print(f"   - Valor: R$ {quitacao['valor']:.2f}")
        print(f"   - Data: {quitacao['data']}")
        print(f"   - Status: {quitacao['status']}")
        print(f"   - Observações: {quitacao['observacoes']}")
    
    # Verificar se as parcelas foram excluídas
    response_parcelas = supabase.table('lancamentos')\
        .select('*')\
        .eq('numero_contrato', numero_contrato)\
        .execute()
    
    print(f"\n   Parcelas restantes do contrato: {len(response_parcelas.data)}")
    if response_parcelas.data:
        for p in response_parcelas.data:
            print(f"   - Parcela {p['parcela_atual']}/{p['total_parcelas']} - Status: {p['status']}")
else:
    print("   ✗ Erro ao quitar contrato!")

print("\n" + "=" * 60)
print("TESTE CONCLUÍDO")
print("=" * 60)
