-- ============================================================
-- Seed Crops
-- References farmer users by email sub-select
-- ============================================================

INSERT INTO crops (farmer_id, name, description, price, quantity, harvest_date) VALUES
  -- Juan dela Cruz's crops (Benguet)
  ((SELECT id FROM users WHERE email = 'juan@farm.com'), 'Organic Tomatoes',     'Vine-ripened organic tomatoes grown without pesticides.',            4.50,  120, '2026-04-15'),
  ((SELECT id FROM users WHERE email = 'juan@farm.com'), 'Highland Strawberries', 'Sweet strawberries from the highlands of Benguet.',                8.00,   80, '2026-04-01'),
  ((SELECT id FROM users WHERE email = 'juan@farm.com'), 'Fresh Lettuce',         'Crisp iceberg and romaine lettuce mix.',                           3.00,  200, '2026-03-25'),
  ((SELECT id FROM users WHERE email = 'juan@farm.com'), 'Carrots',               'Fresh orange carrots, naturally grown.',                           2.50,  300, '2026-04-10'),

  -- Maria Santos's crops (Nueva Ecija)
  ((SELECT id FROM users WHERE email = 'maria@farm.com'), 'Basmati Rice',         'Premium long-grain basmati rice from local paddies.',              6.00,  500,  NULL),
  ((SELECT id FROM users WHERE email = 'maria@farm.com'), 'Jasmine Rice',         'Fragrant jasmine rice, freshly milled.',                          5.50,  600,  NULL),
  ((SELECT id FROM users WHERE email = 'maria@farm.com'), 'Sweet Corn',           'Fresh sweet corn harvested at peak sweetness.',                   2.00,  300, '2026-04-20'),
  ((SELECT id FROM users WHERE email = 'maria@farm.com'), 'Red Onions',           'Locally grown red onions, perfect for cooking.',                  3.50,  250, '2026-04-05'),

  -- Pedro Reyes's crops (Pangasinan)
  ((SELECT id FROM users WHERE email = 'pedro@farm.com'), 'Bangus (Milkfish)',    'Fresh bangus from Dagupan fish farms.',                          12.00,  100, '2026-03-30'),
  ((SELECT id FROM users WHERE email = 'pedro@farm.com'), 'Mangoes',              'Sweet Carabao mangoes, the best in the Philippines.',             7.00,  150, '2026-05-01'),
  ((SELECT id FROM users WHERE email = 'pedro@farm.com'), 'Garlic',               'Pungent garlic bulbs, sun-dried and ready for market.',           4.00,  400, '2026-04-12'),
  ((SELECT id FROM users WHERE email = 'pedro@farm.com'), 'Eggplant',             'Long purple eggplants, freshly harvested.',                      2.80,  180, '2026-04-08');
