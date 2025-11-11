# models.py - Funções de acesso e manipulação de dados

import database
import bcrypt
from datetime import datetime, timedelta
from calendar import monthrange
import uuid

# ==================== USUÁRIOS ====================

def criar_usuario(username, senha):
    """Cria um novo usuário com senha criptografada"""
    try:
        # Criptografar senha
        senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())
        
        query = "INSERT INTO usuarios (username, password) VALUES (?, ?)"
        database.executar_query(query, (username, senha_hash), commit=True)
        
        # Criar categorias padrão para o novo usuário
        user = autenticar(username, senha)
        if user:
            criar_categorias_padrao(user['id'])
        
        return True
    except Exception as e:
        print(f"Erro ao criar usuário: {e}")
        return False

def autenticar(username, senha):
    """Autentica um usuário e retorna seus dados"""
    query = "SELECT * FROM usuarios WHERE username = ?"
    resultado = database.executar_query(query, (username,))
    
    if resultado:
        user = dict(resultado[0])
        # Verificar senha
        if bcrypt.checkpw(senha.encode('utf-8'), user['password']):
            return user
    
    return None

def listar_usuarios():
    """Lista todos os usuários"""
    query = "SELECT id, username, criado_em FROM usuarios"
    return [dict(row) for row in database.executar_query(query)]

def redefinir_senha(user_id, nova_senha):
    """Redefine a senha de um usuário"""
    senha_hash = bcrypt.hashpw(nova_senha.encode('utf-8'), bcrypt.gensalt())
    query = "UPDATE usuarios SET password = ? WHERE id = ?"
    database.executar_query(query, (senha_hash, user_id), commit=True)

# ==================== CONFIGURAÇÕES ====================

def get_config(chave):
    """Obtém um valor de configuração"""
    query = "SELECT valor FROM app_config WHERE chave = ?"
    resultado = database.executar_query(query, (chave,))
    return resultado[0]['valor'] if resultado else None

def set_config(chave, valor):
    """Define um valor de configuração"""
    query = "INSERT OR REPLACE INTO app_config (chave, valor) VALUES (?, ?)"
    database.executar_query(query, (chave, valor), commit=True)

# ==================== CATEGORIAS ====================

def criar_categorias_padrao(user_id):
    """Cria categorias padrão para um novo usuário"""
    categorias_padrao = [
        ('Salário', 'Receita'),
        ('Freelance', 'Receita'),
        ('Investimentos', 'Receita'),
        ('Outros', 'Receita'),
        ('Alimentação', 'Despesa'),
        ('Transporte', 'Despesa'),
        ('Moradia', 'Despesa'),
        ('Saúde', 'Despesa'),
        ('Educação', 'Despesa'),
        ('Lazer', 'Despesa'),
        ('Vestuário', 'Despesa'),
        ('Outros', 'Despesa')
    ]
    
    for nome, tipo in categorias_padrao:
        criar_categoria(user_id, nome, tipo)

def criar_categoria(user_id, nome, tipo):
    """Cria uma nova categoria"""
    try:
        query = "INSERT INTO categorias (user_id, nome, tipo) VALUES (?, ?, ?)"
        return database.executar_query(query, (user_id, nome, tipo), commit=True)
    except:
        return None

def listar_categorias(user_id, tipo=None):
    """Lista categorias de um usuário"""
    if tipo:
        query = "SELECT * FROM categorias WHERE user_id = ? AND tipo = ? ORDER BY nome"
        params = (user_id, tipo)
    else:
        query = "SELECT * FROM categorias WHERE user_id = ? ORDER BY tipo, nome"
        params = (user_id,)
    
    return [dict(row) for row in database.executar_query(query, params)]

# ==================== LANÇAMENTOS ====================

