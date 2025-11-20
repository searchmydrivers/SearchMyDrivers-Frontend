import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { driverService } from '../services/driverService';
import { tripService } from '../services/tripService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    pendingDrivers: 0,
    verifiedDrivers: 0,
    rejectedDrivers: 0,
    totalTrips: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [allDrivers, pendingDrivers, verifiedDrivers, rejectedDrivers, allTrips] = await Promise.all([
        driverService.getAllDrivers(),
        driverService.getPendingDrivers(),
        driverService.getVerifiedDrivers(),
        driverService.getRejectedDrivers(),
        tripService.getAllTrips(),
      ]);

      setStats({
        totalDrivers: allDrivers.data?.drivers?.length || 0,
        pendingDrivers: pendingDrivers.data?.drivers?.length || 0,
        verifiedDrivers: verifiedDrivers.data?.drivers?.length || 0,
        rejectedDrivers: rejectedDrivers.data?.drivers?.length || 0,
        totalTrips: allTrips.data?.trips?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Drivers', value: stats.totalDrivers, color: 'blue', icon: '👥' },
    { label: 'Pending Verification', value: stats.pendingDrivers, color: 'yellow', icon: '⏳' },
    { label: 'Verified Drivers', value: stats.verifiedDrivers, color: 'green', icon: '✅' },
    { label: 'Rejected Drivers', value: stats.rejectedDrivers, color: 'red', icon: '❌' },
    { label: 'Total Trips', value: stats.totalTrips, color: 'purple', icon: '🚗' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/drivers/pending" className="btn-primary text-center block">
              Review Pending Drivers
            </Link>
            <Link to="/drivers" className="btn-secondary text-center block">
              View All Drivers
            </Link>
            <Link to="/trips" className="btn-secondary text-center block">
              View All Trips
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

