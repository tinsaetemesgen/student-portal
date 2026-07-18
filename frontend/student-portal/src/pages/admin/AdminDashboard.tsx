import DashboardLayout from "../../layout/DashboardLayout";

const stats = [
    { title: "Total Students", value: "1,000" },
    { title: "Total Teachers", value: "50" },
    { title: "Attendance Today", value: "90%" },
    { title: "Announcements", value: "10" },
];

export default function AdminDashboard() {
    return (
        <DashboardLayout>
            <div className="space-y-6">s
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm">
                            <p className="text-gray-500 text-sm">{stat.title}</p>
                            <h3 className="text-3xl font-bold mt-2 text-gray-800">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-gray-500 text-sm">
                                    <th className="pb-3">Activity</th>
                                    <th className="pb-3">User</th>
                                    <th className="pb-3">Time</th>
                                </tr>
                            </thead>

                            <tbody className="text-gray-700">
                                <tr className="border-b">
                                    <td className="py-4">Added new student</td>
                                    <td className="py-4">Admin User</td>
                                    <td className="py-4">10 min ago</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="py-4">Published announcement</td>
                                    <td className="py-4">Admin User</td>
                                    <td className="py-4">1 hour ago</td>
                                </tr>
                                <tr>
                                    <td className="py-4">Updated attendance records</td>
                                    <td className="py-4">Teacher Samuel</td>
                                    <td className="py-4">2 hours ago</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}