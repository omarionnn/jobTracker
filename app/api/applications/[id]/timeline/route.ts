import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query the applications table
    const { data: applications, error } = await supabase
      .from('applications')
      .select('date_applied, interview_date, offer_date, rejected_date')
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    // Calculate average times for each phase
    const averages = calculateAverageTimes(applications);

    // Return the aggregated data
    return NextResponse.json({ averages });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Helper function to calculate average times
function calculateAverageTimes(applications: any[]) {
  const phaseDurations: { [key: string]: number[] } = {
    appliedToInterview: [],
    interviewToOffer: [],
    offerToRejected: [],
  };

  applications.forEach((app) => {
    if (app.date_applied && app.interview_date) {
      const appliedToInterview = new Date(app.interview_date).getTime() - new Date(app.date_applied).getTime();
      phaseDurations.appliedToInterview.push(appliedToInterview);
    }
    if (app.interview_date && app.offer_date) {
      const interviewToOffer = new Date(app.offer_date).getTime() - new Date(app.interview_date).getTime();
      phaseDurations.interviewToOffer.push(interviewToOffer);
    }
    if (app.offer_date && app.rejected_date) {
      const offerToRejected = new Date(app.rejected_date).getTime() - new Date(app.offer_date).getTime();
      phaseDurations.offerToRejected.push(offerToRejected);
    }
  });

  // Calculate averages
  const averages = Object.keys(phaseDurations).reduce((acc, key) => {
    const durations = phaseDurations[key];
    acc[key] = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    return acc;
  }, {} as { [key: string]: number });

  return averages;
}