def inserir_lancamento(user_id, data, tipo, valor, descricao, categoria_id, 
                      parcelas=1, observacao=''):
    """Insere um ou mais lançamentos (com suporte a parcelamento)"""
    
    # Definir status padrão
    if tipo == 'Despesa':
        status = 'Pendente'
    else:
        status = 'A receber'
    
    if parcelas > 1:
        # Gerar ID único para o contrato
        contrato_id = str(uuid.uuid4())
        
        # Converter data inicial
        data_inicial = datetime.strptime(data, '%Y-%m-%d')
        
        lancamentos = []
        for i in range(parcelas):
            # Calcular data da parcela (mês a mês)
            data_parcela = data_inicial + timedelta(days=30*i)
            data_parcela_str = data_parcela.strftime('%Y-%m-%d')
            
            lancamentos.append((
                user_id, data_parcela_str, tipo, valor, descricao,
                categoria_id, status, i+1, parcelas, contrato_id, observacao
            ))
        
        query = '''INSERT INTO lancamentos 
                   (user_id, data, tipo, valor, descricao, categoria_id, status, 
                    parcela_atual, parcela_total, contrato_id, observacao)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'''
        
        database.executar_many(query, lancamentos)
    else:
        # Lançamento único
        query = '''INSERT INTO lancamentos 
                   (user_id, data, tipo, valor, descricao, categoria_id, status, observacao)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)'''
        database.executar_query(query, (user_id, data, tipo, valor, descricao, 
                                        categoria_id, status, observacao), commit=True)

def listar_lancamentos_mes(user_id, mes, ano):
    """Lista todos os lançamentos de um mês específico"""
    query = '''
        SELECT l.*, c.nome as categoria_nome
        FROM lancamentos l
        JOIN categorias c ON l.categoria_id = c.id
        WHERE l.user_id = ? 
        AND strftime('%m', l.data) = ? 
        AND strftime('%Y', l.data) = ?
        ORDER BY l.data DESC, l.id DESC
    '''
    
    mes_str = f"{mes:02d}"
    ano_str = str(ano)
    
    lancamentos = database.executar_query(query, (user_id, mes_str, ano_str))
    
    result = []
    for lanc in lancamentos:
        lanc_dict = dict(lanc)
        # Formatar parcela
        if lanc_dict['parcela_atual'] and lanc_dict['parcela_total']:
            lanc_dict['parcela_texto'] = f"{lanc_dict['parcela_atual']}/{lanc_dict['parcela_total']}"
        else:
            lanc_dict['parcela_texto'] = '-'
        
        # Formatar data
        data_obj = datetime.strptime(lanc_dict['data'], '%Y-%m-%d')
        lanc_dict['data_formatada'] = data_obj.strftime('%d/%m/%Y')
        
        # Formatar valor
        lanc_dict['valor_formatado'] = f"R$ {lanc_dict['valor']:.2f}"
        
        result.append(lanc_dict)
    
    return result

def listar_lancamentos_periodo(user_id, data_inicial, data_final):
    """Lista lançamentos em um período"""
    query = '''
        SELECT l.*, c.nome as categoria_nome
        FROM lancamentos l
        JOIN categorias c ON l.categoria_id = c.id
        WHERE l.user_id = ? AND l.data BETWEEN ? AND ?
        ORDER BY l.data DESC, l.id DESC
    '''
    
    lancamentos = database.executar_query(query, (user_id, data_inicial, data_final))
    
    result = []
    for lanc in lancamentos:
        lanc_dict = dict(lanc)
        if lanc_dict['parcela_atual'] and lanc_dict['parcela_total']:
            lanc_dict['parcela_texto'] = f"{lanc_dict['parcela_atual']}/{lanc_dict['parcela_total']}"
        else:
            lanc_dict['parcela_texto'] = '-'
        
        data_obj = datetime.strptime(lanc_dict['data'], '%Y-%m-%d')
        lanc_dict['data_formatada'] = data_obj.strftime('%d/%m/%Y')
        lanc_dict['valor_formatado'] = f"R$ {lanc_dict['valor']:.2f}"
        
        result.append(lanc_dict)
    
    return result

