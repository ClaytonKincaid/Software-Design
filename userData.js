// This module interacts with the database to perform various user-related operations.

// Import the MySQL connection pool
const pool = require('./mysqlConnection');

/**
 * Function to fetch all users from the database.
 * @returns {Promise<Array>} An array of user objects.
 */
async function getUsers() {
  try {
    const [rows] = await pool.query('SELECT * FROM UserCredentials');
    return rows;
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
    await pool.query('INSERT INTO UserCredentials (Username, PasswordHash) VALUES (?, ?)', [user.username, user.password]);
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
    const [userData] = await pool.query('SELECT * FROM UserCredentials WHERE Username = ?', [username]);
    if (userData.length > 0) {
      // Check if profile is completed
      const [profileData] = await pool.query('SELECT * FROM ClientInformation WHERE UserID = ?', [userData[0].UserID]);
      const profileCompleted = (profileData.length > 0);

      // Create user object
      const user = {
          id: userData[0].UserID,
          username: userData[0].Username,
          password: userData[0].PasswordHash,
          profileComplete: profileCompleted
      };
      
      return user;

      } else {
        return null;
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
    const [userData] = await pool.query('SELECT * FROM UserCredentials WHERE UserID = ?', [id]);
    if (userData.length > 0) {
      // Check if profile is completed
      const [profileData] = await pool.query('SELECT * FROM ClientInformation WHERE UserID = ?', [userData[0].UserID]);
      const profileCompleted = (profileData.length > 0);

      // Create a user object from the fetched data
      const user = {
        id: userData[0].UserID,
        username: userData[0].Username,
        password: userData[0].PasswordHash,
        profileComplete: profileCompleted
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
    const [rows] = await pool.query('SELECT * FROM ClientInformation WHERE UserID = ?', [id]);

    if (rows.length === 0) {
      // Insert a new profile for the user
      await pool.query('INSERT INTO ClientInformation (UserID, FullName, Address1, Address2, City, State, ZipCode) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, fullName, address1, address2, city, state, zipcode]);
    } else {
      // Update the existing profile
      await pool.query('UPDATE ClientInformation SET FullName = ?, Address1 = ?, Address2 = ?, City = ?, State = ?, ZipCode = ? WHERE UserID = ?', [fullName, address1, address2, city, state, zipcode, id]);
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
    const [rows] = await pool.query('SELECT * FROM ClientInformation WHERE UserID = ?', [id]);

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

async function storeFuelQuote(quoteDetails) {
  try {
    const {
      userId,
      gallonsRequested,
      deliveryAddress,
      deliveryDate,
      suggestedPrice,
      totalAmountDue
    } = quoteDetails;

    // Query to insert a new quote into the FuelQuote table
    const query = 'INSERT INTO FuelQuote (UserID, GallonsRequested, DeliveryAddress, DeliveryDate, SuggestedPrice, TotalAmountDue) VALUES (?, ?, ?, ?, ?, ?)';
    
    const [result] = await pool.query(query, [
      userId,
      gallonsRequested,
      deliveryAddress,
      deliveryDate,
      suggestedPrice,
      totalAmountDue
    ]);

    // Return ID of the inserted row
    return result.insertId;
  } catch (error) {
    console.error('Error storing fuel quote:', error);
    throw error;
  }
}

async function getFuelQuoteHistoryById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM FuelQuote WHERE UserID = ?', [id]);

    // Check if fuel quote history data exists for the user
    if (rows.length > 0) {
      const fuelQuoteHistory = rows.map(row => ({
        estimateDate: row.estimateDate,
        gallonsRequested: row.GallonsRequested,
        deliveryAddress: row.DeliveryAddress,
        deliveryDate: row.DeliveryDate,
        suggestedPrice: row.SuggestedPrice,
        quote: row.TotalAmountDue
      }));

      return fuelQuoteHistory;
    } else {
      return []; // Return nothing if no fuel quote history data is found for the user
    }
  } catch (error) {
    console.error('Error fetching fuel quote history data by ID:', error);
    throw error;
  }
}

module.exports = {
  getUsers,
  addUser,
  findUserByUsername,
  findUserById,
  setUserProfileComplete,
  getProfileDataById,
  storeFuelQuote,
  getFuelQuoteHistoryById
};

