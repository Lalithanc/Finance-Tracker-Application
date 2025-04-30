-- Create User table
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Date account was made
    current_balance DECIMAL(10, 2) DEFAULT 0.00,  -- Income - Expenses balance
    user_type ENUM('Individual', 'Group Admin') DEFAULT 'Individual',
    admin_id INT DEFAULT NULL,  -- Admin_id for Group Admin, NULL for Individual users
    FOREIGN KEY (admin_id) REFERENCES User(user_id)  -- Self-referencing foreign key for Group Admin
);

-- Create Transaction table
CREATE TABLE Transaction (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Time when transaction was created
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Time when transaction was last updated
    amount DECIMAL(10, 2),  -- The amount of the transaction (could be positive or negative)
    description VARCHAR(255),  -- Description of the transaction (e.g., "Groceries")
    category_name VARCHAR(255),  -- Directly store the category name (e.g., "Food", "Rent", etc.)
    user_id INT,  -- Foreign key that references the user (creator of the transaction)
    transaction_type ENUM('Revenue', 'Expense'),  -- Type of the transaction
    FOREIGN KEY (user_id) REFERENCES User(user_id)  -- Foreign key linking to the User table
);

-- Create indexes on frequently queries attributes of transaction table (beneficial for reports, sorting, retreival)
CREATE INDEX idx_created_time ON Transaction(created_time);
CREATE INDEX idx_user_id ON Transaction(user_id);
CREATE INDEX idx_category_amount ON Transaction(category_name, amount);
CREATE INDEX idx_transaction_type_amount ON Transaction(transaction_type, amount);
CREATE INDEX idx_user_created_time ON Transaction(user_id, created_time);