def obter_lancamento_por_id(lanc_id):
    """Obtém um lançamento específico"""
    query = "SELECT * FROM lancamentos WHERE id = ?"
    resultado = database.executar_query(query, (lanc_id,))
    return dict(resultado[0]) if resultado else None

def atualizar_lancamento(lanc_id, data, tipo, valor, descricao, categoria_id, observacao):
    """Atualiza um lançamento existente"""
    query = '''UPDATE lancamentos 
               SET data = ?, tipo = ?, valor = ?, descricao = ?, 
                   categoria_id = ?, observacao = ?
               WHERE id = ?'''
    database.executar_query(query, (data, tipo, valor, descricao, 
                                   categoria_id, observacao, lanc_id), commit=True)

def excluir_lancamentos(ids_list):
    """Exclui um ou mais lançamentos"""
    placeholders = ','.join('?' * len(ids_list))
    query = f"DELETE FROM lancamentos WHERE id IN ({placeholders})"
    database.executar_query(query, ids_list, commit=True)

def alternar_status(lanc_id):
    """Alterna o status de um lançamento entre pago/pendente ou recebido/a receber"""
    lancamento = obter_lancamento_por_id(lanc_id)
    
    if lancamento:
        if lancamento['tipo'] == 'Despesa':
            novo_status = 'Pago' if lancamento['status'] == 'Pendente' else 'Pendente'
        else:
            novo_status = 'Recebido' if lancamento['status'] == 'A receber' else 'A receber'
        
        query = "UPDATE lancamentos SET status = ? WHERE id = ?"
        database.executar_query(query, (novo_status, lanc_id), commit=True)

def obter_totais_mes(user_id, mes, ano):
    """Calcula totais de receitas, despesas e saldo do mês"""
    mes_str = f"{mes:02d}"
    ano_str = str(ano)
    
    # Total de receitas recebidas
    query_receitas = '''
        SELECT SUM(valor) as total
        FROM lancamentos
        WHERE user_id = ? 
        AND tipo = 'Receita' 
        AND status = 'Recebido'
        AND strftime('%m', data) = ? 
        AND strftime('%Y', data) = ?
    '''
    
    # Total de despesas pagas
    query_despesas = '''
        SELECT SUM(valor) as total
        FROM lancamentos
        WHERE user_id = ? 
        AND tipo = 'Despesa' 
        AND status = 'Pago'
        AND strftime('%m', data) = ? 
        AND strftime('%Y', data) = ?
    '''
    
    receitas = database.executar_query(query_receitas, (user_id, mes_str, ano_str))
    despesas = database.executar_query(query_despesas, (user_id, mes_str, ano_str))
    
    total_receitas = receitas[0]['total'] if receitas and receitas[0]['total'] else 0
    total_despesas = despesas[0]['total'] if despesas and despesas[0]['total'] else 0
    saldo = total_receitas - total_despesas
    
    return {
        'total_receitas': total_receitas,
        'total_despesas': total_despesas,
        'saldo': saldo
    }

# ==================== CONTAS FIXAS ====================

def criar_conta_fixa(user_id, descricao, categoria_id, tipo, valor, 
                    dia_vencimento, observacao='', ativa=True):
    """Cria uma conta fixa"""
    query = '''INSERT INTO contas_fixas 
               (user_id, descricao, categoria_id, tipo, valor, dia_vencimento, 
                ativa, observacao)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)'''
    
    return database.executar_query(query, (user_id, descricao, categoria_id, tipo, 
                                          valor, dia_vencimento, 1 if ativa else 0, 
                                          observacao), commit=True)

