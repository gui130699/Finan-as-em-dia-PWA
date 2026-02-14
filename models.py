# models.py - Funções de acesso e manipulação de dados (PostgreSQL puro)

import database
import bcrypt
from datetime import datetime, timedelta
from calendar import monthrange
from dateutil.relativedelta import relativedelta
import uuid
import traceback
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm

# ==================== USUÁRIOS ====================

def criar_usuario(nome, email, senha):
    """Cria um novo usuário com senha criptografada"""
    try:
        # Verificar se o email já existe
        query = "SELECT id FROM usuarios WHERE email = %s"
        check = database.executar_query(query, (email,), fetch=True)
        if check:
            print(f"❌ Email '{email}' já está cadastrado!")
            return False
        
        # Criptografar senha
        senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Inserir usuário
        query = "INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s) RETURNING id"
        resultado = database.executar_query(query, (nome, email, senha_hash), commit=True, fetch=True)
        
        if resultado:
            user_id = resultado[0]['id']
            print(f"✓ Usuário '{nome}' criado com ID: {user_id}")
            # Criar categorias padrão
            criar_categorias_padrao(user_id)
            return True
        return False
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        traceback.print_exc()
        return False

def autenticar(email, senha):
    """Autentica um usuário e retorna seus dados"""
    try:
        query = "SELECT * FROM usuarios WHERE email = %s"
        resultado = database.executar_query(query, (email,), fetch=True)
        
        if resultado:
            user = resultado[0]
            # Verificar senha
            if bcrypt.checkpw(senha.encode('utf-8'), user['senha'].encode('utf-8').rstrip()):
                return user
        
        return None
    except Exception as e:
        print(f"Erro ao autenticar: {e}")
        return None

def listar_usuarios():
    """Lista todos os usuários"""
    try:
        query = "SELECT id, nome, email, data_criacao FROM usuarios"
        resultado = database.executar_query(query, (), fetch=True)
        return resultado if resultado else []
    except Exception as e:
        print(f"Erro ao listar usuários: {e}")
        return []

