"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      fetchApplications(user.id);
    };
    
    checkUser();
  }, [router]);

  const fetchApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          company:companies(id, name, website, location, industry)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Function to calculate application stats
  const getStats = () => {
    const total = applications.length;
    const applied = applications.filter(app => app.status === 'Applied').length;
    const interviewing = applications.filter(app => 
      app.status === 'Interview Scheduled' || app.status === 'In Progress'
    ).length;
    const offered = applications.filter(app => app.status === 'Offer').length;
    const rejected = applications.filter(app => app.status === 'Rejected').length;

    return { total, applied, interviewing, offered, rejected };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Job Application Tracker</h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/applications/new"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              New Application
            </Link>
            <button
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
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
        </div>
        
        {/* Applications List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Applications</h2>
            <div className="flex gap-2">
              <Link href="/companies" className="text-primary hover:underline">
                Manage Companies
              </Link>
              <Link href="/interviews" className="text-primary hover:underline">
                View Interviews
              </Link>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your job search by adding your first application.</p>
              <Link 
                href="/applications/new"
                className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Application
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.company?.name || 'Unknown Company'}</div>
                        <div className="text-sm text-gray-500">{app.company?.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800' :
                          app.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'Offer' ? 'bg-green-100 text-green-800' :
                          app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(app.date_applied).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/applications/${app.id}`} className="text-primary hover:text-blue-800 mr-4">
                          View
                        </Link>
                        <Link href={`/applications/${app.id}/edit`} className="text-gray-600 hover:text-gray-900">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}