def listar_contas_fixas(user_id):
    """Lista todas as contas fixas de um usuário"""
    query = '''
        SELECT cf.*, c.nome as categoria_nome
        FROM contas_fixas cf
        JOIN categorias c ON cf.categoria_id = c.id
        WHERE cf.user_id = ?
        ORDER BY cf.dia_vencimento
    '''
    
    contas = database.executar_query(query, (user_id,))
    
    result = []
    for conta in contas:
        conta_dict = dict(conta)
        conta_dict['ativa_bool'] = conta_dict['ativa'] == 1
        conta_dict['valor_formatado'] = f"R$ {conta_dict['valor']:.2f}"
        result.append(conta_dict)
    
    return result

def obter_conta_fixa_por_id(conta_id):
    """Obtém uma conta fixa específica"""
    query = "SELECT * FROM contas_fixas WHERE id = ?"
    resultado = database.executar_query(query, (conta_id,))
    return dict(resultado[0]) if resultado else None

def atualizar_conta_fixa(conta_id, descricao, categoria_id, tipo, valor, 
                        dia_vencimento, ativa, observacao):
    """Atualiza uma conta fixa"""
    query = '''UPDATE contas_fixas 
               SET descricao = ?, categoria_id = ?, tipo = ?, valor = ?, 
                   dia_vencimento = ?, ativa = ?, observacao = ?
               WHERE id = ?'''
    
    database.executar_query(query, (descricao, categoria_id, tipo, valor, 
                                   dia_vencimento, 1 if ativa else 0, 
                                   observacao, conta_id), commit=True)

def excluir_conta_fixa(conta_id):
    """Exclui uma conta fixa"""
    query = "DELETE FROM contas_fixas WHERE id = ?"
    database.executar_query(query, (conta_id,), commit=True)

def gerar_lancamentos_contas_fixas_mes(user_id, mes, ano):
    """Gera lançamentos para todas as contas fixas ativas do mês"""
    contas = listar_contas_fixas(user_id)
    contas_ativas = [c for c in contas if c['ativa_bool']]
    
    lancamentos_gerados = 0
    
    for conta in contas_ativas:
        # Verificar se já existe lançamento desta conta no mês
        dia = conta['dia_vencimento']
        
        # Garantir que o dia seja válido para o mês
        ultimo_dia = monthrange(ano, mes)[1]
        if dia > ultimo_dia:
            dia = ultimo_dia
        
        data = f"{ano}-{mes:02d}-{dia:02d}"
        
        # Verificar se já existe
        query = '''SELECT COUNT(*) as count FROM lancamentos 
                   WHERE user_id = ? AND descricao = ? 
                   AND strftime('%m', data) = ? AND strftime('%Y', data) = ?'''
        
        resultado = database.executar_query(query, (user_id, conta['descricao'], 
                                                    f"{mes:02d}", str(ano)))
        
        if resultado[0]['count'] == 0:
            # Gerar lançamento
            status = 'Pendente' if conta['tipo'] == 'Despesa' else 'A receber'
            
            query = '''INSERT INTO lancamentos 
                       (user_id, data, tipo, valor, descricao, categoria_id, 
                        status, observacao)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)'''
            
            database.executar_query(query, (user_id, data, conta['tipo'], 
                                           conta['valor'], conta['descricao'], 
                                           conta['categoria_id'], status, 
                                           conta['observacao']), commit=True)
            
            lancamentos_gerados += 1
    
    return lancamentos_gerados

# ==================== CONTAS PARCELADAS ====================