def redefinir_senha(user_id, nova_senha):
    """Redefine a senha de um usuário"""
    try:
        senha_hash = bcrypt.hashpw(nova_senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        query = "UPDATE usuarios SET senha = %s WHERE id = %s"
        database.executar_query(query, (senha_hash, user_id), commit=True, fetch=False)
        return True
    except Exception as e:
        print(f"Erro ao redefinir senha: {e}")
        return False

# ==================== CONFIGURAÇÕES ====================

def get_config(user_id, chave):
    """Obtém um valor de configuração"""
    try:
        query = "SELECT valor FROM app_config WHERE usuario_id = %s AND chave = %s"
        resultado = database.executar_query(query, (user_id, chave), fetch=True)
        return resultado[0]['valor'] if resultado else None
    except:
        return None

def set_config(user_id, chave, valor):
    """Define um valor de configuração"""
    try:
        query = """
            INSERT INTO app_config (usuario_id, chave, valor) 
            VALUES (%s, %s, %s)
            ON CONFLICT (usuario_id, chave) 
            DO UPDATE SET valor = EXCLUDED.valor
        """
        database.executar_query(query, (user_id, chave, valor), commit=True, fetch=False)
        return True
    except Exception as e:
        print(f"Erro ao salvar config: {e}")
        return False

# ==================== CATEGORIAS ====================

def criar_categorias_padrao(user_id):
    """Cria categorias padrão para um novo usuário"""
    categorias_padrao = [
        {'nome': 'Salário', 'tipo': 'receita'},
        {'nome': 'Freelance', 'tipo': 'receita'},
        {'nome': 'Investimentos', 'tipo': 'receita'},
        {'nome': 'Outros', 'tipo': 'receita'},
        {'nome': 'Alimentação', 'tipo': 'despesa'},
        {'nome': 'Transporte', 'tipo': 'despesa'},
        {'nome': 'Moradia', 'tipo': 'despesa'},
        {'nome': 'Saúde', 'tipo': 'despesa'},
        {'nome': 'Educação', 'tipo': 'despesa'},
        {'nome': 'Lazer', 'tipo': 'despesa'},
        {'nome': 'Vestuário', 'tipo': 'despesa'},
        {'nome': 'Outros', 'tipo': 'despesa'}
    ]
    
    try:
        query = "INSERT INTO categorias (usuario_id, nome, tipo) VALUES (%s, %s, %s)"
        params_list = [(user_id, cat['nome'], cat['tipo']) for cat in categorias_padrao]
        database.executar_many(query, params_list)
        print(f"✓ {len(categorias_padrao)} categorias padrão criadas para usuário {user_id}")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar categorias padrão: {e}")
        traceback.print_exc()
        return False

def criar_categoria(user_id, nome, tipo):
    """Cria uma nova categoria"""
    try:
        query = "INSERT INTO categorias (usuario_id, nome, tipo) VALUES (%s, %s, %s) RETURNING id"
        resultado = database.executar_query(query, (user_id, nome, tipo), commit=True, fetch=True)
        return resultado[0]['id'] if resultado else None
    except Exception as e:
        print(f"Erro ao criar categoria: {e}")
        return None

def listar_categorias(user_id, tipo=None):
    """Lista categorias de um usuário"""
    try:
        if tipo:
            query = "SELECT * FROM categorias WHERE usuario_id = %s AND tipo = %s ORDER BY nome"
            resultado = database.executar_query(query, (user_id, tipo), fetch=True)
        else:
            query = "SELECT * FROM categorias WHERE usuario_id = %s ORDER BY nome"
            resultado = database.executar_query(query, (user_id,), fetch=True)
        
        return resultado if resultado else []
    except Exception as e:
        print(f"Erro ao listar categorias: {e}")
        return []

def obter_categoria(categoria_id):
    """Obtém uma categoria pelo ID"""
    try:
        query = "SELECT * FROM categorias WHERE id = %s"
        resultado = database.executar_query(query, (categoria_id,), fetch=True)
        return resultado[0] if resultado else None
    except:
        return None

def atualizar_categoria(categoria_id, nome, tipo):
    """Atualiza uma categoria"""
    try:
        query = "UPDATE categorias SET nome = %s, tipo = %s WHERE id = %s"
        database.executar_query(query, (nome, tipo, categoria_id), commit=True, fetch=False)
        return True
    except Exception as e:
        print(f"Erro ao atualizar categoria: {e}")
        return False

def excluir_categoria(categoria_id):
    """Exclui uma categoria (apenas se não houver lançamentos)"""
    try:
        query = "DELETE FROM categorias WHERE id = %s"
        database.executar_query(query, (categoria_id,), commit=True, fetch=False)
        return True
    except Exception as e:
        print(f"Erro ao excluir categoria: {e}")
        return False

# ==================== LANÇAMENTOS ====================

def inserir_lancamento(user_id, tipo, categoria_id, descricao, valor, data, status='pendente', 
                      observacoes='', eh_parcelado=False, parcela_atual=None, total_parcelas=None, 
                      numero_contrato=None, conta_fixa_id=None):
    """Insere um novo lançamento (ou múltiplas parcelas se for parcelado)"""
    try:
        # Se for parcelado, criar todas as parcelas
        if eh_parcelado and total_parcelas and total_parcelas > 1:
            data_obj = datetime.strptime(data, '%Y-%m-%d')
            ids_criados = []
            
            query = """
                INSERT INTO lancamentos 
                (usuario_id, tipo, categoria_id, descricao, valor, data, status, observacoes, 
                 eh_parcelado, parcela_atual, total_parcelas, numero_contrato, conta_fixa_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            
            for i in range(1, total_parcelas + 1):
                # Calcular data da parcela (adicionar meses)
                data_parcela = data_obj + relativedelta(months=i-1)
                
                params = (
                    user_id, tipo, categoria_id, 
                    f"{descricao} ({i}/{total_parcelas})",
                    float(valor), data_parcela.strftime('%Y-%m-%d'),
                    status, observacoes or None,
                    True, i, total_parcelas, numero_contrato, conta_fixa_id
                )
                
                resultado = database.executar_query(query, params, commit=True, fetch=True)
                if resultado:
                    ids_criados.append(resultado[0]['id'])
            
            return ids_criados[0] if ids_criados else None
        else:
            # Lançamento único
            query = """
                INSERT INTO lancamentos 
                (usuario_id, tipo, categoria_id, descricao, valor, data, status, observacoes, 
                 eh_parcelado, parcela_atual, total_parcelas, numero_contrato, conta_fixa_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """
            params = (
                user_id, tipo, categoria_id, descricao, float(valor), data,
                status, observacoes or None, eh_parcelado, parcela_atual,
                total_parcelas, numero_contrato, conta_fixa_id
            )
            
            resultado = database.executar_query(query, params, commit=True, fetch=True)
            return resultado[0]['id'] if resultado else None
        
    except Exception as e:
        print(f"Erro ao inserir lançamento: {e}")
        traceback.print_exc()
        return None

def listar_lancamentos_mes(user_id, ano, mes):
    """Lista lançamentos de um usuário em um mês específico"""
    try:
        data_inicio = f"{ano}-{mes:02d}-01"
        ultimo_dia = monthrange(ano, mes)[1]
        data_fim = f"{ano}-{mes:02d}-{ultimo_dia}"
        
        query = """
            SELECT l.*, c.nome as categoria_nome
            FROM lancamentos l
            LEFT JOIN categorias c ON l.categoria_id = c.id
            WHERE l.usuario_id = %s AND l.data >= %s AND l.data <= %s
            ORDER BY l.data
        """
        resultado = database.executar_query(query, (user_id, data_inicio, data_fim), fetch=True)
        
        # Ajustar estrutura para manter compatibilidade com o formato de dados esperado
        if resultado:
            for r in resultado:
                categoria_nome = r.pop('categoria_nome', None)
                r['categorias'] = {'nome': categoria_nome} if categoria_nome else None
        
        return resultado if resultado else []
        
    except Exception as e:
        print(f"Erro ao listar lançamentos: {e}")
        return []

def obter_lancamento(lancamento_id):
    """Obtém um lançamento pelo ID"""
    try:
        query = "SELECT * FROM lancamentos WHERE id = %s"
        resultado = database.executar_query(query, (lancamento_id,), fetch=True)
        return resultado[0] if resultado else None
    except:
        return None

def atualizar_lancamento(lancamento_id, tipo, categoria_id, descricao, valor, data, status, observacoes=''):
    """Atualiza um lançamento"""
    try:
        query = """
            UPDATE lancamentos 
            SET tipo = %s, categoria_id = %s, descricao = %s, valor = %s, 
                data = %s, status = %s, observacoes = %s
            WHERE id = %s
        """
        database.executar_query(query, (tipo, categoria_id, descricao, float(valor), 
                                       data, status, observacoes or None, lancamento_id), 
                               commit=True, fetch=False)
        return True
    except Exception as e:
        print(f"Erro ao atualizar lançamento: {e}")
        return False

def excluir_lancamentos(lancamento_id=None, numero_contrato=None):
    """Exclui lançamento(s)"""
    try:
        if lancamento_id:
            query = "DELETE FROM lancamentos WHERE id = %s"
            database.executar_query(query, (lancamento_id,), commit=True, fetch=False)
        elif numero_contrato:
            query = "DELETE FROM lancamentos WHERE numero_contrato = %s"
            database.executar_query(query, (numero_contrato,), commit=True, fetch=False)
        
        return True
    except Exception as e:
        print(f"Erro ao excluir lançamentos: {e}")
        return False

def alternar_status(lancamento_id):
    """Alterna o status de um lançamento entre pendente e pago"""
    try:
        lancamento = obter_lancamento(lancamento_id)
        if not lancamento:
            return False
        
        novo_status = 'pago' if lancamento['status'] == 'pendente' else 'pendente'
        query = "UPDATE lancamentos SET status = %s WHERE id = %s"
        database.executar_query(query, (novo_status, lancamento_id), commit=True, fetch=False)
        
        return True
    except Exception as e:
        print(f"Erro ao alternar status: {e}")
        return False

def calcular_resumo_mes(user_id, ano, mes):
    """Calcula resumo financeiro do mês"""
    lancamentos = listar_lancamentos_mes(user_id, ano, mes)
    
    # Calcular valores pagos/recebidos
    receitas_pagas = sum(l['valor'] for l in lancamentos if l['tipo'] == 'receita' and l['status'] == 'pago')
    despesas_pagas = sum(l['valor'] for l in lancamentos if l['tipo'] == 'despesa' and l['status'] == 'pago')
    
    # Calcular valores pendentes/a receber
    receitas_pendentes_valor = sum(l['valor'] for l in lancamentos if l['tipo'] == 'receita' and l['status'] == 'pendente')
    despesas_pendentes_valor = sum(l['valor'] for l in lancamentos if l['tipo'] == 'despesa' and l['status'] == 'pendente')
    
    # Contar quantidade de lançamentos pendentes
    receitas_pendentes_qtd = len([l for l in lancamentos if l['tipo'] == 'receita' and l['status'] == 'pendente'])
    despesas_pendentes_qtd = len([l for l in lancamentos if l['tipo'] == 'despesa' and l['status'] == 'pendente'])
    
    # Totais (pagas + pendentes)
    receitas_total = receitas_pagas + receitas_pendentes_valor
    despesas_total = despesas_pagas + despesas_pendentes_valor
    
    # Saldo realizado (apenas pagos) e previsto (incluindo pendentes)
    saldo_realizado = receitas_pagas - despesas_pagas
    saldo_previsto = receitas_total - despesas_total
    
    return {
        # Estrutura aninhada para dashboard
        'receitas': {
            'total': receitas_total,
            'pagas': len([l for l in lancamentos if l['tipo'] == 'receita' and l['status'] == 'pago']),
            'pendentes': receitas_pendentes_qtd
        },
        'despesas': {
            'total': despesas_total,
            'pagas': len([l for l in lancamentos if l['tipo'] == 'despesa' and l['status'] == 'pago']),
            'pendentes': despesas_pendentes_qtd
        },
        'saldo': saldo_previsto,
        # Valores para home (apenas pagos)
        'receitas_pagas': receitas_pagas,
        'despesas_pagas': despesas_pagas,
        'receitas_pendentes_valor': receitas_pendentes_valor,
        'despesas_pendentes_valor': despesas_pendentes_valor,
        'receitas_pendentes_qtd': receitas_pendentes_qtd,
        'despesas_pendentes_qtd': despesas_pendentes_qtd,
        # Aliases para compatibilidade com templates antigos
        'receitas_total': receitas_total,
        'total_receitas': receitas_pagas,  # Mudado para mostrar apenas pagas
        'despesas_total': despesas_total,
        'total_despesas': despesas_pagas,  # Mudado para mostrar apenas pagas
        'saldo_previsto': saldo_previsto,
        'saldo_realizado': saldo_realizado
    }

# Alias para compatibilidade com app.py
obter_totais_mes = calcular_resumo_mes

# ==================== CONTAS FIXAS ====================

def criar_conta_fixa(user_id, tipo, categoria_id, descricao, valor, dia_vencimento, observacoes=''):
    """Cria uma conta fixa recorrente"""
    try:
        query = """
            INSERT INTO contas_fixas 
            (usuario_id, tipo, categoria_id, descricao, valor, dia_vencimento, ativa, observacoes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        resultado = database.executar_query(
            query, 
            (user_id, tipo, categoria_id, descricao, float(valor), dia_vencimento, True, observacoes or None),
            commit=True, 
            fetch=True
        )
        return resultado[0]['id'] if resultado else None
        
    except Exception as e:
        print(f"Erro ao criar conta fixa: {e}")
        return None

def listar_contas_fixas(user_id, apenas_ativas=True):
    """Lista contas fixas de um usuário"""
    try:
        if apenas_ativas:
            query = """
                SELECT cf.*, c.nome as categoria_nome
                FROM contas_fixas cf
                LEFT JOIN categorias c ON cf.categoria_id = c.id
                WHERE cf.usuario_id = %s AND cf.ativa = TRUE
                ORDER BY cf.dia_vencimento
            """
            resultado = database.executar_query(query, (user_id,), fetch=True)
        else:
            query = """
                SELECT cf.*, c.nome as categoria_nome
                FROM contas_fixas cf
                LEFT JOIN categorias c ON cf.categoria_id = c.id
                WHERE cf.usuario_id = %s
                ORDER BY cf.dia_vencimento
            """
            resultado = database.executar_query(query, (user_id,), fetch=True)
        
        # Ajustar estrutura para manter compatibilidade com o formato de dados esperado
        if resultado:
            for r in resultado:
                categoria_nome = r.pop('categoria_nome', None)
                r['categorias'] = {'nome': categoria_nome} if categoria_nome else None
        
        return resultado if resultado else []
        
    except Exception as e:
        print(f"Erro ao listar contas fixas: {e}")
        return []

def obter_conta_fixa(conta_id):
    """Obtém uma conta fixa pelo ID"""
    try:
        query = "SELECT * FROM contas_fixas WHERE id = %s"
        resultado = database.executar_query(query, (conta_id,), fetch=True)
        return resultado[0] if resultado else None
    except:
        return None

def atualizar_conta_fixa(conta_id, tipo, categoria_id, descricao, valor, dia_vencimento, ativa, observacoes=''):
    """Atualiza uma conta fixa"""
    try:
        query = """
            UPDATE contas_fixas 
            SET tipo = %s, categoria_id = %s, descricao = %s, valor = %s, 
                dia_vencimento = %s, ativa = %s, observacoes = %s
            WHERE id = %s
        """
        database.executar_query(
            query, 
            (tipo, categoria_id, descricao, float(valor), dia_vencimento, ativa, observacoes or None, conta_id),
            commit=True, 
            fetch=False
        )
        return True
    except Exception as e:
        print(f"Erro ao atualizar conta fixa: {e}")
        return False

def excluir_conta_fixa(conta_id):
    """Exclui uma conta fixa"""
    try:
        query = "DELETE FROM contas_fixas WHERE id = %s"
        database.executar_query(query, (conta_id,), commit=True, fetch=False)
        return True
    except Exception as e:
        print(f"Erro ao excluir conta fixa: {e}")
        return False

def gerar_lancamentos_contas_fixas_mes(user_id, ano, mes):
    """Gera lançamentos automáticos das contas fixas para um mês"""
    try:
        contas = listar_contas_fixas(user_id, apenas_ativas=True)
        lancamentos_criados = 0
        
        for conta in contas:
            # Verificar se já existe lançamento desta conta neste mês
            data_venc = f"{ano}-{mes:02d}-{conta['dia_vencimento']:02d}"
            
            query = """
                SELECT id FROM lancamentos 
                WHERE usuario_id = %s AND conta_fixa_id = %s AND data = %s
            """
            existe = database.executar_query(query, (user_id, conta['id'], data_venc), fetch=True)
            
            if not existe:
                # Criar lançamento
                inserir_lancamento(
                    user_id=user_id,
                    tipo=conta['tipo'],
                    categoria_id=conta['categoria_id'],
                    descricao=conta['descricao'],
                    valor=conta['valor'],
                    data=data_venc,
                    status='pendente',
                    observacoes=conta.get('observacoes', ''),
                    conta_fixa_id=conta['id']
                )
                lancamentos_criados += 1
        
        return lancamentos_criados
        
    except Exception as e:
        print(f"Erro ao gerar lançamentos de contas fixas: {e}")
        return 0

# ==================== PARCELADOS ====================

def listar_parcelados_pendentes(user_id):
    """Lista contratos parcelados com parcelas pendentes"""
    try:
        # Buscar lançamentos parcelados com join de categorias
        query = """
            SELECT l.numero_contrato, l.descricao, l.total_parcelas, l.valor, l.tipo, 
                   l.categoria_id, l.data, l.status, c.nome as categoria_nome
            FROM lancamentos l
            LEFT JOIN categorias c ON l.categoria_id = c.id
            WHERE l.usuario_id = %s AND l.eh_parcelado = TRUE AND l.numero_contrato IS NOT NULL
        """
        resultado = database.executar_query(query, (user_id,), fetch=True)
        
        if not resultado:
            return []
        
        # Agrupar por contrato
        contratos = {}
        for lanc in resultado:
            contrato = lanc['numero_contrato']
            if contrato not in contratos:
                contratos[contrato] = {
                    'numero_contrato': contrato,
                    'descricao': lanc['descricao'],
                    'tipo': lanc['tipo'],
                    'categoria_nome': lanc['categoria_nome'] or '-',
                    'total_parcelas': lanc['total_parcelas'],
                    'valor_parcela': lanc['valor'],
                    'parcelas_pagas': 0,
                    'parcelas_pendentes': 0,
                    'proxima_data': None
                }
            
            # Contar status e pegar próxima data
            if lanc['status'] == 'pago':
                contratos[contrato]['parcelas_pagas'] += 1
            else:
                contratos[contrato]['parcelas_pendentes'] += 1
                # Pegar a primeira data pendente (se ainda não tiver)
                if not contratos[contrato]['proxima_data']:
                    contratos[contrato]['proxima_data'] = lanc['data']
        
        # Filtrar apenas com pendentes
        resultado = [c for c in contratos.values() if c['parcelas_pendentes'] > 0]
        
        # Formatar datas
        for c in resultado:
            if c['proxima_data']:
                try:
                    if isinstance(c['proxima_data'], str):
                        data_obj = datetime.strptime(c['proxima_data'], '%Y-%m-%d')
                    else:
                        data_obj = c['proxima_data']
                    c['proxima_data_formatada'] = data_obj.strftime('%d/%m/%Y')
                except:
                    c['proxima_data_formatada'] = str(c['proxima_data'])
            else:
                c['proxima_data_formatada'] = '-'
        
        return resultado
        
    except Exception as e:
        print(f"Erro ao listar parcelados: {e}")
        traceback.print_exc()
        return []

def quitar_parcelado_integral(user_id, numero_contrato, desconto=0):
    """Quita todas as parcelas pendentes de um contrato, criando um único lançamento"""
    try:
        # Buscar todas as parcelas pendentes
        query = """
            SELECT * FROM lancamentos 
            WHERE numero_contrato = %s AND status = 'pendente'
            ORDER BY parcela_atual
        """
        parcelas = database.executar_query(query, (numero_contrato,), fetch=True)
        
        if not parcelas:
            return False
        
        # Calcular valor total
        valor_total = sum(p['valor'] for p in parcelas)
        valor_com_desconto = valor_total - desconto
        
        # Pegar dados da primeira parcela como referência
        primeira = parcelas[0]
        total_parcelas = len(parcelas)
        
        # Criar lançamento único de quitação
        data_hoje = datetime.now().strftime('%Y-%m-%d')
        
        descricao_base = primeira['descricao']
        # Remover o sufixo (X/Y) se existir
        if '(' in descricao_base and ')' in descricao_base:
            descricao_base = descricao_base[:descricao_base.rfind('(')].strip()
        
        query_insert = """
            INSERT INTO lancamentos 
            (usuario_id, tipo, categoria_id, descricao, valor, data, status, observacoes, 
             eh_parcelado, parcela_atual, total_parcelas, numero_contrato, conta_fixa_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        observacoes = (f"Quitação integral de {total_parcelas} parcelas. " +
                      (f"Desconto: R$ {desconto:.2f}. " if desconto > 0 else "") +
                      f"Valor original: R$ {valor_total:.2f}")
        
        params = (
            user_id, primeira['tipo'], primeira['categoria_id'],
            f"Quitação {descricao_base}", valor_com_desconto, data_hoje,
            'pago', observacoes, False, None, None, None, primeira.get('conta_fixa_id')
        )
        
        database.executar_query(query_insert, params, commit=True, fetch=False)
        
        # Excluir todas as parcelas pendentes
        ids_para_excluir = [p['id'] for p in parcelas]
        placeholders = ','.join(['%s'] * len(ids_para_excluir))
        query_delete = f"DELETE FROM lancamentos WHERE id IN ({placeholders})"
        database.executar_query(query_delete, tuple(ids_para_excluir), commit=True, fetch=False)
        
        return True
        
    except Exception as e:
        print(f"Erro ao quitar parcelado integral: {e}")
        traceback.print_exc()
        return False

def quitar_parcelado_parcial(numero_contrato, numero_parcelas):
    """Quita um número específico de parcelas pendentes"""
    try:
        # Buscar parcelas pendentes ordenadas
        query = """
            SELECT id FROM lancamentos 
            WHERE numero_contrato = %s AND status = 'pendente'
            ORDER BY parcela_atual
            LIMIT %s
        """
        resultado = database.executar_query(query, (numero_contrato, numero_parcelas), fetch=True)
        
        # Atualizar cada parcela
        for lanc in resultado:
            query_update = "UPDATE lancamentos SET status = 'pago' WHERE id = %s"
            database.executar_query(query_update, (lanc['id'],), commit=True, fetch=False)
        
        return True
    except Exception as e:
        print(f"Erro ao quitar parcelado parcial: {e}")
        return False

def quitar_parcelas_selecionadas(user_id, contrato_id, parcelas_ids, desconto=0):
    """Quita parcelas específicas selecionadas, opcionalmente com desconto"""
    try:
        if not parcelas_ids:
            return False
        
        # Se houver desconto, criar um lançamento único com o valor total - desconto
        if desconto > 0:
            # Buscar informações das parcelas selecionadas
            placeholders = ','.join(['%s'] * len(parcelas_ids))
            query = f"SELECT * FROM lancamentos WHERE id IN ({placeholders})"
            resultado = database.executar_query(query, tuple(parcelas_ids), fetch=True)
            
            if resultado:
                # Calcular valor total
                valor_total = sum(p['valor'] for p in resultado)
                valor_com_desconto = valor_total - desconto
                
                # Pegar dados da primeira parcela como referência
                primeira = resultado[0]
                
                # Criar lançamento de quitação
                data_hoje = datetime.now().strftime('%Y-%m-%d')
                
                query_insert = """
                    INSERT INTO lancamentos 
                    (usuario_id, tipo, categoria_id, descricao, valor, data, status, observacoes, 
                     eh_parcelado, parcela_atual, total_parcelas, numero_contrato, conta_fixa_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                
                observacoes = f"Quitação com desconto de R$ {desconto:.2f}. Valor original: R$ {valor_total:.2f}"
                params = (
                    user_id, primeira['tipo'], primeira['categoria_id'],
                    f"Quitação {primeira['descricao']} - {len(parcelas_ids)} parcelas",
                    valor_com_desconto, data_hoje, 'pago', observacoes,
                    False, None, None, None, None
                )
                
                database.executar_query(query_insert, params, commit=True, fetch=False)
                
                # Excluir as parcelas quitadas
                query_delete = f"DELETE FROM lancamentos WHERE id IN ({placeholders})"
                database.executar_query(query_delete, tuple(parcelas_ids), commit=True, fetch=False)
        else:
            # Sem desconto, apenas marcar como pago
            for parcela_id in parcelas_ids:
                query = "UPDATE lancamentos SET status = 'pago' WHERE id = %s"
                database.executar_query(query, (parcela_id,), commit=True, fetch=False)
        
        return True
        
    except Exception as e:
        print(f"Erro ao quitar parcelas selecionadas: {e}")
        traceback.print_exc()
        return False

# ==================== RELATÓRIOS ====================

def gerar_relatorio_pdf(user_id, data_inicio, data_fim, nome_arquivo):
    """Gera relatório em PDF"""
    try:
        # Buscar lançamentos do período
        query = """
            SELECT l.*, c.nome as categoria_nome
            FROM lancamentos l
            LEFT JOIN categorias c ON l.categoria_id = c.id
            WHERE l.usuario_id = %s AND l.data >= %s AND l.data <= %s
            ORDER BY l.data
        """
        resultado = database.executar_query(query, (user_id, data_inicio, data_fim), fetch=True)
        
        # Ajustar estrutura para compatibilidade
        lancamentos = []
        if resultado:
            for r in resultado:
                categoria_nome = r.pop('categoria_nome', None)
                r['categorias'] = {'nome': categoria_nome} if categoria_nome else {'nome': 'N/A'}
                lancamentos.append(r)
        
        # Criar PDF
        doc = SimpleDocTemplate(nome_arquivo, pagesize=A4)
        story = []
        styles = getSampleStyleSheet()
        
        # Título
        titulo = Paragraph(f"<b>Relatório Financeiro</b><br/>Período: {data_inicio} a {data_fim}", styles['Title'])
        story.append(titulo)
        story.append(Spacer(1, 0.5*cm))
        
        # Calcular totais
        receitas = sum(l['valor'] for l in lancamentos if l['tipo'] == 'receita')
        despesas = sum(l['valor'] for l in lancamentos if l['tipo'] == 'despesa')
        saldo = receitas - despesas
        
        # Resumo
        resumo_data = [
            ['Receitas', f'R$ {receitas:,.2f}'],
            ['Despesas', f'R$ {despesas:,.2f}'],
            ['Saldo', f'R$ {saldo:,.2f}']
        ]
        
        resumo_table = Table(resumo_data, colWidths=[8*cm, 8*cm])
        resumo_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(resumo_table)
        story.append(Spacer(1, 1*cm))
        
        # Tabela de lançamentos
        if lancamentos:
            dados = [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status']]
            
            for l in lancamentos:
                categoria_nome = l['categorias']['nome'] if l.get('categorias') else 'N/A'
                data_str = str(l['data']) if isinstance(l['data'], str) else l['data'].strftime('%Y-%m-%d')
                dados.append([
                    data_str,
                    l['descricao'][:30],
                    categoria_nome,
                    l['tipo'].capitalize(),
                    f"R$ {l['valor']:,.2f}",
                    l['status'].capitalize()
                ])
            
            table = Table(dados, colWidths=[2.5*cm, 5*cm, 3*cm, 2*cm, 3*cm, 2.5*cm])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
        
        doc.build(story)
        return True
        
    except Exception as e:
        print(f"Erro ao gerar PDF: {e}")
        return False

# ==================== FUNÇÕES DE COMPATIBILIDADE ====================

# Aliases para compatibilidade com app.py antigo
obter_lancamento_por_id = obter_lancamento
obter_conta_fixa_por_id = obter_conta_fixa

def listar_lancamentos_periodo(user_id, data_inicio, data_fim):
    """Lista lançamentos de um período"""
    try:
        query = """
            SELECT l.*, c.nome as categoria_nome
            FROM lancamentos l
            LEFT JOIN categorias c ON l.categoria_id = c.id
            WHERE l.usuario_id = %s AND l.data >= %s AND l.data <= %s
            ORDER BY l.data
        """
        resultado = database.executar_query(query, (user_id, data_inicio, data_fim), fetch=True)
        
        # Ajustar estrutura para manter compatibilidade com o formato de dados esperado
        if resultado:
            for r in resultado:
                categoria_nome = r.pop('categoria_nome', None)
                r['categorias'] = {'nome': categoria_nome} if categoria_nome else None
        
        return resultado if resultado else []
    except Exception as e:
        print(f"Erro ao listar lançamentos do período: {e}")
        return []

def listar_parcelas_contrato(numero_contrato):
    """Lista todas as parcelas de um contrato com formatação"""
    try:
        query = """
            SELECT * FROM lancamentos 
            WHERE numero_contrato = %s
            ORDER BY parcela_atual
        """
        parcelas = database.executar_query(query, (numero_contrato,), fetch=True)
        
        if not parcelas:
            return []
        
        # Formatar dados para exibição
        for p in parcelas:
            # Formatar data
            try:
                if isinstance(p['data'], str):
                    data_obj = datetime.strptime(p['data'], '%Y-%m-%d')
                else:
                    data_obj = p['data']
                p['data_formatada'] = data_obj.strftime('%d/%m/%Y')
            except:
                p['data_formatada'] = str(p['data'])
            
            # Formatar valor
            p['valor_formatado'] = f"R$ {p['valor']:.2f}"
            
            # Adicionar total de parcelas (para exibição)
            p['parcela_total'] = p['total_parcelas']
        
        return parcelas
        
    except Exception as e:
        print(f"Erro ao listar parcelas: {e}")
        traceback.print_exc()
        return []

# ==================== TRAZER DADOS DO MÊS ANTERIOR ====================

def trazer_despesas_pendentes_mes_anterior(user_id, ano_destino, mes_destino):
    """
    Move todas as despesas e receitas pendentes do mês anterior para o mês especificado
    Remove os registros do mês anterior após copiar
    Retorna a quantidade de lançamentos movidos
    """
    try:
        # Calcular mês anterior
        if mes_destino == 1:
            mes_origem = 12
            ano_origem = ano_destino - 1
        else:
            mes_origem = mes_destino - 1
            ano_origem = ano_destino
        
        # Calcular período do mês anterior
        data_inicio = f"{ano_origem}-{mes_origem:02d}-01"
        ultimo_dia = monthrange(ano_origem, mes_origem)[1]
        data_fim = f"{ano_origem}-{mes_origem:02d}-{ultimo_dia}"
        
        # Buscar TODOS os lançamentos pendentes do mês anterior (despesas E receitas)
        query = """
            SELECT * FROM lancamentos 
            WHERE usuario_id = %s AND status = 'pendente' 
            AND data >= %s AND data <= %s
        """
        resultado = database.executar_query(query, (user_id, data_inicio, data_fim), fetch=True)
        
        if not resultado:
            return 0
        
        # Copiar cada lançamento para o mês destino e excluir o original
        contador = 0
        primeiro_dia_destino = f"{ano_destino}-{mes_destino:02d}-01"
        ids_para_excluir = []
        
        query_insert = """
            INSERT INTO lancamentos 
            (usuario_id, tipo, categoria_id, descricao, valor, data, status, observacoes, 
             eh_parcelado, parcela_atual, total_parcelas, numero_contrato, conta_fixa_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        for lanc in resultado:
            # Criar novo lançamento no mês destino
            params = (
                user_id, lanc['tipo'], lanc['categoria_id'],
                f"{lanc['descricao']} (Pend. {mes_origem:02d}/{ano_origem})",
                lanc['valor'], primeiro_dia_destino, 'pendente',
                (lanc.get('observacoes') or '') + f" | Movido do mês {mes_origem:02d}/{ano_origem}",
                lanc.get('eh_parcelado', False), lanc.get('parcela_atual'),
                lanc.get('total_parcelas'), lanc.get('numero_contrato'), lanc.get('conta_fixa_id')
            )
            
            database.executar_query(query_insert, params, commit=True, fetch=False)
            ids_para_excluir.append(lanc['id'])
            contador += 1
        
        # Excluir os lançamentos originais do mês anterior
        if ids_para_excluir:
            placeholders = ','.join(['%s'] * len(ids_para_excluir))
            query_delete = f"DELETE FROM lancamentos WHERE id IN ({placeholders})"
            database.executar_query(query_delete, tuple(ids_para_excluir), commit=True, fetch=False)
        
        return contador
        
    except Exception as e:
        print(f"Erro ao trazer despesas pendentes: {e}")
        traceback.print_exc()
        return 0

def criar_lancamento_saldo_anterior(user_id, ano_destino, mes_destino):
    """
    Calcula o saldo do mês anterior e cria um lançamento de receita
    ou despesa no primeiro dia do mês destino para ajustar o saldo
    Retorna True se criou lançamento, False caso contrário
    """
    try:
        # Calcular mês anterior
        if mes_destino == 1:
            mes_anterior = 12
            ano_anterior = ano_destino - 1
        else:
            mes_anterior = mes_destino - 1
            ano_anterior = ano_destino
        
        # Obter totais do mês anterior
        totais = obter_totais_mes(user_id, ano_anterior, mes_anterior)
        saldo = totais['saldo']
        
        if saldo == 0:
            return False
        
        # Buscar categoria "Saldo Anterior" ou criar se não existir
        query = "SELECT id FROM categorias WHERE usuario_id = %s AND nome = 'Saldo Anterior'"
        resultado = database.executar_query(query, (user_id,), fetch=True)
        
        if resultado:
            categoria_id = resultado[0]['id']
        else:
            # Criar categoria
            query_insert = """
                INSERT INTO categorias (usuario_id, nome, tipo) 
                VALUES (%s, %s, %s) RETURNING id
            """
            tipo_cat = 'receita' if saldo > 0 else 'despesa'
            nova_cat = database.executar_query(query_insert, (user_id, 'Saldo Anterior', tipo_cat), 
                                              commit=True, fetch=True)
            categoria_id = nova_cat[0]['id']
        
        # Criar lançamento
        primeiro_dia = f"{ano_destino}-{mes_destino:02d}-01"
        
        query_lanc = """
            INSERT INTO lancamentos 
            (usuario_id, tipo, categoria_id, descricao, valor, data, status, observacoes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        if saldo > 0:
            # Saldo positivo = criar receita
            params = (
                user_id, 'receita', categoria_id,
                f'Saldo do mês {mes_anterior:02d}/{ano_anterior}',
                abs(saldo), primeiro_dia, 'pago',
                f'Saldo positivo trazido automaticamente: R$ {saldo:.2f}'
            )
        else:
            # Saldo negativo = criar despesa
            params = (
                user_id, 'despesa', categoria_id,
                f'Déficit do mês {mes_anterior:02d}/{ano_anterior}',
                abs(saldo), primeiro_dia, 'pago',
                f'Saldo negativo trazido automaticamente: R$ {saldo:.2f}'
            )
        
        database.executar_query(query_lanc, params, commit=True, fetch=False)
        return True
        
    except Exception as e:
        print(f"Erro ao criar lançamento de saldo anterior: {e}")
        traceback.print_exc()
        return False
