-- Reports table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('spam','harmful','inappropriate','other')),
  detail text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reporter_id, post_id)
);

-- RLS for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports: insert own" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports: read own" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- Blocks table
CREATE TABLE blocks (
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- RLS for blocks
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocks: manage own" ON blocks FOR ALL USING (auth.uid() = blocker_id);

-- Resonances table (mutual likes detected)
CREATE TABLE resonances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_a uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  post_b uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  seen boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_a, user_b)
);

-- RLS for resonances
ALTER TABLE resonances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resonances: read own" ON resonances FOR SELECT 
  USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "resonances: update own" ON resonances FOR UPDATE 
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Index for fast unseen count
CREATE INDEX idx_resonances_unseen ON resonances (user_a, user_b, seen) WHERE seen = false;
