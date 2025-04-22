import { supabase } from '@/lib/supabase';

/**
 * Type definitions for application data
 */
export interface ApplicationCreateInput {
  position: string;         // Job position title
  company_id: string;       // Reference to company table
  date_applied: string;     // Date applied in ISO format
  status: string;           // Application status (Applied, Interview, etc.)
  notes?: string;           // Optional notes
}

/**
 * Type for update operations - all fields are optional
 */
export interface ApplicationUpdateInput {
  position?: string;
  company_id?: string;
  date_applied?: string;
  status?: string;
  notes?: string;
}

/**
 * Creates a new job application in the database
 * 
 * @param data Application data to insert
 * @returns The created application or null if operation failed
 */
export async function createApplication(data: ApplicationCreateInput) {
  try {
    // First, validate that the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create an application');
    }
    
    // Insert the application with the current user ID
    const { data: application, error } = await supabase
      .from('applications')
      .insert([{
        ...data,
        user_id: user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    return application;
  } catch (error) {
    console.error('Error creating application:', error);
    return null;
  }
}

/**
 * Updates an existing application if the current user has permission
 * 
 * @param id The ID of the application to update
 * @param data The fields to update
 * @returns The updated application or null if operation failed
 */
export async function editApplication(id: string, data: ApplicationUpdateInput) {
  try {
    // First, validate that the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to edit an application');
    }
    
    // First check if the application exists and belongs to the user
    const { data: existingApp, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError || !existingApp) {
      // Application doesn't exist or doesn't belong to user
      return null;
    }
    
    // Update the application
    const { data: updatedApp, error: updateError } = await supabase
      .from('applications')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure only owner can update
      .select()
      .single();
    
    if (updateError) throw updateError;
    return updatedApp;
  } catch (error) {
    console.error('Error editing application:', error);
    return null;
  }
}

/**
 * Deletes an application by ID if the current user has permission
 * 
 * @param id The ID of the application to delete
 * @returns Boolean indicating success or failure
 */
export async function deleteApplication(id: string) {
  try {
    // Validate that the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to delete an application');
    }
    
    // Delete the application
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure only owner can delete
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting application:', error);
    return false;
  }
}

/**
 * Fetches a single application by ID if the current user has permission
 * 
 * @param id The ID of the application to fetch
 * @returns The application or null if not found
 */
export async function getApplicationById(id: string) {
  try {
    // Validate that the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to view an application');
    }
    
    // Fetch the application with company data
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        company:companies(id, name, website, location, industry)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
}