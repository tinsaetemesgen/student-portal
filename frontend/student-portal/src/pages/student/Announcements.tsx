import { useState } from "react";
import { Search, Megaphone, FileText, CheckCircle } from "lucide-react";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAppContext } from "../../context/AppContext";

const AUDIENCE_BADGES: Record<string, string> = {
    All: "bg-blue-100 text-blue-700",
    Students: "bg-green-100 text-green-700",
    Teachers: "bg-purple-100 text-purple-700",
    Parents: "bg-orange-100 text-orange-700",
};

const Announcements = () => {
    const { announcements, schoolInfo } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");

    const studentAnnouncements = announcements.filter(
        (a) => a.status === "Published" && (a.audience === "All" || a.audience === "Students")
    );

    const filteredAnnouncements = studentAnnouncements.filter((announcement) =>
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout role="student">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                    <p className="text-gray-500">View school announcements from administration</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Megaphone size={25} /></div>
                        <div><p className="text-gray-500 text-sm">Total</p><h2 className="text-2xl font-bold">{studentAnnouncements.length}</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg text-green-600"><CheckCircle size={25} /></div>
                        <div><p className="text-gray-500 text-sm">For Students</p><h2 className="text-2xl font-bold">{studentAnnouncements.filter(a => a.audience === "Students" || a.audience === "All").length}</h2></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><FileText size={25} /></div>
                        <div><p className="text-gray-500 text-sm">School</p><h2 className="text-2xl font-bold">{schoolInfo.name}</h2></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search announcements..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border rounded-lg pl-10 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredAnnouncements.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                            No announcements available yet.
                        </div>
                    ) : (
                        filteredAnnouncements.map((announcement) => (
                            <div key={announcement.id} className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-gray-800">{announcement.title}</h3>
                                        <p className="text-gray-600 mt-2 whitespace-pre-wrap">{announcement.content}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${AUDIENCE_BADGES[announcement.audience]}`}>
                                        {announcement.audience}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                    <span>{announcement.date}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Published</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Announcements;
