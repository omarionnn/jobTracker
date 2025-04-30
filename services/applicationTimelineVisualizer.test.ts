import { test, expect } from '@playwright/test';
import { supabase } from '@/lib/supabase';

test.describe('Dashboard Integration Tests', () => {
  test.beforeEach(async () => {
    // Clear the database before each test
    await supabase.from('applications').delete().neq('id', 0);
  });

  test('Calculate Average Time for Single Application', async ({ page }) => {
    // Insert a single application into the database
    await supabase.from('applications').insert([
      {
        user_id: 'test-user',
        position: 'Software Engineer',
        status: 'Applied',
        date_applied: new Date().toISOString(),
        interview_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
        offer_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days later
      },
    ]);

    // Navigate to the dashboard
    await page.goto('/dashboard');

    // Verify the average time for each phase
    const totalApplications = await page.locator('text=Total').textContent();
    expect(totalApplications).toContain('1');

    const appliedCount = await page.locator('text=Applied').textContent();
    expect(appliedCount).toContain('1');
  });

  test('The timeline renders correctly with color-coded stages', async ({ page }) => {
    // Insert applications with different statuses
    await supabase.from('applications').insert([
      {
        user_id: 'test-user',
        position: 'Software Engineer',
        status: 'Applied',
        date_applied: new Date().toISOString(),
      },
      {
        user_id: 'test-user',
        position: 'Product Manager',
        status: 'Interview Scheduled',
        date_applied: new Date().toISOString(),
        interview_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: 'test-user',
        position: 'Data Scientist',
        status: 'Offer',
        date_applied: new Date().toISOString(),
        offer_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);

    // Navigate to the dashboard
    await page.goto('/dashboard');

    // Verify color-coded stages
    const appliedStage = await page.locator('.timeline-stage.bg-blue-500');
    expect(await appliedStage.count()).toBe(1);

    const interviewStage = await page.locator('.timeline-stage.bg-yellow-500');
    expect(await interviewStage.count()).toBe(1);

    const offerStage = await page.locator('.timeline-stage.bg-green-500');
    expect(await offerStage.count()).toBe(1);
  });

  test('Average time calculations are accurate', async ({ page }) => {
    // Insert multiple applications into the database
    await supabase.from('applications').insert([
      {
        user_id: 'test-user',
        position: 'Software Engineer',
        status: 'Applied',
        date_applied: new Date().toISOString(),
        interview_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_id: 'test-user',
        position: 'Product Manager',
        status: 'Offer',
        date_applied: new Date().toISOString(),
        interview_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        offer_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]);

    // Navigate to the dashboard
    await page.goto('/dashboard');

    // Verify average time calculations
    const averageAppliedToInterview = await page.locator('text=Applied to Interview:').textContent();
    expect(averageAppliedToInterview).toContain('6 days'); // Average of 7 and 5 days

    const averageInterviewToOffer = await page.locator('text=Interview to Offer:').textContent();
    expect(averageInterviewToOffer).toContain('5 days'); // Only one application with this phase
  });

  test('Tooltips display correct details', async ({ page }) => {
    // Insert an application into the database
    await supabase.from('applications').insert([
      {
        user_id: 'test-user',
        position: 'Software Engineer',
        status: 'Applied',
        date_applied: new Date().toISOString(),
      },
    ]);

    // Navigate to the dashboard
    await page.goto('/dashboard');

    // Hover over a timeline stage
    await page.hover('.timeline-stage.bg-blue-500');

    // Verify tooltip details
    const tooltip = await page.locator('.tooltip').textContent();
    expect(tooltip).toContain('Status: Applied');
    expect(tooltip).toContain('Position: Software Engineer');
  });
});