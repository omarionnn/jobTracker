"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

/**
 * Type definitions
 */
type Company = {
  id: string;
  name: string;
  website?: string;
  location?: string;
  industry?: string;
};

type Application = {
  id: string;
  position: string;
  company_id: string;
  date_applied: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  company?: Company;
};

/**
 * ViewApplication Component
 * 
 * This page displays the details of a specific job application
 * It fetches the application data from Supabase and displays it
 */
export default function ViewApplication({ params }: { params: { id: string } }) {
  // Component state
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch application data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Fetch application data with company information
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            company:companies(id, name, website, location, industry)
          `)
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          throw new Error('Application not found');
        }
        
        setApplication(data);
        
      } catch (error) {
        console.error('Error loading application:', error);
        setError('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, router]);
  
  /**
   * Handle delete application
   * Confirms with user and deletes the application if confirmed
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', params.id);
      
      if (error) throw error;
      
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Application not found'}</h1>
            <Link 
              href="/dashboard"
              className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Main UI
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with actions */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
          <div className="flex space-x-3">
            <Link 
              href={`/applications/${application.id}/edit`}
              className="text-primary hover:underline"
            >
              Edit
            </Link>
            <button 
              onClick={handleDelete}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
            <Link 
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              Back
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Header with status */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{application.position}</h2>
              <p className="text-gray-600">{application.company?.name}</p>
            </div>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
              application.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' :
              application.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800' :
              application.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
              application.status === 'Offer' ? 'bg-green-100 text-green-800' :
              application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {application.status}
            </span>
          </div>
          
          {/* Application details */}
          <div className="p-6 space-y-6">
            {/* Company section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Company Details</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p className="text-sm text-gray-900">{application.company?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{application.company?.location || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Industry</p>
                    <p className="text-sm text-gray-900">{application.company?.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    {application.company?.website ? (
                      <a 
                        href={application.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {application.company.website}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-900">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Application information */}
            <div>
              <h3 className="text-lg font-medium mb-3">Application Information</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Position</p>
                    <p className="text-sm text-gray-900">{application.position}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date Applied</p>
                    <p className="text-sm text-gray-900">{new Date(application.date_applied).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900">{application.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-sm text-gray-900">{new Date(application.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                {application.notes ? (
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{application.notes}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No notes added</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}