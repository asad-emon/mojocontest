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


// Initialize the quiz database
const quizdb = new sqlite3.Database('quiz.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to Quiz database.');
        quizdb.run(`
            CREATE TABLE IF NOT EXISTS quizs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id TEXT,
                question TEXT,
                option_id TEXT,
                option TEXT,
                correct INTEGER,
                error_message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
});

async function saveToQuizDatabase(jsonData = [], errorMessage = null) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            return reject(new Error("jsonData must be a non-empty array."));
        }

        quizdb.serialize(() => {
            quizdb.run("BEGIN TRANSACTION");

            jsonData.forEach(item => {
                quizdb.get(
                    `SELECT COUNT(*) as count FROM quizs WHERE question_id = ?`,
                    [item.question_id],
                    (err, row) => {
                        if (err) {
                            console.error("Database Select Error:", err.message);
                            return reject(err);
                        }

                        if (row.count === 0) {
                            // If question_id does not exist, insert the data
                            const stmt = quizdb.prepare(`
                                INSERT INTO quizs (question_id, question, option_id, option, correct, error_message) 
                                VALUES (?, ?, ?, ?, ?, ?)
                            `);
                            
                            stmt.run(
                                item.question_id, 
                                item.question, 
                                item.option_id, 
                                item.option, 
                                item.correct, 
                                errorMessage
                            );
                            
                            stmt.finalize();
                            console.log(`Inserted new question_id: ${item.question_id}`);
                        } else {
                            console.log(`Skipping existing question_id: ${item.question_id}`);
                        }
                    }
                );
            });

            quizdb.run("COMMIT", () => {
                console.log("Data processing completed.");
                resolve(true);
            });
        });
    });
}

async function getQuizById(question_id) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM quizs WHERE question_id = ?`,
            [question_id],
            (err, rows) => {
                if (err) {
                    console.error("Database Query Error:", err.message);
                    reject(err);
                } else {
                    if (rows.length === 0) {
                        resolve(null);
                    } else {
                        resolve(rows);
                    }
                }
            }
        );
    });
}




module.exports = { db, quizdb, saveToDatabase, saveToQuizDatabase, getQuizById };