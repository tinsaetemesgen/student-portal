import { useState, useEffect } from "react";
import { Plus, Megaphone, FileText, CheckCircle, Clock, X, Calendar, BookOpen, User, Edit2, Trash2, Save } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import axios from "axios";

// ============================================
// 📢 INTERFACES
// ============================================

interface Announcement {
    _id: string;
    title: string;
    content: string;
    audience: "All" | "Students" | "Teachers" | "Parents";
    date: string;
    status: "Published" | "Draft";
    createdBy: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

interface AnnouncementForm {
    title: string;
    content: string;
    audience: "All" | "Students" | "Teachers" | "Parents";
    date: string;
    status: "Published" | "Draft";
}

interface TimeSlot {
    _id: string;
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    subject: string;
    teacherId: {
        _id: string;
        name: string;
    } | string;
    classId: {
        _id: string;
        name: string;
    } | string;
    room: string;
    isBreak: boolean;
    breakDuration: number;
    semester: string;
    academicYear: string;
}

interface TimeSlotForm {
    day: string;
    startTime: string;
    endTime: string;
    periodNumber: number;
    subject: string;
    teacherId: string;
    classId: string;
    room: string;
    isBreak: boolean;
    breakDuration: number;
    semester: string;
    academicYear: string;
}

// ============================================
// 🎨 STYLES
// ============================================

const AUDIENCE_BADGES: Record<string, string> = {
    All: "bg-purple-100 text-purple-700",
    Students: "bg-blue-100 text-blue-700",
    Teachers: "bg-green-100 text-green-700",
    Parents: "bg-yellow-100 text-yellow-700",
};

const STATUS_BADGES: Record<string, string> = {
    Published: "bg-green-100 text-green-700",
    Draft: "bg-gray-100 text-gray-700",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6];

// ============================================
// 📢 MAIN COMPONENT
// ============================================

const Announcements = () => {
    // ---------- Announcements State ----------
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedAudience, setSelectedAudience] = useState<"All" | "Students" | "Teachers" | "Parents">("All");
    const [activeTab, setActiveTab] = useState<"announcements" | "timetable">("announcements");

    // ---------- Timetable State ----------
    const [timetableSlots, setTimetableSlots] = useState<TimeSlot[]>([]);
    const [timetableLoading, setTimetableLoading] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    const [slotFormData, setSlotFormData] = useState<TimeSlotForm>({
        day: "Monday",
        startTime: "8:00 AM",
        endTime: "9:00 AM",
        periodNumber: 1,
        subject: "",
        teacherId: "",
        classId: "",
        room: "",
        isBreak: false,
        breakDuration: 0,
        semester: "Semester 1",
        academicYear: "2024/25",
    });

    const [formData, setFormData] = useState<AnnouncementForm>({
        title: "",
        content: "",
        audience: "All",
        date: new Date().toISOString().split("T")[0],
        status: "Published",
    });

    // ---------- Get User Info ----------
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userRole = user?.role || 'student';
    const canManage = userRole === 'admin' || userRole === 'teacher';

    // ============================================
    // 📡 API CALLS
    // ============================================

    // ✅ Fetch Announcements
    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // TODO: Replace with actual API when backend is ready
            // const response = await axios.get('http://localhost:7000/api/announcements', {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            // setAnnouncements(response.data.data || []);
            
            // Mock data for now
            setAnnouncements([
                {
                    _id: "1",
                    title: "📢 School Opening",
                    content: "School will reopen on September 15, 2026. All students must report to their classes by 8:00 AM.",
                    audience: "All",
                    date: "2026-09-01",
                    status: "Published",
                    createdBy: { _id: "admin1", name: "Admin User" },
                    createdAt: "2026-09-01T10:00:00Z"
                },
                {
                    _id: "2",
                    title: "👨‍👩‍👧‍👦 Parent-Teacher Meeting",
                    content: "Parent-teacher meeting scheduled for October 10, 2026 at 2:00 PM in the school auditorium.",
                    audience: "Parents",
                    date: "2026-09-15",
                    status: "Published",
                    createdBy: { _id: "admin1", name: "Admin User" },
                    createdAt: "2026-09-15T14:30:00Z"
                },
            ]);
            
