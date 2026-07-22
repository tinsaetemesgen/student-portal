import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";

import Students from "./pages/admin/Students";
import Teachers from "./pages/admin/Teachers";
import Announcements from "./pages/admin/Announcements";
import AdminAttendance from "./pages/admin/Attendance";
import AdminGrades from "./pages/admin/Grades";
import Settings from "./pages/admin/Settings";

import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherGrades from "./pages/teacher/Grades";
import TeacherAnnouncements from "./pages/teacher/Announcements";

import StudentMyGrades from "./pages/student/MyGrades";
import StudentMyAttendance from "./pages/student/MyAttendance";
import StudentAnnouncements from "./pages/student/Announcements";

import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentGrades from "./pages/parent/ParentGrades";
import ParentAnnouncements from "./pages/parent/ParentAnnouncements";
import ParentPayments from "./pages/parent/Payments";
import AdminPayments from "./pages/admin/Payments";
import StudentFees from "./pages/student/Fees";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/teachers" element={<Teachers />} />
        <Route path="/admin/announcements" element={<Announcements />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/grades" element={<AdminGrades />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/settings" element={<Settings />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/grades" element={<TeacherGrades />} />
        <Route path="/teacher/announcements" element={<TeacherAnnouncements />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/grades" element={<StudentMyGrades />} />
        <Route path="/student/attendance" element={<StudentMyAttendance />} />
        <Route path="/student/fees" element={<StudentFees />} />
        <Route path="/student/announcements" element={<StudentAnnouncements />} />

        {/* Parent Routes */}
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/attendance" element={<ParentAttendance />} />
        <Route path="/parent/grades" element={<ParentGrades />} />
        <Route path="/parent/payments" element={<ParentPayments />} />
        <Route path="/parent/announcements" element={<ParentAnnouncements />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
