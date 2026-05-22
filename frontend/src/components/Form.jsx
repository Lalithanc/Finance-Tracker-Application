import { useState, useEffect } from "react";
import axios from 'axios';
import dayjs from "dayjs";

const Form = ({ transactions, setTransactions, expenseMode, setExpenseMode }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [availableCategories, setAvailableCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Fetch available categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/categories');
                setAvailableCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Functions update state when user inputs in the form fields
    const updateDescription = (event) => setDescription(event.target.value);
    const updateAmount = (event) => setAmount(event.target.value);
    
    const updateCategory = (event) => {
        const value = event.target.value;
        setCategory(value);
        
        // Filter categories based on input
        if (value.trim()) {
            const filtered = availableCategories.filter(cat =>
                cat.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredCategories(filtered);
            setShowDropdown(filtered.length > 0);
        } else {
            setFilteredCategories([]);
            setShowDropdown(false);
        }
    };

    // Handle category selection from dropdown
    const selectCategory = (selectedCategory) => {
        setCategory(selectedCategory);
        setFilteredCategories([]);
        setShowDropdown(false);
    };

    const user_id = 1;

    // Handle the form submission to add a new transaction
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission

        // Determine whether it's an Expense or Revenue transaction
        const checkType = expenseMode ? 'Expense' : 'Revenue';
        console.log("Current type: ", checkType);

        // Check if any field is empty and show an alert if so
        if (!description.trim() || !amount.trim() || !category.trim()) {
            alert('Please fill in all the fields to add a transaction!');
            return; // Prevent the form from submitting if any field is empty
        }

        // Create a new transaction object with required data
        const newTransaction = {
            description,
            amount: parseFloat(amount).toFixed(2),
            category_name: category,
            transaction_type: checkType,
            user_id,
            created_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            updated_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };

        // Send the new transaction data to the backend (API)
        axios.post('http://localhost:5001/api/transactions', newTransaction)
            .then(response => {
                console.log('Transaction added:', response.data);
                // Clear the form after successful submission
                setDescription('');
                setAmount('');
                setCategory('');
                setExpenseMode(false); // Reset expense mode to "Income"

                // Update the transaction list with the newly added transaction
                // setTransactions(prev => [...prev, response.data]);

                // Re-fetch the transactions from the backend to ensure the UI is updated
                axios.get('http://localhost:5001/api/transactions')
                .then(response => {
                    setTransactions(response.data); // Update the transaction list
                })
                .catch(error => {
                    console.error('Error fetching transactions:', error);
                });

            })
            .catch(error => {
                console.error('Error adding transaction to form:', error);
                alert('Error adding transaction to form: ' + error.message); // Show an alert with the error
            });
    };

    // Toggle between Income and Expense
    // update expense function - changes setExpenseMode state
    const toggleExpenseMode = () => {
        setExpenseMode(prevState => !prevState);
    }

    return (
        <div className="w-4/5">
            <p className="text-[1.5rem] font-semibold">Add Entry</p>
            <div className="mt-3 h-[0.7px] w-full bg-gray-200"></div>
            <p className="mt-4 font-semibold text-[1.2rem]">Description:</p>
            <input
                className="mt-2 w-full border-[0.3px] border-gray-200 p-2 py-3 bg-white"
                type="text"
                value={description}
                onChange={updateDescription}
                required
                placeholder="Add description"
            />

            <p className="mt-4 font-semibold text-[1.2rem]">Amount:</p>
            <input
                className="mt-2 w-full border-[0.3px] border-gray-200 p-2 py-3 bg-white"
                type="number"
                value={amount}
                onChange={updateAmount}
                required
                placeholder="Enter amount"
            />

            <p className="mt-4 font-semibold text-[1.2rem]">Category:</p>
            <div className="relative">
                <input
                    className="mt-2 w-full border-[0.3px] border-gray-200 p-2 py-3 bg-white"
                    type="text"
                    value={category}
                    onChange={updateCategory}
                    onFocus={() => category.trim() && filteredCategories.length > 0 && setShowDropdown(true)}
                    required
                    placeholder="Enter category"
                />
                
                {showDropdown && filteredCategories.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                        {filteredCategories.map((cat, index) => (
                            <div
                                key={index}
                                onClick={() => selectCategory(cat)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                            >
                                {cat}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="mt-6 font-semibold text-[1.2rem]">Type:</p>

            <div className="flex">
                <button
                    onClick={toggleExpenseMode} // change state to income
                    className={`flex-1 mt-3 font-semibold text-[1.2rem] cursor-pointer rounded-[5px] py-2
                    ${!expenseMode ? 'bg-[#2d9a51] text-white' : 'bg-white text-black'}
                    hover:opacity-85 transition duration-300`}
                >
                    Income
                </button>
                <button
                    onClick={toggleExpenseMode} // change state to expense
                    className={`flex-1 mt-3 font-semibold text-[1.2rem] ml-[10px] cursor-pointer rounded-[5px] py-2
                    ${expenseMode ? 'bg-[#D22B2B] text-white' : 'bg-white text-black'}
                    hover:opacity-85 transition duration-300`}
                >
                    Expense
                </button>
            </div>

            <button
                type="submit"
                onClick={handleSubmit}
                className="mt-4 w-full rounded-[5px] bg-cyan-600 py-3 text-[1.2rem] text-center text-white font-semibold cursor-pointer hover:bg-cyan-700 transition duration-300"
            >
                Add Transaction
            </button>
        </div>
    );
};

export default Form;
