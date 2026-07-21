import { Bell, Search, Menu, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Role = "admin" | "teacher" | "student" | "parent";

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
        navigate("/");
    };

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
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent outline-none ml-2 text-sm w-32 lg:w-auto"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Info */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800">{info.userName}</p>
                        <p className="text-xs text-gray-500">{info.userRole}</p>
                    </div>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm sm:text-base">
                        {info.userName.charAt(0)}
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
