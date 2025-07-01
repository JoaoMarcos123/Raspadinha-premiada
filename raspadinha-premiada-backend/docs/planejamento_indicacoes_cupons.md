# Planejamento Detalhado - Novas Funcionalidades

## 1. Sistema de Indicação para Usuários ("Convide 3 Amigos")

**Objetivo:** Permitir que usuários convidem amigos e ganhem 1 raspadinha bônus quando 3 amigos se cadastrarem usando seu código.

**Modificações no Banco de Dados (`src/models/user.py`):**

*   **Tabela `User`:**
    *   Adicionar campo `referral_code` (String, único, indexado): Código único gerado para cada usuário no momento do cadastro.
    *   Adicionar campo `referred_by_user_id` (Integer, ForeignKey para `users.id`, nullable): ID do usuário que o indicou.
    *   Adicionar campo `referral_count` (Integer, default 0): Contador de quantos amigos se cadastraram com sucesso usando o código deste usuário.
    *   Adicionar campo `referral_bonus_awarded` (Boolean, default False): Indica se o bônus de 1 raspadinha por 3 indicações já foi concedido.

**Modificações no Backend:**

*   **`src/routes/auth.py`:**
    *   Na rota `/register`:
        *   Após criar um `new_user`, gerar um `referral_code` único para ele (ex: usando `uuid` ou uma combinação).
        *   Aceitar um parâmetro opcional `referral_code_input` no JSON da requisição.
        *   Se `referral_code_input` for fornecido:
            *   Buscar o `referring_user` pelo `referral_code_input`.
            *   Se encontrado, atribuir `referring_user.id` ao campo `referred_by_user_id` do `new_user`.
            *   Incrementar `referring_user.referral_count`.
            *   Verificar se `referring_user.referral_count` é igual a 3 e `referring_user.referral_bonus_awarded` é False.
            *   Se sim, conceder o bônus (ver próximo ponto) e definir `referring_user.referral_bonus_awarded = True`.
            *   Salvar as alterações no `referring_user`.
*   **Nova Rota (ex: `src/routes/user.py` ou `auth.py`):**
    *   Criar rota `/profile/referral-info` (GET, protegida por `@token_required`):
        *   Retornar o `referral_code` e `referral_count` do usuário logado.
*   **Lógica de Concessão de Bônus:**
    *   **Onde?** Pode ser um novo campo na tabela `User` como `bonus_raspadinhas_available` (Integer, default 0) ou integrado ao fluxo de compra.
    *   **Sugestão:** Adicionar `bonus_raspadinhas_available` à tabela `User`. Quando o bônus for concedido, incrementar este campo.
    *   **Uso:** Na rota de compra de raspadinhas (`/jogos/comprar` em `jogos.py`?), permitir que o usuário use 1 raspadinha bônus se `bonus_raspadinhas_available > 0`. Decrementar o campo após o uso.

**Modificações no Frontend:**

*   **Página de Cadastro (`index.html` / `auth.js`):**
    *   Adicionar um campo opcional "Código de Indicação" no formulário de cadastro.
    *   Enviar o valor deste campo como `referral_code_input` na requisição para `/register`.
*   **Área do Usuário (ex: `profile.html` / `main.js` / `auth.js`):**
    *   Criar uma nova seção "Indique e Ganhe".
    *   Fazer uma chamada à API `/profile/referral-info` para obter o código e a contagem.
    *   Exibir o `referral_code` do usuário com um botão "Copiar".
    *   Mostrar o progresso: "Você indicou X de 3 amigos para ganhar uma raspadinha bônus!".
    *   Exibir o número de `bonus_raspadinhas_available`.
*   **Fluxo de Compra (`index.html` / `main.js` / `raspadinha-enhanced.js`):**
    *   Se o usuário tiver `bonus_raspadinhas_available > 0`, mostrar uma opção para "Usar Raspadinha Bônus" (talvez como um botão ou checkbox antes de confirmar a quantidade).
    *   Se usada, ajustar a chamada à API de compra para indicar o uso do bônus.

## 2. Sistema de Cupons para Parceiros/Influenciadores

