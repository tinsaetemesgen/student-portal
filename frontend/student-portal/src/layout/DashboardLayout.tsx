import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

type Role = "admin" | "teacher" | "student";

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: Role;
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar role={role} />

            <div className="flex-1">
                <Navbar role={role} />

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;