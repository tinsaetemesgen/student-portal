// src/pages/parent/ParentAnnouncements.tsx
import { useState, useEffect } from "react";
import { Megaphone, Calendar, Clock, AlertCircle, Users, GraduationCap } from "lucide-react";
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

interface Child {
    _id: string;
    name: string;
    class: string;
}

const ParentAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // 1️⃣ Fetch announcements
            const annRes = await axios.get('http://localhost:7000/api/announcements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(annRes.data.data || []);

            // 2️⃣ Fetch children (to show child-specific context)
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
        } catch (error: any) {
            console.error("Error fetching data:", error);
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

    // ✅ Check if announcement is relevant to parent's children
    const isRelevantToChildren = (announcement: Announcement) => {
        // If announcement is for parents or all users, it's relevant
        if (announcement.audience === 'parents' || announcement.audience === 'all') {
            return true;
        }
        // If it's for students, check if any child is a student
        if (announcement.audience === 'students' && children.length > 0) {
            return true;
        }
        return false;
    };

    if (loading) {
        return (
            <DashboardLayout role="parent">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading announcements...</div>
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

    // ✅ Filter announcements relevant to this parent
    const relevantAnnouncements = announcements.filter(isRelevantToChildren);

    return (
        <DashboardLayout role="parent">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                        <p className="text-gray-500">Stay informed about school updates</p>
                    </div>
                    {children.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                            <Users size={18} className="text-blue-600" />
                            <span className="text-sm text-blue-700">
                                {children.length} child{children.length > 1 ? 'ren' : ''} enrolled
                            </span>
                        </div>
                    )}
                </div>

                {/* Children Quick View */}
                {children.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap size={18} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Your Children:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {children.map((child) => (
                                <span key={child._id} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                                    {child.name} ({child.class || 'No class'})
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Announcements List */}
                {relevantAnnouncements.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <Megaphone size={48} className="mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-700">No Announcements</h3>
                        <p className="text-gray-500">No announcements available for you at this time.</p>
                        {children.length === 0 && (
                            <p className="text-sm text-gray-400 mt-2">
                                💡 You don't have any children linked yet. Contact the school registrar.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {relevantAnnouncements.map((announcement) => (
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
                                        
                                        {/* ✅ Show which child this affects (if applicable) */}
                                        {announcement.audience === 'students' && children.length > 0 && (
                                            <div className="mt-2 flex items-center gap-1 text-sm text-blue-600">
                                                <GraduationCap size={14} />
                                                <span>Affects your child{children.length > 1 ? 'ren' : ''}</span>
                                            </div>
                                        )}

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

export default ParentAnnouncements;