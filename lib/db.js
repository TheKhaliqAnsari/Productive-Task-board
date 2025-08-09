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
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
    }
  } catch (_err) {
    // Best-effort; actual read/write functions will handle errors too
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
  ensureDBFileExists();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return parseDB(raw);
  } catch (err) {
    // If the file is missing or unreadable, return a default structure
    return { ...DEFAULT_DB };
  }
}

/**
 * Persist the provided database object to disk.
 * Ensures directory exists and writes pretty-printed JSON.
 * @param {Database} db
 * @returns {void}
 */
function saveDB(db) {
  ensureDBFileExists();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db ?? DEFAULT_DB, null, 2), "utf8");
  } catch (err) {
    // Swallow write errors for now; callers may choose to handle via try/catch
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