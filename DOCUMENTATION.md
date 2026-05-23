# B2C Operating System — Documentação Mestre

> Referência técnica e estratégica para o Claude Code usar em todas as fases de desenvolvimento.
> Este arquivo deve ser lido no início de CADA fase antes de qualquer código.

---

## 1. Visão do Sistema

**Nome:** B2C Operating System  
**Propósito:** Painel operacional pessoal para descoberta, validação, distribuição e escala de produtos digitais B2C.  
**Usuário:** Single-user (founder). Sem multitenancy. Sem sistema de registro público.  
**Filosofia de design:** War room para produtos digitais — clareza mental, direção, foco, controle estratégico.  
**Inspiração visual:** Linear, Notion, Raycast, Arc Browser, dashboards de IA modernos.

---

## 2. Stack Técnica

```
Framework:     Next.js 15 (App Router) + TypeScript strict
Estilo:        Tailwind CSS v3 + shadcn/ui (components)
Banco:         Supabase (PostgreSQL + Auth + Realtime)
Auth:          Supabase Auth — email/password, single user
Estado:        Zustand (slices por módulo)
Formulários:   React Hook Form + Zod
Gráficos:      Recharts (composable, performático, clean)
Animações:     Framer Motion
Drag & Drop:   @dnd-kit/core + @dnd-kit/sortable (Pipeline Kanban)
Ícones:        Lucide React (já incluso no shadcn)
Datas:         date-fns
Utilitários:   clsx, tailwind-merge (já via shadcn)
Deploy:        Vercel
```

**Por que esta stack:**
- Next.js App Router + Supabase SSR = queries no servidor, dashboard carrega instantâneo
- shadcn/ui = componentes copiados no projeto, 100% customizáveis, visual premium
- Recharts = melhor custo-benefício entre performance e customização visual
- @dnd-kit = mais leve e acessível que react-beautiful-dnd
- Framer Motion = animações declarativas, smooth, production-grade

---

## 3. Estrutura de Pastas

```
b2cos/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Layout com sidebar
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── ideas/
│   │   │   ├── page.tsx            # Lista de ideias
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Detalhe da ideia + containers
│   │   ├── pipeline/
│   │   │   └── page.tsx            # Kanban pipeline
│   │   ├── problems/
│   │   │   └── page.tsx            # Biblioteca de problemas
│   │   ├── roadmap/
│   │   │   └── page.tsx            # Roadmap visual
│   │   ├── metrics/
│   │   │   └── page.tsx            # Métricas e gráficos
│   │   └── learning/
│   │       └── page.tsx            # Sistema de aprendizado
│   ├── api/
│   │   └── [...route]/             # API routes se necessário
│   ├── globals.css
│   └── layout.tsx                  # Root layout
├── components/
│   ├── ui/                         # shadcn components (gerados)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── command-palette.tsx
│   ├── ideas/
│   │   ├── idea-card.tsx
│   │   ├── idea-form.tsx
│   │   └── idea-filters.tsx
│   ├── containers/
│   │   ├── container-card.tsx
│   │   ├── container-analysis.tsx
│   │   └── score-gauge.tsx
│   ├── pipeline/
│   │   ├── pipeline-board.tsx
│   │   ├── pipeline-column.tsx
│   │   └── pipeline-card.tsx
│   ├── dashboard/
│   │   ├── metric-card.tsx
│   │   ├── activity-feed.tsx
│   │   └── bottleneck-alert.tsx
│   └── shared/
│       ├── score-badge.tsx
│       ├── status-badge.tsx
│       ├── tag-input.tsx
│       └── empty-state.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client (App Router)
│   │   └── middleware.ts
│   ├── scoring.ts                  # Lógica de score estratégico
│   ├── pipeline-rules.ts           # Gates de avanço por etapa
│   ├── container-criteria.ts       # Critérios por container
│   └── utils.ts
├── store/
│   ├── ideas.store.ts
│   ├── pipeline.store.ts
│   └── ui.store.ts
├── types/
│   └── index.ts                    # Todas as interfaces globais
├── middleware.ts                   # Auth guard
└── supabase/
    └── schema.sql                  # Schema completo do banco
```

---

## 4. Schema Completo do Supabase

