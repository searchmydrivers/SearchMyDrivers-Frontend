import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/common/Loader';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const UserDetails = lazy(() => import('./pages/UserDetails'));
const Drivers = lazy(() => import('./pages/Drivers'));
const DriverDetails = lazy(() => import('./pages/DriverDetails'));
const EditDriver = lazy(() => import('./pages/EditDriver'));
const TripBookings = lazy(() => import('./pages/TripBookings'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const ContentManagement = lazy(() => import('./pages/ContentManagement'));
const HiringManagement = lazy(() => import('./pages/HiringManagement'));
const IncompleteRegistrations = lazy(() => import('./pages/IncompleteRegistrations'));
const DriverWalletTransactions = lazy(() => import('./pages/DriverWalletTransactions'));
const Banners = lazy(() => import('./pages/Banners'));
const AdminProfile = lazy(() => import('./pages/AdminProfile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Fare = lazy(() => import('./pages/Fare'));
const SubAdmins = lazy(() => import('./pages/SubAdmins'));
const ServiceZones = lazy(() => import('./pages/ServiceZones'));
const SupportTickets = lazy(() => import('./pages/SupportTickets'));
const TicketDetails = lazy(() => import('./pages/TicketDetails'));
const DriverReferrals = lazy(() => import('./pages/DriverReferrals'));



function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
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
            path="/driver-referrals"
            element={
              <ProtectedRoute>
                <DriverReferrals />
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
            path="/drivers/:id/edit"
            element={
              <ProtectedRoute>
                <EditDriver />
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
            path="/hiring-requests"
            element={
              <ProtectedRoute>
                <HiringManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incomplete-registrations"
            element={
              <ProtectedRoute>
                <IncompleteRegistrations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver-wallet-transactions"
            element={
              <ProtectedRoute>
                <DriverWalletTransactions />
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
      </Suspense>
    </Router>
  );
}

export default App;
