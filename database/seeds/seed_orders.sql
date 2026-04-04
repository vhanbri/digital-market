-- ============================================================
-- Seed Orders
-- Creates sample orders in different statuses
-- ============================================================

-- Ana Garcia places an order (pending)
WITH buyer AS (SELECT id FROM users WHERE email = 'ana@buyer.com'),
     crop1 AS (SELECT id, price FROM crops WHERE name = 'Organic Tomatoes' LIMIT 1),
     crop2 AS (SELECT id, price FROM crops WHERE name = 'Fresh Lettuce' LIMIT 1),
     new_order AS (
       INSERT INTO orders (buyer_id, status, total_price)
       VALUES (
         (SELECT id FROM buyer),
         'pending',
         (SELECT price * 10 FROM crop1) + (SELECT price * 5 FROM crop2)
       )
       RETURNING id
     )
INSERT INTO order_items (order_id, crop_id, quantity, price)
VALUES
  ((SELECT id FROM new_order), (SELECT id FROM crop1), 10, (SELECT price FROM crop1)),
  ((SELECT id FROM new_order), (SELECT id FROM crop2), 5,  (SELECT price FROM crop2));

-- Update stock for the pending order
UPDATE crops SET quantity = quantity - 10 WHERE name = 'Organic Tomatoes';
UPDATE crops SET quantity = quantity - 5  WHERE name = 'Fresh Lettuce';

-- Carlos Lim places an order (accepted)
WITH buyer AS (SELECT id FROM users WHERE email = 'carlos@buyer.com'),
     crop1 AS (SELECT id, price FROM crops WHERE name = 'Basmati Rice' LIMIT 1),
     crop2 AS (SELECT id, price FROM crops WHERE name = 'Sweet Corn' LIMIT 1),
     new_order AS (
       INSERT INTO orders (buyer_id, status, total_price)
       VALUES (
         (SELECT id FROM buyer),
         'accepted',
         (SELECT price * 20 FROM crop1) + (SELECT price * 15 FROM crop2)
       )
       RETURNING id
     )
INSERT INTO order_items (order_id, crop_id, quantity, price)
VALUES
  ((SELECT id FROM new_order), (SELECT id FROM crop1), 20, (SELECT price FROM crop1)),
  ((SELECT id FROM new_order), (SELECT id FROM crop2), 15, (SELECT price FROM crop2));

UPDATE crops SET quantity = quantity - 20 WHERE name = 'Basmati Rice';
UPDATE crops SET quantity = quantity - 15 WHERE name = 'Sweet Corn';

-- Sofia Tan places an order (delivered)
WITH buyer AS (SELECT id FROM users WHERE email = 'sofia@buyer.com'),
     crop1 AS (SELECT id, price FROM crops WHERE name = 'Mangoes' LIMIT 1),
     new_order AS (
       INSERT INTO orders (buyer_id, status, total_price)
       VALUES (
         (SELECT id FROM buyer),
         'delivered',
         (SELECT price * 30 FROM crop1)
       )
       RETURNING id
     )
INSERT INTO order_items (order_id, crop_id, quantity, price)
VALUES
  ((SELECT id FROM new_order), (SELECT id FROM crop1), 30, (SELECT price FROM crop1));

UPDATE crops SET quantity = quantity - 30 WHERE name = 'Mangoes';