```sql
-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- IDEIAS
-- ============================================================
CREATE TABLE ideas (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT,
  main_pain             TEXT,
  pain_frequency        TEXT CHECK (pain_frequency IN ('daily','weekly','monthly','rarely')),
  pain_intensity        INTEGER CHECK (pain_intensity BETWEEN 1 AND 10),
  recurrence            TEXT CHECK (recurrence IN ('high','medium','low')),
  retention_potential   INTEGER CHECK (retention_potential BETWEEN 1 AND 10),
  distribution_difficulty INTEGER CHECK (distribution_difficulty BETWEEN 1 AND 10),
  monetization_notes    TEXT,
  competition_level     TEXT CHECK (competition_level IN ('none','low','medium','high','saturated')),
  complexity            INTEGER CHECK (complexity BETWEEN 1 AND 10),
  risk                  INTEGER CHECK (risk BETWEEN 1 AND 10),
  target_segment        TEXT,
  market_size           TEXT,
  observations          TEXT,
  insights              TEXT,
  score                 NUMERIC(4,1) DEFAULT 0,
  status                TEXT DEFAULT 'active' CHECK (status IN ('active','archived','discarded')),
  pipeline_stage        TEXT DEFAULT 'epiphany' CHECK (pipeline_stage IN (
                          'epiphany','triage','validation','mvp','launch',
                          'retention','monetization','scale')),
  tags                  TEXT[] DEFAULT '{}',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANÁLISES DOS CONTAINERS
-- ============================================================
CREATE TABLE container_analyses (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id        UUID REFERENCES ideas(id) ON DELETE CASCADE,
  container_type TEXT NOT NULL CHECK (container_type IN (
                   'discovery','validation','retention','distribution',
                   'mvp','monetization','scale','behavior')),
  score          INTEGER CHECK (score BETWEEN 0 AND 100),
  approved       BOOLEAN,
  answers        JSONB DEFAULT '{}',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, container_type)
);

-- ============================================================
-- EVENTOS DO PIPELINE (audit trail)
-- ============================================================
CREATE TABLE pipeline_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id     UUID REFERENCES ideas(id) ON DELETE CASCADE,
  from_stage  TEXT,
  to_stage    TEXT,
  notes       TEXT,
  blocked     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BIBLIOTECA DE PROBLEMAS
-- ============================================================
CREATE TABLE problems (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title               TEXT NOT NULL,
  description         TEXT,
  frequency           TEXT CHECK (frequency IN ('daily','weekly','monthly','rarely')),
  emotional_intensity INTEGER CHECK (emotional_intensity BETWEEN 1 AND 10),
  source              TEXT CHECK (source IN ('observation','interview','personal','research','social')),
  real_quote          TEXT,
  behavior_pattern    TEXT,
  tags                TEXT[] DEFAULT '{}',
  related_idea_ids    UUID[] DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROADMAP
-- ============================================================
CREATE TABLE roadmap_items (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  plan_type    TEXT DEFAULT 'A' CHECK (plan_type IN ('A','B')),
  timeframe    TEXT DEFAULT 'short' CHECK (timeframe IN ('short','medium','long')),
  status       TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','blocked')),
  priority     TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  is_milestone BOOLEAN DEFAULT FALSE,
  idea_id      UUID REFERENCES ideas(id) ON DELETE SET NULL,
  due_date     DATE,
  order_index  INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MÉTRICAS
-- ============================================================
CREATE TABLE metrics (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id        UUID REFERENCES ideas(id) ON DELETE CASCADE,
  product_name   TEXT,
  date           DATE NOT NULL,
  d1_retention   NUMERIC(5,2),
  d7_retention   NUMERIC(5,2),
  d30_retention  NUMERIC(5,2),
  churn_rate     NUMERIC(5,2),
  mrr            NUMERIC(12,2),
  cac            NUMERIC(10,2),
  ctr            NUMERIC(5,2),
  new_users      INTEGER,
  active_users   INTEGER,
  custom_metrics JSONB DEFAULT '{}',
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SISTEMA DE APRENDIZADO
-- ============================================================
CREATE TABLE learning_resources (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title                TEXT NOT NULL,
  type                 TEXT DEFAULT 'note' CHECK (type IN (
                         'book','article','framework','note','study','insight')),
  author               TEXT,
  description          TEXT,
  progress             INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  key_insights         TEXT[] DEFAULT '{}',
  actionable_notes     TEXT,
  applied_to_idea_ids  UUID[] DEFAULT '{}',
  tags                 TEXT[] DEFAULT '{}',
  url                  TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_containers_updated_at
  BEFORE UPDATE ON container_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_problems_updated_at
  BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_roadmap_updated_at
  BEFORE UPDATE ON roadmap_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_learning_updated_at
  BEFORE UPDATE ON learning_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (single user — simplificado)
-- ============================================================
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário autenticado acessa tudo (single-user)
CREATE POLICY "auth_all" ON ideas FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON container_analyses FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON pipeline_events FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON problems FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON roadmap_items FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON metrics FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON learning_resources FOR ALL TO authenticated USING (true);
```

