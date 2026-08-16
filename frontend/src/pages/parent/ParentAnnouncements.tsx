// src/pages/parent/ParentAnnouncements.tsx - ENHANCED UI

import { useState, useEffect } from "react";
import { Megaphone, Calendar, Clock, AlertCircle, Users, GraduationCap, Bell } from "lucide-react";
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

interface Child {
    _id: string;
    name: string;
    class: string;
    classLevel?: string;
}

const PRIORITY_STYLES: Record<string, { border: string; bg: string; icon: string; badge: string }> = {
    low: { 
        border: 'border-gray-300', 
        bg: 'bg-gray-50 dark:bg-gray-700/50', 
        icon: '📌',
        badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    },
    medium: { 
        border: 'border-blue-400', 
        bg: 'bg-blue-50 dark:bg-blue-900/20', 
        icon: '🔵',
        badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    },
    high: { 
        border: 'border-orange-400', 
        bg: 'bg-orange-50 dark:bg-orange-900/20', 
        icon: '🔶',
        badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    },
    urgent: { 
        border: 'border-red-500', 
        bg: 'bg-red-50 dark:bg-red-900/20', 
        icon: '🚨',
        badge: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
    },
};

const ParentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const token = localStorage.getItem('token');
                
                const annRes = await axios.get('http://localhost:7000/api/announcements', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnnouncements(annRes.data.data || []);

                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const userId = user?._id;

                if (userId) {
                    const childRes = await axios.get(
                        `http://localhost:7000/api/parents/${userId}/children`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setChildren(childRes.data.data || []);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(getApiErrorMessage(error, "Failed to load announcements"));
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const isRelevantToChildren = (announcement: Announcement) => {
        if (announcement.audience === 'parents' || announcement.audience === 'all') return true;
        if (announcement.audience === 'students' && children.length > 0) return true;
        return false;
    };

    const getPriorityStyle = (priority: string) => {
        return PRIORITY_STYLES[priority] || PRIORITY_STYLES.low;
    };

    if (loading) {
        return (
            <DashboardLayout role="parent">
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
            <DashboardLayout role="parent">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    const relevantAnnouncements = announcements.filter(isRelevantToChildren);

    return (
        <DashboardLayout role="parent">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                            <Megaphone size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Announcements</h1>
                            <p className="text-gray-500 dark:text-gray-400">Stay informed about school updates</p>
                        </div>
                    </div>
                    {children.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
                            <Users size={18} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                                {children.length} child{children.length > 1 ? 'ren' : ''} enrolled
                            </span>
                        </div>
                    )}
                </div>

                {/* Children Quick View */}
                {children.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap size={18} className="text-blue-500 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Your Children:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {children.map((child) => (
                                <span key={child._id} className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full text-sm text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                    {child.name} ({child.class || 'No class'})
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">For You</p>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{relevantAnnouncements.length}</h2>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm p-4 border border-red-200 dark:border-red-800">
                        <p className="text-red-600 dark:text-red-400 text-sm">Urgent</p>
                        <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
                            {relevantAnnouncements.filter(a => a.priority === 'urgent').length}
                        </h2>
                    </div>
                </div>

                {/* Announcements List */}
                {relevantAnnouncements.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} className="text-gray-300 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">No Announcements</h3>
                        <p className="text-gray-500 dark:text-gray-400">No announcements available for you at this time.</p>
                        {children.length === 0 && (
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                💡 You don't have any children linked yet. Contact the school registrar.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {relevantAnnouncements.map((announcement) => {
                            const style = getPriorityStyle(announcement.priority);
                            
                            return (
                                <div
                                    key={announcement._id}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-l-4 p-5 hover:shadow-md transition-all ${style.border} ${style.bg}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.badge}`}>
                                                <span className="text-xl">{style.icon}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                                    {announcement.title}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>
                                                    {announcement.priority.toUpperCase()}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                                                {announcement.content}
                                            </p>

                                            {/* Child-specific context */}
                                            {announcement.audience === 'students' && children.length > 0 && (
                                                <div className="mt-2 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                                                    <GraduationCap size={14} />
                                                    <span>Affects your child{children.length > 1 ? 'ren' : ''}</span>
                                                </div>
                                            )}

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
                                                <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                                                    👤 {announcement.createdBy?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>

                                        {announcement.priority === 'urgent' && (
                                            <div className="flex-shrink-0">
                                                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium flex items-center gap-1">
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

export default ParentAnnouncements;