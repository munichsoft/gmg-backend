-- MySQL Schema for Gujarati Marketplace Germany Backend

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS advertisements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  category_id INT NOT NULL,
  city_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  is_featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  advertisement_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_thumbnail BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (advertisement_id) REFERENCES advertisements(id) ON DELETE CASCADE
);

-- Helpful indexes
CREATE INDEX idx_ads_status ON advertisements(status);
CREATE INDEX idx_ads_featured ON advertisements(is_featured);
CREATE INDEX idx_ads_city ON advertisements(city_id);
CREATE INDEX idx_ads_category ON advertisements(category_id);
CREATE INDEX idx_ads_user ON advertisements(user_id);

-- Seed initial data for cities and categories
INSERT INTO cities (name) VALUES ('Berlin'), ('Stuttgart'), ('Munich');
INSERT INTO categories (name, slug) VALUES
('Housing', 'housing'),
('Second-hand Items', 'items'),
('Community Events', 'events'),
('Services', 'services');
