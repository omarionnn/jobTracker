"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
  new_company_name?: string;
  new_company_website?: string;
  new_company_location?: string;
  new_company_industry?: string;
};

export default function NewApplication() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [addingNewCompany, setAddingNewCompany] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    defaultValues: {
      status: 'Applied',
      date_applied: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      fetchCompanies(user.id);
    };
    
    checkUser();
  }, [router]);

  const fetchCompanies = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      let company_id = data.company_id;
      
      // If adding a new company
      if (addingNewCompany && data.new_company_name) {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert([
            { 
              name: data.new_company_name,
              website: data.new_company_website,
              location: data.new_company_location,
              industry: data.new_company_industry,
              user_id: user.id
            }
          ])
          .select()
          .single();

        if (companyError) throw companyError;
        company_id = newCompany.id;
      }
      
      // Insert the application
      const { error: applicationError } = await supabase
        .from('applications')
        .insert([
          {
            company_id,
            position: data.position,
            date_applied: data.date_applied,
            status: data.status,
            notes: data.notes,
            user_id: user.id
          }
        ]);

      if (applicationError) throw applicationError;
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating application:', error);
      alert('Error creating application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Add New Application</h1>
          <Link 
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Link>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              
              {!addingNewCompany ? (
                <div className="flex items-center space-x-4">
                  <select
                    {...register('company_id', { required: !addingNewCompany && 'Please select a company' })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    disabled={addingNewCompany}
                  >
                    <option value="">Select a company...</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name} {company.location ? `(${company.location})` : ''}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => setAddingNewCompany(true)}
                    className="text-primary hover:text-blue-700"
                  >
                    Add New
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name*
                    </label>
                    <input
                      type="text"
                      {...register('new_company_name', { required: addingNewCompany && 'Company name is required' })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                    {errors.new_company_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.new_company_name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      {...register('new_company_website')}
                      placeholder="https://example.com"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      {...register('new_company_location')}
                      placeholder="City, State"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      {...register('new_company_industry')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setAddingNewCompany(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Use Existing Company
                  </button>
                </div>
              )}
            </div>
            
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
            
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}