            setLoading(false);
        } catch (error) {
            console.error("Error fetching announcements:", error);
            setLoading(false);
        }
    };

    // ✅ Fetch Timetable
    const fetchTimetable = async () => {
        setTimetableLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Use the semester and academicYear from the form
            const semester = slotFormData.semester || "Semester 1";
            const academicYear = slotFormData.academicYear || "2024/25";
            
            console.log(`🔄 Fetching timetable for ${semester} - ${academicYear}`);
            
            const slotsRes = await axios.get(
                `http://localhost:7000/api/timetable/slots?semester=${semester}&academicYear=${academicYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log("📊 Timetable slots received:", slotsRes.data.data);
            
            // Fetch teachers and classes for dropdowns
            const teachersRes = await axios.get('http://localhost:7000/api/users?role=teacher', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeachers(teachersRes.data.data || []);

            const classesRes = await axios.get('http://localhost:7000/api/classes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(classesRes.data.data || []);

            setTimetableSlots(slotsRes.data.data || []);
            setTimetableLoading(false);
        } catch (error) {
            console.error("Error fetching timetable:", error);
            setTimetableLoading(false);
        }
    };

    // ✅ Create Time Slot
    const createTimeSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            const slotData = {
                ...slotFormData,
                teacherId: slotFormData.teacherId || undefined,
                classId: slotFormData.classId || undefined,
            };

            console.log("📤 Creating time slot:", slotData);

            await axios.post('http://localhost:7000/api/timetable/slots', slotData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("✅ Time slot created successfully");

            setShowSlotModal(false);
            resetSlotForm();
            
            // ✅ Force refresh the timetable
            await fetchTimetable();
            
            alert('✅ Time slot created successfully!');
        } catch (error: any) {
            console.error("❌ Error creating time slot:", error);
            alert(error.response?.data?.error || "Failed to create time slot");
        }
    };

    // ✅ Update Time Slot
    const updateTimeSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            const slotData = {
                ...slotFormData,
                teacherId: slotFormData.teacherId || undefined,
                classId: slotFormData.classId || undefined,
            };

            console.log("📤 Updating time slot:", slotData);

            await axios.put(`http://localhost:7000/api/timetable/slots/${editingSlotId}`, slotData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("✅ Time slot updated successfully");

            setShowSlotModal(false);
            resetSlotForm();
            
            // ✅ Force refresh the timetable
            await fetchTimetable();
            
            alert('✅ Time slot updated successfully!');
        } catch (error: any) {
            console.error("❌ Error updating time slot:", error);
            alert(error.response?.data?.error || "Failed to update time slot");
        }
    };

    // ✅ Delete Time Slot
    const deleteTimeSlot = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this time slot?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:7000/api/timetable/slots/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchTimetable();
            alert('✅ Time slot deleted successfully!');
        } catch (error) {
            console.error("Error deleting time slot:", error);
            alert("Failed to delete time slot");
        }
    };

    // ✅ Load data on mount
    useEffect(() => {
        fetchAnnouncements();
        fetchTimetable();
    }, []);

    const resetSlotForm = () => {
        setSlotFormData({
            day: "Monday",
            startTime: "8:00 AM",
            endTime: "9:00 AM",
            periodNumber: 1,
            subject: "",
            teacherId: "",
            classId: "",
            room: "",
            isBreak: false,
            breakDuration: 0,
            semester: "Semester 1",
            academicYear: "2024/25",
        });
        setEditingSlotId(null);
    };

    const openAddSlotModal = () => {
        resetSlotForm();
        setShowSlotModal(true);
    };

    const openEditSlotModal = (slot: TimeSlot) => {
        setEditingSlotId(slot._id);
        setSlotFormData({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            periodNumber: slot.periodNumber,
            subject: slot.subject,
            teacherId: typeof slot.teacherId === 'string' ? slot.teacherId : slot.teacherId?._id || "",
            classId: typeof slot.classId === 'string' ? slot.classId : slot.classId?._id || "",
            room: slot.room,
            isBreak: slot.isBreak || false,
            breakDuration: slot.breakDuration || 0,
            semester: slot.semester || "Semester 1",
            academicYear: slot.academicYear || "2024/25",
        });
        setShowSlotModal(true);
    };

    // ============================================
    // 📢 ANNOUNCEMENT CRUD
    // ============================================

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            
            const announcementData = {
                title: formData.title,
                content: formData.content,
                audience: formData.audience,
                date: formData.date,
                status: formData.status,
            };

            // TODO: Replace with actual API
            // await axios.post('http://localhost:7000/api/announcements', announcementData, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            
            const newAnnouncement: Announcement = {
                _id: Date.now().toString(),
                ...announcementData,
                createdBy: { _id: user?._id || 'current', name: user?.name || 'You' },
                createdAt: new Date().toISOString(),
            };
            
            if (editingId) {
                setAnnouncements(announcements.map(a => 
                    a._id === editingId ? { ...a, ...announcementData } : a
                ));
            } else {
                setAnnouncements([newAnnouncement, ...announcements]);
            }

            setShowModal(false);
            setFormData({
                title: "",
                content: "",
                audience: "All",
                date: new Date().toISOString().split("T")[0],
                status: "Published",
            });
            setEditingId(null);
            
        } catch (error: any) {
            console.error("Error saving announcement:", error);
            alert(error.response?.data?.error || "Failed to save announcement");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        
        try {
            // TODO: Replace with actual API
            // await axios.delete(`http://localhost:7000/api/announcements/${id}`, {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            
            setAnnouncements(announcements.filter(a => a._id !== id));
        } catch (error) {
            console.error("Error deleting announcement:", error);
            alert("Failed to delete announcement");
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            title: "",
            content: "",
            audience: "All",
            date: new Date().toISOString().split("T")[0],
            status: "Published",
        });
        setShowModal(true);
    };

    const openEditModal = (id: string) => {
        const announcement = announcements.find((a) => a._id === id);
        if (!announcement) return;
        setEditingId(id);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            audience: announcement.audience,
            date: announcement.date,
            status: announcement.status,
        });
        setShowModal(true);
    };

    // ============================================
    // 🔍 FILTERS
    // ============================================

    const getFilteredAnnouncements = () => {
        let filtered = announcements;

        if (userRole) {
            filtered = filtered.filter(a => 
                a.audience === "All" || 
                a.audience === userRole.charAt(0).toUpperCase() + userRole.slice(1)
            );
        }

        if (selectedAudience !== "All") {
            filtered = filtered.filter(a => a.audience === selectedAudience);
        }

        return filtered;
    };

    const filteredAnnouncements = getFilteredAnnouncements();

    const totalAnnouncements = announcements.length;
    const publishedCount = announcements.filter((a) => a.status === "Published").length;
    const draftCount = announcements.filter((a) => a.status === "Draft").length;

    // ============================================
    // 📅 TIMETABLE RENDER
    // ============================================

    const renderTimetable = () => {
        if (timetableLoading) {
            return <div className="text-center py-8 text-gray-500">Loading timetable...</div>;
        }

        if (timetableSlots.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
                    <p>No timetable slots created yet.</p>
                    <p className="text-sm mt-1">Click "Add Time Slot" to create one.</p>
                </div>
            );
        }

        // Group by day
        const groupedSlots: Record<string, TimeSlot[]> = {};
        DAYS.forEach(day => { groupedSlots[day] = []; });
        timetableSlots.forEach(slot => {
            if (groupedSlots[slot.day]) {
                groupedSlots[slot.day].push(slot);
            }
        });

        return (
            <div className="overflow-x-auto">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={openAddSlotModal}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        Add Time Slot
                    </button>
                </div>

                <table className="w-full border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Time</th>
                            {DAYS.map(day => (
                                <th key={day} className="text-left px-4 py-3 text-sm font-semibold text-gray-600">
                                    {day}
                                </th>
                            ))}
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {PERIODS.map(period => {
                            // Find slots for this period
                            const periodSlots = timetableSlots.filter(s => s.periodNumber === period);
                            if (periodSlots.length === 0) return null;
                            
                            const timeDisplay = `${periodSlots[0].startTime} - ${periodSlots[0].endTime}`;
                            
                            return (
                                <tr key={period} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-600 whitespace-nowrap">
                                        {timeDisplay}
                                    </td>
                                    {DAYS.map(day => {
                                        const slot = groupedSlots[day]?.find(s => s.periodNumber === period);
                                        return (
                                            <td key={day} className="px-4 py-3">
                                                {slot ? (
                                                    slot.isBreak ? (
                                                        <span className="text-gray-400 text-sm">☕ Break</span>
                                                    ) : (
                                                        <div>
                                                            <div className="font-medium text-gray-800">{slot.subject}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {typeof slot.teacherId === 'string' ? 'N/A' : slot.teacherId?.name || 'N/A'} • {slot.room}
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-3">
                                        {(() => {
                                            // Find the slot for this day and period
                                            const slot = Object.values(groupedSlots).flat().find(s => s.periodNumber === period);
                                            if (!slot) return null;
                                            return (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditSlotModal(slot)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTimeSlot(slot._id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // ============================================
    // 🎨 MODAL FOR TIME SLOT
    // ============================================

    const slotModalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSlotModal(false)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {editingSlotId ? "Edit Time Slot" : "Add Time Slot"}
                    </h2>
                    <button onClick={() => { setShowSlotModal(false); resetSlotForm(); }} className="p-1 rounded-lg hover:bg-gray-100 transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={editingSlotId ? updateTimeSlot : createTimeSlot} className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                            <select
                                value={slotFormData.day}
                                onChange={(e) => setSlotFormData({ ...slotFormData, day: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                {DAYS.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Period Number</label>
                            <input
                                type="number"
                                min="1"
                                max="8"
                                value={slotFormData.periodNumber}
                                onChange={(e) => setSlotFormData({ ...slotFormData, periodNumber: parseInt(e.target.value) || 1 })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="text"
                                value={slotFormData.startTime}
                                onChange={(e) => setSlotFormData({ ...slotFormData, startTime: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="8:00 AM"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="text"
                                value={slotFormData.endTime}
                                onChange={(e) => setSlotFormData({ ...slotFormData, endTime: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="9:00 AM"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            type="text"
                            value={slotFormData.subject}
                            onChange={(e) => setSlotFormData({ ...slotFormData, subject: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mathematics"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                            <select
                                value={slotFormData.teacherId}
                                onChange={(e) => setSlotFormData({ ...slotFormData, teacherId: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map((t) => (
                                    <option key={t._id} value={t._id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <select
                                value={slotFormData.classId}
                                onChange={(e) => setSlotFormData({ ...slotFormData, classId: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                        <input
                            type="text"
                            value={slotFormData.room}
                            onChange={(e) => setSlotFormData({ ...slotFormData, room: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="R101"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                            <select
                                value={slotFormData.semester}
                                onChange={(e) => setSlotFormData({ ...slotFormData, semester: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Semester 1">Semester 1</option>
                                <option value="Semester 2">Semester 2</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                            <input
                                type="text"
                                value={slotFormData.academicYear}
                                onChange={(e) => setSlotFormData({ ...slotFormData, academicYear: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="2024/25"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={slotFormData.isBreak}
                                onChange={(e) => setSlotFormData({ ...slotFormData, isBreak: e.target.checked })}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Is Break</span>
                        </label>
                        {slotFormData.isBreak && (
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">Break Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={slotFormData.breakDuration}
                                    onChange={(e) => setSlotFormData({ ...slotFormData, breakDuration: parseInt(e.target.value) || 0 })}
                                    className="w-24 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    max="60"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setShowSlotModal(false); resetSlotForm(); }}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {editingSlotId ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // ============================================
    // 🎨 RENDER
    // ============================================

    if (loading) {
        return (
            <DashboardLayout role={userRole}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-xl text-gray-500">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {editingId !== null ? "Edit Announcement" : "Add Announcement"}
                    </h2>
                    <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100 transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Announcement title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Announcement content"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                            <select
                                value={formData.audience}
                                onChange={(e) => setFormData({ ...formData, audience: e.target.value as AnnouncementForm["audience"] })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All</option>
                                <option value="Students">Students</option>
                                <option value="Teachers">Teachers</option>
                                <option value="Parents">Parents</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as AnnouncementForm["status"] })}
                                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {editingId !== null ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <DashboardLayout role={userRole}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {activeTab === "announcements" ? "Announcements" : "Timetable"}
                        </h1>
                        <p className="text-gray-500">
                            {activeTab === "announcements" 
                                ? "View and manage school announcements" 
                                : "Manage class timetables and schedules"}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab("announcements")}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                activeTab === "announcements"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <Megaphone size={16} className="inline mr-2" />
                            Announcements
                        </button>
                        <button
                            onClick={() => setActiveTab("timetable")}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                activeTab === "timetable"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            <Calendar size={16} className="inline mr-2" />
                            Timetable
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "announcements" ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                                <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><Megaphone size={25} /></div>
                                <div>
                                    <p className="text-gray-500 text-sm">Total</p>
                                    <h2 className="text-2xl font-bold">{totalAnnouncements}</h2>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                                <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><CheckCircle size={25} /></div>
                                <div>
                                    <p className="text-gray-500 text-sm">Published</p>
                                    <h2 className="text-2xl font-bold">{publishedCount}</h2>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                                <div className="bg-gray-100 p-3 rounded-lg text-gray-600"><Clock size={25} /></div>
                                <div>
                                    <p className="text-gray-500 text-sm">Drafts</p>
                                    <h2 className="text-2xl font-bold">{draftCount}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col md:flex-row gap-4">
                            <select
                                value={selectedAudience}
                                onChange={(e) => setSelectedAudience(e.target.value as "All" | "Students" | "Teachers" | "Parents")}
                                className="border rounded-lg px-4 py-2 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All Audiences</option>
                                <option value="Students">Students</option>
                                <option value="Teachers">Teachers</option>
                                <option value="Parents">Parents</option>
                            </select>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b flex justify-between items-center">
                                <h2 className="font-semibold text-lg text-gray-800">All Announcements</h2>
                                {canManage && (
                                    <button
                                        onClick={openAddModal}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                                    >
                                        <Plus size={16} />
                                        Add
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Title</th>
                                            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Audience</th>
                                            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                                            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                            {canManage && (
                                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredAnnouncements.length === 0 ? (
                                            <tr>
                                                <td colSpan={canManage ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                                                    No announcements found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAnnouncements.map((announcement) => (
                                                <tr key={announcement._id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="max-w-xs md:max-w-sm">
                                                            <p className="font-medium text-gray-800 line-clamp-1">{announcement.title}</p>
                                                            <p className="text-sm text-gray-500 truncate">{announcement.content}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${AUDIENCE_BADGES[announcement.audience]}`}>
                                                            {announcement.audience}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">
                                                        {announcement.date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[announcement.status]}`}>
                                                            {announcement.status}
                                                        </span>
                                                    </td>
                                                    {canManage && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => openEditModal(announcement._id)}
                                                                    className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(announcement._id)}
                                                                    className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar size={24} className="text-blue-600" />
                            <h2 className="text-lg font-semibold text-gray-800">Manage Timetable</h2>
                        </div>
                        {renderTimetable()}
                    </div>
                )}
            </div>

            {showModal && modalContent}
            {showSlotModal && slotModalContent}
        </DashboardLayout>
    );
};

export default Announcements;