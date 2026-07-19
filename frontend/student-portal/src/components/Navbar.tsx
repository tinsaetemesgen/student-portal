import { Bell, Search } from "lucide-react";

type Role = "admin" | "teacher" | "student";

interface NavbarProps {
    role: Role;
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
};

const Navbar = ({ role }: NavbarProps) => {
    const info = roleInfo[role];

    return (
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
            {/* Left Section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{info.title}</h1>
                <p className="text-sm text-gray-500">{info.subtitle}</p>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent outline-none ml-2 text-sm"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Info */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">{info.userName}</p>
                        <p className="text-xs text-gray-500">{info.userRole}</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {info.userName.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;