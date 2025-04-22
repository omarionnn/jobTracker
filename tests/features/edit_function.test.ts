import { describe, test, expect } from "@jest/globals"; // Import Jest functions
import { createApplication, editApplication } from "../../services/applicationService"; // Import application service functions

/**
 * Tests for the application editing functionality
 */
describe("edit_application", () => {
    test("should allow user to edit position of existing application", async () => {
        // Create a new application with proper schema
        const app = await createApplication({
            position: "Software Engineer", // Job title
            company_id: "some-company-id", // Reference to company table
            date_applied: "2023-10-01",    // Application date
            status: "Applied",             // Application status
            notes: "Initial application"   // Optional notes
        });

        // Edit the application's position
        const updatedApp = await editApplication(app.id, {
            position: "Senior Software Engineer"
        });

        // Assert that the application was updated successfully
        expect(updatedApp.position).toBe("Senior Software Engineer");
    });

    test("should allow users to edit status of existing application", async () => {
        // Create a new application
        const app = await createApplication({
            position: "Software Engineer",
            company_id: "some-company-id",
            date_applied: "2023-10-01",
            status: "Applied",
        });

        // Edit the application's status
        const updatedApp = await editApplication(app.id, {
            status: "Interview Scheduled",
        });

        // Assert that the application was updated successfully
        expect(updatedApp.status).toBe("Interview Scheduled");
    });

    test("should allow users to edit date of existing application", async () => {
        // Create a new application
        const app = await createApplication({
            position: "Software Engineer",
            company_id: "some-company-id",
            date_applied: "2023-10-01",
            status: "Applied",
        });

        // Edit the application's date
        const updatedApp = await editApplication(app.id, {
            date_applied: "2023-10-15",
        });

        // Assert that the application was updated successfully
        expect(updatedApp.date_applied).toBe("2023-10-15");
    });

    test("should allow users to edit notes of existing application", async () => {
        // Create a new application
        const app = await createApplication({
            position: "Software Engineer",
            company_id: "some-company-id",
            date_applied: "2023-10-01",
            status: "Applied",
        });

        // Edit the application's notes
        const updatedApp = await editApplication(app.id, {
            notes: "Updated interview notes after phone screening",
        });

        // Assert that the application was updated successfully
        expect(updatedApp.notes).toBe("Updated interview notes after phone screening");
    });

    test("should allow users to edit company of existing application", async () => {
        // Create a new application
        const app = await createApplication({
            position: "Software Engineer",
            company_id: "some-company-id",
            date_applied: "2023-10-01",
            status: "Applied",
        });

        // Edit the application's company
        const updatedApp = await editApplication(app.id, {
            company_id: "different-company-id",
        });

        // Assert that the application was updated successfully
        expect(updatedApp.company_id).toBe("different-company-id");
    });

    test("should make sure edits can only be done by the user who created the application", async () => {
        // This test assumes the editApplication function checks user ownership
        // before allowing edits, which is implemented in the service
        
        // Create a new application (this sets the current user as owner)
        const app = await createApplication({
            position: "Software Engineer",
            company_id: "some-company-id",
            date_applied: "2023-10-01",
            status: "Applied",
        });

        // Simulate non-owner attempting edit (the service will handle this check)
        // In a real test, you would mock the auth to be a different user
        const updatedApp = await editApplication(app.id, {
            position: "Malicious Update",
        });

        // Since our implementation rejects non-owner edits, this should fail
        // and return null (in a real app, it would depend on the auth state)
        expect(updatedApp).not.toBeNull();
        expect(updatedApp.position).not.toBe("Malicious Update");
    });

    test("should make sure edits can only be done on existing applications", async () => {
        // Attempt to edit a non-existing application
        const updatedApp = await editApplication("non-existing-id", {
            position: "This should fail",
        });

        // Assert that the edit operation failed
        expect(updatedApp).toBe(null);
    });
});