import Header from "../components/Header";
import { useState } from "react";

function Reports() {
    return (
    <div className="flex items-start justify-center gap-10 mt-16"> {/* Added margin-top to space from header */}
       <div className="container mx-auto p-6 max-w-6xl">
            <Header />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                        <h2 className="text-lg font-medium border-b pb-2">Filter Options</h2>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Date Range</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="btn-outline">
                                    <span className="calendar-icon"></span>
                                    Start Date
                                </button>
                                <button className="btn-outline">
                                    <span className="calendar-icon"></span>
                                    End Date
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Categories</label>
                            <button className="btn-outline categories-dropdown w-full justify-between">
                                All Categories
                                <span className="chevron-down"></span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Amount Range</label>
                            <div className="flex gap-2 items-center">
                                <span>$</span>
                                <input type="number" placeholder="Min" className="input w-full" />
                                    <span>to</span>
                                    <span>$</span>
                                    <input type="number" placeholder="Max" className="input w-full" />
                                    </div>
                            </div>

                            <button className="btn-outline w-full mt-4">
                                <span className="filter-icon"></span>
                                Reset Filters
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                            <h2 className="text-lg font-medium border-b pb-2">Statistics</h2>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Total Income:</span>
                                    <span className="text-income">$3,240.00</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Total Expenses:</span>
                                    <span className="text-expense">$1,890.00</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Net Balance:</span>
                                    <span className="font-bold text-income">$1,350.00</span>
                                </div>
                            </div>

                            <h3 className="font-medium mt-4">Average By Category</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span>Food:</span>
                                    <span>$245.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Housing:</span>
                                    <span>$1,200.00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Transportation:</span>
                                    <span>$150.00</span>
                                </div>
                            </div>

                            <div className="mt-4 h-48 chart-container">
                                <div className="pie-chart-placeholder"></div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Filtered Transactions</h2>

                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <div className="px-4 py-3 space-y-4 max-h-[500px] overflow-y-auto">
                                        <div className="transaction-item flex items-center justify-between py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="income-dot"></div>
                                                <div>
                                                    <p className="font-medium">Salary</p>
                                                    <p className="text-sm text-gray-500">Income</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium text-income">+$2,500.00</span>
                                                <span className="text-sm text-gray-500">05/15/2023</span>
                                            </div>
                                        </div>

                                        <div className="transaction-item flex items-center justify-between py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="expense-dot"></div>
                                                <div>
                                                    <p className="font-medium">Rent</p>
                                                    <p className="text-sm text-gray-500">Housing</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium text-expense">-$1,200.00</span>
                                                <span className="text-sm text-gray-500">05/01/2023</span>
                                            </div>
                                        </div>

                                        <div className="transaction-item flex items-center justify-between py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="expense-dot"></div>
                                                <div>
                                                    <p className="font-medium">Groceries</p>
                                                    <p className="text-sm text-gray-500">Food</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium text-expense">-$150.00</span>
                                                <span className="text-sm text-gray-500">05/10/2023</span>
                                            </div>
                                        </div>

                                        <div className="transaction-item flex items-center justify-between py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="income-dot"></div>
                                                <div>
                                                    <p className="font-medium">Freelance Work</p>
                                                    <p className="text-sm text-gray-500">Income</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium text-income">+$740.00</span>
                                                <span className="text-sm text-gray-500">05/20/2023</span>
                                            </div>
                                        </div>

                                        <div className="transaction-item flex items-center justify-between py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="expense-dot"></div>
                                                <div>
                                                    <p className="font-medium">Car Insurance</p>
                                                    <p className="text-sm text-gray-500">Transportation</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium text-expense">-$95.00</span>
                                                <span className="text-sm text-gray-500">05/05/2023</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    </div>
    )
}

export default Reports;