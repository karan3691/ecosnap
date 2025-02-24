const API_URL = "http://localhost:3000/api/auth";
const COMPLAINT_API_URL = "http://localhost:3000/api/complaints";

const apiClient = {
    async get(url) {
        const token = localStorage.getItem('token');
        console.log(`GET ${url} with token:`, token);
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            console.log(`Response from ${url}:`, data);
            return data;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        }
    },
    async post(url, data, isFormData = false) {
        const token = localStorage.getItem('token');
        console.log(`POST ${url} with token:`, token);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: isFormData ? { 'Authorization': `Bearer ${token}` } : { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: isFormData ? data : JSON.stringify(data)
            });
            if (!response.ok) throw new Error(await response.text());
            const result = await response.json();
            console.log(`Response from ${url}:`, result);
            return result;
        } catch (error) {
            console.error(`Error posting to ${url}:`, error);
            throw error;
        }
    }
};

function logout() {
    console.log('Logging out...');
    localStorage.removeItem('token');
    window.location.assign('login.html');
}

// Register
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMsg = document.getElementById('errorMessage');

    if (!username || !password || !confirmPassword) {
        errorMsg.textContent = 'Please fill in all fields';
        errorMsg.style.display = 'block';
        return;
    }

    if (password !== confirmPassword) {
        errorMsg.textContent = 'Passwords do not match';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        errorMsg.style.display = 'none';
        const result = await apiClient.post(`${API_URL}/register`, { username, password });
        alert(result.message || "Registration successful");
        window.location.assign('login.html');
    } catch (error) {
        let errorMessage = 'Registration failed';
        try {
            errorMessage = JSON.parse(error.message).message || errorMessage;
        } catch (parseError) {
            errorMessage = error.message || errorMessage;
        }
        errorMsg.textContent = errorMessage;
        errorMsg.style.display = 'block';
    }
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('errorMessage');

    if (!username || !password) {
        errorMsg.textContent = 'Please enter both username and password';
        errorMsg.style.display = 'block';
        return;
    }

    try {
        errorMsg.style.display = 'none';
        const result = await apiClient.post(`${API_URL}/login`, { username, password });
        localStorage.setItem('token', result.token);
        window.location.assign('dashboard.html');
    } catch (error) {
        let errorMessage = 'Login failed';
        try {
            errorMessage = JSON.parse(error.message).message || errorMessage;
        } catch (parseError) {
            errorMessage = error.message || errorMessage;
        }
        errorMsg.textContent = errorMessage;
        errorMsg.style.display = 'block';
    }
});

// Complaint Submission (index.html)
document.getElementById('complaintForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Complaint form submitted'); // Debug: Confirm event triggers

    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token, redirecting to login');
        alert('Please log in to submit a complaint');
        logout();
        return;
    }

    const formData = new FormData();
    const description = document.getElementById('description').value;
    const lat = document.getElementById('lat').value;
    const lng = document.getElementById('lng').value;
    const image = document.getElementById('image').files[0];
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lng', lng);
    if (image) formData.append('image', image);

    console.log('Submitting complaint with data:', { description, lat, lng, image: image ? image.name : 'none' }); // Debug: Log form data

    try {
        const result = await apiClient.post(COMPLAINT_API_URL, formData, true);
        alert('Complaint registered successfully!');
        console.log('Complaint submission result:', result);
        document.getElementById('complaintForm').reset();
        loadComplaints(); // Refresh the list
    } catch (error) {
        let errorMessage = 'Failed to submit complaint';
        try {
            errorMessage = JSON.parse(error.message).message || errorMessage;
        } catch (parseError) {
            errorMessage = error.message || errorMessage;
        }
        console.error('Complaint submission error:', errorMessage);
        alert(errorMessage);
    }
});

// Load Complaints (index.html)
async function loadComplaints() {
    const list = document.getElementById('complaintsList');
    if (!list) {
        console.log('No complaintsList element found'); // Debug: Confirm element exists
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token, redirecting to login');
        logout();
        return;
    }

    try {
        list.innerHTML = '<div class="loading">Loading complaints...</div>';
        const complaints = await apiClient.get(COMPLAINT_API_URL);
        list.innerHTML = '';
        complaints.forEach(complaint => {
            const div = document.createElement('div');
            div.className = 'complaint-item';
            div.innerHTML = `
                <h3>${complaint.user?.username || 'Anonymous'}</h3>
                <div class="complaint-meta">
                    <span>📍 ${complaint.location.lat.toFixed(4)}, ${complaint.location.lng.toFixed(4)}</span>
                    <span>🕒 ${new Date(complaint.createdAt).toLocaleString()}</span>
                    <span>Status: ${complaint.status}</span>
                </div>
                <p>${complaint.description}</p>
                ${complaint.imageUrl ? `<img src="${complaint.imageUrl}" alt="Complaint Image" loading="lazy">` : ''}
            `;
            list.appendChild(div);
        });
        console.log('Complaints loaded:', complaints.length); // Debug: Log count
    } catch (error) {
        list.innerHTML = '<div class="error">Failed to load complaints: ' + error.message + '</div>';
        console.error('Error loading complaints:', error);
    }
};

// Dashboard Functions
async function loadDashboardData() {
    const token = localStorage.getItem('token');
    if (!token) {
        logout();
        return;
    }

    try {
        // User Profile
        const userData = await apiClient.get(`${API_URL}/user`);
        document.getElementById('userGreeting').textContent = `Welcome, ${userData.username}!`;
        document.getElementById('joinDate').textContent = 'N/A'; // Update if createdAt is added
        const userComplaints = await apiClient.get(`${COMPLAINT_API_URL}/my-complaints`);
        console.log('User complaints:', userComplaints);
        document.getElementById('reportCount').textContent = userComplaints.length;

        // Report Status Overview
        const pending = userComplaints.filter(c => c.status === 'pending').length;
        const inProgress = userComplaints.filter(c => c.status === 'in_progress').length;
        const resolved = userComplaints.filter(c => c.status === 'resolved').length;
        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('inProgressCount').textContent = inProgress;
        document.getElementById('resolvedCount').textContent = resolved;

        // Rewards
        const points = userComplaints.length * 10;
        document.getElementById('rewardPoints').textContent = points;
        document.getElementById('rewardStatus').textContent = points > 100 ? 'Platinum' : points > 50 ? 'Gold' : points > 20 ? 'Silver' : 'Bronze';
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        logout();
    }
}

// Navigation and Initialization
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    console.log('Page loaded:', window.location.pathname, 'Token:', token);

    if (!token && window.location.pathname.includes('dashboard.html')) {
        logout();
        return;
    }

    if (document.getElementById('userGreeting')) {
        loadDashboardData();
    }

    if (document.getElementById('complaintsList')) {
        loadComplaints();
    }

    document.getElementById('raiseReportBtn')?.addEventListener('click', () => {
        window.location.assign('index.html');
    });

    document.getElementById('viewReportsBtn')?.addEventListener('click', () => {
        window.location.assign('index.html');
    });

    document.getElementById('redeemRewards')?.addEventListener('click', () => {
        alert('Rewards redemption coming soon!');
    });

    document.getElementById('logoutButton')?.addEventListener('click', logout);
});