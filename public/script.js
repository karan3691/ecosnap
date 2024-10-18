document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            const userList = document.getElementById('user-list');
            const productList = document.getElementById('product-list');

            data.users.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `${user.name} (${user.age}) - ${user.email}`;
                userList.appendChild(li);
            });

            data.products.forEach(product => {
                const li = document.createElement('li');
                li.textContent = `${product.name} - $${product.price} (${product.category})`;
                productList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});
