// Supabase Configuration
// Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://fzgjpmcswtecwlripsos.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6Z2pwbWNzd3RlY3dscmlwc29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MTU2NTMsImV4cCI6MjA5MDQ5MTY1M30.ECFsLLLKdNLenLwiKRcO6uI7w8WmAGKgStIE7Q0bGaU\n';

let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
    console.error("Supabase client failed to initialize.");
}

const ADMIN_PASSWORD = 'admin'; // Hardcoded for MVP

const loginForm = document.getElementById('loginForm');
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginError = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;

        if (password === ADMIN_PASSWORD) {
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            loadDashboardData();
        } else {
            loginError.classList.remove('hidden');
        }
    });
}

async function loadDashboardData() {
    try {
        if (!supabaseClient) throw new Error("Supabase client not initialized.");

        const { data: responses, error } = await supabaseClient
            .from('responses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        updateAnalytics(responses);
        populateTable(responses);
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load dashboard data. Check console for details. Make sure you have configured Supabase URL and Key in admin.js.');
    }
}

function updateAnalytics(responses) {
    const total = responses.length;
    document.getElementById('totalResponses').textContent = total;

    if (total === 0) return;

    const q1Yes = responses.filter(r => r.q1 === 'Yes').length;
    const q2Yes = responses.filter(r => r.q2 === 'Yes').length;
    
    document.getElementById('q1Yes').textContent = Math.round((q1Yes / total) * 100) + '%';
    document.getElementById('q2Yes').textContent = Math.round((q2Yes / total) * 100) + '%';

    const q3Counts = {
        Product: 0,
        Marketing: 0,
        Efficiency: 0
    };

    responses.forEach(r => {
        if (q3Counts[r.q3] !== undefined) {
            q3Counts[r.q3]++;
        }
    });

    const pProd = Math.round((q3Counts.Product / total) * 100);
    const pMark = Math.round((q3Counts.Marketing / total) * 100);
    const pEff = Math.round((q3Counts.Efficiency / total) * 100);

    document.getElementById('q3Dist').textContent = `Product: ${pProd}% | Marketing: ${pMark}% | Efficiency: ${pEff}%`;
}

function populateTable(responses) {
    const tbody = document.querySelector('#responsesTable tbody');
    tbody.innerHTML = '';

    responses.forEach(r => {
        const tr = document.createElement('tr');
        
        // Format date
        const date = new Date(r.created_at || r.createdAt);
        const dateString = isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();

        tr.innerHTML = `
            <td>${dateString}</td>
            <td>${escapeHtml(r.name)}</td>
            <td>${escapeHtml(r.email)}</td>
            <td>${escapeHtml(r.function)}</td>
            <td>$${r.businessSize.toLocaleString()}</td>
            <td>${escapeHtml(r.q1)}</td>
            <td>${escapeHtml(r.q2)}</td>
            <td>${escapeHtml(r.q3)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
