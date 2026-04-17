-- Seed categories
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic devices and gadgets'),
    ('Clothing', 'Apparel and fashion items'),
    ('Books', 'Books, magazines, and educational materials')
ON CONFLICT (name) DO NOTHING;

-- Seed products
INSERT INTO products (name, description, price, stock, sku) VALUES
    ('Wireless Bluetooth Headphones', 'Premium noise-cancelling over-ear headphones with 30-hour battery life', 79.99, 150, 'ELEC-001'),
    ('Mechanical Keyboard', 'TKL mechanical keyboard with RGB backlight and blue switches', 89.99, 80, 'ELEC-002'),
    ('USB-C Hub 7-in-1', 'Multiport adapter with HDMI, USB 3.0, SD card reader', 39.99, 200, 'ELEC-003'),
    ('Smart Watch Series X', 'Fitness tracking smartwatch with heart rate monitor and GPS', 199.99, 60, 'ELEC-004'),
    ('Portable Power Bank 20000mAh', 'Fast-charging power bank with dual USB-A and USB-C ports', 49.99, 120, 'ELEC-005'),
    ('Men''s Slim Fit Jeans', 'Classic straight-leg denim jeans in dark wash', 49.99, 300, 'CLTH-001'),
    ('Women''s Running Shoes', 'Lightweight breathable running shoes with cushioned sole', 89.99, 175, 'CLTH-002'),
    ('Unisex Hoodie', 'Comfortable cotton-blend pullover hoodie in various colors', 39.99, 250, 'CLTH-003'),
    ('Clean Code', 'A handbook of agile software craftsmanship by Robert C. Martin', 34.99, 90, 'BOOK-001'),
    ('The Pragmatic Programmer', '20th Anniversary Edition guide for software developers', 39.99, 70, 'BOOK-002'),
    ('Design Patterns', 'Elements of reusable object-oriented software by GoF', 44.99, 55, 'BOOK-003'),
    ('Wireless Mouse', 'Ergonomic wireless optical mouse with silent click', 29.99, 180, 'ELEC-006')
ON CONFLICT (sku) DO NOTHING;

-- Link products to categories
DO $$
DECLARE
    elec_id INTEGER;
    clth_id INTEGER;
    book_id INTEGER;
BEGIN
    SELECT id INTO elec_id FROM categories WHERE name = 'Electronics';
    SELECT id INTO clth_id FROM categories WHERE name = 'Clothing';
    SELECT id INTO book_id FROM categories WHERE name = 'Books';

    -- Electronics products (1-5, 12)
    INSERT INTO product_categories (product_id, category_id)
    SELECT p.id, elec_id FROM products p WHERE p.sku IN ('ELEC-001','ELEC-002','ELEC-003','ELEC-004','ELEC-005','ELEC-006')
    ON CONFLICT DO NOTHING;

    -- Clothing products (6-8)
    INSERT INTO product_categories (product_id, category_id)
    SELECT p.id, clth_id FROM products p WHERE p.sku IN ('CLTH-001','CLTH-002','CLTH-003')
    ON CONFLICT DO NOTHING;

    -- Books products (9-11)
    INSERT INTO product_categories (product_id, category_id)
    SELECT p.id, book_id FROM products p WHERE p.sku IN ('BOOK-001','BOOK-002','BOOK-003')
    ON CONFLICT DO NOTHING;
END $$;
