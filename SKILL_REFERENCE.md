# SKILL_REFERENCE.md — ideia-b2c

> Este arquivo é a referência completa da skill que alimenta os containers inteligentes.
> O Claude Code deve ler este arquivo na Fase 5 antes de implementar qualquer chamada à IA.

---

## O que esta skill faz

A skill `ideia-b2c` é um avaliador estratégico especializado em produtos digitais B2C. Opera em dois modos:

1. **Modo Geração** — Cria ideias B2C completas a partir de palavras-chave ou tema
2. **Modo Avaliação** — Analisa viabilidade de mercado de uma ideia com rigor, usando 10 critérios ponderados

---

## Modo Avaliação — Os 10 Critérios

> Score de 0 a 10 por critério. Total: 100 pontos.

### ⚠️ Verificação OBRIGATÓRIA antes de qualquer nota: Concorrência Comportamental

Antes de pontuar qualquer critério, verificar:

> "O produto compete com inércia, evitação ou comportamento impulsivo do usuário?"

**Sinais de alerta:**
- A dor é **contornada** em vez de resolvida (ex: pedir delivery em vez de cozinhar)
- O usuário **convive** com a dor sem sentir urgência de eliminá-la
- Existem substitutos de **esforço zero** que resolvem "bem o suficiente" (ex: TikTok de receitas, ChatGPT)
- O comportamento que o produto quer mudar é **emocional ou impulsivo** por natureza

**Ação se 2+ sinais detectados:** emitir alerta crítico que eleva rigor nos critérios 3 (Dor Desejada) e 9 (Retenção).

---

### Critério 1: Tamanho do Mercado (TAM)
Estimativa do mercado endereçável usando proxies reais:
- Volume de buscas no Google Trends
- Apps similares no ranking de stores
- Número de comunidades online sobre o tema
- Dados públicos do setor

**Container:** Descoberta de Problemas

---

### Critério 2: Dor Recorrente
A dor existe de forma frequente e as pessoas já gastam dinheiro ou tempo tentando resolver?
Ou é um incômodo esporádico que ninguém pagaria para resolver?

Foco: **FREQUÊNCIA** e **IMPACTO CONCRETO** da dor.

**Container:** Descoberta de Problemas

---

### Critério 3: Dor Desejada ⚠️ (critério diferenciador)
As pessoas QUEREM ativamente resolver essa dor, ou convivem com ela / a evitam / a contornam?

Uma dor pode ser real e recorrente mas **não desejada**:
- Cozinhar: todos precisam, poucos querem resolver ativamente
- Fazer exercício: real e frequente, mas maioria contorna
- Organizar finanças: urgente na crise, esquecido depois

**Pergunta-chave:** "Se eu oferecesse a solução GRÁTIS hoje, a pessoa usaria todo dia?"

**Escala de notas:**
- 9–10: usuário busca ativamente soluções, já paga por alternativas imperfeitas
- 6–8: quer resolver, mas procrastina ou usa gambiarras
- 3–5: convive com a dor sem senso de urgência
- 0–2: dor é evitada ou contornada sistematicamente (ex: delivery, impulsividade)

**Container:** Comportamento Humano

---

### Critério 4: Disposição a Pagar
- Existe precedente de pagamento em produtos similares?
- O público-alvo tem renda compatível?
- Há urgência ou é "seria legal ter"?

Nota: dor profissional justifica assinatura mais facilmente que dor comportamental-pessoal.

**Container:** Monetização

---

### Critério 5: Diferencial Competitivo
O que torna esta ideia difícil de copiar em 6 meses?

**Diferenciais válidos:**
- Efeito de rede (valor cresce com mais usuários)
- Dados proprietários acumulados
- Marca forte em nicho específico
- Comunidade engajada
- Tecnologia proprietária não replicável

**Diferenciais que valem ZERO em 2025+:**
- "IA personalizada"
- "UX intuitiva"
- "Algoritmo proprietário"
- "Mais barato que a concorrência"

**Container:** Distribuição

---

### Critério 6: Velocidade de Validação
É possível testar a hipótese central em menos de 30 dias com menos de R$500?

Quanto menor o tempo e custo de validação, maior a pontuação.

**Container:** MVP + Validação

---

### Critério 7: Escalabilidade
O custo marginal de atender mais um cliente tende a zero?

Ou o modelo exige mais pessoas/infraestrutura a cada cliente novo?

Software puro: custo marginal → 0 = alta escalabilidade.
Serviço com mão de obra: custo cresce com clientes = baixa escalabilidade.

**Container:** Escala

---

### Critério 8: Risco Regulatório/Legal
Escala invertida (10 = sem risco).

**Setores de alto risco (notas baixas):**
- Saúde e diagnósticos
- Serviços financeiros e crédito
- Dados de menores (LGPD extra)
- Armas, álcool, apostas
- Educação regulamentada

**Container:** MVP

---

### Critério 9: Retenção Esperada D30/D90 ⚠️ (critério diferenciador)
Mede sustentação do produto, não só entrada.

**Pergunta:** Qual a probabilidade real de o usuário ainda estar ativo 30 e 90 dias após o cadastro?

