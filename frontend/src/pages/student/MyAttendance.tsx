import { useState, useEffect } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

interface SummaryData {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    attendanceRate: number;
}

interface AttendanceSummary {
    _id: string;
    period: "week" | "month" | "semester" | "annual";
    periodStart: string;
    periodEnd: string;
    weekNumber?: number;
    month?: string;
    semester?: string;
    academicYear: string;
    summary: SummaryData;
}

const MyAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [overall, setOverall] = useState<SummaryData | null>(null);
    const [breakdown, setBreakdown] = useState<AttendanceSummary[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    'http://localhost:7000/api/attendance/my-summary',
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setOverall(response.data.data.overall);
                    setBreakdown(response.data.data.breakdown || []);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching attendance summary:", error);
                setError(getApiErrorMessage(error, "Failed to load attendance"));
                setLoading(false);
            }
        }
        load();
    }, []);

    const getFilteredBreakdown = () => {
        if (selectedPeriod === "all") return breakdown;
        return breakdown.filter(item => item.period === selectedPeriod);
    };

    const getPeriodLabel = (item: AttendanceSummary) => {
        switch (item.period) {
            case 'week':
                return `Week ${item.weekNumber} (${new Date(item.periodStart).toLocaleDateString()} - ${new Date(item.periodEnd).toLocaleDateString()})`;
            case 'month':
                return `${item.month} ${new Date(item.periodStart).getFullYear()}`;
            case 'semester':
                return `${item.semester} ${item.academicYear}`;
            case 'annual':
                return `Annual ${item.academicYear}`;
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500 dark:text-gray-400">Loading attendance summary...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Attendance</h1>
                    <p className="text-gray-500 dark:text-gray-400">View your attendance summary</p>
                </div>

                {/* Overall Stats Cards */}
                {overall && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center border-l-4 border-green-500">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Present</p>
                            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">{overall.present}</h2>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center border-l-4 border-red-500">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Absent</p>
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">{overall.absent}</h2>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center border-l-4 border-yellow-500">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Late</p>
                            <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{overall.late}</h2>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center border-l-4 border-blue-500">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Excused</p>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{overall.excused}</h2>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center border-l-4 border-purple-500">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Attendance Rate</p>
                            <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">{overall.attendanceRate}%</h2>
                        </div>
                    </div>
                )}

                {/* Period Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <label className="font-medium text-gray-700 dark:text-gray-200">Filter by Period:</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                        >
                            <option value="all">All Periods</option>
                            <option value="week">Weekly</option>
                            <option value="month">Monthly</option>
                            <option value="semester">Semester</option>
                            <option value="annual">Annual</option>
                        </select>
                    </div>
                </div>

                {/* Breakdown Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Attendance Breakdown
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                                ({getFilteredBreakdown().length} records)
                            </span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Period</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Present</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Absent</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Late</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Excused</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Rate</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {getFilteredBreakdown().length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No attendance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    getFilteredBreakdown().map((item) => {
                                        const rate = item.summary.attendanceRate;
                                        const statusColor = rate >= 90 ? 'text-green-600 dark:text-green-400' : rate >= 75 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
                                        const statusText = rate >= 90 ? 'Good' : rate >= 75 ? 'Fair' : 'Needs Improvement';
                                        
                                        return (
                                            <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 font-medium">{getPeriodLabel(item)}</td>
                                                <td className="px-6 py-4 text-green-600 dark:text-green-400">{item.summary.present}</td>
                                                <td className="px-6 py-4 text-red-600 dark:text-red-400">{item.summary.absent}</td>
                                                <td className="px-6 py-4 text-yellow-600 dark:text-yellow-400">{item.summary.late}</td>
                                                <td className="px-6 py-4 text-blue-600 dark:text-blue-400">{item.summary.excused}</td>
                                                <td className="px-6 py-4 font-bold">{item.summary.attendanceRate}%</td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-medium ${statusColor}`}>
                                                        {statusText}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400">
                    💡 Your attendance is summarized weekly. Daily records are removed after summarization to keep the system fast and efficient.
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MyAttendance;