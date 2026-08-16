// src/pages/student/Announcements.tsx - ENHANCED UI

import { useState, useEffect } from "react";
import { Megaphone, Calendar, Clock, AlertCircle, Bell, Users } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

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

const PRIORITY_COLORS: Record<string, string> = {
    low: 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50',
    medium: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
    high: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
    urgent: 'border-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse',
};

const PRIORITY_BADGES: Record<string, { bg: string; text: string; icon: string }> = {
    low: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300', icon: '📌' },
    medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: '🔵' },
    high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', icon: '🔶' },
    urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: '🚨' },
};

const StudentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:7000/api/announcements', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnnouncements(response.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching announcements:", error);
                setError(getApiErrorMessage(error, "Failed to load announcements"));
                setLoading(false);
            }
        }
        load();
    }, []);

    const getPriorityBadge = (priority: string) => {
        const style = PRIORITY_BADGES[priority] || PRIORITY_BADGES.low;
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${style.bg} ${style.text}`}>
                {style.icon} {priority.toUpperCase()}
            </span>
        );
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading announcements...</p>
                    </div>
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
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                        <Megaphone size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Announcements</h1>
                        <p className="text-gray-500 dark:text-gray-400">Stay updated with school news</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Total</p>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{announcements.length}</h2>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm p-4 border border-red-200 dark:border-red-800">
                        <p className="text-red-600 dark:text-red-400 text-sm">Urgent</p>
                        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
                            {announcements.filter(a => a.priority === 'urgent').length}
                        </h2>
                    </div>
                </div>

                {/* Announcements List */}
                {announcements.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} className="text-gray-300 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">No Announcements</h3>
                        <p className="text-gray-500 dark:text-gray-400">No announcements available at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => {
                            const borderColor = PRIORITY_COLORS[announcement.priority] || PRIORITY_COLORS.low;
                            
                            return (
                                <div
                                    key={announcement._id}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-l-4 p-5 hover:shadow-md transition-all ${borderColor}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {announcement.priority === 'urgent' ? (
                                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                                    <AlertCircle size={20} className="text-red-500" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                    <Megaphone size={20} className="text-blue-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                                    {announcement.title}
                                                </h3>
                                                {getPriorityBadge(announcement.priority)}
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                                                {announcement.content}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={15} />
                                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={15} />
                                                    {announcement.timeRemaining || 'No expiry'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Users size={15} />
                                                    {announcement.audience}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                                    👤 {announcement.createdBy?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>

                                        {announcement.priority === 'urgent' && (
                                            <div className="flex-shrink-0">
                                                <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    New
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentAnnouncements;