import { Bell, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Role = "admin" | "registrar" | "finance_officer" | "teacher" | "student" | "parent";

interface NavbarProps {
    role: Role;
    toggleSidebar: () => void;
}

const roleInfo = {
    admin: {
        title: "Admin Dashboard",
        subtitle: "Manage students, teachers, and school operations",
        userName: "Admin User",
        userRole: "Administrator",
    },
    registrar: {
        title: "Registrar Dashboard",
        subtitle: "Manage student enrollment, teachers, and class records",
        userName: "Registrar User",
        userRole: "Registrar",
    },
    finance_officer: {
        title: "Finance Dashboard",
        subtitle: "Manage school fees, payments, and financial reports",
        userName: "Finance Officer",
        userRole: "Finance Officer",
    },
    teacher: {
        title: "Teacher Dashboard",
        subtitle: "Manage attendance, grades, and class activities",
        userName: "Teacher Samuel",
        userRole: "Teacher",
    },
    student: {
        title: "Student Dashboard",
        subtitle: "View grades, attendance, and announcements",
        userName: "Student User",
        userRole: "Student",
    },
    parent: {
        title: "Parent Dashboard",
        subtitle: "Monitor your children's progress",
        userName: "Parent User",
        userRole: "Parent",
    },
};

const Navbar = ({ role, toggleSidebar }: NavbarProps) => {
    const navigate = useNavigate();
    const info = roleInfo[role];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/");
    };

    // Get the user name from localStorage if available
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const displayName = user?.name || info.userName;
    const displayRole = user?.role || info.userRole;

    return (
        <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                {/* Hamburger - visible on mobile only */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 transition md:hidden"
                >
                    <Menu size={22} className="text-gray-600" />
                </button>

                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{info.title}</h1>
                    <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{info.subtitle}</p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Info */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800">{displayName}</p>
                        <p className="text-xs text-gray-500 capitalize">{displayRole.replace('_', ' ')}</p>
                    </div>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
                        {displayName.charAt(0).toUpperCase()}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition ml-2"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;