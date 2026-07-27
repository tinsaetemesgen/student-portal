import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Chat from './pages/Chat';


// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import Teachers from "./pages/admin/Teachers";
import Announcements from "./pages/admin/Announcements";
import AdminAttendance from "./pages/admin/Attendance";
import AdminGrades from "./pages/admin/Grades";
import AdminPayments from "./pages/admin/Payments";
import Settings from "./pages/admin/Settings";

// Registrar Pages
import RegistrarDashboard from "./pages/registrar/RegistrarDashboard";
import RegistrarStudents from './pages/registrar/RegistrarStudents';
import RegistrarTeachers from './pages/registrar/RegistrarTeachers';
import RegistrarClasses from './pages/registrar/RegistrarClasses';
import RegistrarParents from './pages/registrar/RegistrarParents';



// Finance Officer Pages
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import FinancePayments from './pages/finance/FinancePayments';
import FinanceFees from './pages/finance/FinanceFees';

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherGrades from "./pages/teacher/Grades";
import TeacherAnnouncements from "./pages/teacher/TeacherAnnouncement";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentMyGrades from "./pages/student/MyGrades";
import StudentMyAttendance from "./pages/student/MyAttendance";
import StudentFees from "./pages/student/Fees";
import StudentAnnouncements from "./pages/student/Announcements";

// Parent Pages
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentGrades from "./pages/parent/ParentGrades";
import ParentPayments from "./pages/parent/Payments";
import ParentAnnouncements from "./pages/parent/ParentAnnouncements";
import ParentChildren from "./pages/parent/ParentChildren";
import ParentChildGrades from './pages/parent/ParentChildGrades';
import ParentChildAttendance from './pages/parent/ParentChildAttendance';
//worksheet routes
import TeacherWorksheets from './pages/teacher/Worksheets';
import StudentAvailableWorksheets from './pages/student/AvailableWorksheets';
import WorksheetAttempt from './pages/student/WorksheetAttempt';
import TeacherWorksheetResults from './pages/teacher/TeacherWorksheetResults';