def listar_parcelados_pendentes(user_id):
    """Lista contratos de parcelados com parcelas pendentes, agrupados"""
    query = '''
        SELECT 
            contrato_id,
            descricao,
            categoria_id,
            tipo,
            MAX(parcela_total) as total_parcelas,
            COUNT(*) as parcelas_pendentes,
            SUM(valor) as valor_total_pendente,
            MIN(data) as proxima_data
        FROM lancamentos
        WHERE user_id = ? 
        AND contrato_id IS NOT NULL
        AND status IN ('Pendente', 'A receber')
        GROUP BY contrato_id
        ORDER BY proxima_data
    '''
    
    contratos = database.executar_query(query, (user_id,))
    
    result = []
    for contrato in contratos:
        contrato_dict = dict(contrato)
        
        # Buscar nome da categoria
        query_cat = "SELECT nome FROM categorias WHERE id = ?"
        cat = database.executar_query(query_cat, (contrato_dict['categoria_id'],))
        contrato_dict['categoria_nome'] = cat[0]['nome'] if cat else 'N/A'
        
        # Formatar texto
        contrato_dict['texto_parcelas'] = f"{contrato_dict['parcelas_pendentes']} pendentes de {contrato_dict['total_parcelas']} parcelas"
        contrato_dict['valor_formatado'] = f"R$ {contrato_dict['valor_total_pendente']:.2f}"
        
        # Formatar data
        data_obj = datetime.strptime(contrato_dict['proxima_data'], '%Y-%m-%d')
        contrato_dict['proxima_data_formatada'] = data_obj.strftime('%d/%m/%Y')
        
        result.append(contrato_dict)
    
    return result

def listar_parcelas_contrato(contrato_id):
    """Lista todas as parcelas pendentes de um contrato"""
    query = '''
        SELECT *
        FROM lancamentos
        WHERE contrato_id = ? 
        AND status IN ('Pendente', 'A receber')
        ORDER BY parcela_atual
    '''
    
    parcelas = database.executar_query(query, (contrato_id,))
    
    result = []
    for parcela in parcelas:
        parcela_dict = dict(parcela)
        data_obj = datetime.strptime(parcela_dict['data'], '%Y-%m-%d')
        parcela_dict['data_formatada'] = data_obj.strftime('%d/%m/%Y')
        parcela_dict['valor_formatado'] = f"R$ {parcela_dict['valor']:.2f}"
        parcela_dict['parcela_texto'] = f"{parcela_dict['parcela_atual']}/{parcela_dict['parcela_total']}"
        result.append(parcela_dict)
    
    return result

def quitar_parcelado_integral(user_id, contrato_id, desconto=0):
    """Quita integralmente um contrato parcelado"""
    # Buscar todas as parcelas pendentes
    parcelas = listar_parcelas_contrato(contrato_id)
    
    if not parcelas:
        return
    
    # Calcular total
    valor_total = sum(p['valor'] for p in parcelas)
    valor_com_desconto = valor_total - desconto
    
    # Criar lançamento de quitação no mês atual
    hoje = datetime.now()
    data_quitacao = hoje.strftime('%Y-%m-%d')
    
    primeira_parcela = parcelas[0]
    descricao_quitacao = f"Quitação integral: {primeira_parcela['descricao']}"
    
    if desconto > 0:
        descricao_quitacao += f" (Desconto: R$ {desconto:.2f})"
    
    status = 'Pago' if primeira_parcela['tipo'] == 'Despesa' else 'Recebido'
    
    query = '''INSERT INTO lancamentos 
               (user_id, data, tipo, valor, descricao, categoria_id, status, observacao)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)'''
    
    database.executar_query(query, (user_id, data_quitacao, primeira_parcela['tipo'],
                                   valor_com_desconto, descricao_quitacao,
                                   primeira_parcela['categoria_id'], status,
                                   f"Quitação de {len(parcelas)} parcelas"), commit=True)
    
    # Excluir parcelas pendentes
    ids_parcelas = [p['id'] for p in parcelas]
    excluir_lancamentos(ids_parcelas)

