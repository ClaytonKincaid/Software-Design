// This module interacts with the database to perform various user-related operations.

// Import the MySQL connection pool
const pool = require('./mysqlConnection');

/**
 * Function to fetch all users from the database.
 * @returns {Promise<Array>} An array of user objects.
 */
async function getUsers() {
  try {
    // Query the database to fetch all users
    const [rows] = await pool.query('SELECT * FROM AccountData');
    return rows; // Return the fetched users
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Function to add a new user to the database.
 * @param {Object} user - The user object containing username and password.
 */
async function addUser(user) {
  try {
    // Insert the user into the database
    await pool.query('INSERT INTO AccountData (Username, PasswordHash) VALUES (?, ?)', [user.username, user.password]);
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

/**
 * Function to find a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<Object|null>} A user object if found, otherwise null.
 */
async function findUserByUsername(username) {
  try {
    // Query the database to find the user by username
    const [rows] = await pool.query('SELECT * FROM AccountData WHERE Username = ?', [username]);
    if (rows.length > 0) {
      // Create a user object from the fetched data
      const user = {
        id: rows[0].UserID,
        username: rows[0].Username,
        password: rows[0].PasswordHash,
        profileComplete: rows[0].ProfileComplete
      };
      return user;
    } else {
      return null; // Return null if no user found
    }
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
}

/**
 * Function to find a user by their ID.
 * @param {number} id - The user ID to search for.
 * @returns {Promise<Object|null>} A user object if found, otherwise null.
 */
async function findUserById(id) {
  try {
    // Query the database to find the user by ID
    const [rows] = await pool.query('SELECT * FROM AccountData WHERE UserID = ?', [id]);
    if (rows.length > 0) {
      // Create a user object from the fetched data
      const user = {
        id: rows[0].UserID,
        username: rows[0].Username,
        password: rows[0].PasswordHash,
        profileComplete: rows[0].ProfileComplete
      };
      return user;
    } else {
      return null; // Return null if no user found
    }
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
}

/**
 * Function to set the profile completion status for a user.
 * @param {number} id - The user ID.
 * @param {Object} profile - The profile data containing fullName, address1, address2, city, state, zipcode.
 */
async function setUserProfileComplete(id, { fullName, address1, address2, city, state, zipcode }) {
  try {
    // Retrieve the existing profile for the user
    const [rows] = await pool.query('SELECT * FROM ClientProfile WHERE UserID = ?', [id]);

    if (rows.length === 0) {
      // Insert a new profile for the user if not exists
      await pool.query('INSERT INTO ClientProfile (UserID, FullName, Address1, Address2, City, State, ZipCode) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, fullName, address1, address2, city, state, zipcode]);
      // Set profile to complete in AccountData
      await pool.query('UPDATE AccountData SET ProfileComplete = true WHERE UserID = ?', [id]);
    } else {
      // Update the existing profile
      await pool.query('UPDATE ClientProfile SET FullName = ?, Address1 = ?, Address2 = ?, City = ?, State = ?, ZipCode = ? WHERE UserID = ?', [fullName, address1, address2, city, state, zipcode, id]);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Function to fetch profile data by user ID.
 * @param {number} id - The user ID.
 * @returns {Promise<Object|null>} Profile data if found, otherwise null.
 */
async function getProfileDataById(id) {
  try {
    // Query the database to fetch profile data based on the provided user ID
    const [rows] = await pool.query('SELECT * FROM ClientProfile WHERE UserID = ?', [id]);

    // Check if profile data exists for the user
    if (rows.length > 0) {
      const profileData = {
        fullName: rows[0].FullName,
        address1: rows[0].Address1,
        address2: rows[0].Address2,
        city: rows[0].City,
        state: rows[0].State,
        zipcode: rows[0].Zipcode
      };
      return profileData; // Return the fetched profile data
    } else {
      return null; // Return null if no profile data found
    }
  } catch (error) {
    console.error('Error fetching profile data by ID:', error);
    throw error;
  }
}

// Export all functions for use in other modules
module.exports = {
  getUsers,
  addUser,
  findUserByUsername,
  findUserById,
  setUserProfileComplete,
  getProfileDataById
};

