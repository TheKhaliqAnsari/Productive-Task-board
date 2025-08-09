/**
 * Simple JSON file database utilities.
 * Data file lives at `data/db.json` relative to project root.
 * Uses synchronous fs APIs for simplicity.
 */

const fs = require("fs");
const path = require("path");

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} password - Hashed password
 */

/**
 * @typedef {Object} TaskBoard
 * @property {string} id
 * @property {string} userId
 * @property {string} name
 * @property {string} createdAt - ISO date string
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} boardId
 * @property {string} title
 * @property {string} [description]
 * @property {"pending"|"completed"} status
 * @property {"low"|"medium"|"high"} [priority] - Task priority level
 * @property {string} [dueDate] - ISO date string
 * @property {string} createdAt - ISO date string
 */

/**
 * @typedef {Object} Database
 * @property {User[]} users
 * @property {TaskBoard[]} boards
 * @property {Task[]} tasks
 */

const DB_PATH = path.join(process.cwd(), "data", "db.json");
/** @type {Database} */
const DEFAULT_DB = { users: [], boards: [], tasks: [] };

/** Ensure the data directory and file exist with a default structure. */
function ensureDBFileExists() {
  const dir = path.dirname(DB_PATH);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
      console.log(`Created database file: ${DB_PATH}`);
    }
  } catch (err) {
    console.error("Error ensuring database file exists:", err);
    // In serverless environments like Vercel, this might fail
    // The app will fallback to default empty data structure
  }
}

/**
 * Safely parse a JSON string, falling back to DEFAULT_DB.
 * @param {string} text
 * @returns {Database}
 */
function parseDB(text) {
  try {
    const parsed = JSON.parse(text);
    // Sanitize shape and provide fallbacks
    return {
      users: Array.isArray(parsed?.users) ? parsed.users : [],
      boards: Array.isArray(parsed?.boards) ? parsed.boards : [],
      tasks: Array.isArray(parsed?.tasks) ? parsed.tasks : [],
    };
  } catch (_err) {
    return { ...DEFAULT_DB };
  }
}

/**
 * Read and return the entire JSON database.
 * Returns an empty structure if the file doesn't exist or JSON is invalid.
 * @returns {Database}
 */
function getDB() {
  try {
    ensureDBFileExists();
    const text = fs.readFileSync(DB_PATH, "utf8");
    const db = parseDB(text);
    console.log(`Database read successfully. Users: ${db.users.length}, Boards: ${db.boards.length}, Tasks: ${db.tasks.length}`);
    return db;
  } catch (err) {
    console.error("Failed to read database:", err);
    console.log("Returning default empty database structure");
    return { ...DEFAULT_DB };
  }
}

/**
 * Write the entire database to the JSON file.
 * @param {Database} db
 */
function saveDB(db) {
  try {
    ensureDBFileExists();
    const text = JSON.stringify(db, null, 2);
    fs.writeFileSync(DB_PATH, text, "utf8");
    console.log(`Database saved successfully. Users: ${db.users.length}, Boards: ${db.boards.length}, Tasks: ${db.tasks.length}`);
  } catch (err) {
    console.error("Failed to save database:", err);
    // In serverless environments like Vercel, file writes might fail
    // This is expected behavior for the demo app
  }
}

/**
 * Find a user by their username.
 * @param {string} username
 * @returns {User|null}
 */
function getUserByUsername(username) {
  const db = getDB();
  const user = db.users.find((u) => u.username === username);
  return user ?? null;
}

/**
 * Get all boards for a given user id.
 * @param {string} userId
 * @returns {TaskBoard[]}
 */
function getBoardsByUserId(userId) {
  const db = getDB();
  return db.boards.filter((b) => b.userId === userId);
}

/**
 * Get all tasks for a given board id.
 * @param {string} boardId
 * @returns {Task[]}
 */
function getTasksByBoardId(boardId) {
  const db = getDB();
  return db.tasks.filter((t) => t.boardId === boardId);
}

module.exports = {
  getDB,
  saveDB,
  getUserByUsername,
  getBoardsByUserId,
  getTasksByBoardId,
}; 