**Objetivo:** Permitir que o administrador crie códigos únicos para parceiros, rastreie cadastros originados por esses códigos e visualize relatórios.

**Modificações no Banco de Dados (`src/models/user.py`):**

*   **Nova Tabela `PartnerCoupon`:**
    *   `id` (Integer, primary key)
    *   `code` (String, único, indexado): O código do cupom (ex: "INFLUENCER10").
    *   `partner_name` (String): Nome do parceiro/influenciador.
    *   `description` (Text, nullable): Descrição ou notas sobre o parceiro.
    *   `created_at` (DateTime, default `datetime.utcnow`)
    *   `is_active` (Boolean, default True): Para ativar/desativar o cupom.
    *   `usage_count` (Integer, default 0): Contador de quantos usuários se cadastraram com este cupom.
*   **Tabela `User`:**
    *   Adicionar campo `partner_coupon_id` (Integer, ForeignKey para `partner_coupons.id`, nullable): ID do cupom de parceiro usado no cadastro.

**Modificações no Backend:**

*   **`src/routes/auth.py`:**
    *   Na rota `/register`:
        *   Modificar a lógica de `referral_code_input`: Primeiro, verificar se o código corresponde a um `PartnerCoupon` ativo.
        *   Se for um cupom de parceiro válido:
            *   Atribuir o `partner_coupon.id` ao campo `partner_coupon_id` do `new_user`.
            *   Incrementar `partner_coupon.usage_count`.
            *   Salvar as alterações no `partner_coupon`.
            *   *Não* processar como indicação de usuário comum (ignorar busca por `referring_user`).
        *   Se *não* for um cupom de parceiro, *então* tentar processar como código de indicação de usuário comum (lógica da seção 1).
*   **Novas Rotas em `src/routes/admin.py`:**
    *   `/admin/partner-coupons` (GET, protegida por `@admin_required`): Listar todos os cupons de parceiros com suas informações (nome, código, contagem, status).
    *   `/admin/partner-coupons` (POST, protegida por `@admin_required`): Criar um novo cupom de parceiro (recebe `code`, `partner_name`, `description`). Validar unicidade do `code`.
    *   `/admin/partner-coupons/<int:coupon_id>/toggle` (PUT, protegida por `@admin_required`): Ativar/desativar um cupom (`is_active`).
    *   `/admin/partner-coupons/<int:coupon_id>` (DELETE, protegida por `@admin_required`): Excluir um cupom (cuidado com FK em `User` - talvez apenas desativar seja melhor).
    *   `/admin/reports/partner-usage` (GET, protegida por `@admin_required`): Retornar dados agregados sobre o uso de cupons (ex: lista de cupons com `usage_count`).

**Modificações no Frontend:**

*   **Página de Cadastro (`index.html` / `auth.js`):**
    *   O campo "Código de Indicação" existente será usado tanto para códigos de usuários quanto para cupons de parceiros. Nenhuma mudança extra necessária aqui, pois o backend fará a distinção.
*   **Painel Administrativo (`admin.html` / `admin.js`):**
    *   Criar uma nova seção "Cupons de Parceiros".
    *   Implementar interface para:
        *   Listar cupons existentes (tabela com código, nome, contagem, status, ações).
        *   Criar novo cupom (formulário com campos necessários).
        *   Botões para ativar/desativar cupons.
        *   (Opcional) Botão para excluir.
    *   Criar uma nova sub-seção em "Relatórios" chamada "Uso de Cupons".
    *   Exibir os dados retornados pela API `/admin/reports/partner-usage` (ex: tabela ou gráfico mostrando quantos cadastros vieram de cada cupom).

---

**Próximos Passos:**

1.  **Refinar o Modelo de Dados:** Confirmar os campos e relacionamentos.
2.  **Implementar Backend:** Criar/modificar modelos, rotas e lógica.
3.  **Implementar Frontend:** Criar/modificar interfaces de usuário e admin.
4.  **Testes:** Validar ambos os fluxos.

Este é o plano detalhado. Vou começar a trabalhar na implementação do backend, começando pelas modificações no modelo de dados.
