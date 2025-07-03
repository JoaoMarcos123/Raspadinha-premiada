# -*- coding: utf-8 -*-
from flask import Blueprint, request, jsonify
from src.models.user import db, User, Jogo, Raspadinha, Saque, Configuracao, PartnerCoupon # Import PartnerCoupon
from src.routes.auth import token_required
from datetime import datetime, timedelta
from functools import wraps
from sqlalchemy import func, and_, exc # Import exc for exception handling
import os

admin_bp = Blueprint("admin", __name__)

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@raspadinha.com")

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user or current_user.email != ADMIN_EMAIL:
            return jsonify({"message": "Acesso negado. Permissões de administrador necessárias!"}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# --- Rotas Admin Existentes (Dashboard, Usuários, Jogos, Saques, Configurações) --- 
# ... (código anterior das rotas /dashboard, /usuarios, /jogos, /saques, /configuracoes permanece aqui) ...

@admin_bp.route("/dashboard", methods=["GET"])
@token_required
@admin_required
def get_dashboard(current_user):
    """Retorna dados para o dashboard administrativo"""
    total_usuarios = User.query.count()
    total_jogos = Jogo.query.count()
    total_arrecadado = db.session.query(func.sum(Jogo.valor_total)).scalar() or 0
    total_premios = db.session.query(func.sum(Jogo.premio_total)).scalar() or 0
    saques_pendentes = Saque.query.filter_by(status="pendente").count()
    valor_saques_pendentes = db.session.query(func.sum(Saque.valor)).filter_by(status="pendente").scalar() or 0
    data_limite = datetime.utcnow() - timedelta(days=7)
    novos_usuarios = User.query.filter(User.data_cadastro >= data_limite).count()
    jogos_recentes = Jogo.query.filter(Jogo.data_jogo >= data_limite).count()
    total_cupons_ativos = PartnerCoupon.query.filter_by(is_active=True).count()
    total_cadastros_cupom = db.session.query(func.sum(PartnerCoupon.usage_count)).scalar() or 0

    return jsonify({
        "total_usuarios": total_usuarios,
        "total_jogos": total_jogos,
        "total_arrecadado": float(total_arrecadado),
        "total_premios": float(total_premios),
        "lucro": float(total_arrecadado - total_premios),
        "margem_lucro": float(((total_arrecadado - total_premios) / total_arrecadado) * 100) if total_arrecadado > 0 else 0,
        "saques_pendentes": saques_pendentes,
        "valor_saques_pendentes": float(valor_saques_pendentes),
        "novos_usuarios_7d": novos_usuarios,
        "jogos_7d": jogos_recentes,
        "total_cupons_ativos": total_cupons_ativos,
        "total_cadastros_cupom": total_cadastros_cupom
    }), 200

@admin_bp.route("/usuarios", methods=["GET"])
@token_required
@admin_required
def get_usuarios(current_user):
    """Retorna lista de usuários para o painel administrativo"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    usuarios_paginados = User.query.order_by(User.data_cadastro.desc()).paginate(page=page, per_page=per_page)
    return jsonify({
        "usuarios": [user.to_dict() for user in usuarios_paginados.items],
        "total": usuarios_paginados.total,
        "pages": usuarios_paginados.pages,
        "current_page": page
    }), 200

@admin_bp.route("/jogos", methods=["GET"])
@token_required
@admin_required
def get_jogos(current_user):
    """Retorna lista de jogos para o painel administrativo"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    user_id = request.args.get("user_id", type=int)
    data_inicio = request.args.get("data_inicio")
    data_fim = request.args.get("data_fim")
    query = Jogo.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if data_inicio:
        try:
            data_inicio_dt = datetime.strptime(data_inicio, "%Y-%m-%d")
            query = query.filter(Jogo.data_jogo >= data_inicio_dt)
        except ValueError:
            pass
    if data_fim:
        try:
            data_fim_dt = datetime.strptime(data_fim, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(Jogo.data_jogo < data_fim_dt)
        except ValueError:
            pass
    jogos_paginados = query.order_by(Jogo.data_jogo.desc()).paginate(page=page, per_page=per_page)
    return jsonify({
        "jogos": [jogo.to_dict() for jogo in jogos_paginados.items],
        "total": jogos_paginados.total,
        "pages": jogos_paginados.pages,
        "current_page": page
    }), 200

@admin_bp.route("/saques", methods=["GET"])
@token_required
@admin_required
def get_saques(current_user):
    """Retorna lista de saques para o painel administrativo"""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status = request.args.get("status")
    query = Saque.query
    if status:
        query = query.filter_by(status=status)
    saques_paginados = query.order_by(Saque.data_solicitacao.desc()).paginate(page=page, per_page=per_page)
    return jsonify({
        "saques": [saque.to_dict() for saque in saques_paginados.items],
        "total": saques_paginados.total,
        "pages": saques_paginados.pages,
        "current_page": page
    }), 200

@admin_bp.route("/saques/<int:saque_id>/status", methods=["PUT"])
@token_required
@admin_required
def atualizar_status_saque(current_user, saque_id):
    """Atualiza o status de um saque"""
    data = request.get_json()
    if not data or "status" not in data:
        return jsonify({"message": "Status é obrigatório!"}), 400
    status_validos = ["pendente", "processando", "concluido", "cancelado"]
    if data["status"] not in status_validos:
        return jsonify({"message": f"Status inválido! Valores permitidos: {', '.join(status_validos)}"}), 400
    saque = Saque.query.get(saque_id)
    if not saque:
        return jsonify({"message": "Saque não encontrado!"}), 404
    if data["status"] == "cancelado" and saque.status != "cancelado":
        usuario = User.query.get(saque.user_id)
        if usuario:
            usuario.add_saldo(saque.valor)
    saque.status = data["status"]
    if data["status"] in ["concluido", "cancelado"]:
        saque.data_processamento = datetime.utcnow()
    db.session.commit()
    return jsonify({
        "message": "Status do saque atualizado com sucesso!",
        "saque": saque.to_dict()
    }), 200

@admin_bp.route("/relatorios/financeiro", methods=["GET"])
@token_required
@admin_required
def relatorio_financeiro(current_user):
    """Gera relatório financeiro com base em período"""
    data_inicio = request.args.get("data_inicio")
    data_fim = request.args.get("data_fim")
    if not data_inicio:
        data_inicio = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
    if not data_fim:
        data_fim = datetime.utcnow().strftime("%Y-%m-%d")
    try:
        data_inicio_dt = datetime.strptime(data_inicio, "%Y-%m-%d")
        data_fim_dt = datetime.strptime(data_fim, "%Y-%m-%d") + timedelta(days=1)
    except ValueError:
        return jsonify({"message": "Formato de data inválido! Use YYYY-MM-DD"}), 400
    
    total_arrecadado = db.session.query(func.sum(Jogo.valor_total)).filter(and_(Jogo.data_jogo >= data_inicio_dt, Jogo.data_jogo < data_fim_dt)).scalar() or 0
    total_premios = db.session.query(func.sum(Jogo.premio_total)).filter(and_(Jogo.data_jogo >= data_inicio_dt, Jogo.data_jogo < data_fim_dt)).scalar() or 0
    total_saques = db.session.query(func.sum(Saque.valor)).filter(and_(Saque.data_solicitacao >= data_inicio_dt, Saque.data_solicitacao < data_fim_dt)).scalar() or 0
    total_saques_concluidos = db.session.query(func.sum(Saque.valor)).filter(and_(Saque.data_processamento >= data_inicio_dt, Saque.data_processamento < data_fim_dt, Saque.status == "concluido")).scalar() or 0
    qtd_jogos = Jogo.query.filter(and_(Jogo.data_jogo >= data_inicio_dt, Jogo.data_jogo < data_fim_dt)).count()
    qtd_raspadinhas = db.session.query(func.sum(Jogo.quantidade_raspadinhas)).filter(and_(Jogo.data_jogo >= data_inicio_dt, Jogo.data_jogo < data_fim_dt)).scalar() or 0
    lucro = total_arrecadado - total_premios
    margem_lucro = (lucro / total_arrecadado * 100) if total_arrecadado > 0 else 0
    
    return jsonify({
        "periodo": {"inicio": data_inicio, "fim": data_fim},
        "financeiro": {
            "total_arrecadado": float(total_arrecadado),
            "total_premios": float(total_premios),
            "total_saques_solicitados": float(total_saques),
            "total_saques_concluidos": float(total_saques_concluidos),
            "lucro": float(lucro),
            "margem_lucro": float(margem_lucro)
        },
        "operacional": {
            "quantidade_jogos": qtd_jogos,
            "quantidade_raspadinhas": qtd_raspadinhas,
            "ticket_medio": float(total_arrecadado / qtd_jogos) if qtd_jogos > 0 else 0,
            "premio_medio": float(total_premios / qtd_jogos) if qtd_jogos > 0 else 0
        }
    }), 200

@admin_bp.route("/configuracoes", methods=["GET"])
@token_required
@admin_required
def get_configuracoes(current_user):
    """Retorna todas as configurações do sistema"""
    configuracoes = Configuracao.query.all()
    return jsonify({"configuracoes": [config.to_dict() for config in configuracoes]}), 200

@admin_bp.route("/configuracoes", methods=["POST"])
@token_required
@admin_required
def criar_configuracao(current_user):
    """Cria ou atualiza uma configuração do sistema"""
    data = request.get_json()
    if not data or "chave" not in data or "valor" not in data:
        return jsonify({"message": "Chave e valor são obrigatórios!"}), 400
    config = Configuracao.query.filter_by(chave=data["chave"]).first()
    if config:
        config.valor = data["valor"]
        if "descricao" in data:
            config.descricao = data["descricao"]
    else:
        config = Configuracao(chave=data["chave"], valor=data["valor"], descricao=data.get("descricao"))
        db.session.add(config)
    db.session.commit()
    return jsonify({"message": "Configuração salva com sucesso!", "configuracao": config.to_dict()}), 200

# --- Novas Rotas para Gerenciamento de Cupons de Parceiros --- 

@admin_bp.route("/partner-coupons", methods=["GET"])
@token_required
@admin_required
def get_partner_coupons(current_user):
    """Lista todos os cupons de parceiros"""
    coupons = PartnerCoupon.query.order_by(PartnerCoupon.created_at.desc()).all()
    return jsonify({"coupons": [coupon.to_dict() for coupon in coupons]}), 200

@admin_bp.route("/partner-coupons", methods=["POST"])
@token_required
@admin_required
def create_partner_coupon(current_user):
    """Cria um novo cupom de parceiro"""
    data = request.get_json()
    required_fields = ["code", "partner_name"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"message": f"Campo {field} é obrigatório!"}), 400
    
    # Verifica se o código já existe
    if PartnerCoupon.query.filter_by(code=data["code"]).first():
        return jsonify({"message": "Este código de cupom já está em uso!"}), 400
        
    new_coupon = PartnerCoupon(
        code=data["code"],
        partner_name=data["partner_name"],
        description=data.get("description")
    )
    
    try:
        db.session.add(new_coupon)
        db.session.commit()
        return jsonify({"message": "Cupom de parceiro criado com sucesso!", "coupon": new_coupon.to_dict()}), 201
    except exc.IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Erro: Código de cupom duplicado ou outro problema de integridade."}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao criar cupom: {e}")
        return jsonify({"message": "Erro interno ao criar cupom."}), 500

