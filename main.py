from pymongo import MongoClient

# Create a connection to MongoDB
client = MongoClient('mongodb://localhost:27017/')

# Specify the database
db = client.mySampleDatabase

# Access the collections
users_collection = db.users
products_collection = db.products

# Fetch all users
users = users_collection.find()
print("Users:")
for user in users:
    print(user)

# Fetch all products
products = products_collection.find()
print("\nProducts:")
for product in products:
    print(product)

# Example of inserting a new user
new_user = {
    "name": "Alice Johnson",
    "age": 32,
    "email": "alice.j@example.com",
    "interests": ["painting", "hiking"],
    "location": {
        "city": "Los Angeles",
        "country": "USA"
    }
}

# Insert the new user
users_collection.insert_one(new_user)
print("\nInserted a new user: Alice Johnson")
