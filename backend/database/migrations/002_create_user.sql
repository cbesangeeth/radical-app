CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  last_logged_in TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

-- Add an index on google_id for faster lookups
CREATE INDEX idx_users_google_id ON users (google_id);


-- Update the expenses table to reference the users table
ALTER TABLE expenses
ADD CONSTRAINT fk_expenses_user
FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;