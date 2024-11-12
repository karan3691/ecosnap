const API_URL = "http://localhost:3000/api/auth";
const COMPLAINT_API_URL = "http://localhost:3000/api/complaints";

// Register form handling
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || "Registration successful");
            window.location.href = 'login.html'; // Redirect to login page after registration
        } else {
            alert(result.message || "Registration failed");
        }
    } catch (error) {
        console.error('Registration error:', error);
    }
});

// Login form handling
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.token); // Store JWT token
            window.location.href = 'index.html'; // Redirect to main page
        } else {
            alert(result.message || "Login failed");
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});

document.getElementById('complaintForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to submit a complaint');
        window.location.href = 'login.html';
        return;
    }

    const description = document.getElementById('description').value;
    const lat = document.getElementById('lat').value;
    const lng = document.getElementById('lng').value;
    const image = document.getElementById('image').files[0];

    if (!description || !lat || !lng) {
        alert('Please fill in all fields');
        return;
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lng', lng);
    if (image) {
        formData.append('image', image);
    }

    try {
        const response = await fetch(COMPLAINT_API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        const data = await response.json();
        if (response.ok) {
            loadComplaints(); // Reload complaints
            document.getElementById('complaintForm').reset(); // Reset form after submission
        } else {
            console.error('Error submitting complaint:', data.message);
        }
    } catch (err) {
        console.error('Complaint submission error:', err);
    }
});

// Load complaints
async function loadComplaints() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to view complaints');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(COMPLAINT_API_URL, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.status === 401) {
            alert('Session expired, please log in again.');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

        const complaints = await response.json();
        const complaintsList = document.getElementById('complaintsList');
        complaintsList.innerHTML = '';

        complaints.forEach(complaint => {
            const complaintDiv = document.createElement('div');
            complaintDiv.className = 'complaint';
            complaintDiv.innerHTML = `
                <strong>${complaint.user?.username || 'Anonymous'}</strong> <!-- Display username -->
                <p>${complaint.description}</p>
                <p><strong>Location:</strong> ${complaint.location.lat}, ${complaint.location.lng}</p>
                ${complaint.imageUrl ? `<img src="${complaint.imageUrl}" alt="Complaint Image" style="max-width: 100%;">` : ''}
                <hr>
            `;
            complaintsList.appendChild(complaintDiv);
        });
    } catch (err) {
        console.error('Error loading complaints:', err);
    }
}

// Automatically load complaints if the user is logged in
window.onload = () => {
    if (localStorage.getItem('token')) {
        loadComplaints();
    } else if (document.getElementById('complaintsList')) {
        window.location.href = 'login.html'; // Redirect to login if no token
    }
};
