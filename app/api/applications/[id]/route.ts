import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET handler to fetch a specific application
 * 
 * This function handles GET requests to /api/applications/[id]
 * It returns the application data if the authenticated user owns it
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    
    if (error) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT handler to update an application
 * 
 * This function handles PUT requests to /api/applications/[id]
 * It updates the application if the authenticated user owns it
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate input data - ensure required fields are present
    const requiredFields = ['position', 'company_id', 'date_applied', 'status'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }
    
    // Update the application
    const { data, error } = await supabase
      .from('applications')
      .update({
        position: body.position,
        company_id: body.company_id,
        date_applied: body.date_applied,
        status: body.status,
        notes: body.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure only owner can update
      .select(`
        *,
        company:companies(id, name, website, location, industry)
      `)
      .single();
    
    if (error) {
      return NextResponse.json({ error: 'Failed to update application' }, { status: 400 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE handler to remove an application
 * 
 * This function handles DELETE requests to /api/applications/[id]
 * It deletes the application if the authenticated user owns it
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete the application
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure only owner can delete
    
    if (error) {
      return NextResponse.json({ error: 'Failed to delete application' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}