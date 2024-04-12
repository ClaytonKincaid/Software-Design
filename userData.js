const pool = require('./mysqlConnection');

async function getUsers() {
  try {
    const [rows] = await pool.query('SELECT * FROM UserCredentials');
    return rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

async function addUser(user) {
  try {
    await pool.query('INSERT INTO UserCredentials (Username, PasswordHash) VALUES (?, ?)', [user.username, user.password]);
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}

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

async function findUserById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM UserCredentials WHERE UserID = ?', [id]);
    if (rows.length > 0) {
      // create user object
      const user = {
        id: rows[0].UserID,
        username: rows[0].Username,
        password: rows[0].PasswordHash,
        profileComplete: rows[0].ProfileComplete
      };
    
      return user;
      } else {
        return null;
      }
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
}

async function setUserProfileComplete(id, { fullName, address1, address2, city, state, zipcode }) {
  try {
    // Retrieve the existing profile for the user
    const [rows] = await pool.query('SELECT * FROM ClientInformation WHERE UserID = ?', [id]);

    if (rows.length === 0) {
      // Insert a new profile for the user
      await pool.query('INSERT INTO ClientInformation (UserID, FullName, Address1, Address2, City, State, ZipCode) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, fullName, address1, address2, city, state, zipcode]);
      // Set profile to complete in UserCredentials
      await pool.query('UPDATE UserCredentials SET ProfileComplete = true WHERE UserID = ?', [id])
    } else {
      // Update the existing profile
      await pool.query('UPDATE ClientInformation SET FullName = ?, Address1 = ?, Address2 = ?, City = ?, State = ?, ZipCode = ? WHERE UserID = ?', [fullName, address1, address2, city, state, zipcode, id]);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

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

      return profileData;
    } else {
      return null; // Return null if no profile data is found for the user
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

