import { useState } from "react";
import { Plus, Megaphone, FileText, CheckCircle, Clock, X } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAppContext } from "../../context/AppContext";

interface AnnouncementForm {
    title: string;
    content: string;
    audience: "All" | "Students" | "Teachers" | "Parents";
    date: string;
    status: "Published" | "Draft";
}

const AUDIENCE_BADGES: Record<string, string> = {
    All: "bg-gray-100 text-gray-700",
    Students: "bg-gray-100 text-gray-700",
    Teachers: "bg-gray-100 text-gray-700",
    Parents: "bg-gray-100 text-gray-700",
};

const STATUS_BADGES: Record<string, string> = {
    Published: "bg-gray-100 text-gray-700",
    Draft: "bg-gray-100 text-gray-700",
};

const Announcements = () => {
    const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAppContext();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAudience, setSelectedAudience] = useState<"All" | "Students" | "Teachers" | "Parents">("All");

    const [formData, setFormData] = useState<AnnouncementForm>({
        title: "",
        content: "",
        audience: "All",
        date: new Date().toISOString().split("T")[0],
        status: "Published",
    });

    const totalAnnouncements = announcements.length;
    const publishedCount = announcements.filter((a) => a.status === "Published").length;
    const draftCount = announcements.filter((a) => a.status === "Draft").length;

    const filteredAnnouncements = announcements.filter((announcement) => {
        const matchesAudience = selectedAudience === "All" || announcement.audience === selectedAudience;
        return matchesAudience;
    });

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ title: "", content: "", audience: "All", date: new Date().toISOString().split("T")[0], status: "Published" });
        setShowModal(true);
    };

    const openEditModal = (id: number) => {
        const announcement = announcements.find((a) => a.id === id);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId !== null) {
            updateAnnouncement(editingId, formData);
        } else {
            addAnnouncement({ id: Date.now(), ...formData });
        }
        setShowModal(false);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this announcement?")) {
            deleteAnnouncement(id);
        }
    };

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
        <DashboardLayout role="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                        <p className="text-gray-500">Manage school announcements and notifications</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        Add Announcement
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg text-gray-600">
                            <Megaphone size={25} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Total</p>
                            <h2 className="text-2xl font-bold">{totalAnnouncements}</h2>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg text-gray-600">
                            <CheckCircle size={25} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Published</p>
                            <h2 className="text-2xl font-bold">{publishedCount}</h2>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg text-gray-600">
                            <Clock size={25} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Drafts</p>
                            <h2 className="text-2xl font-bold">{draftCount}</h2>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-lg text-gray-600">
                            <FileText size={25} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Audience Types</p>
                            <h2 className="text-2xl font-bold">4</h2>
                        </div>
                    </div>
                </div>

                {/* Filter Panel */}
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

                {/* Announcements Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b">
                        <h2 className="font-semibold text-lg text-gray-800">All Announcements</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Title</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Audience</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAnnouncements.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No announcements found. Click "Add Announcement" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAnnouncements.map((announcement) => (
                                        <tr key={announcement.id} className="hover:bg-gray-50 transition">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(announcement.id)}
                                                        className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(announcement.id)}
                                                        className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && modalContent}
        </DashboardLayout>
    );
};

export default Announcements;
