const API_URL = "http://localhost:3000/api/auth";
const COMPLAINT_API_URL = "http://localhost:3000/api/complaints";

// Register form handling
// Register form handling
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    console.log('Submitting registration for:', username, password);

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        console.log('Registration response:', result);

        if (response.ok) {
            alert(result.message || "Registration successful");
            window.location.href = 'login.html'; // Redirect to login page after successful registration
        } else {
            alert(result.message || "Registration failed");
        }
    } catch (error) {
        alert('An error occurred during registration.');
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
        alert('An error occurred during login.');
        console.error('Login error:', error);
    }
});

// Complaint form submission
document.getElementById('complaintForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to submit a complaint');
        window.location.href = 'login.html'; // Redirect to login if no token
        return;
    }

    const user = getUserFromToken(token);
    const description = document.getElementById('description').value;
    const lat = document.getElementById('lat').value;
    const lng = document.getElementById('lng').value;
    const image = document.getElementById('image').files[0];

    if (!description || !lat || !lng) {
        alert('Please fill in all fields');
        return;
    }

    const formData = new FormData();
    formData.append('user', user.username);
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lng', lng);
    if (image) {
        formData.append('image', image); // Only append image if present
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
            document.getElementById('complaintForm').reset(); // Reset the form after submission
        } else {
            console.error('Error submitting complaint:', data.message);
        }
    } catch (err) {
        console.error('Complaint submission error:', err);
    }
});

// Decode JWT token to extract user info
function getUserFromToken(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload)); // Decode base64 token payload
        return decoded;
    } catch (error) {
        console.error('Token decoding error:', error);
        return null;
    }
}

// Load complaints
async function loadComplaints() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please log in to view complaints');
        window.location.href = 'login.html'; // Redirect to login if no token
        return;
    }

    try {
        const response = await fetch(COMPLAINT_API_URL, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.status === 401) {
            alert('Session expired, please log in again.');
            localStorage.removeItem('token');
            window.location.href = 'login.html'; // Redirect to login if session expired
            return;
        }

        const complaints = await response.json();
        const complaintsList = document.getElementById('complaintsList');
        complaintsList.innerHTML = ''; // Clear existing complaints list

        complaints.forEach(complaint => {
            const complaintDiv = document.createElement('div');
            complaintDiv.className = 'complaint';
            complaintDiv.innerHTML = `
                <strong>${complaint.user}</strong>
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

// Preserve form data on input change
document.getElementById('username')?.addEventListener('input', (e) => localStorage.setItem('savedUsername', e.target.value));
document.getElementById('password')?.addEventListener('input', (e) => localStorage.setItem('savedPassword', e.target.value));
document.getElementById('loginUsername')?.addEventListener('input', (e) => localStorage.setItem('savedLoginUsername', e.target.value));
document.getElementById('loginPassword')?.addEventListener('input', (e) => localStorage.setItem('savedLoginPassword', e.target.value));

// Pre-fill form data on load
window.onload = () => {
    if (document.getElementById('username')) {
        document.getElementById('username').value = localStorage.getItem('savedUsername') || '';
        document.getElementById('password').value = localStorage.getItem('savedPassword') || '';
    }
    if (document.getElementById('loginUsername')) {
        document.getElementById('loginUsername').value = localStorage.getItem('savedLoginUsername') || '';
        document.getElementById('loginPassword').value = localStorage.getItem('savedLoginPassword') || '';
    }

    // Automatically load complaints if the user is logged in
    if (localStorage.getItem('token')) {
        loadComplaints();
    } else if (document.getElementById('complaintsList')) {
        window.location.href = 'login.html'; // Redirect to login if no token
    }
};
