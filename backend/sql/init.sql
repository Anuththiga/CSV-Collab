-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =========================
-- Users table
-- =========================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- CSV Records table
-- =========================

CREATE TABLE IF NOT EXISTS csv_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    pending_data TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedBy UUID NOT NULL,

    CONSTRAINT fk_csv_record_updated_by
        FOREIGN KEY (updatedBy)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

