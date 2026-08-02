// src/pages/finance/FinanceDashboard.tsx - FIXED

import { useState, useEffect } from "react";
import { DollarSign, Clock, AlertCircle, TrendingUp, Plus, Users, FileText, CheckCircle } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { Link } from "react-router-dom";

interface DashboardStats {
    totalCollected: number;
    pendingAmount: number;
    overdueAmount: number;
    collectionRate: number;
    totalFees: number;
    paidFees: number;
    pendingCount: number;
}

const FinanceDashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalCollected: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        collectionRate: 0,
        totalFees: 0,
        paidFees: 0,
        pendingCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/finance/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('📊 Stats response:', response.data);
            setStats(response.data.data || {
                totalCollected: 0,
                pendingAmount: 0,
                overdueAmount: 0,
                collectionRate: 0,
                totalFees: 0,
                paidFees: 0,
                pendingCount: 0,
            });
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching stats:", error);
            setError(error.response?.data?.error || "Failed to load stats");
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount || 0);
    };

    if (loading) {
        return (
            <DashboardLayout role="finance_officer">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading dashboard...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="finance_officer">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Finance Dashboard</h1>
                    <p className="text-gray-500">Manage school fees, payments, and financial reports</p>
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-700">Welcome, Finance Officer! You can view and manage all financial activities here.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 font-medium">Total Collected</p>
                                <p className="text-2xl font-bold text-green-800">{formatCurrency(stats.totalCollected || 0)}</p>
                            </div>
                            <DollarSign size={32} className="text-green-600" />
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700 font-medium">Pending Payments</p>
                                <p className="text-2xl font-bold text-yellow-800">{formatCurrency(stats.pendingAmount || 0)}</p>
                                <p className="text-xs text-yellow-600">{stats.pendingCount || 0} payments pending</p>
                            </div>
                            <Clock size={32} className="text-yellow-600" />
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700 font-medium">Overdue Fees</p>
                                <p className="text-2xl font-bold text-red-800">{formatCurrency(stats.overdueAmount || 0)}</p>
                            </div>
                            <AlertCircle size={32} className="text-red-600" />
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Collection Rate</p>
                                <p className="text-2xl font-bold text-purple-800">{stats.collectionRate || 0}%</p>
                                <p className="text-xs text-purple-600">{stats.paidFees || 0} / {stats.totalFees || 0} fees paid</p>
                            </div>
                            <TrendingUp size={32} className="text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Management</h3>
                        <div className="space-y-3">
                            <Link
                                to="/finance/fees"
                                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                            >
                                <Plus size={20} className="text-blue-600" />
                                <div>
                                    <p className="font-medium text-blue-700">Create Fee Structure</p>
                                    <p className="text-sm text-blue-500">Create new fee structures</p>
                                </div>
                            </Link>
                            <Link
                                to="/finance/fees"
                                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                            >
                                <Users size={20} className="text-green-600" />
                                <div>
                                    <p className="font-medium text-green-700">Assign Fees to Students</p>
                                    <p className="text-sm text-green-500">Assign fees to students</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Processing</h3>
                        <div className="space-y-3">
                            <Link
                                to="/finance/payments"
                                className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
                            >
                                <CheckCircle size={20} className="text-yellow-600" />
                                <div>
                                    <p className="font-medium text-yellow-700">Confirm Payments</p>
                                    <p className="text-sm text-yellow-500">Review and confirm pending payments</p>
                                </div>
                            </Link>
                            <Link
                                to="/finance/payments"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                                <FileText size={20} className="text-gray-600" />
                                <div>
                                    <p className="font-medium text-gray-700">View All Payments</p>
                                    <p className="text-sm text-gray-500">View payment history</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Reports Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Reports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            to="/finance/reports"
                            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <FileText size={24} className="text-blue-600" />
                            <div>
                                <p className="font-medium">Revenue Report</p>
                                <p className="text-sm text-gray-500">View revenue breakdown</p>
                            </div>
                        </Link>
                        <Link
                            to="/finance/reports"
                            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <FileText size={24} className="text-red-600" />
                            <div>
                                <p className="font-medium">Expense Report</p>
                                <p className="text-sm text-gray-500">View expense breakdown</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FinanceDashboard;