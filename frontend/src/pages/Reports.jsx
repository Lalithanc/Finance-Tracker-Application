import Header from "../components/Header";
import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid";
// import { Pie } from 'react-chartjs-2';


function Reports() {
    // filter date range (start data and end date optional)
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    // filter by category (can select none, some, or all)
    const [selectedCategory, setSelectedCategory] = useState([]);
    // filter by amount range for min and max price
    const [amountRange, setAmountRange] = useState({ min: "", max: "" });

    // const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [statistics, setStatistics] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        categoryAverages: {}
    });
    const [availableCategories, setAvailableCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchFilteredData();
    }, [dateRange, selectedCategory, amountRange]);

    // Fetch transactions from API
    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/categories');
            setAvailableCategories(response.data)
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchFilteredData = async () => {
        try {
            // build the query string for filtering
            const params = new URLSearchParams();

            // add each selected category to the paramters
            if (selectedCategory.length > 0) {
                params.append('categories', selectedCategory.join(','));
            }

            // append to parameteres based on user input
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);
            if (selectedCategory !== 'All Categories') params.append('category', selectedCategory);
            if (amountRange.min) params.append('minAmount', amountRange.min);
            if (amountRange.max) params.append('maxAmount', amountRange.max);

            // /api/reports/statistics endpoint accepts optional filter parameters
            // returns both filtered transactions and calculated statistics 
            const response = await axios.get(`http://localhost:5001/api/reports/statistics?${params}`);

            // set the filtered transactions & statistics
            setFilteredTransactions(response.data.transactions);
            setStatistics({
                totalIncome: response.data.statistics.totalIncome,
                totalExpenses: response.data.statistics.totalExpenses,
                netBalance: response.data.statistics.netBalance,
                categoryTotals: response.data.statistics.categoryTotals
            });
        }
        catch (error) {
            console.error("Error fetching filtered data", error);
        }
    }

    // calculate expense totals by category
    const expenseTransactions = filteredTransactions.filter(
        t => t.transaction_type === 'Expense'
    );

    const totalExpenses = expenseTransactions.reduce(
            (sum, t) => sum + parseFloat(t.amount), 0
    );

    const expenseByCategory = {};
    expenseTransactions.forEach(t => {
            if (!expenseByCategory[t.category_name]) {
                    expenseByCategory[t.category_name] = 0;
            }
            expenseByCategory[t.category_name] += parseFloat(t.amount);
    })

    // generate data for display in statistics section
    const expenseCategoryStats = Object.entries(expenseByCategory)
        .map(([category, amount]) => ({
            category, amount,
            percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount) // sort from highest percentage of spending to lowest

    const calculateDateRange = () => {
        if (dateRange.startDate && dateRange.endDate) {
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(0,0,0,0); // normalize to start of day
            // difference in dates is the range
            const diffTime = Math.abs(endDate - startDate);
            // find days by taking total milliseconds (diffTime) and dividing by total mil in a day
            const diffDates = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDates;
        }
        else if (dateRange.startDate) {
            // only a start date was chosen
            const dates = filteredTransactions.map(t => new Date(t.created_time));
            if (dates.length === 0) return null;

            const startDate = new Date(dateRange.startDate);
            startDate.setHours(0,0,0,0);

            const endDate = new Date(Math.max(...dates));
            endDate.setHours(0,0,0,0); // normalize to start of day

            const diffTime = Math.abs(endDate - startDate);
            const diffDates = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDates;
        }
        else if (dateRange.endDate) {
            // only an end date was chosen
            const dates = filteredTransactions.map(t => new Date(t.created_time));
            const startDate = new Date(Math.min(...dates));
            const endDate = new Date(dateRange.endDate);
            const diffTime = Math.abs(endDate - startDate);
            const diffDates = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDates;
        }
        else if (filteredTransactions.length > 0) {
            // if no date range was chosen use min and max dates from transactions
            const dates = filteredTransactions.map(t => new Date(t.created_time));
            const startDate = new Date(Math.min(...dates));
            const endDate = new Date(Math.max(...dates));
            const diffTime = Math.abs(endDate - startDate);
            const diffDates = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDates;
        }
        return null; // no date calculation (ex: start date > end date)
    }

    const calculateDailyAvg= () => {
        const dateRange = calculateDateRange();
        if (!dateRange || dateRange === 0) return 0;
        return statistics.totalExpenses / dateRange;
    }

    const calculateWeeklyAvg = () => {
        // weekly spending based on expenses (daily avg spending * 7)
        return calculateDailyAvg() * 7;
    }


    // Cancel editing and exit edit mode
    const handleRestore = () => {
        setDateRange({ startDate: "", endDate: "" });
        // setSelectedCategory("[All Categories]");
        setSelectedCategory([]);
        setAmountRange({ min: "", max: "" });
    };

    function MultiSelectDropdown({ options, selected, setSelected }) {
        const [open, setOpen] = useState(false);
        const ref = useRef();

        // Close dropdown on outside click
        useEffect(() => {
            const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
            };
            document.addEventListener("mousedown", handleClick);
            return () => document.removeEventListener("mousedown", handleClick);
        }, []);

        const allSelected = selected.length === options.length;
        const noneSelected = selected.length === 0;

        const handleSelectAll = () => setSelected([...options]);
        const handleClear = () => setSelected([]);

        const toggleOption = (option) => {
            if (selected.includes(option)) {
            setSelected(selected.filter((c) => c !== option));
            } else {
            setSelected([...selected, option]);
            }
        };

        return (
            <div className="relative" ref={ref}>
            <button
                type="button"
                className="w-full border-[0.3px] border-gray-300 rounded px-3 py-2 flex justify-between items-center bg-white"
                onClick={() => setOpen((v) => !v)}
            >
                <span>
                {selected.length === 0
                    ? "Select categories"
                    : `${selected.length} categor${selected.length > 1 ? "ies" : "y"} selected`}
                </span>
                <ChevronDownIcon className="w-4 h-4" />
            </button>
            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg p-2">
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                    <button
                    type="button"
                    className="hover:underline"
                    onClick={handleSelectAll}
                    disabled={allSelected}
                    >
                    Select All
                    </button>
                    <button
                    type="button"
                    className="hover:underline"
                    onClick={handleClear}
                    disabled={noneSelected}
                    >
                    Clear
                    </button>
                </div>
                <div>
                    {options.map((option) => (
                    <button
                        type="button"
                        key={option}
                        className="flex items-center w-full px-2 py-1 hover:bg-gray-100 rounded"
                        onClick={() => toggleOption(option)}
                    >
                        {selected.includes(option) ? (
                        <CheckIcon className="w-4 h-4 text-blue-600 mr-2" />
                        ) : (
                        <span className="w-4 h-4 mr-2" />
                        )}
                        <span>{option}</span>
                    </button>
                    ))}
                </div>
                </div>
            )}
            </div>
        );
    }


    return (
        <div className="min-h-screen w-full bg-white-50">
            <Header />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-8 py-8">
                    <div className="md:col-span-3/4 space-y-8 w-full">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4 w-full">
                            <h2 className="text-lg font-medium border-b pb-2">Filter Options</h2>

                            {/* Date Range Filter */}
                            <div className="space-y-2">
                                <label className="block text-lg font-medium">Date Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm mb-1">Start Date (Inclusive) </label>
                                        <input  
                                            type="date"
                                            //className="w-full p-2 border gray-200 rounded"
                                            className = "mt-2 w-full border-[0.3px] border-gray-300 p-2 py-3 bg-white"
                                            value={dateRange.startDate}
                                            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">End Date (Exclusive)</label>
                                        <input  
                                            type="date"
                                            className="mt-2 w-full border-[0.3px] border-gray-300 p-2 py-3 bg-white"
                                            value={dateRange.endDate}
                                            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                
                            {/* Categories Filter 
                            <div className="space-y-2">
                                <label className="block text-lg font-medium">Categories</label>
                                <div className="max-h-40 overflow-y-auto border rounded p-2">
                                    {availableCategories.map(category => (
                                    <label key={category} className="flex items-center space-x-2 p-1 hover:bg-gray-50">
                                        <input
                                        type="checkbox"
                                        checked={selectedCategory.includes(category)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCategory([...selectedCategory, category]);
                                            } else {
                                                setSelectedCategory(selectedCategory.filter(c => c !== category));
                                            }
                                        }}
                                        />
                                        <span>{category}</span>
                                    </label>
                                    ))}
                                </div>
                            </div>
                            */}

                            <div className="space-y-2">
                            <label className="block text-lg font-medium">Categories</label>
                            <MultiSelectDropdown
                                options={availableCategories}
                                selected={selectedCategory}
                                setSelected={setSelectedCategory}
                            />
                            </div>


                            {/* Amount Range Filter */}
                            <div className="space-y-2">
                                <label className="block text-lg font-medium">Amount Range</label>
                                <div className="flex gap-2 items-center">
                                    <span>$</span>
                                    <input 
                                        type="number" 
                                        placeholder="Min" 
                                        className="mt-2 w-full border-[0.3px] border-gray-300 p-2 py-3 bg-white"
                                        value={amountRange.min} 
                                        onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                                    />
                                    <span>to</span>
                                    <span>$</span>
                                    <input 
                                        type="number" 
                                        placeholder="Max" 
                                        className="mt-2 w-full border-[0.3px] border-gray-300 p-2 py-3 bg-white"
                                        value={amountRange.max}
                                        onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Reset Filters */}
                            <button 
                                className="w-full py-2 mt-4 bg-cyan-600 hover:bg-gray-300 rounded font-medium text-center text-white"
                                onClick={handleRestore}
                            >
                                Reset Filters
                            </button>
                        </div>

                         {/* Statistics Panel */}
                         <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                            <h2 className="text-lg text-black-500 font-medium border-b pb-2">Statistics</h2>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Total Income:</span>
                                    <span className="text-green-600">${statistics.totalIncome.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Total Expenses:</span>
                                    <span className="text-red-500">${statistics.totalExpenses.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Net Balance:</span>
                                    {/* Label the net balance in green if it is positive, in red if it is negative */}
                                    <span className={`font-bold ${statistics.netBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
                                        ${statistics.netBalance.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-lg text-black-500 font-medium border-b pb-2">Average Spending Metrics</h2>
                            {/* New average spending statistics */}
                            {calculateDateRange() && (
                                <>
                                    <div className="flex justify-between">
                                        <span>Average Daily Spending:</span>
                                        <span className="text-red-500">${calculateDailyAvg().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Average Weekly Spending:</span>
                                        <span className="text-red-500">${calculateWeeklyAvg().toFixed(2)}</span>
                                    </div>
                                    {/*}
                                    <div className="text-xs text-gray-500 mt-1">
                                        Based on {dateRange.startDate} and {dateRange.endDate}
                                    </div>
                                    */}
                                    <div className="text-xs text-gray-500 mt-1">
                                        Based on {calculateDateRange()} day{calculateDateRange() !== 1 ? 's' : ''}
                                    </div>
                                </>
                            )}

                            <h2 className="text-lg text-black-500 font-medium border-b pb-2">Spending By Category Metrics</h2>
                            <div>
                                {expenseCategoryStats.map(({ category, amount, percent }) => (
                                    <div key={category} className="flex justify-between text-black">
                                    <span>{category}:</span>
                                    <span>
                                        <span className="font-bold">${amount.toFixed(2)}</span>
                                        <span className="text-cyan-600 font-normal ml-1">({percent.toFixed(1)}%)</span>
                                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Pie Chart Panel
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                            <h2 className="text-lg text-black-500 font-medium border-b pb-2">Pie Chart</h2>
                            {/* <Pie data={pieData} />
                        </div>
                        */}
                    </div>

                    {/* Transactions List Panel */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-medium border-b pb-2 mb-4">Filtered Report</h2>
                            
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map(transaction => (
                                        <div key={transaction.transaction_id} className="flex justify-between items-center p-2 border-b hover:bg-gray-50">
                                            <div className="flex items-center">
                                                <div className={`w-2 h-2 rounded-full ${transaction.transaction_type === 'Revenue' ? 'bg-green-600' : 'bg-red-500'} mr-3`}></div>
                                                <div>
                                                    <p className="font-medium">{transaction.description}</p>
                                                    <p className="text-sm text-gray-500">{transaction.category_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className={`font-bold ${transaction.transaction_type === 'Revenue' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {transaction.transaction_type === 'Revenue' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(transaction.created_time).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-gray-500">No transactions match your filters</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
         </div>
    );

}

export default Reports;