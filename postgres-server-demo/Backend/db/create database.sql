CREATE TABLE Categories (
id Serial Primary key,
category_name varchar(255) not null
);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2), -- Name must not be empty and have at least 2 characters
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- Valid email format
    password VARCHAR(100) NOT NULL CHECK (LENGTH(password) >= 8), -- Password must have at least 8 characters
    role VARCHAR(10) CHECK (role IN ('admin', 'customer')) NOT NULL, -- Role must be 'admin' or 'customer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Products (
    id SERIAL PRIMARY KEY,                                  -- Auto-incremented product ID
    product_name VARCHAR(255) NOT NULL CHECK (char_length(product_name) >= 2), -- Product name, must be at least 2 characters long
    sales_price INTEGER NOT NULL CHECK (sales_price > 0),   -- Sales price, must be greater than 0
    mrp INTEGER NOT NULL CHECK (mrp > 0 AND mrp >= sales_price), -- MRP, must be greater than 0 and >= sales_price
    images TEXT[] DEFAULT '{}',                             -- Array of image URLs for the product
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,-- Foreign key to Categories table
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)     -- Ensure stock is non-negative
);

CREATE TABLE Carts (
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id) 
);

CREATE TYPE order_status AS ENUM ('pending', 'delivered', 'completed', 'cancelled');



CREATE TABLE Addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15)  NOT NULL CHECK (phone ~ '^\d{10}$'),
    pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^\d{6}$'),
    house_number VARCHAR(100) NOT NULL,
    area VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    address_type VARCHAR(20)  DEFAULT 'Home',
    is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete flag
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    address_id INTEGER REFERENCES Addresses(id) ON DELETE SET NULL, 
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE Order_Items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2)
);

