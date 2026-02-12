
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(255),
  is_verified BOOLEAN DEFAULT false
);

CREATE TABLE otp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100),
  code VARCHAR(6)
);

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  description TEXT,
  price INT
);
