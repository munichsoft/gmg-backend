import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL
const url = new URL(process.env.DATABASE_URL);

// Create connection pool with minimal configuration
const pool = mysql.createPool({
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // Remove leading slash
  waitForConnections: true,
  connectionLimit: 1, // Use only 1 connection to avoid overwhelming the server
  queueLimit: 0,
  ssl: false
});

// Helper function to execute queries
export async function query(sql, params = []) {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    // Return in PostgreSQL format for compatibility
    return { rows };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get a client from the pool (for transactions)
export async function getClient() {
  const connection = await pool.getConnection();
  
  // Add PostgreSQL-compatible methods
  const client = {
    connection, // Expose the raw connection for insertId access
    query: async (sql, params = []) => {
      const [rows, fields] = await connection.execute(sql, params);
      return { rows };
    },
    release: () => connection.release(),
    // Add transaction methods
    begin: () => connection.beginTransaction(),
    commit: () => connection.commit(),
    rollback: () => connection.rollback()
  };
  
  return client;
}

// Health check function
export async function healthCheck() {
  try {
    const result = await query('SELECT 1 as health');
    return { healthy: true, result: result.rows[0] };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

export default pool;