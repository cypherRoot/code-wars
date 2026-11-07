-- shop (main variant): a tiny e-commerce OLTP database. Deterministic, hand-written.
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
  (1,  'Aarav Sharma',   'aarav@example.com',   'India',          'Mumbai',     DATE '2024-01-15', true),
  (2,  'Priya Patel',    'priya@example.com',   'India',          'Bengaluru',  DATE '2024-02-03', true),
  (3,  'Liam Smith',     'liam@example.com',    'United Kingdom', 'London',     DATE '2024-02-20', true),
  (4,  'Emma Johnson',   'emma@example.com',    'United States',  'New York',   DATE '2024-03-05', true),
  (5,  'Noah Williams',  'noah@example.com',    'United States',  'Austin',     DATE '2024-03-18', false),
  (6,  'Sofia Rossi',    'sofia@example.com',   'Italy',          'Milan',      DATE '2024-04-02', true),
  (7,  'Lukas Müller',   'lukas@example.com',   'Germany',        'Berlin',     DATE '2024-04-11', true),
  (8,  'Ananya Iyer',    'ananya@example.com',  'India',          'Chennai',    DATE '2024-05-09', true),
  (9,  'Mateo García',   'mateo@example.com',   'Spain',          'Madrid',     DATE '2024-05-27', false),
  (10, 'Chloe Martin',   'chloe@example.com',   'France',         'Paris',      DATE '2024-06-14', true),
  (11, 'Kenji Tanaka',   'kenji@example.com',   'Japan',          'Tokyo',      DATE '2024-07-01', true),
  (12, 'Olivia Brown',   'olivia@example.com',  'United Kingdom', 'Manchester', DATE '2024-07-19', true),
  (13, 'Rohan Gupta',    'rohan@example.com',   'India',          'Delhi',      DATE '2024-08-08', true),
  (14, 'Mia Fischer',    'mia@example.com',     'Germany',        'Hamburg',    DATE '2024-09-02', false),
  (15, 'Ethan Davis',    'ethan@example.com',   'United States',  NULL,         DATE '2024-09-21', true),
  (16, 'Isabella Silva', NULL,                  'Brazil',         'São Paulo',  DATE '2024-10-10', true),
  (17, 'Arjun Nair',     'arjun@example.com',   'India',          NULL,         DATE '2024-11-05', true),
  (18, 'Hana Kim',       'hana@example.com',    'South Korea',    'Seoul',      DATE '2025-01-12', true),
  (19, 'Lucas Dubois',   'lucas@example.com',   'France',         'Lyon',       DATE '2025-02-08', true),
  (20, 'Zara Khan',      'zara@example.com',    'United Kingdom', 'London',     DATE '2025-03-01', true);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name       VARCHAR NOT NULL,
  category   VARCHAR,
  price      DECIMAL(10, 2)
);

INSERT INTO products VALUES
  (1,  'Wireless Mouse',                        'Electronics', 24.99),
  (2,  'Mechanical Keyboard',                   'Electronics', 89.00),
  (3,  'USB-C Hub',                             'Electronics', 39.50),
  (4,  'Noise-Cancelling Headphones',           'Electronics', 199.99),
  (5,  'Standing Desk',                         'Furniture',   349.00),
  (6,  'Ergonomic Chair',                       'Furniture',   279.00),
  (7,  'Desk Lamp',                             'Furniture',   34.90),
  (8,  'Python Crash Course',                   'Books',       29.99),
  (9,  'Designing Data-Intensive Applications', 'Books',       42.50),
  (10, 'The Data Warehouse Toolkit',            'Books',       54.00),
  (11, 'Coffee Beans 1kg',                      'Grocery',     18.75),
  (12, 'Green Tea (100 bags)',                  'Grocery',     9.99);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date  DATE NOT NULL,
  status      VARCHAR NOT NULL,
  amount      DECIMAL(10, 2)
);

INSERT INTO orders VALUES
  (101, 1,  DATE '2024-02-01', 'delivered', 114.49),
  (102, 2,  DATE '2024-02-10', 'delivered', 29.99),
  (103, 3,  DATE '2024-03-02', 'delivered', 349.00),
  (104, 1,  DATE '2024-03-15', 'delivered', 42.50),
  (105, 4,  DATE '2024-03-20', 'cancelled', 199.99),
  (106, 6,  DATE '2024-04-08', 'delivered', 58.74),
  (107, 7,  DATE '2024-04-25', 'delivered', 279.00),
  (108, 2,  DATE '2024-05-03', 'shipped',   89.00),
  (109, 8,  DATE '2024-05-12', 'delivered', 54.00),
  (110, 10, DATE '2024-06-20', 'delivered', 24.99),
  (111, 11, DATE '2024-07-04', 'delivered', 239.49),
  (112, 4,  DATE '2024-07-11', 'delivered', 18.75),
  (113, 12, DATE '2024-07-30', 'cancelled', 34.90),
  (114, 13, DATE '2024-08-15', 'delivered', 129.00),
  (115, 3,  DATE '2024-08-22', 'delivered', 9.99),
  (116, 1,  DATE '2024-09-09', 'delivered', 199.99),
  (117, 16, DATE '2024-10-14', 'delivered', 96.50),
  (118, 6,  DATE '2024-10-30', 'shipped',   42.50),
  (119, 13, DATE '2024-11-11', 'delivered', 368.75),
  (120, 18, DATE '2025-01-20', 'delivered', 89.00),
  (121, 19, DATE '2025-02-14', 'delivered', 64.49),
  (122, 2,  DATE '2025-02-28', 'delivered', 349.00),
  (123, 20, DATE '2025-03-05', 'pending',   24.99),
  (124, 11, DATE '2025-03-09', 'shipped',   54.00),
  (125, 8,  DATE '2025-03-12', 'pending',   279.00),
  (126, 4,  DATE '2025-03-15', 'delivered', 39.50),
  (127, 15, DATE '2025-03-18', 'cancelled', 18.75),
  (128, 17, DATE '2025-03-20', 'pending',   29.99),
  (129, 10, DATE '2025-03-22', 'shipped',   199.99),
  (130, 1,  DATE '2025-03-25', 'pending',   9.99);
