const express = require('express');

// connect to sequlize for ORM functionality
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

// use express and declare port number
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// Initialize Sequelize with your existing database configuration
const sequelize = new Sequelize('finance_app_new', 'root', 'Niha@2005', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log,
});

// Test the connection
sequelize.authenticate()
    .then(() => console.log('Connected to the MySQL database using Sequelize'))
    .catch((err) => console.error('Unable to connect to the database:', err));

// Define User datatable
const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    first_name: { 
        type: DataTypes.STRING 
    },
    last_name: { 
        type: DataTypes.STRING 
    },
    email: { 
        type: DataTypes.STRING 
    },
    user_type: { 
        type: DataTypes.STRING 
    },
    current_balance: { 
        type: DataTypes.FLOAT, 
        defaultValue: 0 
    },
}, { 
    timestamps: false,
    tableName: 'User', // Force table name to match your existing table
    // add indexes on username
    indexes: [
        {name: 'idx_username', fields: ['username'], unique: true}
    ]
});

// Define Transaction datatable
const Transaction = sequelize.define('Transaction', {
    transaction_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    created_time: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    updated_time: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    amount: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
    },
    description: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    category_name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    transaction_type: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        }
    }
}, { 
    timestamps: false,
    tableName: 'Transaction',
    // define indexes on time, category, user, and amount
    indexes: [
        // helpful for date range filters
        {name: 'idx_created_time', fields: ['created_time']},
        // helpful for category + amount filters (reports)
        {name: 'idx_category_amount', fields: ['category_name', 'amount']},
        // helpful for user-specified queries (for multi-user model)
        {name: 'idx_user_id', fields: ['user_id']},
        // helpful for revenue/expense calculations
        {name: 'idx_transaction_type_amount', fields: ['transaction_type', 'amount']}
    ]
});

// Define Relationship between User and Transactions
User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

// Function to check if User table is empty and insert initial data if needed
const checkIfUserExists = async () => {
    try {
        const count = await User.count();
        if (count === 0) {
            // If the User table is empty, insert the initial user and dummy data
            insertUser();
        }
    } catch (err) {
        console.error('Error checking User table:', err);
    }
};

// Insert a new sample user
const insertUser = async () => {
    try {
        const user = await User.create({ // ORM to create a user
            username: 'jane_doe',
            password: 'password123',
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@example.com',
            user_type: 'Individual'
        });
        console.log('User inserted successfully');
        insertDummyData(user.user_id);
    } catch (err) {
        console.error('Error inserting user:', err);
    }
};

// Insert dummy data using Sequelize
const insertDummyData = async (userId) => {
    try {
        const now = new Date();
        await Transaction.bulkCreate([
            {
                created_time: now,
                updated_time: now,
                amount: 2320.23,
                description: 'Grocery Bill',
                category_name: 'Food',
                user_id: userId,
                transaction_type: 'Revenue'
            },
            {
                created_time: now,
                updated_time: now,
                amount: 4402.34,
                description: 'Refund',
                category_name: 'Shopping',
                user_id: userId,
                transaction_type: 'Revenue'
            },
            {
                created_time: now,
                updated_time: now,
                amount: 3420.23,
                description: 'House Rent',
                category_name: 'Housing',
                user_id: userId,
                transaction_type: 'Expense'
            },
            {
                created_time: now,
                updated_time: now,
                amount: 5502.34,
                description: 'Utilities',
                category_name: 'Bills',
                user_id: userId,
                transaction_type: 'Expense'
            }
        ]);
        console.log('Dummy data inserted successfully');
    } catch (err) {
        console.error('Error inserting dummy data:', err);
    }
};

