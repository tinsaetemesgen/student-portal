import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardCheck, CheckCircle, XCircle, Clock } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

interface AttendanceRecord {
    _id: string;
    date: string;
    status: string;
    classId: { name: string };
    remarks?: string;
}

interface Student {
    _id: string;
    name: string;
    email: string;
    class: string;
}

const ParentChildAttendance = () => {
    const { childId } = useParams();
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem('token');
                
                const userRes = await axios.get(`http://localhost:7000/api/users/${childId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudent(userRes.data.data);

                const attendanceRes = await axios.get(
                    `http://localhost:7000/api/attendance/child/${childId}/attendance`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setAttendance(attendanceRes.data.data?.records || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(getApiErrorMessage(error, "Failed to load attendance"));
                setLoading(false);
            }
        }

        fetchData();
    }, [childId]);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            present: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
            absent: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
            late: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
            excused: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        };
        return styles[status] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />;
            case 'absent': return <XCircle size={16} className="text-red-600 dark:text-red-400" />;
            case 'late': return <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />;
            default: return null;
        }
    };

    const summary = attendance.reduce((acc, record) => {
        if (record.status === 'present') acc.present++;
        else if (record.status === 'absent') acc.absent++;
        else if (record.status === 'late') acc.late++;
        else if (record.status === 'excused') acc.excused++;
        acc.total++;
        return acc;
    }, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });

    if (loading) {
        return (
            <DashboardLayout role="parent">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500 dark:text-gray-400">Loading attendance...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="parent">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="parent">
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/parent/children')}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                    <ArrowLeft size={18} /> Back to Children
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{student?.name}'s Attendance</h1>
                    <p className="text-gray-500 dark:text-gray-400">{student?.class} • {student?.email}</p>
                </div>

                {/* Summary Cards */}
                {attendance.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center border-l-4 border-green-500">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Present</p>
                            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.present}</h2>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center border-l-4 border-red-500">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Absent</p>
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.absent}</h2>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center border-l-4 border-yellow-500">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Late</p>
                            <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.late}</h2>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center border-l-4 border-blue-500">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Days</p>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.total}</h2>
                        </div>
                    </div>
                )}

                {attendance.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                        <ClipboardCheck size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                        <h3 className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">No Attendance Records</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">No attendance has been recorded for this student yet.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Class</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {attendance.slice(0, 10).map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">{record.classId?.name || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{record.remarks || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {attendance.length > 10 && (
                                <p className="px-6 py-2 text-sm text-gray-400 dark:text-gray-500">Showing 10 of {attendance.length} records</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ParentChildAttendance;