import { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import HomePageMain from './HomePageMain';

// Function to calculate balance dynamically from the list of transactions
// uses calculations on revenues and expenses for user
const calculateBalance = (transactions) => {
    return transactions.reduce((balance, transaction) => {
        // increase balance for revenue
        if (transaction.transaction_type === 'Revenue') {
            balance += parseFloat(transaction.amount);
        // decrease balance for expense
        } else if (transaction.transaction_type === 'Expense') {
            balance -= parseFloat(transaction.amount);
        }
        return balance;
    }, 0);
};

const HomePage = () => {
    const [transactions, setTransactions] = useState([]); // Stores the list of transactions
    const [balance, setBalance] = useState(0); // Stores the calculated balance
    const [expenseMode, setExpenseMode] = useState(false); // initialize expense mode to false

    // Fetch the transactions from the backend API when the component mounts
    useEffect(() => {
        axios.get('http://localhost:5001/api/transactions') // Send GET request to the backend to get transactions
            .then(response => {
                console.log('Fetched transactions:' , response.data);
                setTransactions(response.data); // Store the fetched transactions
            })
            .catch(error => {
                console.error('There was an error fetching the transactions:', error);
            });
    }, []); // Empty dependency array ensures this runs once when the component mounts

    // Update balance whenever transactions change
    useEffect(() => {
        if (transactions.length > 0) {
            const newBalance = calculateBalance(transactions); // Calculate balance based on transactions
            setBalance(newBalance); // Update the balance state
        }
    }, [transactions]);

    return (
        <div>
            <HomePageMain 
                transactions={transactions} 
                setTransactions={setTransactions} 
                expenseMode={expenseMode}
                setExpenseMode={setExpenseMode}
            /> 
            {/* Pass transactions and setTransactions to HomePageMain */}
        </div>
    );
};

export default HomePage;
