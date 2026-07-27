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
    Banknote,
    School,
    DollarSign,
    BarChart3,
    MessageCircle,
    FileText,
} from "lucide-react";

type Role = "admin" | "registrar" | "finance_officer" | "teacher" | "student" | "parent";

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
        { name: "Attendance", path: "/admin/attendance", icon: <ClipboardCheck size={20} /> },
        { name: "Grades", path: "/admin/grades", icon: <BookOpen size={20} /> },
        { name: "Announcements", path: "/admin/announcements", icon: <Megaphone size={20} /> },
        { name: "Payments", path: "/admin/payments", icon: <Banknote size={20} /> },
        { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
    ],

    registrar: [
        { name: "Dashboard", path: "/registrar", icon: <LayoutDashboard size={20} /> },
        { name: "Students", path: "/registrar/students", icon: <Users size={20} /> },
        { name: "Teachers", path: "/registrar/teachers", icon: <UserCheck size={20} /> },
        { name: "Classes", path: "/registrar/classes", icon: <School size={20} /> },
        { name: "Parents", path: "/registrar/parents", icon: <Users size={20} /> }, 
    ],

    finance_officer: [
        { name: "Dashboard", path: "/finance", icon: <LayoutDashboard size={20} /> },
        { name: "Fee Structures", path: "/finance/fees", icon: <DollarSign size={20} /> },
        { name: "Payments", path: "/finance/payments", icon: <Banknote size={20} /> },
        { name: "Reports", path: "/finance/reports", icon: <BarChart3 size={20} /> },
    ],

    teacher: [
        
        { name: "Attendance", path: "/teacher/attendance", icon: <ClipboardCheck size={20} /> },
        { name: "Grades", path: "/teacher/grades", icon: <BookOpen size={20} /> },
        { name: "Announcements", path: "/teacher/announcements", icon: <Megaphone size={20} /> },
        { name: "Chat", path: "/chat", icon: <MessageCircle size={20} /> }, 
        
    { name: "Worksheets", path: "/teacher/worksheets", icon: <FileText size={20} /> },
    ],

    student: [
       // { name: "Dashboard", path: "/student", icon: <LayoutDashboard size={20} /> },
        { name: "Attendance", path: "/student/attendance", icon: <ClipboardCheck size={20} /> },
        { name: "Grades", path: "/student/grades", icon: <GraduationCap size={20} /> },
        { name: "Fees", path: "/student/fees", icon: <Banknote size={20} /> },
        { name: "Announcements", path: "/student/announcements", icon: <Megaphone size={20} /> },
    { name: "Worksheets", path: "/student/worksheets", icon: <FileText size={20} /> },
    ],

    parent: [
       // { name: "Dashboard", path: "/parent", icon: <LayoutDashboard size={20} /> },
        { name: "Children", path: "/parent/children", icon: <Users size={20} /> },
        { name: "Attendance", path: "/parent/attendance", icon: <ClipboardCheck size={20} /> },
        { name: "Grades", path: "/parent/grades", icon: <GraduationCap size={20} /> },
        { name: "Payments", path: "/parent/payments", icon: <Banknote size={20} /> },
        { name: "Announcements", path: "/parent/announcements", icon: <Megaphone size={20} /> },
        { name: "Chat", path: "/chat", icon: <MessageCircle size={20} /> },
    ],
};

const Sidebar = ({ role, isOpen, onClose }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onClose();
        navigate("/");
    };

    const items = menuItems[role] || [];

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex md:flex-col w-64 bg-blue-700 text-white min-h-screen p-5 shrink-0">
                <h1 className="text-2xl font-bold mb-2">🏫 School Portal</h1>
                <p className="text-sm text-blue-200 mb-6 capitalize">
                    Welcome, {role.replace('_', ' ')}
                </p>

                <nav className="space-y-1 flex-1">
                    {items.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                    isActive
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

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition hover:bg-red-600 w-full mt-4"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            {/* Mobile sidebar drawer */}
            <aside
                className={`fixed top-0 left-0 z-40 h-full w-64 bg-blue-700 text-white p-5 transform transition-transform duration-300 ease-in-out md:hidden ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">🏫 School Portal</h1>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-blue-800 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <p className="text-sm text-blue-200 mb-4 capitalize">
                    Welcome, {role.replace('_', ' ')}
                </p>

                <nav className="space-y-1">
                    {items.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                    isActive
                                        ? "bg-white text-blue-700 font-semibold"
                                        : "hover:bg-blue-800"
                                }`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                            
                        );
                    })}

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