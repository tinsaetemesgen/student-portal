import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    UserCheck,
    ClipboardCheck,
    Megaphone,
    Settings,
    BookOpen,
    GraduationCap,
    X,
    LogOut,
} from "lucide-react";

type Role = "admin" | "teacher" | "student" | "parent";

interface SidebarProps {
    role: Role;
    isOpen: boolean;
    onClose: () => void;
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

    parent: [
        { name: "Dashboard", path: "/parent", icon: <LayoutDashboard size={20} /> },
        { name: "Attendance", path: "/parent/attendance", icon: <ClipboardCheck size={20} /> },
        { name: "Grades", path: "/parent/grades", icon: <GraduationCap size={20} /> },
        { name: "Announcements", path: "/parent/announcements", icon: <Megaphone size={20} /> },
    ],
};

const Sidebar = ({ role, isOpen, onClose }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        onClose();
        navigate("/");
    };

    return (
        <>
            {/* Desktop sidebar - always visible */}
            <aside className="hidden md:flex md:flex-col w-64 bg-blue-700 text-white min-h-screen p-5 shrink-0">
                <h1 className="text-2xl font-bold mb-8">School Portal</h1>

                <nav className="space-y-2 flex-1">
                    {menuItems[role].map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={onClose}
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

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition hover:bg-red-600 w-full mt-4"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Mobile sidebar - drawer */}
            <aside
                className={`fixed top-0 left-0 z-40 h-full w-64 bg-blue-700 text-white p-5 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">School Portal</h1>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-blue-800 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="space-y-2">
                    {menuItems[role].map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={onClose}
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

                    {/* Logout Button - Mobile */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition hover:bg-red-600 w-full mt-4"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