---

## 5. Sistema de Score Estratégico

O score de cada ideia é calculado automaticamente em `lib/scoring.ts` com base em 8 critérios ponderados. **Escala: 0–100 pontos.**

### Pesos e Critérios

| Critério | Peso | Campo fonte | Lógica |
|---|---|---|---|
| Retenção potencial | 25% | `retention_potential` (1–10) | `valor / 10 * 25` |
| Frequência da dor | 20% | `pain_frequency` | daily=20, weekly=15, monthly=8, rarely=2 |
| Monetização | 20% | `recurrence` | high=20, medium=13, low=6 |
| Distribuição | 15% | `distribution_difficulty` (1–10, invertido) | `(10 - valor) / 10 * 15` |
| Comportamento humano | 10% | `pain_intensity` (1–10) | `valor / 10 * 10` |
| Complexidade (inverso) | 5% | `complexity` (1–10) | `(10 - valor) / 10 * 5` |
| Risco (inverso) | 5% | `risk` (1–10) | `(10 - valor) / 10 * 5` |

**Score total = soma de todos os pontos (0–100)**

### Classificação

| Faixa | Classificação | Cor |
|---|---|---|
| 80–100 | 🔥 Oportunidade crítica | Verde |
| 60–79 | ✅ Alta prioridade | Azul |
| 40–59 | ⚠️ Potencial moderado | Amarelo |
| 20–39 | 🔻 Baixo potencial | Laranja |
| 0–19 | ❌ Descartar | Vermelho |

---

## 6. Containers — Critérios Detalhados

Cada container tem perguntas com pontuação própria (0–100), critério de aprovação, e alertas.

---

### Container 1: Descoberta de Problemas 🔍

**Objetivo:** Validar se a dor é real, intensa e frequente o suficiente.

**Perguntas e pontuação:**

| Pergunta | Opções | Pontos |
|---|---|---|
| Intensidade da dor (1–10) | Slider | `valor * 10` |
| O usuário busca solução ativamente? | Sim=30 / Às vezes=15 / Não=0 | — |
| Frequência da dor | Diária=40 / Semanal=25 / Mensal=10 / Raramente=0 | — |
| Custo atual da dor | Alto (tempo+dinheiro)=20 / Médio=10 / Baixo=0 | — |
| Segmento-alvo definido? | Muito claro=10 / Vago=3 / Indefinido=0 | — |

**Score:** Média ponderada (0–100)  
**✅ Aprovado se:** intensidade ≥ 7 E frequência ≥ semanal E busca ativa = Sim  
**🚨 Alerta vermelho:** intensidade < 5 OU frequência = raramente  
**Perguntas críticas:**
- Quem sofre isso mais de uma vez por semana?
- Quanto tempo ou dinheiro essa dor custa hoje?
- Existe comportamento compensatório (workaround)?

---

### Container 2: Validação 🧪

**Objetivo:** Distinguir interesse genuíno de curiosidade passiva.

**Perguntas e pontuação:**

| Pergunta | Opções | Pontos |
|---|---|---|
| Número de entrevistas realizadas | ≥10=30 / 5–9=20 / 1–4=10 / 0=0 | — |
| Fake door / landing page com CTA real? | Sim com dados=35 / Criada sem dados=15 / Não=0 | — |
| Taxa de sinalização de interesse (CTR/waitlist) | >15%=25 / 5–15%=15 / <5%=5 / Sem dados=0 | — |
| Risco de viés de confirmação | Baixo=10 / Médio=5 / Alto=0 | — |

