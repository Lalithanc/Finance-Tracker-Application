import { useMemo, useState } from "react";
import { CgCheckO, CgCloseO } from "react-icons/cg"; // check mark symbol and cancel mark symbol
import axios from 'axios';  // Make sure to import axios
import Header from "../components/Header";
import Form from "../components/Form";
import dayjs from "dayjs";

const HomePageMain = ({ transactions, setTransactions, expenseMode, setExpenseMode }) => {
    console.log('Transactions in HomePageMain:', transactions);

    // track which entry is being updated
    const [editingTransaction, setEditingTransaction] = useState(null);
    // store the edited entry
    const [editedTransaction, setEditedTransaction] = useState({});
    // pop up message when a transaction is modified or deleted
    const [message, setMessage] = useState(' ');

    // Handle edit mode for a particular transaction
    const handleEdit = (transaction) => {
        setEditingTransaction(transaction.transaction_id);
        setEditedTransaction(transaction);  // Set the current transaction data to be edited
    };

    // Sort transactions by date descending (most recent first)
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.created_time) - new Date(a.created_time)
    );

    const handleSave = (transactionId) => {
        console.log('Entered handle save function');
        console.log("Updating transaction with data:", editedTransaction);

        // Extract only the serializable fields from editedTransaction
        const { description, amount, category_name } = editedTransaction;

        // Find the original transaction to preserve necessary fields
        const originalTransaction = transactions.find(t => t.transaction_id === transactionId);

        // Add updated_time to the updated transaction
        const updatedTransaction = {
            description,
            amount,
            category_name,
            transaction_type: originalTransaction?.transaction_type, // Preserve transaction type
            user_id: originalTransaction?.user_id, // Include user_id for balance updates
            updated_time: dayjs().format('YYYY-MM-DD HH:mm:ss'), // Set the updated_time
        };

        console.log("Updated transaction object:", updatedTransaction);

        // Send PUT request to update the transaction
        axios.put(`http://localhost:5001/api/transactions/${transactionId}`, updatedTransaction)
            .then(response => {
                // Update the local state after saving to the backend
                const updatedTransactions = sortedTransactions.map(transaction =>
                    transaction.transaction_id === transactionId ?
                        { ...transaction, ...updatedTransaction } : transaction
                );
                setTransactions(updatedTransactions);

                // Set a success message
                setMessage("Transaction saved!");
                setTimeout(() => setMessage(null), 5000); // Hide the message after 5 seconds

                setEditingTransaction(null); // Exit edit mode
            })
            .catch(error => {
                console.error('Error updating transaction:', error);
            });
    };


    // Cancel editing and exit edit mode
    const handleCancel = () => {
        setEditingTransaction(null);
    };

    // Delete a transaction and update the state
    const handleDelete = (transactionId) => {
        axios.delete(`http://localhost:5001/api/transactions/${transactionId}`)
            .then(response => {
                const remainingTransactions = transactions.filter(transaction => transaction.transaction_id !== transactionId);
                setTransactions(remainingTransactions);  // Remove the deleted transaction from the state

                // Set a delete message
                setMessage("Transaction deleted!");
                setTimeout(() => setMessage(null), 5000); // Hide the message after 5 seconds
            })
            .catch(error => {
                console.error('Error deleting transaction:', error);
            });
    };

    // Calculate the current balance
    const currentBalance = useMemo(() => {
        return transactions.reduce((balance, transaction) => {
            if (transaction.transaction_type === 'Revenue') {
                balance += parseFloat(transaction.amount);
            } else if (transaction.transaction_type === 'Expense') {
                balance -= parseFloat(transaction.amount);
            }
            return balance;
        }, 0).toFixed(2);
    }, [transactions]);


    return (
        <div className="min-h-screen bg-white-50">
            <Header /> {/* Header placed at the top of the page */}

            <div className="flex items-start justify-center gap-10 mt-16"> {/* Added margin-top to space from header */}
                <div className="w-2/5">
                    <Form
                        transactions={transactions}
                        setTransactions={setTransactions}
                        expenseMode={expenseMode}
                        setExpenseMode={setExpenseMode}
                    />
                </div>

                <div className="bg-white w-3/6 h-[900px] border-[0.5px] border-gray-300 rounded-[10px] pl-5 pr-5 relative shadow-[0px_0px_2px_#9CA3AF80]">
                    <p className="font-semibold text-[1.5rem] mt-3">My Finances</p>

                    {/* Display the message */}
                    {message && <div className="text-center text-lg text-green-600 font-semibold">{message}</div>}

                    {/* Display the transactions */}
                    <div className="border-[0.5px] border-gray-300 mt-5 rounded-[5px] max-h-[700px] overflow-y-auto">
                        {sortedTransactions.map((transaction) => (
                            <div key={transaction.transaction_id} className="flex items-center justify-between py-5 border-b px-4">
                                {/* Editing Transaction */}
                                {editingTransaction === transaction.transaction_id ? (
                                    <div className="flex items-center justify-between w-full gap-4">
                                        <input
                                            value={editedTransaction.description || ''}
                                            onChange={(e) => setEditedTransaction({ ...editedTransaction, description: e.target.value })}
                                            className="p-2 border rounded w-[20%]"
                                            placeholder="Description"
                                        />
                                        <input
                                            value={editedTransaction.amount || ''}
                                            onChange={(e) => setEditedTransaction({ ...editedTransaction, amount: e.target.value })}
                                            className="p-2 border rounded w-[15%]"
                                            placeholder="Amount"
                                            type="number"
                                            step="0.01"
                                        />
                                        <input
                                            value={editedTransaction.category_name || ''}
                                            onChange={(e) => setEditedTransaction({ ...editedTransaction, category_name: e.target.value })}
                                            className="p-2 border rounded w-[20%]"
                                            placeholder="Category"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleSave(editingTransaction)}
                                                className="p-2 bg-green-600 text-white rounded hover:bg-green-600"
                                            >
                                                <CgCheckO className="text-xl" />
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                <CgCloseO className="text-xl" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between w-full gap-4">
                                        {/* Left Section: Circle and Description */}
                                        <div className="flex items-center w-[30%]">
                                            {/* Green or Red Circle */}
                                            <div
                                                className={`w-3 h-3 rounded-full ${transaction.transaction_type === 'Revenue' ? 'bg-green-600' : 'bg-red-500'
                                                    }`}
                                            ></div>
                                            {/* Description and Category */}
                                            <div className="ml-4">
                                                <p className="text-lg font-semibold">{transaction.description}</p>
                                                <p className="text-gray-600">{transaction.category_name}</p>
                                            </div>
                                        </div>
                                        <p className={`text-lg font-bold w-[15%] ${transaction.transaction_type === 'Revenue' ? 'text-green-600' : 'text-red-500'}`}>
                                            {transaction.transaction_type === 'Revenue' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                        </p>
                                        {/* Display the formatted created_time */}
                                        <p className="text-gray-600 text-sm w-[15%] text-center">{dayjs(transaction.created_time).format('MM/DD/YYYY')}</p>
                                        <div className="flex gap-3 w-[20%] justify-end">
                                            <button
                                                onClick={() => handleEdit(transaction)}
                                                className="text-blue-500 hover:text-blue-700 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(transaction.transaction_id)}
                                                className="text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Display Current Balance */}
                    <div className="absolute bottom-0 left-0 w-full flex justify-between h-[70px] border-t-[1px] items-center border-gray-300">
                        <p className="ml-5 font-semibold text-[1.4rem]">Current Balance:</p>
                        {parseFloat(currentBalance) >= 0 && (
                            <p className="mr-5 text-[#2d9a51] font-bold text-[1.4rem]">+${currentBalance}</p>
                        )}
                        {parseFloat(currentBalance) < 0 && (
                            <p className="mr-5 text-[#ff0000] font-bold text-[1.4rem]">${currentBalance}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePageMain;
