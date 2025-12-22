import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import Drivers from './pages/Drivers';
import DriverDetails from './pages/DriverDetails';
import TripBookings from './pages/TripBookings';
import TripDetails from './pages/TripDetails';
import TransactionHistory from './pages/TransactionHistory';
import ContentManagement from './pages/ContentManagement';
import Banners from './pages/Banners';
import AdminProfile from './pages/AdminProfile';
import Notifications from './pages/Notifications';
import Fare from './pages/Fare';
import SubAdmins from './pages/SubAdmins';
import ServiceZones from './pages/ServiceZones';
import SupportTickets from './pages/SupportTickets';
import TicketDetails from './pages/TicketDetails';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers"
          element={
            <ProtectedRoute>
              <Drivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers/pending"
          element={
            <ProtectedRoute>
              <Drivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers/verified"
          element={
            <ProtectedRoute>
              <Drivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers/rejected"
          element={
            <ProtectedRoute>
              <Drivers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drivers/:id"
          element={
            <ProtectedRoute>
              <DriverDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip-bookings"
          element={
            <ProtectedRoute>
              <TripBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip-bookings/:tripId"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/content"
          element={
            <ProtectedRoute>
              <ContentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/banners"
          element={
            <ProtectedRoute>
              <Banners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-profile"
          element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fare"
          element={
            <ProtectedRoute>
              <Fare />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subadmins"
          element={
            <ProtectedRoute>
              <SubAdmins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/zones"
          element={
            <ProtectedRoute>
              <ServiceZones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <SupportTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