**Score:** Soma (0–100)  
**✅ Aprovado se:** ≥ 3 sinais independentes de interesse real (entrevistas OU dados de landing)  
**🚨 Alerta vermelho:** Zero entrevistas OU apenas validação com amigos/família  
**Benchmarks de referência:**
- CTR de interesse > 15% = forte sinal
- Waitlist com conversão > 20% = validado
- Entrevistas: mínimo 5 pessoas fora do círculo pessoal

---

### Container 3: Retenção 🔄

**Objetivo:** Avaliar se o produto tem potencial de hábito.

**Perguntas e pontuação:**

| Pergunta | Opções | Pontos |
|---|---|---|
| Existe loop de habituação natural? | Forte=30 / Fraco=15 / Nenhum=0 | — |
| D1 projetado | >40%=25 / 25–40%=15 / <25%=5 | — |
| D7 projetado | >20%=25 / 10–20%=15 / <10%=5 | — |
| D30 projetado | >10%=15 / 5–10%=10 / <5%=3 | — |
| Custo de troca cresce com uso? | Sim=5 / Não=0 | — |

**Score:** Soma (0–100)  
**✅ Aprovado se:** loop de habituação presente E D30 projetado > 10%  
**🚨 Alerta vermelho:** D30 < 5% OU sem loop identificável  
**Benchmarks B2C (2024/2025):**
- D1 mediana geral: 26% | Bom: >35% | Excelente: >45%
- D7 mediana geral: 13% | Bom: >20% | Excelente: >30%
- D30 mediana geral: 7% | Bom: >10% | Excelente: >20%
- Apps de produtividade/social: D30 > 15% = forte

---

### Container 4: Distribuição 📡

**Objetivo:** Avaliar se o produto pode crescer de forma orgânica e escalável.

**Perguntas e pontuação:**

| Pergunta | Opções | Pontos |
|---|---|---|
| Canal primário de aquisição identificado? | Claro e testável=30 / Hipótese=15 / Indefinido=0 | — |
| Potencial SEO (volume de busca para o problema) | Alto=25 / Médio=15 / Baixo=5 / Inexistente=0 | — |
| Potencial viral / compartilhamento natural | Alto (produto usado em público)=25 / Médio=15 / Baixo=5 | — |
| CAC estimado < 20% do LTV esperado? | Sim=20 / Incerto=8 / Não=0 | — |

**Score:** Soma (0–100)  
**✅ Aprovado se:** ≥ 1 canal orgânico escalável identificado E CAC/LTV viável  
**🚨 Alerta vermelho:** 100% dependência de paid ads OU K-factor < 0.1  
**Perguntas críticas:**
- Por que alguém indicaria esse produto?
- Existe SEO intent forte (buscas com intenção de resolver)?

---

### Container 5: MVP 🛠️

**Objetivo:** Garantir que o menor escopo possível seja construído primeiro.

**Perguntas e pontuação:**

| Pergunta | Opções | Pontos |
|---|---|---|
| MVP definido em ≤ 3 features? | Sim=30 / 4–5 features=15 / Mais de 5=0 | — |
| Tempo estimado de build | <2 semanas=40 / 2–4 semanas=25 / 1–2 meses=10 / >2 meses=0 | — |
| Feature de diferenciação clara? | Sim=20 / Parcial=10 / Não=0 | — |
| Hipótese principal testável pelo MVP? | Sim=10 / Parcial=5 / Não=0 | — |

**Score:** Soma (0–100)  
**✅ Aprovado se:** build ≤ 4 semanas E MVP ≤ 3 features E hipótese testável  
**🚨 Alerta vermelho:** MVP > 8 features OU build > 2 meses  
**Regra de ouro:** Se não consegue descrever o MVP em 1 frase, ainda não está pronto.

---

### Container 6: Monetização 💰

**Objetivo:** Validar o modelo financeiro antes de construir.

**Perguntas e pontuação:**

