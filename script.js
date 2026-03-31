// Supabase Configuration
// Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://fzgjpmcswtecwlripsos.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6Z2pwbWNzd3RlY3dscmlwc29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MTU2NTMsImV4cCI6MjA5MDQ5MTY1M30.ECFsLLLKdNLenLwiKRcO6uI7w8WmAGKgStIE7Q0bGaU';

let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
    console.error("Supabase client failed to initialize. Check if the CDN script is loaded.");
}

const form = document.getElementById('surveyForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset messages
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';

        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            function: formData.get('function'),
            businessSize: parseFloat(formData.get('businessSize')),
            q1: formData.get('q1'),
            q2: formData.get('q2'),
            q3: formData.get('q3'),
        };

        // Basic validation
        if (!data.name || !data.email || !data.function || isNaN(data.businessSize) || !data.q1 || !data.q2 || !data.q3) {
            errorMessage.textContent = 'Please fill in all required fields.';
            errorMessage.classList.remove('hidden');
            return;
        }

        // Set loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            if (!supabaseClient) throw new Error("Supabase client not initialized.");

            // Insert into Supabase
            const { error } = await supabaseClient
                .from('responses')
                .insert([data]);

            if (error) throw error;

            // Success
            successMessage.classList.remove('hidden');
            form.reset();
        } catch (error) {
            console.error('Error submitting survey:', error);
            errorMessage.textContent = 'An error occurred while submitting. Please try again later. Make sure you have configured Supabase URL and Key in script.js.';
            errorMessage.classList.remove('hidden');
        } finally {
            // Reset button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}
