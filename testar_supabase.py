"""
Script de teste para verificar conexão e dados no Supabase
"""

import database
import models

print("=" * 60)
print("TESTE DE CONEXÃO E DADOS - SUPABASE")
print("=" * 60)

# Testar conexão
print("\n1. Testando conexão...")
try:
    supabase = database.conectar()
    print("✓ Conexão estabelecida com sucesso!")
except Exception as e:
    print(f"✗ Erro ao conectar: {e}")
    exit(1)

# Listar usuários
print("\n2. Listando usuários...")
try:
    response = supabase.table('usuarios').select('id, nome, email').execute()
    if response.data:
        print(f"✓ {len(response.data)} usuário(s) encontrado(s):")
        for user in response.data:
            print(f"  - ID: {user['id']}, Nome: {user['nome']}, Email: {user['email']}")
    else:
        print("⚠ Nenhum usuário cadastrado ainda")
except Exception as e:
    print(f"✗ Erro ao listar usuários: {e}")

# Listar categorias
print("\n3. Listando categorias...")
try:
    response = supabase.table('categorias').select('*').execute()
    if response.data:
        print(f"✓ {len(response.data)} categoria(s) encontrada(s):")
        for cat in response.data:
            print(f"  - ID: {cat['id']}, Nome: {cat['nome']}, Tipo: {cat['tipo']}, User ID: {cat['usuario_id']}")
    else:
        print("⚠ Nenhuma categoria cadastrada ainda")
except Exception as e:
    print(f"✗ Erro ao listar categorias: {e}")

# Listar lançamentos
print("\n4. Listando lançamentos...")
try:
    response = supabase.table('lancamentos').select('id, descricao, valor, tipo, status').limit(5).execute()
    if response.data:
        print(f"✓ {len(response.data)} lançamento(s) encontrado(s):")
        for lanc in response.data:
            print(f"  - ID: {lanc['id']}, {lanc['descricao']}: R$ {lanc['valor']} ({lanc['tipo']}/{lanc['status']})")
    else:
        print("⚠ Nenhum lançamento cadastrado ainda")
except Exception as e:
    print(f"✗ Erro ao listar lançamentos: {e}")

# Listar contas fixas
print("\n5. Listando contas fixas...")
try:
    response = supabase.table('contas_fixas').select('id, descricao, valor, tipo').execute()
    if response.data:
        print(f"✓ {len(response.data)} conta(s) fixa(s) encontrada(s):")
        for conta in response.data:
            print(f"  - ID: {conta['id']}, {conta['descricao']}: R$ {conta['valor']} ({conta['tipo']})")
    else:
        print("⚠ Nenhuma conta fixa cadastrada ainda")
except Exception as e:
    print(f"✗ Erro ao listar contas fixas: {e}")

# Verificar estrutura das tabelas
print("\n6. Verificando estrutura das tabelas...")
tabelas = ['usuarios', 'categorias', 'lancamentos', 'contas_fixas', 'app_config']
for tabela in tabelas:
    try:
        response = supabase.table(tabela).select('*').limit(1).execute()
        print(f"✓ Tabela '{tabela}' existe e é acessível")
    except Exception as e:
        print(f"✗ Erro na tabela '{tabela}': {e}")

print("\n" + "=" * 60)
print("TESTE CONCLUÍDO")
print("=" * 60)
