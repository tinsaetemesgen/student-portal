import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    UserCheck,
    ClipboardCheck,
    Megaphone,
    Settings,
    BookOpen,
    GraduationCap,
} from "lucide-react";

type Role = "admin" | "teacher" | "student";

interface SidebarProps {
    role: Role;
}

const menuItems = {
    admin: [
        { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
        { name: "Students", path: "/admin/students", icon: <Users size={20} /> },
        { name: "Teachers", path: "/admin/teachers", icon: <UserCheck size={20} /> },
        { name: "Announcements", path: "/admin/announcements", icon: <Megaphone size={20} /> },
        { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
    ],

    teacher: [
        { name: "Dashboard", path: "/teacher", icon: <LayoutDashboard size={20} /> },
        { name: "Attendance", path: "/teacher/attendance", icon: <ClipboardCheck size={20} /> },
        { name: "Grades", path: "/teacher/grades", icon: <BookOpen size={20} /> },
        { name: "Announcements", path: "/teacher/announcements", icon: <Megaphone size={20} /> },
    ],

    student: [
        { name: "Dashboard", path: "/student", icon: <LayoutDashboard size={20} /> },
        { name: "My Grades", path: "/student/grades", icon: <GraduationCap size={20} /> },
        { name: "My Attendance", path: "/student/attendance", icon: <ClipboardCheck size={20} /> },
        { name: "Announcements", path: "/student/announcements", icon: <Megaphone size={20} /> },
    ],
};

const Sidebar = ({ role }: SidebarProps) => {
    const location = useLocation();

    return (
        <aside className="w-64 bg-blue-700 text-white min-h-screen p-5">
            <h1 className="text-2xl font-bold mb-8">School Portal</h1>

            <nav className="space-y-2">
                {menuItems[role].map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                ? "bg-white text-blue-700 font-semibold"
                                : "hover:bg-blue-800"
                                }`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;