| Pergunta | Opções | Pontos |
|---|---|---|
| Modelo de monetização definido? | Claro e testado=30 / Hipótese=15 / Indefinido=0 | — |
| LTV/CAC estimado | ≥5:1=30 / 3–5:1=20 / 1–3:1=8 / <1:1=0 | — |
| Recorrência do pagamento | Mensal/anual=25 / Transacional=12 / One-time=5 | — |
| Payback period | <6 meses=15 / 6–12 meses=10 / >12 meses=3 | — |

**Score:** Soma (0–100)  
**✅ Aprovado se:** LTV/CAC ≥ 3:1 E modelo com alguma recorrência  
**🚨 Alerta vermelho:** LTV/CAC < 1:1 OU one-time sem upsell claro  
**Benchmarks:**
- LTV/CAC mínimo sustentável: 3:1
- LTV/CAC excelente: 5:1+
- Payback ideal: < 12 meses

---

### Container 7: Escala 🚀

**Objetivo:** Avaliar se o produto pode crescer sem dependência linear do fundador.

**Perguntas e pontuação:**

| Pergunta | Opções | Pontos |
|---|---|---|
| % de operações principais automatizáveis | >80%=35 / 50–80%=20 / <50%=8 | — |
| Dependência do fundador em ops críticas | <20%=30 / 20–50%=15 / >50%=0 | — |
| Unit economics melhora com escala? | Sim (custos marginais decrescentes)=25 / Neutro=12 / Piora=0 | — |
| Processos documentados e replicáveis? | Sim=10 / Parcialmente=5 / Não=0 | — |

**Score:** Soma (0–100)  
**✅ Aprovado se:** automação > 50% E dependência do fundador < 30%  
**🚨 Alerta vermelho:** fundador necessário para cada entrega OU custo linear com usuários

---

### Container 8: Comportamento Humano 🧠

**Objetivo:** Avaliar alinhamento com motivações psicológicas reais.

**Perguntas e pontuação:**

| Pergunta | Opções | Pontos |
|---|---|---|
| Gatilho emocional primário identificado? | Forte e claro=30 / Fraco=12 / Ausente=0 | — |
| Resolve medo (perda) ou desejo (ganho)? | Medo (mais poderoso)=25 / Desejo=18 / Neutro=5 | — |
| Nível de conveniência / redução de friction | Alta=25 / Média=12 / Baixa=3 | — |
| Identidade do usuário envolvida? | Sim (status, pertencimento)=15 / Não=5 | — |
| Momento de uso definido? | Claro (trigger + contexto)=5 / Vago=2 | — |

**Score:** Soma (0–100)  
**✅ Aprovado se:** gatilho emocional claro E alta conveniência  
**🚨 Alerta vermelho:** produto neutro emocionalmente OU aumenta friction

---

## 7. Pipeline — Stages e Gates de Avanço

### Stages

| Stage | Descrição |
|---|---|
| `epiphany` | Ideia recém-capturada, mínimo preenchimento |
| `triage` | Campos básicos preenchidos, score calculado |
| `validation` | Sinais reais sendo coletados |
| `mvp` | Produto sendo construído |
| `launch` | Produto lançado para primeiros usuários |
| `retention` | Medindo D1/D7/D30, iterando no produto |
| `monetization` | Ativando cobrança, medindo MRR/churn |
| `scale` | Crescimento sustentável, automação em curso |

### Gates (critérios mínimos em `lib/pipeline-rules.ts`)

```typescript
epiphany → triage:
  - name preenchido
  - description preenchido
  - main_pain preenchido

triage → validation:
  - score >= 50
  - pain_intensity >= 5
  - pain_frequency != null
  - retention_potential preenchido
  - container Discovery aprovado

validation → mvp:
  - container Validation aprovado
  - container Behavior aprovado
  - score >= 60
  - Pelo menos 3 sinais reais (answers.validation_signals >= 3)

mvp → launch:
  - container MVP aprovado
  - container Monetization aprovado (score >= 60)
  - MVP construído confirmado (campo no container MVP)

launch → retention:
  - Pelo menos 7 dias de dados reais
  - D1 registrado em metrics

retention → monetization:
  - D7 >= 15% (registrado em metrics)
  - container Retention aprovado
  - Padrão de uso consistente (>= 2 semanas de dados)

monetization → scale:
  - MRR > 0 registrado
  - Churn < 8% mensal
  - container Monetization score >= 70
  - LTV/CAC >= 3

scale:
  - container Scale aprovado
  - Processo documentado
```

