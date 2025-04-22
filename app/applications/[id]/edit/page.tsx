"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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

type FormData = {
  company_id: string;
  position: string;
  date_applied: string;
  status: string;
  notes: string;
};

type Application = {
  id: string;
  position: string;
  company_id: string;
  date_applied: string;
  status: string;
  notes?: string;
  company?: Company;
};

/**
 * EditApplication Component
 * 
 * This page provides a form to edit an existing job application
 * It fetches the current application data and allows the user to update it
 */
export default function EditApplication({ params }: { params: { id: string } }) {
  // Component state
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form with react-hook-form
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  
  // Fetch application data and companies on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Fetch application data
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select(`
            *,
            company:companies(id, name, website, location, industry)
          `)
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();
        
        if (appError) {
          throw new Error('Application not found');
        }
        
        // Fetch companies for dropdown
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
        
        if (companiesError) throw companiesError;
        
        // Set the application and companies state
        setApplication(appData);
        setCompanies(companiesData || []);
        
        // Reset form with application data
        reset({
          company_id: appData.company_id,
          position: appData.position,
          date_applied: appData.date_applied,
          status: appData.status,
          notes: appData.notes || '',
        });
        
      } catch (error) {
        console.error('Error loading application:', error);
        setError('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, router, reset]);
  
  /**
   * Handle form submission
   * Updates the application in the database
   */
  const onSubmit = async (data: FormData) => {
    setSaving(true);
    
    try {
      // Update the application using Supabase
      const { error } = await supabase
        .from('applications')
        .update({
          company_id: data.company_id,
          position: data.position,
          date_applied: data.date_applied,
          status: data.status,
          notes: data.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);
      
      if (error) throw error;
      
      // Show success and redirect back to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Error updating application:', error);
      setError('Failed to update application. Please try again.');
    } finally {
      setSaving(false);
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
  
  // Main UI - Edit form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Application</h1>
          <Link 
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>
        </div>
        
        {/* Edit form */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <select
                {...register('company_id', { required: 'Please select a company' })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              >
                <option value="">Select a company...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} {company.location ? `(${company.location})` : ''}
                  </option>
                ))}
              </select>
              {errors.company_id && (
                <p className="mt-1 text-sm text-red-600">{errors.company_id.message}</p>
              )}
            </div>
            
            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position*
              </label>
              <input
                id="position"
                type="text"
                {...register('position', { required: 'Position is required' })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
              )}
            </div>
            
            {/* Date and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date_applied" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Applied*
                </label>
                <input
                  id="date_applied"
                  type="date"
                  {...register('date_applied', { required: 'Application date is required' })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
                {errors.date_applied && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_applied.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status*
                </label>
                <select
                  id="status"
                  {...register('status', { required: 'Status is required' })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                {...register('notes')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="Additional details about the application..."
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}