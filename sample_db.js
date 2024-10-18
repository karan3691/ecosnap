// Create a "users" collection and insert documents

db.users.insertMany([
    {
      name: "Karan Sahota",
      age: 25,
      email: "karan.s@example.com",
      interests: ["coding", "machine learning", "gaming"],
      location: {
        city: "Delhi",
        country: "India"
      }
    },
    {
      name: "John Doe",
      age: 30,
      email: "john.doe@example.com",
      interests: ["traveling", "photography"],
      location: {
        city: "New York",
        country: "USA"
      }
    },
    {
      name: "Jane Smith",
      age: 28,
      email: "jane.smith@example.com",
      interests: ["reading", "yoga", "programming"],
      location: {
        city: "London",
        country: "UK"
      }
    }
  ]);
  
  // Create a "products" collection and insert documents
  db.products.insertMany([
    {
      name: "Wireless Headphones",
      price: 99.99,
      category: "Electronics",
      stock: 150,
      ratings: 4.5
    },
    {
      name: "Gaming Laptop",
      price: 1499.99,
      category: "Computers",
      stock: 50,
      ratings: 4.8
    },
    {
      name: "Smartwatch",
      price: 199.99,
      category: "Wearable",
      stock: 200,
      ratings: 4.4
    },
    {
      name: "Coffee Maker",
      price: 49.99,
      category: "Home Appliances",
      stock: 80,
      ratings: 4.2
    }
  ]);
  
  // Query all users
  print("All Users:");
  db.users.find().forEach(printjson);
  
  // Query all products
  print("All Products:");
  db.products.find().forEach(printjson);
  