// In StudentDashboard.tsx
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

const StudentDashboard = () => {
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        fetchNotificationCount();
    }, []);

    const fetchNotificationCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/announcements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotificationCount(response.data.data?.length || 0);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
                        <p className="text-gray-500">View grades, attendance, and announcements</p>
                    </div>
                    <div className="relative">
                        <Bell size={24} className="text-gray-600" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                {notificationCount}
                            </span>
                        )}
                    </div>
                </div>
                {/* ... rest of dashboard content */}
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;