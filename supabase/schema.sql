-- B2C Operating System — Schema Completo
-- Execute este arquivo no Supabase Dashboard > SQL Editor

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
-- ROW LEVEL SECURITY (single user)
-- ============================================================
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON ideas FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON container_analyses FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON pipeline_events FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON problems FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON roadmap_items FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON metrics FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_all" ON learning_resources FOR ALL TO authenticated USING (true);