---

## 8. Design System — Tokens e Diretrizes

### Paleta de Cores (dark mode base)

```css
/* Backgrounds */
--bg-primary:    #0A0A0B    /* fundo principal */
--bg-secondary:  #111113    /* cards */
--bg-tertiary:   #18181B    /* hover, inputs */
--bg-elevated:   #1C1C1F    /* modais, dropdowns */

/* Texto */
--text-primary:   #FAFAFA
--text-secondary: #A1A1AA
--text-muted:     #52525B

/* Bordas */
--border-subtle:  #27272A
--border-default: #3F3F46
--border-strong:  #52525B

/* Accent */
--accent-primary: #6366F1   /* indigo — ações principais */
--accent-hover:   #4F46E5

/* Semântico */
--success:  #22C55E
--warning:  #F59E0B
--danger:   #EF4444
--info:     #3B82F6

/* Containers (cores únicas por container) */
--c-discovery:    #8B5CF6   /* violet */
--c-validation:   #3B82F6   /* blue */
--c-retention:    #10B981   /* emerald */
--c-distribution: #F59E0B   /* amber */
--c-mvp:          #6366F1   /* indigo */
--c-monetization: #22C55E   /* green */
--c-scale:        #EC4899   /* pink */
--c-behavior:     #EF4444   /* red */
```

### Tipografia

```css
font-family: 'Inter', -apple-system, sans-serif
font-sizes: 11px (micro), 12px (label), 13px (body-sm), 14px (body), 16px (subtitle), 20px (title), 24px+ (display)
font-weights: 400 (regular), 500 (medium), 600 (semibold)
```

### Glassmorphism (leve, apenas em modais e cards destacados)

```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.06);
```

### Animações padrão (Framer Motion)

```typescript
// Entrada de página
pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } }
}

// Card hover
cardHover = { scale: 1.01, transition: { duration: 0.15 } }

// Fade in list items
staggerChildren = { staggerChildren: 0.05 }
```

---

## 9. Módulos — Resumo Completo

| Módulo | Route | Fase | Prioridade |
|---|---|---|---|
| Dashboard Principal | `/` | 2 | Alta |
| Banco de Ideias | `/ideas` | 1 | Crítica |
| Detalhe da Ideia + Containers | `/ideas/[id]` | 1 | Crítica |
| Pipeline Kanban | `/pipeline` | 2 | Alta |
| Biblioteca de Problemas | `/problems` | 3 | Média |
| Roadmap Visual | `/roadmap` | 3 | Média |
| Sistema de Métricas | `/metrics` | 3 | Alta |
| Sistema de Aprendizado | `/learning` | 4 | Baixa |

---

## 10. Variáveis de Ambiente Necessárias

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # apenas server-side
```

---

## 11. Regras de Código

1. **TypeScript strict** — sem `any`, sem `ts-ignore` injustificado
2. **Server Components por padrão** — `'use client'` só quando necessário
3. **Supabase no servidor** — queries principais em Server Components ou Server Actions
4. **Zustand só para UI state** — estado de modais, filtros, seleção local
5. **Zod em todo input do usuário** — validação antes de qualquer query ao banco
6. **Error boundaries** — todo módulo tem tratamento de erro visível
7. **Loading states** — Skeleton components em todo carregamento assíncrono
8. **Sem `console.log` em produção** — apenas `console.error` com contexto
9. **Componentes < 200 linhas** — extrair quando crescer
10. **Nomes em inglês no código**, comentários e UI em português

---

## 12. Fases de Desenvolvimento

| Fase | Escopo | Estimativa |
|---|---|---|
| **Fase 1** | Setup + Auth + Layout + Banco de Ideias + Containers | ~6–8h de build |
| **Fase 2** | Pipeline Kanban + Score Engine + Dashboard Principal | ~5–6h de build |
| **Fase 3** | Métricas + Biblioteca de Problemas + Roadmap | ~5–6h de build |
| **Fase 4** | Aprendizado + Command Palette + Animações + Polish | ~4–5h de build |

---

*Última atualização: Fase inicial — manter este documento atualizado ao fim de cada fase.*
