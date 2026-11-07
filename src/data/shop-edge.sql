-- shop (edge variant): same schema, but with the cases that break sloppy queries —
-- NULLs everywhere, duplicate names, tied amounts, an orphan order, a zero amount, inconsistent casing.
CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name        VARCHAR NOT NULL,
  email       VARCHAR,
  country     VARCHAR,
  city        VARCHAR,
  signup_date DATE NOT NULL,
  is_active   BOOLEAN
);

INSERT INTO customers VALUES
  (1, 'Asha Rao',  'asha@example.com',  'India',   'Pune',   DATE '2024-01-01', true),
  (2, 'Asha Rao',  'asha.r@example.com','India',   'Pune',   DATE '2024-06-01', true),
  (3, 'Tom Lee',   NULL,                NULL,      NULL,     DATE '2024-02-02', true),
  (4, 'Ivy Chen',  'ivy@example.com',   'India',   NULL,     DATE '2024-03-03', false),
  (5, 'Ben Ode',   'ben@example.com',   'Nigeria', 'Lagos',  DATE '2024-04-04', NULL),
  (6, 'Eva Novak', 'eva@example.com',   'Czechia', 'Prague', DATE '2025-01-01', true),
  (7, 'Raj Mehta', 'raj@example.com',   'india',   'Surat',  DATE '2025-02-02', true),
  (8, 'Ola Berg',  'ola@example.com',   'Norway',  'Oslo',   DATE '2025-03-03', false);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name       VARCHAR NOT NULL,
  category   VARCHAR,
  price      DECIMAL(10, 2)
);

INSERT INTO products VALUES
  (1, 'Pen',         'Office',      2.50),
  (2, 'Pencil',      'Office',      2.50),
  (3, 'Laptop',      'Electronics', 999.00),
  (4, 'Mystery Box', NULL,          NULL);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date  DATE NOT NULL,
  status      VARCHAR NOT NULL,
  amount      DECIMAL(10, 2)
);

INSERT INTO orders VALUES
  (201, 1,  DATE '2024-02-01', 'delivered', 50.00),
  (202, 2,  DATE '2024-02-01', 'delivered', 50.00),
  (203, 3,  DATE '2024-03-01', 'cancelled', NULL),
  (204, 99, DATE '2024-04-01', 'delivered', 10.00),
  (205, 4,  DATE '2024-05-01', 'pending',   0.00),
  (206, 1,  DATE '2025-01-01', 'shipped',   999.00),
  (207, 7,  DATE '2025-02-01', 'delivered', 50.00),
  (208, 5,  DATE '2025-03-01', 'delivered', 12.34);
