const menuItems = [
    "Dashboard",
    "Students",
    "Teachers",
    "Attendance",
    "Announcements",
    "Settings",
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-blue-700 text-white min-h-screen p-5">
            <h1 className="text-2xl font-bold mb-8">School Portal</h1>

            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-800 transition"
                    >
                        {item}
                    </button>
                ))}
            </nav>
        </aside>
    );
}