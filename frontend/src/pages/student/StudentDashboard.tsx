// src/pages/student/StudentDashboard.tsx - COMPLETE WITH RESOURCES & NOTIFICATIONS

import { useState, useEffect } from "react";
import { 
    Bell, 
    BookOpen, 
    Calendar, 
    Award, 
    DollarSign, 
    FileText,
    Download,
    ChevronRight,
    Clock,
    User,
    Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";
import { getApiErrorMessage } from "../../services/error";

// ============================================
// 📌 INTERFACES
// ============================================

interface Announcement {
    _id: string;
    title: string;
    content: string;
    audience: string;
    priority: string;
    createdAt: string;
}

interface Resource {
    _id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    readableSize: string;
    subject: string;
    classLevel: string;
    uploadedBy: { _id: string; name: string; email: string };
    downloadCount: number;
    viewCount: number;
    createdAt: string;
}

interface FeeStatus {
    totalFees: number;
    paid: number;
    pending: number;
    overdue: number;
}

interface GradeSummary {
    average: number;
    subjects: number;
    completed: number;
}

interface FeeItem {
    status: string;
    isOverdue?: boolean;
}

const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
};

// ============================================
// 📌 MAIN COMPONENT
// ============================================

const StudentDashboard = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [recentResources, setRecentResources] = useState<Resource[]>([]);
    const [feeStatus, setFeeStatus] = useState<FeeStatus | null>(null);
    const [gradeSummary, setGradeSummary] = useState<GradeSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);
    const [greeting, setGreeting] = useState("");

    // ✅ Get user info
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const studentName = user?.name || 'Student';

    // ✅ Set greeting based on time
    useEffect(() => {
        async function setGreetingByTime() {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting("Good Morning ☀️");
            else if (hour < 17) setGreeting("Good Afternoon 🌤️");
            else setGreeting("Good Evening 🌙");
        }
        setGreetingByTime();
    }, []);

    // ✅ Fetch all data
    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem('token');
                
                // 1️⃣ Fetch announcements
                const annRes = await axios.get('http://localhost:7000/api/announcements', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const announcementsData = annRes.data.data || [];
                setAnnouncements(announcementsData.slice(0, 3));
                setNotificationCount(announcementsData.length);

                // 2️⃣ Fetch recent resources
                const resRes = await axios.get('http://localhost:7000/api/resources/recent?limit=5', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecentResources(resRes.data.data || []);

                // 3️⃣ Fetch fee status
                try {
                    const feeRes = await axios.get('http://localhost:7000/api/finance/parent/student-fees', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const fees = feeRes.data.data || [];
                    const total = fees.length;
                    const paid = fees.filter((f: FeeItem) => f.status === 'paid').length;
                    const pending = fees.filter((f: FeeItem) => f.status === 'pending').length;
                    const overdue = fees.filter((f: FeeItem) => f.isOverdue).length;
                    setFeeStatus({ totalFees: total, paid, pending, overdue });
                } catch (error) {
                    console.error("Error fetching fees:", error);
                }

                // 4️⃣ Fetch grade summary
                try {
                    const gradeRes = await axios.get('http://localhost:7000/api/grades/my-summary', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setGradeSummary(gradeRes.data.data || null);
                } catch (error) {
                    console.error("Error fetching grades:", error);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        }
        load();
    }, []);

    // ============================================
    // 📌 HELPERS
    // ============================================

    const getFileIcon = (fileType: string) => {
        const icons: Record<string, string> = {
            pdf: '📄',
            doc: '📝',
            docx: '📝',
            xls: '📊',
            xlsx: '📊',
            ppt: '📑',
            pptx: '📑',
            image: '🖼️',
            video: '🎬',
        };
        return icons[fileType] || '📎';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
            medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse',
        };
        return colors[priority] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    };

    const getPriorityIcon = (priority: string) => {
        const icons: Record<string, string> = {
            low: '📌',
            medium: '🔵',
            high: '🔶',
            urgent: '🚨',
        };
        return icons[priority] || '📌';
    };

    const handleDownload = async (id: string, fileName: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:7000/api/resources/${id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert(getApiErrorMessage(error, "Failed to download resource"));
        }
    };

    // ============================================
    // 🎨 RENDER
    // ============================================

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* ============================================
                    HEADER WITH GREETING & NOTIFICATIONS
                    ============================================ */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            {greeting}, {studentName}!
                            <Sparkles size={20} className="text-yellow-500" />
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your learning journey</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/student/announcements"
                            className="relative p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700"
                        >
                            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </Link>
                        <Link 
                            to="/student/resources"
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
                        >
                            <BookOpen size={18} />
                            Resources
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* ============================================
                    STATS CARDS
                    ============================================ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Avg Grade</p>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    {gradeSummary?.average || 'N/A'}%
                                </h2>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                                <Award size={20} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Subjects</p>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                    {gradeSummary?.subjects || 0}
                                </h2>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                                <BookOpen size={20} className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Fees Due</p>
                                <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {feeStatus?.pending || 0}
                                </h2>
                            </div>
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl">
                                <DollarSign size={20} className="text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Resources</p>
                                <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {recentResources.length}
                                </h2>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                                <FileText size={20} className="text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================
                    QUICK LINKS
                    ============================================ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: <Award size={20} />, label: 'My Grades', path: '/student/grades', color: 'blue' },
                        { icon: <Calendar size={20} />, label: 'Attendance', path: '/student/attendance', color: 'green' },
                        { icon: <DollarSign size={20} />, label: 'My Fees', path: '/student/fees', color: 'yellow' },
                        { icon: <FileText size={20} />, label: 'Worksheets', path: '/student/worksheets', color: 'purple' },
                    ].map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition flex items-center gap-3 group`}
                        >
                            <div className={`p-2 rounded-xl bg-${item.color}-100 text-${item.color}-600 group-hover:scale-110 transition`}>
                                {item.icon}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                            <ChevronRight size={16} className="ml-auto text-gray-300 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition" />
                        </Link>
                    ))}
                </div>

                {/* ============================================
                    RECENT RESOURCES
                    ============================================ */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            Recent Resources
                        </h2>
                        <Link 
                            to="/student/resources" 
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                        >
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="p-4">
                        {recentResources.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <FileText size={40} className="mx-auto text-gray-300 dark:text-gray-500 mb-3" />
                                <p>No resources available yet</p>
                                <p className="text-sm">Check back later for learning materials</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentResources.map((resource) => (
                                    <div 
                                        key={resource._id} 
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <span className="text-3xl flex-shrink-0">{getFileIcon(resource.fileType)}</span>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{resource.title}</p>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen size={12} />
                                                        {resource.subject}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} />
                                                        {resource.uploadedBy?.name || 'Teacher'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {getTimeAgo(resource.createdAt)}
                                                    </span>
                                                    <span className="text-gray-400 dark:text-gray-500">{resource.readableSize}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(resource._id, resource.fileName)}
                                            className="flex-shrink-0 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200"
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================
                    ANNOUNCEMENTS SECTION
                    ============================================ */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Bell size={20} className="text-blue-600" />
                            Announcements
                            {notificationCount > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {notificationCount} new
                                </span>
                            )}
                        </h2>
                        <Link 
                            to="/student/announcements" 
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                        >
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="p-4">
                        {announcements.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Bell size={40} className="mx-auto text-gray-300 dark:text-gray-500 mb-3" />
                                <p>No announcements</p>
                                <p className="text-sm">Check back later for updates</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {announcements.map((announcement) => (
                                    <div 
                                        key={announcement._id}
                                        className={`p-4 rounded-xl border-l-4 ${
                                            announcement.priority === 'urgent' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                                            announcement.priority === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :
                                            'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-xl">{getPriorityIcon(announcement.priority)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{announcement.title}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{announcement.content}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {getTimeAgo(announcement.createdAt)}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(announcement.priority)}`}>
                                                        {announcement.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ============================================
                    QUICK TIPS / MOTIVATIONAL
                    ============================================ */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                            <Sparkles size={24} className="text-yellow-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">💡 Did you know?</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                You have {recentResources.length} new resource{recentResources.length !== 1 ? 's' : ''} available. 
                                Check them out to enhance your learning!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;