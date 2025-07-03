# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from src.models.user import db, User, PartnerCoupon # Import PartnerCoupon
from datetime import datetime
import jwt
import os
from functools import wraps

auth_bp = Blueprint("auth", __name__)

# Chave secreta para JWT
SECRET_KEY = os.environ.get("SECRET_KEY", "raspadinha-premiada-secret-key")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@raspadinha.com") # Mantém a verificação de admin por email

# Decorator para verificar token JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"message": "Token de autenticação ausente!"}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id=data["user_id"]).first()
            if not current_user:
                return jsonify({"message": "Usuário não encontrado!"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expirado. Por favor, faça login novamente!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token inválido. Por favor, faça login novamente!"}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    
    required_fields = ["nome", "email", "telefone", "password"]
    for field in required_fields:
        # Garante que o campo existe e não está vazio
        if field not in data or not data[field]: 
            return jsonify({"message": f"Campo {field} é obrigatório!"}), 400
    
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Este email já está cadastrado!"}), 400
    
    # --- Processamento de Código de Indicação/Cupom ---
    referral_code_input = data.get("referral_code_input")
    referring_user = None
    partner_coupon = None
    
    if referral_code_input:
        # 1. Tentar encontrar como Cupom de Parceiro
        partner_coupon = PartnerCoupon.query.filter_by(code=referral_code_input, is_active=True).first()
        
        if not partner_coupon:
            # 2. Se não for cupom, tentar encontrar como Código de Indicação de Usuário
            referring_user = User.query.filter_by(referral_code=referral_code_input).first()

    # Criar novo usuário
    new_user = User(
        nome=data["nome"],
        email=data["email"],
        telefone=data["telefone"],
        # Associa ao cupom ou usuário que indicou, se houver
        partner_coupon_id=partner_coupon.id if partner_coupon else None,
        referred_by_user_id=referring_user.id if referring_user else None
    )
    new_user.set_password(data["password"])
    
    # Salvar novo usuário primeiro para obter o ID (se necessário)
    db.session.add(new_user)
    # Não comitar ainda, precisamos atualizar o indicador/cupom

    # --- Atualizar Contador e Conceder Bônus (se aplicável) ---
    try:
        if partner_coupon:
            partner_coupon.usage_count = (partner_coupon.usage_count or 0) + 1
            db.session.add(partner_coupon) # Adiciona a atualização do cupom à sessão
            
        elif referring_user:
            referring_user.referral_count = (referring_user.referral_count or 0) + 1
            
            # Verificar se atingiu múltiplo de 3 e se o bônus para *este* limiar ainda não foi dado
            # Ex: Se count é 3, bonus_count deve ser 0. Se count é 6, bonus_count deve ser 1.
            required_bonus_count = referring_user.referral_count // 3
            if required_bonus_count > (referring_user.referral_bonus_awarded_count or 0):
                referring_user.add_bonus_raspadinha(1)
                referring_user.referral_bonus_awarded_count = required_bonus_count # Atualiza para o novo limiar atingido
                
            db.session.add(referring_user) # Adiciona a atualização do usuário indicador à sessão

        # Agora comitar todas as alterações juntas (novo usuário, cupom/indicador)
        db.session.commit()
        
    except Exception as e:
        db.session.rollback() # Desfaz tudo se houver erro ao atualizar contadores/bônus
        print(f"Erro ao processar indicação/cupom: {e}") # Log do erro
        return jsonify({"message": "Erro interno ao processar código de indicação/cupom."}), 500

    return jsonify({
        "message": "Usuário cadastrado com sucesso!",
        "user": new_user.to_dict() # Retorna dados básicos, sem info de indicação
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email e senha são obrigatórios!"}), 400
    
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"message": "Email ou senha incorretos!"}), 401
    
    user.ultimo_login = datetime.utcnow()
    db.session.commit()
    
    token = jwt.encode(
        {
            "user_id": user.id,
            "email": user.email,
            # Adiciona flag de admin ao token para facilitar verificação no frontend
            "is_admin": user.email == ADMIN_EMAIL, 
            "exp": datetime.utcnow().timestamp() + 86400  # 24 horas
        },
        SECRET_KEY,
        algorithm="HS256"
    )
    
    return jsonify({
        "message": "Login realizado com sucesso!",
        "token": token,
        "user": user.to_dict() # Retorna dados do usuário logado
    }), 200

@auth_bp.route("/profile", methods=["GET"])
@token_required
def get_profile(current_user):
    # Retorna dados do perfil, incluindo informações de indicação
    profile_data = current_user.to_dict()
    # Adiciona explicitamente os campos de indicação que não estão no to_dict padrão
    profile_data["referral_code"] = current_user.referral_code
    profile_data["referral_count"] = current_user.referral_count
    profile_data["bonus_raspadinhas_available"] = current_user.bonus_raspadinhas_available
    return jsonify({"user": profile_data}), 200

@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    if "nome" in data:
        current_user.nome = data["nome"]
    # Garante que telefone não seja atualizado para vazio
    if "telefone" in data and data["telefone"]:
        current_user.telefone = data["telefone"]
    elif "telefone" in data and not data["telefone"]:
         return jsonify({"message": "Telefone não pode ser vazio!"}), 400
    
    if "password" in data and data["password"]:
        current_user.set_password(data["password"])
    
    db.session.commit()
    
    # Retorna o perfil atualizado, incluindo dados de indicação
    profile_data = current_user.to_dict()
    profile_data["referral_code"] = current_user.referral_code
    profile_data["referral_count"] = current_user.referral_count
    profile_data["bonus_raspadinhas_available"] = current_user.bonus_raspadinhas_available
    return jsonify({
        "message": "Perfil atualizado com sucesso!",
        "user": profile_data
    }), 200

# Nova rota para informações de indicação (redundante se /profile já retorna, mas pode ser útil)
@auth_bp.route("/profile/referral-info", methods=["GET"])
@token_required
def get_referral_info(current_user):
    return jsonify({
        "referral_code": current_user.referral_code,
        "referral_count": current_user.referral_count,
        "bonus_raspadinhas_available": current_user.bonus_raspadinhas_available
    }), 200

