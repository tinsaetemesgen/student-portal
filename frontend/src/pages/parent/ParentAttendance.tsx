import { ClipboardCheck } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAppContext } from "../../context/AppContext";

const ParentAttendance = () => {
    const { attendanceRecords } = useAppContext();

    const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
    const absentCount = attendanceRecords.filter((r) => r.status === "absent").length;
    const lateCount = attendanceRecords.filter((r) => r.status === "late").length;

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            present: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
            absent: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
            late: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
        };
        return styles[status] || "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    };

    return (
        <DashboardLayout role="parent">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance Records</h1>
                    <p className="text-gray-500 dark:text-gray-400">View your children's attendance records</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300"><ClipboardCheck size={25} /></div>
                        <div><p className="text-gray-500 dark:text-gray-400 text-sm">Present</p><h2 className="text-2xl font-bold dark:text-gray-100">{presentCount}</h2></div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300"><ClipboardCheck size={25} /></div>
                        <div><p className="text-gray-500 dark:text-gray-400 text-sm">Absent</p><h2 className="text-2xl font-bold dark:text-gray-100">{absentCount}</h2></div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300"><ClipboardCheck size={25} /></div>
                        <div><p className="text-gray-500 dark:text-gray-400 text-sm">Late</p><h2 className="text-2xl font-bold dark:text-gray-100">{lateCount}</h2></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Student</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Grade</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {attendanceRecords.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No attendance records available yet.</td></tr>
                                ) : (
                                    attendanceRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 font-medium">{record.studentName}</td>
                                            <td className="px-6 py-4">{record.grade}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{record.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(record.status)}`}>{record.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ParentAttendance;
