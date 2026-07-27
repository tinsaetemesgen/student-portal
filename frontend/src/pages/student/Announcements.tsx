// src/pages/student/Announcements.tsx
import { useState, useEffect } from "react";
import { Megaphone, Calendar, Clock, AlertCircle } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

interface Announcement {
    _id: string;
    title: string;
    content: string;
    audience: string;
    priority: string;
    expiresAt: string;
    createdAt: string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    isExpired: boolean;
    timeRemaining: string;
}

const StudentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:7000/api/announcements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(response.data.data || []);
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching announcements:", error);
            setError(error.response?.data?.error || "Failed to load announcements");
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'bg-gray-100 text-gray-700',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-yellow-100 text-yellow-700',
            urgent: 'bg-red-100 text-red-700',
        };
        return colors[priority] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityIcon = (priority: string) => {
        if (priority === 'urgent' || priority === 'high') {
            return <AlertCircle size={16} className="text-red-500" />;
        }
        return <Megaphone size={16} className="text-blue-500" />;
    };

    const getAudienceLabel = (audience: string) => {
        const labels: Record<string, string> = {
            all: '📢 All Users',
            students: '🎓 Students',
            teachers: '👨‍🏫 Teachers',
            parents: '👪 Parents',
            admin: '👑 Admin',
        };
        return labels[audience] || audience;
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading announcements...</div>
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
                    <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                    <p className="text-gray-500">View school announcements from administration</p>
                </div>

                {/* Announcements List */}
                {announcements.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <Megaphone size={48} className="mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-700">No Announcements</h3>
                        <p className="text-gray-500">No announcements available at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement._id}
                                className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                                    announcement.priority === 'urgent' ? 'border-red-500' :
                                    announcement.priority === 'high' ? 'border-yellow-500' :
                                    announcement.priority === 'medium' ? 'border-blue-500' :
                                    'border-gray-300'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {announcement.title}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                                                {announcement.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mt-1">{announcement.content}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(announcement.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {announcement.timeRemaining || 'No expiry'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Megaphone size={14} />
                                                {getAudienceLabel(announcement.audience)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                👤 {announcement.createdBy?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        {getPriorityIcon(announcement.priority)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentAnnouncements;