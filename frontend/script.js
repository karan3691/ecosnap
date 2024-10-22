document.getElementById('complaintForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = document.getElementById('user').value;
    const description = document.getElementById('description').value;
    const lat = document.getElementById('lat').value;
    const lng = document.getElementById('lng').value;
    const image = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('user', user);
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lng', lng);
    if (image) {
        formData.append('image', image);
    }

    try {
        const response = await fetch('http://localhost:3000/api/complaints', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Complaint submitted:', data);
            loadComplaints();
            document.getElementById('complaintForm').reset();
        } else {
            console.error('Error submitting complaint:', data.message);
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
});

async function loadComplaints() {
    try {
        const response = await fetch('http://localhost:3000/api/complaints');
        const complaints = await response.json();
        const complaintsList = document.getElementById('complaintsList');
        complaintsList.innerHTML = '';

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

// Load complaints on page load
window.onload = loadComplaints;