def quitar_parcelado_parcial(user_id, contrato_id, parcelas_ids, desconto=0):
    """Quita parcialmente um contrato parcelado"""
    if not parcelas_ids:
        return
    
    # Buscar parcelas selecionadas
    placeholders = ','.join('?' * len(parcelas_ids))
    query = f'''SELECT * FROM lancamentos 
                WHERE id IN ({placeholders}) AND contrato_id = ?'''
    
    params = list(parcelas_ids) + [contrato_id]
    parcelas = database.executar_query(query, params)
    
    if not parcelas:
        return
    
    # Calcular total
    valor_total = sum(dict(p)['valor'] for p in parcelas)
    valor_com_desconto = valor_total - desconto
    
    # Criar lançamento de quitação
    hoje = datetime.now()
    data_quitacao = hoje.strftime('%Y-%m-%d')
    
    primeira_parcela = dict(parcelas[0])
    descricao_quitacao = f"Quitação parcial: {primeira_parcela['descricao']}"
    
    if desconto > 0:
        descricao_quitacao += f" (Desconto: R$ {desconto:.2f})"
    
    status = 'Pago' if primeira_parcela['tipo'] == 'Despesa' else 'Recebido'
    
    query = '''INSERT INTO lancamentos 
               (user_id, data, tipo, valor, descricao, categoria_id, status, observacao)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)'''
    
    database.executar_query(query, (user_id, data_quitacao, primeira_parcela['tipo'],
                                   valor_com_desconto, descricao_quitacao,
                                   primeira_parcela['categoria_id'], status,
                                   f"Quitação de {len(parcelas)} parcelas"), commit=True)
    
    # Excluir parcelas quitadas
    excluir_lancamentos(parcelas_ids)

# ==================== RELATÓRIOS ====================

def gerar_relatorio_pdf(user_id, data_inicial, data_final):
    """Gera um relatório em PDF dos lançamentos do período"""
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    import os
    
    # Criar pasta de relatórios se não existir
    pasta_relatorios = os.path.join(os.path.dirname(__file__), 'relatorios')
    os.makedirs(pasta_relatorios, exist_ok=True)
    
    # Nome do arquivo
    arquivo_pdf = os.path.join(pasta_relatorios, 
                               f'relatorio_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf')
    
    # Criar documento
    doc = SimpleDocTemplate(arquivo_pdf, pagesize=A4)
    elements = []
    
    # Estilos
    styles = getSampleStyleSheet()
    
    # Título
    titulo = Paragraph(f"<b>Relatório Financeiro</b><br/>{data_inicial} a {data_final}", 
                      styles['Title'])
    elements.append(titulo)
    elements.append(Spacer(1, 1*cm))
    
    # Buscar lançamentos
    lancamentos = listar_lancamentos_periodo(user_id, data_inicial, data_final)
    
    if lancamentos:
        # Criar tabela
        dados = [['Data', 'Descrição', 'Categoria', 'Tipo', 'Status', 'Valor']]
        
        for lanc in lancamentos:
            dados.append([
                lanc['data_formatada'],
                lanc['descricao'][:30],
                lanc['categoria_nome'],
                lanc['tipo'],
                lanc['status'],
                lanc['valor_formatado']
            ])
        
        tabela = Table(dados)
        tabela.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(tabela)
        
        # Totais
        elements.append(Spacer(1, 1*cm))
        
        total_receitas = sum(l['valor'] for l in lancamentos 
                            if l['tipo'] == 'Receita' and l['status'] == 'Recebido')
        total_despesas = sum(l['valor'] for l in lancamentos 
                            if l['tipo'] == 'Despesa' and l['status'] == 'Pago')
        saldo = total_receitas - total_despesas
        
        totais_texto = f"""
        <b>Total de Receitas Recebidas:</b> R$ {total_receitas:.2f}<br/>
        <b>Total de Despesas Pagas:</b> R$ {total_despesas:.2f}<br/>
        <b>Saldo do Período:</b> R$ {saldo:.2f}
        """
        
        totais_para = Paragraph(totais_texto, styles['Normal'])
        elements.append(totais_para)
    else:
        msg = Paragraph("Nenhum lançamento encontrado no período.", styles['Normal'])
        elements.append(msg)
    
    # Gerar PDF
    doc.build(elements)
    
    return arquivo_pdf