@admin_bp.route("/partner-coupons/<int:coupon_id>/toggle", methods=["PUT"])
@token_required
@admin_required
def toggle_partner_coupon(current_user, coupon_id):
    """Ativa ou desativa um cupom de parceiro"""
    coupon = PartnerCoupon.query.get(coupon_id)
    if not coupon:
        return jsonify({"message": "Cupom não encontrado!"}), 404
        
    coupon.is_active = not coupon.is_active
    db.session.commit()
    
    status = "ativado" if coupon.is_active else "desativado"
    return jsonify({"message": f"Cupom {status} com sucesso!", "coupon": coupon.to_dict()}), 200

@admin_bp.route("/partner-coupons/<int:coupon_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_partner_coupon(current_user, coupon_id):
    """Exclui um cupom de parceiro (alternativa: apenas desativar)"""
    coupon = PartnerCoupon.query.get(coupon_id)
    if not coupon:
        return jsonify({"message": "Cupom não encontrado!"}), 404
        
    # Opcional: Verificar se o cupom tem usos antes de excluir permanentemente
    # if coupon.usage_count > 0:
    #     return jsonify({"message": "Não é possível excluir cupons que já foram utilizados. Desative-o."}), 400
        
    try:
        db.session.delete(coupon)
        db.session.commit()
        return jsonify({"message": "Cupom excluído com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao excluir cupom: {e}")
        # Verificar se o erro é devido a FK constraint (usuários usaram o cupom)
        if "FOREIGN KEY constraint failed" in str(e):
             return jsonify({"message": "Erro ao excluir: Este cupom já foi utilizado por usuários. Considere desativá-lo."}), 400
        return jsonify({"message": "Erro interno ao excluir cupom."}), 500

@admin_bp.route("/reports/partner-usage", methods=["GET"])
@token_required
@admin_required
def report_partner_usage(current_user):
    """Retorna dados agregados sobre o uso de cupons de parceiros"""
    # Retorna todos os cupons com suas contagens de uso
    coupons_usage = PartnerCoupon.query.order_by(PartnerCoupon.usage_count.desc()).all()
    
    # Poderia adicionar filtros por data de cadastro do usuário, etc. se necessário
    
    return jsonify({"report": [coupon.to_dict() for coupon in coupons_usage]}), 200

