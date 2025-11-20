import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import DriverDetails from './pages/DriverDetails';
import Trips from './pages/Trips';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
          path="/trips"
          element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
