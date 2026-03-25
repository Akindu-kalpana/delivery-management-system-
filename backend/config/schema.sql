CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  sender_name VARCHAR(100) NOT NULL,
  sender_phone VARCHAR(20) NOT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  receiver_name VARCHAR(100) NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  delivery_address VARCHAR(255) NOT NULL,
  package_description VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  user_id INTEGER REFERENCES users(id),
  driver_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add columns to deliveries
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_option VARCHAR(50) DEFAULT 'standard';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS package_size VARCHAR(50) DEFAULT 'medium';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS package_weight DECIMAL(5,2) DEFAULT 1;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS estimated_price DECIMAL(10,2);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS driver_instructions TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL(10,8);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS pickup_lng DECIMAL(11,8);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10,8);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11,8);

CREATE TABLE IF NOT EXISTS saved_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  label VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  delivery_id INTEGER REFERENCES deliveries(id),
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS damage_claims (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  delivery_id INTEGER REFERENCES deliveries(id),
  description TEXT NOT NULL,
  damage_images TEXT[],
  invoice_image TEXT,
  ai_analysis TEXT,
  ai_verdict VARCHAR(50),
  estimated_refund DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  admin_decision VARCHAR(50),
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bulk_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  filename VARCHAR(255),
  raw_content TEXT,
  extracted_deliveries JSONB,
  status VARCHAR(50) DEFAULT 'processing',
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  level VARCHAR(50) DEFAULT 'bronze',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  points INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  delivery_id INTEGER REFERENCES deliveries(id),
  created_at TIMESTAMP DEFAULT NOW()
);
