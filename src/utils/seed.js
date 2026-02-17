const db = require('../config/database');

async function seed() {
  // Categories
  await db.query("INSERT INTO categories (name, description) VALUES ('Electronics', 'Gadgets') ON CONFLICT DO NOTHING");
  await db.query("INSERT INTO categories (name, description) VALUES ('Clothing', 'Apparel') ON CONFLICT DO NOTHING");
  await db.query("INSERT INTO categories (name, description) VALUES ('Books', 'Literature') ON CONFLICT DO NOTHING");

  // 10 Products (link to categories)
  const products = [
    {name: 'iPhone 15', price: 999.99, sku: 'IPH15', description: 'Latest iPhone'},
    // Add 9 more...
  ];
  for (const p of products) {
    const res = await db.query(
      'INSERT INTO products (name, price, sku, description) VALUES ($1,$2,$3,$4) RETURNING id',
      [p.name, p.price, p.sku, p.description]
    );
    // Link to category 1
    await db.query('INSERT INTO product_categories VALUES ($1, (SELECT id FROM categories WHERE name=$2))', [res.rows[0].id, 'Electronics']);
  }
  console.log('Database seeded!');
}

seed().catch(console.error);
