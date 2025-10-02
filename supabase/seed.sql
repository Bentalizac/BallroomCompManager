-- Seed data for ballroom competition manager
-- Essential reference data only - no fake users

-- Clear existing data (in reverse dependency order)
DELETE FROM event_results;
DELETE FROM event_registration;
DELETE FROM event_info;
DELETE FROM category_ruleset;
DELETE FROM event_categories;
DELETE FROM rulesets;
DELETE FROM scoring_methods;
DELETE FROM competition_admins;
DELETE FROM comp_participant;
DELETE FROM comp_info;
-- Skip deleting from user_info since real users exist
DELETE FROM venue;

-- Insert sample venue
INSERT INTO venue (id, name, street, city, state, postal_code, country, google_maps_url) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Emerald Ballroom',
  '123 Dance Street',
  'San Francisco',
  'CA',
  '94102',
  'USA',
  'https://maps.google.com/?q=123+Dance+Street+San+Francisco+CA'
);

-- Insert essential reference data that doesn't depend on users

-- Insert scoring methods
INSERT INTO scoring_methods (id, name, description) VALUES 
  ('40000000-4000-4000-4000-400000000001', 'Placement System', 'Traditional ballroom placement scoring'),
  ('40000000-4000-4000-4000-400000000002', 'Point System', 'Numerical point-based scoring');

-- Insert rulesets
INSERT INTO rulesets (id, name, scoring_method_id) VALUES 
  ('50000000-5000-5000-5000-500000000001', 'International Standard', '40000000-4000-4000-4000-400000000001'),
  ('50000000-5000-5000-5000-500000000002', 'International Latin', '40000000-4000-4000-4000-400000000001'),
  ('50000000-5000-5000-5000-500000000003', 'American Smooth', '40000000-4000-4000-4000-400000000002');

-- Insert event categories
INSERT INTO event_categories (id, name) VALUES 
  ('60000000-6000-6000-6000-600000000001', 'Amateur'),
  ('60000000-6000-6000-6000-600000000002', 'Professional'),
  ('60000000-6000-6000-6000-600000000003', 'Pro-Am');

-- Insert category rulesets
INSERT INTO category_ruleset (id, category_id, ruleset_id) VALUES 
  ('70000000-7000-7000-7000-700000000001', '60000000-6000-6000-6000-600000000001', '50000000-5000-5000-5000-500000000001'),
  ('70000000-7000-7000-7000-700000000002', '60000000-6000-6000-6000-600000000001', '50000000-5000-5000-5000-500000000002'),
  ('70000000-7000-7000-7000-700000000003', '60000000-6000-6000-6000-600000000002', '50000000-5000-5000-5000-500000000003');

-- NOTE: Competitions, events, participants, and results are skipped
-- These require real user IDs from auth.users and will be created through the application

SELECT 'Essential seed data inserted successfully!' as message;
