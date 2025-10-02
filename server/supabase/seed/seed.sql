-- Seed data for ballroom competition manager
-- This creates a complete mock competition for testing

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
DELETE FROM user_info;
DELETE FROM venue;

-- Insert venue
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

-- Insert users (these would normally come from auth.users via trigger)
-- Note: In real setup, these IDs should match auth.users IDs
INSERT INTO user_info (id, role, email, firstname, lastname) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user', 'admin@example.com', 'Alice', 'Admin'),
  ('22222222-2222-2222-2222-222222222222', 'user', 'judge1@example.com', 'Bob', 'Judge'),
  ('33333333-3333-3333-3333-333333333333', 'user', 'judge2@example.com', 'Carol', 'Scrutineer'),
  ('44444444-4444-4444-4444-444444444444', 'user', 'competitor1@example.com', 'David', 'Dancer'),
  ('55555555-5555-5555-5555-555555555555', 'user', 'competitor2@example.com', 'Eve', 'Partner'),
  ('66666666-6666-6666-6666-666666666666', 'user', 'competitor3@example.com', 'Frank', 'Solo'),
  ('77777777-7777-7777-7777-777777777777', 'user', 'competitor4@example.com', 'Grace', 'Lead');

-- Insert competition
INSERT INTO comp_info (id, name, start_date, end_date, venue_id) VALUES (
  '10000000-1000-1000-1000-100000000001',
  'Bay Area Open Championship 2024',
  '2024-11-15',
  '2024-11-17',
  '00000000-0000-0000-0000-000000000001'
);

-- Insert competition admin
INSERT INTO competition_admins (id, comp_id, user_id) VALUES (
  '20000000-2000-2000-2000-200000000001',
  '10000000-1000-1000-1000-100000000001',
  '11111111-1111-1111-1111-111111111111'
);

-- Insert competition participants with roles
INSERT INTO comp_participant (id, comp_id, user_id, role, participation_status) VALUES 
  ('30000000-3000-3000-3000-300000000001', '10000000-1000-1000-1000-100000000001', '11111111-1111-1111-1111-111111111111', 'organizer', 'active'),
  ('30000000-3000-3000-3000-300000000002', '10000000-1000-1000-1000-100000000001', '22222222-2222-2222-2222-222222222222', 'judge', 'active'),
  ('30000000-3000-3000-3000-300000000003', '10000000-1000-1000-1000-100000000001', '33333333-3333-3333-3333-333333333333', 'judge', 'active'),
  ('30000000-3000-3000-3000-300000000004', '10000000-1000-1000-1000-100000000001', '44444444-4444-4444-4444-444444444444', 'competitor', 'active'),
  ('30000000-3000-3000-3000-300000000005', '10000000-1000-1000-1000-100000000001', '55555555-5555-5555-5555-555555555555', 'competitor', 'active'),
  ('30000000-3000-3000-3000-300000000006', '10000000-1000-1000-1000-100000000001', '66666666-6666-6666-6666-666666666666', 'competitor', 'active'),
  ('30000000-3000-3000-3000-300000000007', '10000000-1000-1000-1000-100000000001', '77777777-7777-7777-7777-777777777777', 'competitor', 'active');

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

-- Insert events
INSERT INTO event_info (id, name, start_date, end_date, category_ruleset_id, comp_id, event_status) VALUES 
  ('80000000-8000-8000-8000-800000000001', 'Amateur Standard', '2024-11-15', '2024-11-15', '70000000-7000-7000-7000-700000000001', '10000000-1000-1000-1000-100000000001', 'scheduled'),
  ('80000000-8000-8000-8000-800000000002', 'Amateur Latin', '2024-11-16', '2024-11-16', '70000000-7000-7000-7000-700000000002', '10000000-1000-1000-1000-100000000001', 'current'),
  ('80000000-8000-8000-8000-800000000003', 'Professional Smooth', '2024-11-17', '2024-11-17', '70000000-7000-7000-7000-700000000003', '10000000-1000-1000-1000-100000000001', 'completed');

-- Insert event registrations
INSERT INTO event_registration (id, comp_participant_id, event_info_id, role, registration_status, partner_id) VALUES 
  -- Competitors in Amateur Standard
  ('90000000-9000-9000-9000-900000000001', '30000000-3000-3000-3000-300000000004', '80000000-8000-8000-8000-800000000001', 'competitor', 'active', '90000000-9000-9000-9000-900000000002'),
  ('90000000-9000-9000-9000-900000000002', '30000000-3000-3000-3000-300000000005', '80000000-8000-8000-8000-800000000001', 'competitor', 'active', '90000000-9000-9000-9000-900000000001'),
  ('90000000-9000-9000-9000-900000000003', '30000000-3000-3000-3000-300000000006', '80000000-8000-8000-8000-800000000001', 'competitor', 'active', null),
  
  -- Judges in Amateur Standard
  ('90000000-9000-9000-9000-900000000004', '30000000-3000-3000-3000-300000000002', '80000000-8000-8000-8000-800000000001', 'judge', 'active', null),
  ('90000000-9000-9000-9000-900000000005', '30000000-3000-3000-3000-300000000003', '80000000-8000-8000-8000-800000000001', 'scrutineer', 'active', null),
  
  -- Competitors in Amateur Latin
  ('90000000-9000-9000-9000-900000000006', '30000000-3000-3000-3000-300000000004', '80000000-8000-8000-8000-800000000002', 'competitor', 'active', '90000000-9000-9000-9000-900000000007'),
  ('90000000-9000-9000-9000-900000000007', '30000000-3000-3000-3000-300000000005', '80000000-8000-8000-8000-800000000002', 'competitor', 'active', '90000000-9000-9000-9000-900000000006'),
  ('90000000-9000-9000-9000-900000000008', '30000000-3000-3000-3000-300000000007', '80000000-8000-8000-8000-800000000002', 'competitor', 'active', null),
  
  -- Judges in Amateur Latin
  ('90000000-9000-9000-9000-900000000009', '30000000-3000-3000-3000-300000000002', '80000000-8000-8000-8000-800000000002', 'judge', 'active', null),
  ('90000000-9000-9000-9000-900000000010', '30000000-3000-3000-3000-300000000003', '80000000-8000-8000-8000-800000000002', 'scrutineer', 'active', null);

-- Insert event results for completed events
INSERT INTO event_results (id, event_registration_id, scoring_method_id, score, rank) VALUES 
  -- Results for Professional Smooth (completed event)
  ('A0000000-A000-A000-A000-A00000000001', '90000000-9000-9000-9000-900000000001', '40000000-4000-4000-4000-400000000001', 85.5, 1),
  ('A0000000-A000-A000-A000-A00000000002', '90000000-9000-9000-9000-900000000002', '40000000-4000-4000-4000-400000000001', 82.0, 2),
  ('A0000000-A000-A000-A000-A00000000003', '90000000-9000-9000-9000-900000000003', '40000000-4000-4000-4000-400000000001', 78.5, 3);

-- Update one event to completed status with results
UPDATE event_info SET event_status = 'completed' WHERE id = '80000000-8000-8000-8000-800000000003';

SELECT 'Seed data inserted successfully!' as message;
