from flask import Blueprint, request, jsonify
from src.models.user import db, User, Jogo, Raspadinha, Saque
from src.routes.auth import token_required
from datetime import datetime

jogos_bp = Blueprint('jogos', __name__)

@jogos_bp.route('/historico', methods=['GET'])
@token_required
def get_historico(current_user):
    """Retorna o histórico de jogos do usuário"""
    jogos = Jogo.query.filter_by(user_id=current_user.id).order_by(Jogo.data_jogo.desc()).all()
    
    return jsonify({
        'jogos': [jogo.to_dict() for jogo in jogos]
    }), 200

@jogos_bp.route('/novo', methods=['POST'])
@token_required
def novo_jogo(current_user):
    """Registra um novo jogo para o usuário"""
    data = request.get_json()
    
    # Verificar se todos os campos necessários estão presentes
    required_fields = ['quantidade_raspadinhas', 'valor_total', 'premio_total', 'raspadinhas', 'origem_saldo']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Campo {field} é obrigatório!'}), 400
    
    # Verificar se o usuário tem saldo suficiente (se estiver usando saldo interno)
    if data['origem_saldo'] and current_user.saldo < data['valor_total']:
        return jsonify({'message': 'Saldo insuficiente!'}), 400
    
    # Criar novo jogo
    novo_jogo = Jogo(
        user_id=current_user.id,
        quantidade_raspadinhas=data['quantidade_raspadinhas'],
        valor_total=data['valor_total'],
        premio_total=data['premio_total'],
        origem_saldo=data['origem_saldo']
    )
    
    # Adicionar raspadinhas
    for r in data['raspadinhas']:
        raspadinha = Raspadinha(
            premio=r['premio'],
            extra=r.get('extra', False)
        )
        novo_jogo.raspadinhas.append(raspadinha)
    
    # Se estiver usando saldo interno, debitar do saldo
    if data['origem_saldo']:
        current_user.remove_saldo(data['valor_total'])
    
    # Adicionar prêmio ao saldo do usuário
    if data['premio_total'] > 0:
        current_user.add_saldo(data['premio_total'])
    
    # Salvar no banco de dados
    db.session.add(novo_jogo)
    db.session.commit()
    
    return jsonify({
        'message': 'Jogo registrado com sucesso!',
        'jogo': novo_jogo.to_dict(),
        'saldo_atual': current_user.saldo
    }), 201

@jogos_bp.route('/saques', methods=['GET'])
@token_required
def get_saques(current_user):
    """Retorna o histórico de saques do usuário"""
    saques = Saque.query.filter_by(user_id=current_user.id).order_by(Saque.data_solicitacao.desc()).all()
    
    return jsonify({
        'saques': [saque.to_dict() for saque in saques]
    }), 200

@jogos_bp.route('/solicitar-saque', methods=['POST'])
@token_required
def solicitar_saque(current_user):
    """Solicita um saque do saldo do usuário"""
    data = request.get_json()
    
    # Verificar se todos os campos necessários estão presentes
    if not data or not data.get('valor') or not data.get('chave_pix'):
        return jsonify({'message': 'Valor e chave Pix são obrigatórios!'}), 400
    
    valor = float(data['valor'])
    
    # Verificar se o valor é válido
    if valor <= 0:
        return jsonify({'message': 'O valor deve ser maior que zero!'}), 400
    
    # Verificar se o usuário tem saldo suficiente
    if current_user.saldo < valor:
        return jsonify({'message': 'Saldo insuficiente!'}), 400
    
    # Criar novo saque
    novo_saque = Saque(
        user_id=current_user.id,
        valor=valor,
        chave_pix=data['chave_pix']
    )
    
    # Debitar do saldo do usuário
    current_user.remove_saldo(valor)
    
    # Salvar no banco de dados
    db.session.add(novo_saque)
    db.session.commit()
    
    return jsonify({
        'message': 'Saque solicitado com sucesso!',
        'saque': novo_saque.to_dict(),
        'saldo_atual': current_user.saldo
    }), 201
