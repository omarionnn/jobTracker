import { useState, useEffect } from 'react';

type Application = {
  id: string;
  status: string;
  created_at: string;
  // Add other fields as needed
};

type Props = {
  applications: Application[];
};

export default function DashboardStats({ applications }: Props) {
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      const total = applications.length;
      const applied = applications.filter(app => app.status === 'Applied').length;
      const interviewing = applications.filter(app => 
        app.status === 'Interview Scheduled' || app.status === 'In Progress'
      ).length;
      const offered = applications.filter(app => app.status === 'Offer').length;
      const rejected = applications.filter(app => app.status === 'Rejected').length;

      setStats({ total, applied, interviewing, offered, rejected });
    };

    calculateStats();
  }, [applications]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Application Summary</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-md text-center">
          <p className="text-sm font-medium text-blue-800">Total</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md text-center">
          <p className="text-sm font-medium text-yellow-800">Applied</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.applied}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-md text-center">
          <p className="text-sm font-medium text-purple-800">Interviewing</p>
          <p className="text-2xl font-bold text-purple-900">{stats.interviewing}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md text-center">
          <p className="text-sm font-medium text-green-800">Offers</p>
          <p className="text-2xl font-bold text-green-900">{stats.offered}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-md text-center">
          <p className="text-sm font-medium text-red-800">Rejected</p>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
        </div>
      </div>
      
      <div className="mt-4 h-2 bg-gray-200 rounded-full">
        <div className="flex h-full rounded-full overflow-hidden">
          {stats.applied > 0 && (
            <div 
              className="bg-yellow-500" 
              style={{ width: `${(stats.applied / stats.total) * 100}%` }}
            ></div>
          )}
          {stats.interviewing > 0 && (
            <div 
              className="bg-purple-500" 
              style={{ width: `${(stats.interviewing / stats.total) * 100}%` }}
            ></div>
          )}
          {stats.offered > 0 && (
            <div 
              className="bg-green-500" 
              style={{ width: `${(stats.offered / stats.total) * 100}%` }}
            ></div>
          )}
          {stats.rejected > 0 && (
            <div 
              className="bg-red-500" 
              style={{ width: `${(stats.rejected / stats.total) * 100}%` }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}