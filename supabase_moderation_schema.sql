-- ============================================================
-- SECOND LIFE: ADMIN MODERATION & REPORTS SYSTEM DATABASE SCHEMA
-- ============================================================

-- 1. POLICY SECTIONS TABLE
CREATE TABLE IF NOT EXISTS policy_sections (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  full_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REPORT REASONS TABLE
CREATE TABLE IF NOT EXISTS report_reasons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  default_priority VARCHAR(20) CHECK (default_priority IN ('High', 'Medium', 'Low')),
  policy_section_id VARCHAR(50) REFERENCES policy_sections(id) ON DELETE SET NULL
);

-- 3. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(50) PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL,
  priority VARCHAR(20) CHECK (priority IN ('High', 'Medium', 'Low')),
  priority_type VARCHAR(20) CHECK (priority_type IN ('high', 'medium', 'low')),
  source VARCHAR(50) CHECK (source IN ('User Report', 'System Detected')),
  policy_key VARCHAR(50) REFERENCES policy_sections(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Resolved', 'Dismissed')),
  status_type VARCHAR(20) DEFAULT 'open' CHECK (status_type IN ('open', 'resolved', 'dismissed')),
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  accused_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REPORT EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS report_evidence (
  id SERIAL PRIMARY KEY,
  report_id VARCHAR(50) REFERENCES reports(id) ON DELETE CASCADE,
  summary TEXT,
  flagged_message_id VARCHAR(100),
  messages_json JSONB DEFAULT '[]'::jsonb,
  images_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MODERATION ACTIONS AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS moderation_actions (
  id VARCHAR(50) PRIMARY KEY,
  report_id VARCHAR(50) REFERENCES reports(id) ON DELETE SET NULL,
  moderator_name VARCHAR(100) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER WARNINGS TABLE
CREATE TABLE IF NOT EXISTS warnings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_id VARCHAR(50) REFERENCES reports(id) ON DELETE SET NULL,
  issued_by VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER SUSPENSIONS TABLE
CREATE TABLE IF NOT EXISTS suspensions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_id VARCHAR(50) REFERENCES reports(id) ON DELETE SET NULL,
  duration_days INT NOT NULL CHECK (duration_days IN (1, 7, 30)),
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- 8. BANNED USERS TABLE
CREATE TABLE IF NOT EXISTS banned_users (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  banned_by VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  banned_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXING FOR OPTIMAL PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_source ON reports(source);
CREATE INDEX IF NOT EXISTS idx_reports_accused ON reports(accused_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_report ON moderation_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_warnings_user ON warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_suspensions_user ON suspensions(user_id);

-- SEED INITIAL POLICY SECTIONS
INSERT INTO policy_sections (id, code, title, summary, full_text) VALUES
('EXTERNAL_PAYMENTS', 'Section A.2', 'External Payments & Off-Platform Settlement', 'Soliciting or accepting payment outside SecondLife secure checkout is strictly prohibited.', 'Section A.2: External Payments Policy\n1. All transactions must occur through integrated secure checkout.\n2. Soliciting off-platform payment via PayPal, Easypaisa, JazzCash, WhatsApp, or Bank Transfer results in suspension or ban.'),
('FRAUD_SCAM', 'Section D.3', 'Fraud & Scam Attempts', 'Attempting to deceive users or misrepresent high-value items leads to permanent expulsion.', 'Section D.3: Anti-Fraud & Scam Standards\n1. Deceptive behavior, fake tracking, or phishing links lead to immediate account bans.'),
('COUNTERFEIT', 'Section C.4', 'Counterfeit & Replica Items', 'Selling counterfeit or replica goods is illegal and strictly forbidden.', 'Section C.4: Authenticity Standards\n1. Counterfeit items will be deleted immediately and seller accounts suspended.'),
('HARASSMENT_ABUSE', 'Section B.1', 'Abusive Language & Harassment', 'Zero-tolerance policy against hate speech, abusive language, bullying, and harassment.', 'Section B.1: Respectful Conduct\n1. Profanity, slurs, and aggression in messages lead to warnings and account bans.'),
('GENERAL_GUIDELINES', 'Section G.1', 'General Community Guidelines', 'All users must abide by platform safety, spam prevention, and listing accuracy standards.', 'Section G.1: General Guidelines\n1. Ensure accurate listings and respectful community interaction.')
ON CONFLICT (id) DO NOTHING;

-- SEED INITIAL REPORT REASONS
INSERT INTO report_reasons (name, default_priority, policy_section_id) VALUES
('Suspicious Transaction', 'High', 'FRAUD_SCAM'),
('External Payment Request', 'Low', 'EXTERNAL_PAYMENTS'),
('Abusive Language', 'Medium', 'HARASSMENT_ABUSE'),
('Harassment', 'Medium', 'HARASSMENT_ABUSE'),
('Spam', 'Medium', 'GENERAL_GUIDELINES'),
('Fake Listing', 'Medium', 'GENERAL_GUIDELINES'),
('Counterfeit Item', 'High', 'COUNTERFEIT'),
('Fraud / Scam Attempt', 'High', 'FRAUD_SCAM'),
('Duplicate Listings', 'Low', 'GENERAL_GUIDELINES'),
('Fake Reviews', 'Medium', 'GENERAL_GUIDELINES'),
('Identity Impersonation', 'High', 'FRAUD_SCAM'),
('Inappropriate Content', 'Medium', 'HARASSMENT_ABUSE')
ON CONFLICT (name) DO NOTHING;
