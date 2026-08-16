import { Users, ClipboardCheck, GraduationCap, Megaphone } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAppContext } from "../../context/AppContext";

const ParentDashboard = () => {
    const { schoolInfo, announcements, attendanceRecords, gradeRecords } = useAppContext();

    const publishedAnnouncements = announcements.filter(a => a.status === "Published");
    const childrenAttendance = attendanceRecords.length;
    const childrenGrades = gradeRecords.length;

    return (
        <DashboardLayout role="parent">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{schoolInfo.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Parent Dashboard - Monitor your children's progress</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300"><Users size={25} /></div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Children</p>
                            <h2 className="text-2xl font-bold dark:text-gray-100">2</h2>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300"><GraduationCap size={25} /></div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Grades Recorded</p>
                            <h2 className="text-2xl font-bold dark:text-gray-100">{childrenGrades}</h2>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300"><ClipboardCheck size={25} /></div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Attendance Records</p>
                            <h2 className="text-2xl font-bold dark:text-gray-100">{childrenAttendance}</h2>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-600 dark:text-gray-300"><Megaphone size={25} /></div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Announcements</p>
                            <h2 className="text-2xl font-bold dark:text-gray-100">{publishedAnnouncements.length}</h2>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold text-lg mb-4 dark:text-gray-100">Recent Announcements</h3>
                        {publishedAnnouncements.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No announcements yet</p>
                        ) : (
                            <div className="space-y-3">
                                {publishedAnnouncements.slice(0, 3).map((a) => (
                                    <div key={a.id} className="border-b dark:border-gray-700 pb-3 last:border-0">
                                        <h4 className="font-medium text-gray-800 dark:text-gray-100">{a.title}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{a.date}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold text-lg mb-4 dark:text-gray-100">Quick Overview</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <span className="text-gray-800 dark:text-gray-100">Children Enrolled</span>
                                <span className="font-bold text-gray-800 dark:text-gray-100">2</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <span className="text-gray-800 dark:text-gray-100">Average Attendance</span>
                                <span className="font-bold text-gray-800 dark:text-gray-100">
                                    {attendanceRecords.length > 0
                                        ? `${Math.round((attendanceRecords.filter(r => r.status === "present").length / attendanceRecords.length) * 100)}%`
                                        : "N/A"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <span className="text-gray-800 dark:text-gray-100">Subjects with Grades</span>
                                <span className="font-bold text-gray-800 dark:text-gray-100">{gradeRecords.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ParentDashboard;
