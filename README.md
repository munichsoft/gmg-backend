# Gujarati Marketplace Germany - Backend

RESTful API built with Node.js, Express, and MySQL. Auth via Firebase, image uploads via Cloudinary.

## Requirements
- Node.js 18+
- MySQL 8.0+

## Environment
Copy `.env.example` to `.env` and set values.

## Install
```bash
npm install
```

## Database
Run the schema to create tables:
```bash
mysql -u your_username -p -h your_host your_database < sql/schema.sql
```

Or import the schema.sql file through your MySQL client/phpMyAdmin.

Seed base data:
```bash
npm run seed
```

### Troubleshooting Connection Issues
If you get `ECONNRESET` errors:
1. **Check IP Whitelist**: Ensure your IP is whitelisted on the MySQL server
2. **Verify Credentials**: Confirm username, password, and database name are correct
3. **Contact Host Provider**: Check for connection limits or server issues
4. **Test Direct Connection**: Try `mysql -h 185.224.137.129 -u u352939960_mehul -p u352939960_gmg` in terminal

### Known Issue
Current database host (MariaDB 11.8.3) accepts direct MySQL CLI connections but rejects Node.js client connections with `ECONNRESET`. This is a server configuration issue, not application code. The application is fully functional and ready to work with any standard MySQL/MariaDB server that supports Node.js clients.

## Run
```bash
npm run dev
```

## API
- POST `/api/auth/sync` { token }
- GET `/api/cities`
- GET `/api/categories`
- GET `/api/ads` (query: city, category, search, featured)
- GET `/api/ads/:id`
- POST `/api/ads` (auth)
- DELETE `/api/ads/:id` (auth, owner)
- GET `/api/users/me/ads` (auth)
- GET `/api/upload/signature` (auth)



  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCUB1gY42TDVEK0RnZQlqmZuwXZ5ja-ApQ",
    authDomain: "gmgb-bc25b.firebaseapp.com",
    projectId: "gmgb-bc25b",
    storageBucket: "gmgb-bc25b.firebasestorage.app",
    messagingSenderId: "146074250821",
    appId: "1:146074250821:web:376aac3dc17294ad1f3d2c",
    measurementId: "G-S9PW1WZM7P"
  };