// Auth Guard Component
const PrivateRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    window.location.href = '/';
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.href = '/';
    return null;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* ============================================
            ADMIN ROUTES
            ============================================ */}
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/students" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Students />
          </PrivateRoute>
        } />
        <Route path="/admin/teachers" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Teachers />
          </PrivateRoute>
        } />
        <Route path="/admin/announcements" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Announcements />
          </PrivateRoute>
        } />
        <Route path="/admin/attendance" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminAttendance />
          </PrivateRoute>
        } />
        <Route path="/admin/grades" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminGrades />
          </PrivateRoute>
        } />
        <Route path="/admin/payments" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminPayments />
          </PrivateRoute>
        } />
        <Route path="/admin/settings" element={
          <PrivateRoute allowedRoles={['admin']}>
            <Settings />
          </PrivateRoute>
        } />

        {/* ============================================
            REGISTRAR ROUTES
            ============================================ */}
       <Route path="/registrar" element={
  <PrivateRoute allowedRoles={['admin', 'registrar']}>
    <RegistrarDashboard />
  </PrivateRoute>
} />
<Route path="/registrar/students" element={
  <PrivateRoute allowedRoles={['admin', 'registrar']}>
    <RegistrarStudents />
  </PrivateRoute>
} />
<Route path="/registrar/teachers" element={
  <PrivateRoute allowedRoles={['admin', 'registrar']}>
    <RegistrarTeachers />
  </PrivateRoute>
} />
<Route path="/registrar/classes" element={
  <PrivateRoute allowedRoles={['admin', 'registrar']}>
    <RegistrarClasses />
  </PrivateRoute>
} />
<Route path="/registrar/parents" element={
  <PrivateRoute allowedRoles={['admin', 'registrar']}>
    <RegistrarParents />
  </PrivateRoute>
} />

        {/* ============================================
            FINANCE OFFICER ROUTES
            ============================================ */}
        <Route path="/finance" element={
  <PrivateRoute allowedRoles={['admin', 'finance_officer']}>
    <FinanceDashboard />
  </PrivateRoute>
} />
<Route path="/finance/payments" element={
  <PrivateRoute allowedRoles={['admin', 'finance_officer']}>
    <FinancePayments />
  </PrivateRoute>
} />
<Route path="/finance/fees" element={
  <PrivateRoute allowedRoles={['admin', 'finance_officer']}>
    <FinanceFees />
  </PrivateRoute>
} />
<Route path="/finance/reports" element={
  <PrivateRoute allowedRoles={['admin', 'finance_officer']}>
    <FinanceDashboard />
  </PrivateRoute>
} />
        {/* ============================================
            TEACHER ROUTES
            ============================================ */}
        <Route path="/teacher" element={
          <PrivateRoute allowedRoles={['admin', 'teacher']}>
            <TeacherDashboard />
          </PrivateRoute>
        } />
        <Route path="/teacher/attendance" element={
          <PrivateRoute allowedRoles={['admin', 'teacher']}>
            <TeacherAttendance />
          </PrivateRoute>
        } />
        <Route path="/teacher/grades" element={
          <PrivateRoute allowedRoles={['admin', 'teacher']}>
            <TeacherGrades />
          </PrivateRoute>
        } />
        <Route path="/teacher/announcements" element={
          <PrivateRoute allowedRoles={['admin', 'teacher']}>
            <TeacherAnnouncements />
          </PrivateRoute>
        } />
        <Route path="/teacher/worksheets" element={
  <PrivateRoute allowedRoles={['admin', 'teacher']}>
    <TeacherWorksheets />
  </PrivateRoute>
} />
<Route path="/teacher/worksheets/:id/results" element={
  <PrivateRoute allowedRoles={['admin', 'teacher']}>
    <TeacherWorksheetResults />
  </PrivateRoute>
} />


        {/* ============================================
            STUDENT ROUTES
            ============================================ */}
        <Route path="/student" element={
          <PrivateRoute allowedRoles={['admin', 'student']}>
            <StudentDashboard />
          </PrivateRoute>
        } />
        <Route path="/student/grades" element={
          <PrivateRoute allowedRoles={['admin', 'student']}>
            <StudentMyGrades />
          </PrivateRoute>
        } />
        <Route path="/student/attendance" element={
          <PrivateRoute allowedRoles={['admin', 'student']}>
            <StudentMyAttendance />
          </PrivateRoute>
        } />
        <Route path="/student/fees" element={
          <PrivateRoute allowedRoles={['admin', 'student']}>
            <StudentFees />
          </PrivateRoute>
        } />
        <Route path="/student/announcements" element={
          <PrivateRoute allowedRoles={['admin', 'student']}>
            <StudentAnnouncements />
          </PrivateRoute>
        } />
        <Route path="/student/worksheets" element={
  <PrivateRoute allowedRoles={['admin', 'student']}>
    <StudentAvailableWorksheets />
  </PrivateRoute>
} />
<Route path="/student/worksheet/:id/attempt" element={
  <PrivateRoute allowedRoles={['admin', 'student']}>
    <WorksheetAttempt />
  </PrivateRoute>
} />

        {/* ============================================
            PARENT ROUTES
            ============================================ */}
        <Route path="/parent" element={
          <PrivateRoute allowedRoles={['admin', 'parent']}>
            <ParentDashboard />
          </PrivateRoute>
        } />
        <Route path="/parent/attendance" element={
          <PrivateRoute allowedRoles={['admin', 'parent']}>
            <ParentAttendance />
          </PrivateRoute>
        } />
        <Route path="/parent/grades" element={
          <PrivateRoute allowedRoles={['admin', 'parent']}>
            <ParentGrades />
          </PrivateRoute>
        } />
        <Route path="/parent/payments" element={
          <PrivateRoute allowedRoles={['admin', 'parent']}>
            <ParentPayments />
          </PrivateRoute>
        } />
        <Route path="/parent/announcements" element={
          <PrivateRoute allowedRoles={['admin', 'parent']}>
            <ParentAnnouncements />
          </PrivateRoute>
        } />
        <Route path="/parent/children" element={
  <PrivateRoute allowedRoles={['admin', 'parent']}>
    <ParentChildren />
  </PrivateRoute>
} />
<Route path="/parent/child/:childId/grades" element={
  <PrivateRoute allowedRoles={['admin', 'parent']}>
    <ParentChildGrades />
  </PrivateRoute>
} />
<Route path="/parent/child/:childId/attendance" element={
  <PrivateRoute allowedRoles={['admin', 'parent']}>
    <ParentChildAttendance />
  </PrivateRoute>
} />
<Route path="/chat" element={
  <PrivateRoute allowedRoles={['admin', 'teacher', 'parent', 'student']}>
    <Chat />
  </PrivateRoute>
} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;