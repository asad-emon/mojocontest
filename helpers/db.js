const sqlite3 = require('sqlite3').verbose();

// Initialize the database
const db = new sqlite3.Database('responses.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`
            CREATE TABLE IF NOT EXISTS api_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT,
                data TEXT,
                error_message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
});

async function saveToDatabase(url, jsonData = null, errorMessage = null) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO api_responses (url, data, error_message) VALUES (?, ?, ?)`,
            [url, jsonData ? JSON.stringify(jsonData) : null, errorMessage],
            function (err) {
                if (err) {
                    console.error('Database Insert Error:', err.message);
                    reject(err);
                } else {
                    console.log('Saved response/error to database, ID:', this.lastID);
                    resolve(this.lastID);
                }
            }
        );
    });
};

module.exports = { db, saveToDatabase };