-- =====================================================================
-- Row Level Security (Supabase). Skipped automatically on plain Postgres
-- where the `auth` schema does not exist.
-- The backend uses the service-role key and bypasses RLS; these policies
-- protect against direct client access with the anon key.
-- =====================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    -- user-owned tables
    EXECUTE 'ALTER TABLE users ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY users_self ON users FOR SELECT USING (id = auth.uid())';

    EXECUTE 'ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY watchlists_owner ON watchlists USING (user_id = auth.uid())';

    EXECUTE 'ALTER TABLE orders ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY orders_owner_read ON orders FOR SELECT USING (user_id = auth.uid())';

    EXECUTE 'ALTER TABLE trades ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY trades_owner_read ON trades FOR SELECT USING (user_id = auth.uid())';

    EXECUTE 'ALTER TABLE funds ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY funds_owner_read ON funds FOR SELECT USING (user_id = auth.uid())';

    EXECUTE 'ALTER TABLE transactions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY tx_owner_read ON transactions FOR SELECT USING (user_id = auth.uid())';

    EXECUTE 'ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY ai_conv_owner ON ai_conversations USING (user_id = auth.uid())';

    -- admin-only tables: no anon/auth policies => only service role can access
    EXECUTE 'ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE market_rules ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE market_config ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;
