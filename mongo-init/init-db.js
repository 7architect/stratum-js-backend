// MongoDB initialization script
db = db.getSiblingDB('soundr');

// Create users collection with indexes
db.createCollection('users');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "deletedAt": 1 });
db.users.createIndex({ "roles": 1 });

print('Database initialized successfully!');
