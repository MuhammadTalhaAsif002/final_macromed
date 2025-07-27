const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Update these with your actual PostgreSQL DB credentials
const pool = new Pool({
  host: 'localhost',
  user: 'postgres', // your postgres username
  password: '1234', // your postgres password
  database: 'Macromed', // your postgres database name
  port: 5432, // default PostgreSQL port
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('DB connection error:', err);
  } else {
    console.log('Connected to PostgreSQL');
    release();
  }
});

// Top selling products
app.get('/top-products', (req, res) => {
  const sql = `
    SELECT p.product_id, p.product_name, p.image_url, COALESCE(SUM(i.quantity), 0) as sales_count
    FROM products p
    JOIN interactions i ON p.product_id = i.product_id
    WHERE i.interaction_type = 'purchase'
    GROUP BY p.product_id, p.product_name, p.image_url
    ORDER BY sales_count DESC
    LIMIT 100;
  `;
  pool.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result.rows);
  });
});

// User trends (pass user_id as query param)
app.get('/user-trends', (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  const sql = `
    SELECT i.interaction_type, COUNT(i.interaction_id) as count
    FROM interactions i
    WHERE i.user_id = $1
    GROUP BY i.interaction_type
  `;
  pool.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result.rows);
  });
});

// User purchases (products bought by user)
app.get('/user-purchases', (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  const sql = `
    SELECT p.product_id, p.product_name, p.image_url, COALESCE(SUM(i.quantity), 0) as purchase_count, MAX(i.timestamp) as timestamp
    FROM products p
    JOIN interactions i ON p.product_id = i.product_id
    WHERE i.user_id = $1 AND i.interaction_type = 'purchase'
    GROUP BY p.product_id, p.product_name, p.image_url
    ORDER BY purchase_count DESC
  `;
  pool.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result.rows);
  });
});

// Product trends (for graph)
app.get('/product-trends', (req, res) => {
  const sql = `
    SELECT p.product_id, p.product_name, p.image_url, COALESCE(SUM(i.quantity), 0) AS purchase_count
    FROM products p
    JOIN interactions i ON p.product_id = i.product_id
    WHERE i.interaction_type = 'purchase'
    GROUP BY p.product_id, p.product_name, p.image_url
    ORDER BY purchase_count DESC;
  `;
  pool.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result.rows);
  });
});

// All products
app.get('/all-products', (req, res) => {
  const sql = 'SELECT * FROM products ORDER BY product_id';
  pool.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result.rows);
  });
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
}); 