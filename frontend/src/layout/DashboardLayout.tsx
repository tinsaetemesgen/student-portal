import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

type Role = "admin" | "registrar" | "finance_officer" | "teacher" | "student" | "parent";

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: Role;
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar role={role} isOpen={sidebarOpen} toggleSidebar={toggleSidebar} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 min-w-0 flex flex-col">
                <Navbar role={role} toggleSidebar={toggleSidebar} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