// Update user balance using prepared statements
// uses parameterized queries to prevent SQL injection
const updateUserBalance = async (userId) => {
    try {
        console.log("Inside update balance function");
        console.log("User id:", userId);

        // Using prepared statement to prevent SQL injection
        // uses parameters :userID to securely concatenate data
        const [results] = await sequelize.query(
            `
            SELECT 
                SUM(CASE WHEN transaction_type = 'Revenue' THEN amount ELSE 0 END) AS revenue_sum,
                SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) AS expense_sum
            FROM Transaction
            WHERE user_id = :userId
            `,
            {
                // utilizing Sequielize and passing parameters to avoid SQL injections
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        // dynamically calculate Revenue & Expense for the specified user_id
        const revenueSum = results.revenue_sum || 0; // revenue is sum of revenues or 0
        const expenseSum = results.expense_sum || 0; // expense is sum of expenses or 0
        const totalBalance = revenueSum - expenseSum; // calculate net income as revenues - expenses

        console.log("Revenue Sum:", revenueSum);
        console.log("Expense Sum:", expenseSum);
        console.log("Total Balance:", totalBalance);

        // Update using Sequelize ORM to upddate total balance for user
        await User.update(
            { current_balance: totalBalance },
            { where: { user_id: userId } }
        );

        console.log("User balance updated successfully.");
    } catch (err) {
        console.error('Error updating user balance:', err);
    }
};

// Sync models with database and check for initial data
sequelize.sync({ alter: true})
    .then(() => {
        console.log('Database synchronized');
        checkIfUserExists();
    })
    .catch((err) => console.error('Error synchronizing database:', err));

// API using ORM
// GET: Fetch all transactions
app.get('/api/transactions', async (req, res) => {
    console.log("Executing get function");
    try {
        // use ORM fetch() function to read/fetch all transactions from db
        const transactions = await Transaction.findAll();
        console.log("Retrieved transactions:", transactions.length);
        res.json(transactions); // Add this line to return the data
    } catch (err) {
        console.error("Database query error:", err);
        res.status(500).send("Database query error");
    }
});


// POST: Add a new transaction
app.post('/api/transactions', async (req, res) => {
    const { amount, description, category_name, user_id, transaction_type, created_time, updated_time } = req.body;
    
    console.log('Received transaction data from user:', req.body);

    // prevent adding an entry if there is missing data fields
    if (!amount || !description || !category_name || !user_id || !transaction_type || !created_time || !updated_time) {
        return res.status(400).send('Missing required fields');
    }
    
    try {
        // try to add a new transaction ORM create function
        await Transaction.create({
            amount,
            description,
            category_name,
            user_id,
            transaction_type,
            created_time,
            updated_time
        });
        
        console.log("Updating user balance for user:", user_id);
        // update balanace after adding transaction
        await updateUserBalance(user_id);
        console.log('Transaction added successfully!');
        res.status(200).send('Transaction added');
    } catch (err) {
        console.error("Error inserting transaction:", err);
        res.status(500).send({ error: 'Error adding transaction', details: err.message });
    }
});

// PUT: Update a transaction in the table
app.put('/api/transactions/:id', async (req, res) => {
    console.log("Entered PUT request in backend");

    const { id } = req.params;
    const { amount, description, category_name, transaction_type, updated_time, user_id } = req.body;

    // prevent modification if there are missing fields
    if (!amount || !description || !category_name || !transaction_type || !updated_time) {
        return res.status(400).send('Missing required fields');
    }

    try {
        // ORM update API to update an existing transaction
        await Transaction.update(
            {
                amount,
                description,
                category_name,
                transaction_type,
                updated_time
            },
            { where: { transaction_id: id } }
        );

        console.log("Modified entry, updating user balance");
        await updateUserBalance(user_id);
        res.status(200).send('Transaction updated');
    } catch (err) {
        console.error("Error updating transaction:", err);
        res.status(500).send('Error updating transaction');
    }
});

// DELETE: Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const user_id = req.body.user_id;
    
    console.log("Delete request for transaction:", id);

    try {
        // If user_id is not provided, get it from the transaction
        let userId = user_id;
        if (!userId) {
            const transaction = await Transaction.findByPk(id);
            if (!transaction) {
                return res.status(404).send('Transaction not found');
            }
            userId = transaction.user_id;
        }
        // ORM delete function
        await Transaction.destroy({ where: { transaction_id: id } });
        
        console.log("Deleted entry, updating user balance for user:", userId);
        await updateUserBalance(userId);
        res.status(200).send('Transaction deleted');
    } catch (err) {
        console.error("Error deleting transaction:", err);
        res.status(500).send('Error deleting transaction');
    }
});