**Escala de notas:**
- 9–10: uso diário natural, valor aumenta com o tempo (ex: gestor financeiro com histórico, app de idiomas com streak)
- 6–8: uso semanal plausível, algum lock-in por dados ou rotina
- 3–5: uso esporádico provável, fácil de abandonar sem culpa
- 0–2: produto de uma vez só, ou comportamento que o usuário abandona em dias

**Exemplos negativos (notas 0–2):**
- App de dieta (abandono em ~3 semanas)
- Planejador de refeições
- App de meditação sem gamificação
- Qualquer produto que resolve uma dor pontual

**Container:** Retenção

---

### Critério 10: Potencial de Nicho Defensável ⚠️ (critério diferenciador)
"App para todo mundo" vira commodity rápido.

**Nicho defensável tem:**
- Dor mais intensa que a média do mercado
- Disposição a pagar acima da média
- Comunidade própria onde o produto pode viralizar organicamente

**Exemplos de nicho forte:**
- Diabéticos (dor intensa + alta disposição a pagar)
- Mães de primeira viagem (comunidade ativa + alta urgência)
- Professores de escola pública (comunidade coesa + dor específica)
- Freelancers de design (comunidade online + já pagam por ferramentas)
- Donos de pet exótico (nicho específico com alta identificação)

**Exemplos de nicho fraco:**
- "Jovens de 18–35" — amplitude demais, sem coesão
- "Pessoas que gostam de saúde" — vago demais
- "Empreendedores" — saturado e heterogêneo

**Container:** Distribuição

---

## Veredictos por score total

| Score | Status | Significado |
|---|---|---|
| 80–100 | ✅ APROVADA | Alta viabilidade, vale aprofundar e executar |
| 60–79 | 🟡 CONDICIONAL | Validar hipóteses específicas antes de construir |
| 40–59 | 🟠 RISCO ALTO | Reavaliar modelo, nicho ou público-alvo |
| 0–39 | ❌ REPROVADA | Ideia não sustenta viabilidade de mercado atual |

---

## Modo Geração — Estrutura de Output

Para cada ideia gerada, a skill produz:

```
Título curto e marcante
Descrição (2-3 frases: o que é, como funciona, qual problema resolve)
Público-alvo:
  - Perfil primário (quem são, idade, contexto, renda)
  - Dor principal
  - Motivação de compra
Como aplicar:
  - Plataformas sugeridas (Web / Mobile / Desktop / Todos)
  - Modelo de negócio
  - MVP mínimo (o que testar em 4-8 semanas)
Estratégia de marketing:
  - Canal principal
  - 3 táticas de aquisição para os primeiros 100 usuários
  - Mensagem-chave (pitch de 1 frase)
Como validar antes de construir:
  - Método 1: Teste de demanda (landing page, pré-venda, formulário)
  - Método 2: Entrevistas (quem, quantas, o que perguntar)
  - Método 3: Proxy de mercado (produtos similares, volume de busca, comunidades)
  - Critério de go/no-go (ex: "50 cadastros em 2 semanas = seguimos")
```

---

## Critérios de escolha de plataforma (usado no modo Geração)

| Plataforma | Quando indicar |
|---|---|
| Web | Acesso rápido, sem instalação, colaboração, B2B leve, dashboard |
| Mobile | Uso em movimento, notificações push, câmera/GPS, hábito diário |
| Desktop | Produtividade intensa, arquivos locais, offline crítico, ferramentas profissionais |
| Todos | Quando serve múltiplos contextos — priorizar web-first |

---

## Regras de comportamento da skill (para os prompts da IA)

1. **Sempre gere E avalie** — não entregar ideias sem avaliação
2. **Seja direto nos veredictos** — não suavize pontuações baixas
3. **Verifique concorrência comportamental PRIMEIRO** — antes de qualquer nota
4. **Use dados reais como proxy** — apps conhecidos, tamanhos de mercado públicos
5. **Diferenciais genéricos valem zero** — "IA personalizada", "UX intuitiva" não são diferenciais
6. **Rigor extra em dor desejada e retenção** — são os critérios mais frequentemente superestimados por founders

---

## Mapeamento completo: critérios da skill → containers do sistema

| Critério da skill | Peso no container | Container primário | Container secundário |
|---|---|---|---|
| TAM (1) | 50% do score | Descoberta | — |
| Dor recorrente (2) | 50% do score | Descoberta | — |
| Dor desejada (3) | 60% do score | Comportamento Humano | — |
| Disposição a pagar (4) | 100% do score | Monetização | — |
| Diferencial competitivo (5) | 50% do score | Distribuição | Escala |
| Velocidade de validação (6) | 60% do score | MVP | Validação |
| Escalabilidade (7) | 100% do score | Escala | — |
| Risco regulatório (8) | 40% do score | MVP | — |
| Retenção D30/D90 (9) | 100% do score | Retenção | — |
| Nicho defensável (10) | 50% do score | Distribuição | — |
| Alerta comportamental | Bônus/penalidade global | Comportamento Humano | Todos |
