-- Reference data required in every environment.
INSERT INTO roles (id, name, description) VALUES
  (1, 'student', 'Default learner / virtual trader'),
  (2, 'mentor', 'Can view cohort progress and author content'),
  (3, 'admin', 'Platform administration'),
  (4, 'super_admin', 'Full access incl. admin management')
ON CONFLICT (id) DO NOTHING;

INSERT INTO market_rules (id, label, value, severity, description) VALUES
  ('maxPositionPct',  'Max single-stock position %', '20', 'BLOCKING', 'Max % of portfolio value in one stock after the order'),
  ('maxSectorPct',    'Max sector exposure %',       '40', 'WARNING',  'Max % of portfolio value in one sector after the order'),
  ('maxOrderValuePct','Max order value %',           '25', 'WARNING',  'Single order value as % of portfolio value'),
  ('maxDailyOrders',  'Max orders per day',          '50', 'BLOCKING', 'Prevents spam / overtrading'),
  ('minCashBufferPct','Min cash buffer %',           '0',  'WARNING',  'Cash that should remain after the order'),
  ('allowShortSelling','Allow short selling',        'false','BLOCKING','Selling more than held quantity'),
  ('allowIntraday',   'Allow intraday (MIS)',        'true', 'BLOCKING','Enable MIS product'),
  ('highVolatilityThresholdPct','High volatility threshold %','45','WARNING','Annualised 30d volatility warning level')
ON CONFLICT (id) DO NOTHING;

INSERT INTO market_config (key, value, description) VALUES
  ('default_capital', '1000000', 'Virtual INR credited at signup'),
  ('slippage_bps', '5', 'Simulated slippage for market orders (basis points)'),
  ('brokerage_flat', '20', 'Simulated flat brokerage per executed order (INR)'),
  ('simulation_mode', '"live"', 'live | replay | frozen'),
  ('market_halted', 'false', 'Admin kill-switch for the simulated market')
ON CONFLICT (key) DO NOTHING;

INSERT INTO market_status (exchange, session, is_open) VALUES ('NSE', 'CLOSED', false)
ON CONFLICT (exchange) DO NOTHING;
