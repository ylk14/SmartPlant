import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toggle mock mode ON/OFF
  const USE_MOCK = true; // change to false later when backend is ready

  // Mock data
  const mockStats = {
    totalUsers: 128,
    totalPlants: 452,
    flaggedPlants: 6,
    activeIoTDevices: 12,
    lastUpdated: "2025-11-14 10:32 AM"
  };

  const fetchRealData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching real API:", error);
      setStats(mockStats); // fallback
    }
  };

  useEffect(() => {
    setLoading(true);

    if (USE_MOCK) {
      // Use mock data now
      setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 400);
    } else {
      // Call backend when ready
      fetchRealData().then(() => setLoading(false));
    }
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1 */}
        <div className="bg-white shadow p-5 rounded-lg">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-4xl font-bold">{stats.totalUsers}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow p-5 rounded-lg">
          <p className="text-gray-500 text-sm">Plants Identified</p>
          <p className="text-4xl font-bold">{stats.totalPlants}</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow p-5 rounded-lg">
          <p className="text-gray-500 text-sm">Flagged Plants</p>
          <p className="text-4xl font-bold">{stats.flaggedPlants}</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white shadow p-5 rounded-lg">
          <p className="text-gray-500 text-sm">Active IoT Devices</p>
          <p className="text-4xl font-bold">{stats.activeIoTDevices}</p>
        </div>

      </div>

      <p className="text-gray-400 mt-6 text-sm">
        Last updated: {stats.lastUpdated}
      </p>
    </div>
  );
}
