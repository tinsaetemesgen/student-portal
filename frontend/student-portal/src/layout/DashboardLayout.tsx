import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

type Props = {
    children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />

            <div className="flex-1">
                <Navbar />

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}