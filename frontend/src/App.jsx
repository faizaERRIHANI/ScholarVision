import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'

const Dashboard        = lazy(() => import('./pages/DashboardPage'))
const Students         = lazy(() => import('./pages/StudentsPage'))
const StudentDetail    = lazy(() => import('./pages/StudentDetailPage'))
const StudentForm      = lazy(() => import('./pages/StudentFormPage'))
const Staff            = lazy(() => import('./pages/StaffPage'))
const Attendance       = lazy(() => import('./pages/AttendancePage'))
const Grades           = lazy(() => import('./pages/GradesPage'))
const Schedule         = lazy(() => import('./pages/SchedulePage'))
const Finance          = lazy(() => import('./pages/FinancePage'))
const FaceRecognition  = lazy(() => import('./pages/FaceRecognitionPage'))
const Notifications    = lazy(() => import('./pages/NotificationsPage'))
const Settings         = lazy(() => import('./pages/SettingsPage'))
const Profile          = lazy(() => import('./pages/ProfilePage'))
const NotFound         = lazy(() => import('./pages/NotFoundPage'))

function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid rgba(26,86,219,0.2)', borderTopColor:'#1a56db', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Guard({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { isAuthenticated } = useAuth()
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"         element={<Dashboard />} />
          <Route path="students"          element={<Students />} />
          <Route path="students/new"      element={<StudentForm />} />
          <Route path="students/:id"      element={<StudentDetail />} />
          <Route path="students/:id/edit" element={<StudentForm />} />
          <Route path="staff"             element={<Staff />} />
          <Route path="attendance"        element={<Attendance />} />
          <Route path="grades"            element={<Grades />} />
          <Route path="schedule"          element={<Schedule />} />
          <Route path="finance"           element={<Finance />} />
          <Route path="face-recognition"  element={<FaceRecognition />} />
          <Route path="notifications"     element={<Notifications />} />
          <Route path="settings"          element={<Settings />} />
          <Route path="profile"           element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
