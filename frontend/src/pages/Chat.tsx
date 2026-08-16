// src/pages/Chat.tsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    MessageCircle,
    Shield,
    Users,
    BookOpen,
    UserCog,
    GraduationCap,
    DollarSign,
} from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import { ChatProvider } from "../context/ChatContext";
import { getSocket } from "../services/socket";

type Role = "admin" | "registrar" | "finance_officer" | "teacher" | "student" | "parent";

interface RoleConfig {
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    badgeClass: string;
    badgeIconClass: string;
}

const roleConfig: Record<Role, RoleConfig> = {
    admin: {
        label: "Admin Access",
        subtitle: "Chat with all users",
        icon: Shield,
        badgeClass: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
        badgeIconClass: "text-purple-600 dark:text-purple-400",
    },
    registrar: {
        label: "Registrar",
        subtitle: "Chat with admins and teachers",
        icon: UserCog,
        badgeClass: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
        badgeIconClass: "text-indigo-600 dark:text-indigo-400",
    },
    finance_officer: {
        label: "Finance Officer",
        subtitle: "Chat with admins and teachers",
        icon: DollarSign,
        badgeClass: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800",
        badgeIconClass: "text-cyan-600 dark:text-cyan-400",
    },
    teacher: {
        label: "Teacher",
        subtitle: "Chat with parents and admins",
        icon: BookOpen,
        badgeClass: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
        badgeIconClass: "text-blue-600 dark:text-blue-400",
    },
    student: {
        label: "Student",
        subtitle: "Chat with teachers and admins",
        icon: GraduationCap,
        badgeClass: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
        badgeIconClass: "text-yellow-600 dark:text-yellow-400",
    },
    parent: {
        label: "Parent",
        subtitle: "Chat with teachers and admins",
        icon: Users,
        badgeClass: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        badgeIconClass: "text-green-600 dark:text-green-400",
    },
};

interface ChatProps {
    role?: Role;
}

const Chat: React.FC<ChatProps> = ({ role: propRole }) => {
    const navigate = useNavigate();
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const role: Role = propRole || user?.role || "student";
    const config = roleConfig[role];

    useEffect(() => {
        const socket = getSocket();
        if (socket) {
            console.log("✅ Chat socket connected");
        }
        return () => {
            console.log("🔌 Chat socket disconnected");
        };
    }, []);

    const goBack = (): void => {
        navigate(role === "finance_officer" ? "/finance" : `/${role}`);
    };

    const BadgeIcon = config.icon;

    return (
        <DashboardLayout role={role}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goBack}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                <MessageCircle size={22} className="text-blue-600 dark:text-blue-400" />
                                Messages
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{config.subtitle}</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${config.badgeClass}`}>
                        <BadgeIcon size={16} className={config.badgeIconClass} />
                        <span className={`text-sm font-medium ${config.badgeIconClass}`}>{config.label}</span>
                    </div>
                </div>

                <div className="h-[calc(100vh-200px)]">
                    <ChatProvider>
                        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                            <ChatList />
                            <ChatWindow />
                        </div>
                    </ChatProvider>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Chat;