// Reports endpoint using prepared statements
app.get('/api/reports/category-summary/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const [results] = await sequelize.query(
            `
            SELECT 
                category_name,
                transaction_type,
                SUM(amount) as total_amount,
                COUNT(*) as transaction_count
            FROM Transaction
            WHERE user_id = :userId
            GROUP BY category_name, transaction_type
            ORDER BY total_amount DESC
            `,
            {
                // prepared statements to prevent SQL injections
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        
        res.json(results);
    } catch (err) {
        console.error("Error generating category report:", err);
        res.status(500).send('Error generating report');
    }
});

// Get filtered transactions with statistics (multi-category support)
app.get('/api/reports/statistics', async (req, res) => {
    try {
        // Extract filter parameters from query
        const { startDate, endDate, categories, minAmount, maxAmount, userId = 1 } = req.query;

        let whereConditions = { user_id: userId };

        // Date range filter
        if (startDate) {
            whereConditions.created_time = {
                [Sequelize.Op.gte]: new Date(startDate)
            };
        }
        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            if (whereConditions.created_time) {
                whereConditions.created_time = {
                    ...whereConditions.created_time,
                    [Sequelize.Op.lte]: endDateTime
                };
            } else {
                whereConditions.created_time = {
                    [Sequelize.Op.lte]: endDateTime
                };
            }
        }

        // Multi-category (apply all categories chosen)
        if (categories) {
            const categoryArray = categories.split(',').filter(Boolean);
            if (categoryArray.length > 0) {
                whereConditions.category_name = { [Sequelize.Op.in]: categoryArray };
            }
        }

        // Amount range filter
        if (minAmount) {
            whereConditions.amount = {
                [Sequelize.Op.gte]: parseFloat(minAmount)
            };
        }
        if (maxAmount) {
            if (whereConditions.amount) {
                whereConditions.amount = {
                    ...whereConditions.amount,
                    [Sequelize.Op.lte]: parseFloat(maxAmount)
                };
            } else {
                whereConditions.amount = {
                    [Sequelize.Op.lte]: parseFloat(maxAmount)
                };
            }
        }

        console.log("Applied filters:", whereConditions);
        // Get filtered transactions
        const transactions = await Transaction.findAll({
            where: whereConditions,
            order: [['created_time', 'DESC']]
        });

        // Calculate statistics from filtered transactions
        const revenueTransactions = transactions.filter(t => t.transaction_type === 'Revenue');
        const expenseTransactions = transactions.filter(t => t.transaction_type === 'Expense');

        const totalIncome = revenueTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Calculate category totals (across all transactions)
        const categoryTotals = {};
        transactions.forEach(t => {
            if (!categoryTotals[t.category_name]) {
                categoryTotals[t.category_name] = 0;
            }
            categoryTotals[t.category_name] += parseFloat(t.amount);
        });

        res.json({
            transactions: transactions,
            statistics: {
                totalIncome: totalIncome,
                totalExpenses: totalExpenses,
                netBalance: totalIncome - totalExpenses,
                categoryTotals: categoryTotals
            }
        });

    } catch (err) {
        console.error("Error generating filtered statistics:", err);
        res.status(500).send('Error generating statistics');
    }
});

// Get unique categories for dropdown
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Transaction.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('category_name')), 'category']],
            raw: true
        });

        res.json(categories.map(item => item.category));
    } catch (err) {
        console.error("Error fetching categories:", err);
        res.status(500).send('Error fetching categories');
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
});
