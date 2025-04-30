import Header from "../components/Header";
import Form from "../components/Form";
import { useMemo, useState } from "react";
import { CgCheckO } from "react-icons/cg"; // check mark symbol
import { CgCloseO } from "react-icons/cg"; // cancel mark symbol


const HomePageMain = ({ mockData, setMockData, expenseMode, setExpenseMode }) => {

    // Track which entry is being edited
    const [isEditing, setIsEditing] = useState(null);
    // Store the data being edited
    const [editData, setEditData] = useState({});
    // track popup messages
    const [message, setMessage] = useState(null);

    // Function to handle editing of a transaction
    function handleEdit(entry) {
        setIsEditing(entry.key);
        setEditData(entry);
    }

    // Function to handle saving changes
    function handleSave() {
        const updatedData = mockData.map((entry) =>
            entry.key === editData.key ? editData : entry
        );
        // Update the state with the modified data
        setMockData(updatedData);
        // send a message to user
        setMessage("Transaction saved!");
        // hide message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
        // exit edit mode
        setIsEditing(null);
    }

    // function to handle cancel edit mode
    function handleCancel() {
        setIsEditing(null);
    }

    // Function to handle deleting a transaction
    function handleDelete(key) {
        const filteredData = mockData.filter(entry => entry.key !== key);
        setMockData(filteredData); // Remove the entry from the state
        // send message to user
        setMessage("Transaction deleted!");
        // hide message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
    }

    // Calculate the current balance (as before)
    const currentBalance = useMemo(() => {
        let balance = 0;
        mockData.forEach((obj) => {
            const amount = parseFloat(obj.Amount);
            if (obj.Type === 'Income') {
                balance += !isNaN(amount) ? amount : 0;
            } else if (obj.Type === 'Expense') {
                balance -= !isNaN(amount) ? amount : 0;
            }
        });
        return balance.toFixed(2);
    }, [mockData]);

    return (
        <div className="min-h-screen bg-gray-50">
            <title>Home Page</title>

            <Header />

            <div className="flex items-start justify-center gap-10 mt-10">

                <Form
                    mockData={mockData}
                    setMockData={setMockData}
                    setExpenseMode={setExpenseMode}
                    expenseMode={expenseMode}
                />

                <div className="bg-white w-2/5 h-[700px] border-[0.5px] border-gray-300 rounded-[10px] pl-5 pr-5 relative shadow-[0px_0px_2px_#9CA3AF80]">
                    <p className="font-semibold text-[1.5rem] mt-3">My Finances</p>

                    {message && <div className="text-center text-green-500 font-semibold">{message}</div>}

                    <div className="border-[0.5px] border-gray-300 mt-5 rounded-[5px] max-h-[500px] overflow-y-auto">
                        {mockData.map((data) => (
                            <div key={data.key} className="transaction-row">
                                {isEditing === data.key ? (
                                    <div className="flex items-center py-5 border-b-[0.5px] border-gray-300 justify-between">
                                        <div className="flex gap-5">
                                            <input
                                                value={editData.Title}
                                                onChange={(e) => setEditData({ ...editData, Title: e.target.value })}
                                                className="w-40"
                                            />
                                            <input
                                                value={editData.Amount}
                                                onChange={(e) => setEditData({ ...editData, Amount: e.target.value })}
                                                className="w-32"
                                            />
                                        </div>
                                        <div className="flex gap-5">
                                            <input
                                                value={editData.Category}
                                                onChange={(e) => setEditData({ ...editData, Category: e.target.value })}
                                                className="w-40"
                                            />
                                            <input
                                                value={editData.DateEntered}
                                                onChange={(e) => setEditData({ ...editData, DateEntered: e.target.value })}
                                                className="w-32"
                                            />
                                        </div>
                                        <div className="flex gap-5">
                                            <button onClick={handleSave} className="text-green-500 text-xl">
                                                <CgCheckO /> {/* Check Icon */}
                                            </button>
                                            <button onClick={handleCancel} className="text-red-500 text-xl">
                                                <CgCloseO /> {/* Close Icon */}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center py-5 border-b-[0.5px] border-gray-300 justify-between">
                                        <div className="flex items-center">
                                            {data.Type === 'Income' && <div className="ml-5 w-3 h-3 bg-[#2d9a51] rounded-2xl"></div>}
                                            {data.Type === 'Expense' && <div className="ml-5 w-3 h-3 bg-[#ff0015] rounded-2xl"></div>}
                                            <div className="ml-4">
                                                <p className="text-[1.2rem] font-semibold">{data.Title}</p>
                                                <p>{data.Category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-[1.2rem] mr-25">
                                            <p className={data.Type === 'Income' ? 'text-[#2d9a51]' : 'text-[#ff0015]'}>{data.Type === 'Income' ? '+' : '-'}${data.Amount}</p>
                                            <p>{data.DateEntered}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleEdit(data)} className="text-blue-500">Edit</button>
                                            <button onClick={() => handleDelete(data.key)} className="text-red-500">Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

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
        </div >
    );
}

export default HomePageMain;
