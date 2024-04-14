// Unit testing the database queries in userData.js 

const userData = require("./userData");
const pool = require('./mysqlConnection');

// Mock the pool.query function which is used by all userData functions
jest.mock('./mysqlConnection', () => ({
    query: jest.fn()
}));

describe('userData functions', () => {
    beforeEach(() => {
        // Clear mock calls before each test
        pool.query.mockClear();
    });


    
    describe('getUsers', () => {
        it('should fetch all users successfully', async () => {
          const mockUsers = [
            { id: 1, username: 'user1', passwordHash: 'hash1' },
            { id: 2, username: 'user2', passwordHash: 'hash2' }
          ];
          pool.query.mockResolvedValueOnce([mockUsers, []]); // Mock the response of the query
    
          const result = await userData.getUsers();
    
          expect(pool.query).toHaveBeenCalledWith('SELECT * FROM UserCredentials');
          expect(result).toEqual(mockUsers);
        });
    
        it('should handle errors during fetching users', async () => {
          const error = new Error('Database error');
          pool.query.mockRejectedValueOnce(error); // Mock a rejection by the query
    
          await expect(userData.getUsers()).rejects.toThrow('Database error');
    
          expect(pool.query).toHaveBeenCalledWith('SELECT * FROM UserCredentials');
        });
    });

    

    describe('addUser', () => {
        it('should add a new user to the database successfully', async () => {
            const testUser = { username: 'testUser', password: 'hashedPassword' };
            pool.query.mockResolvedValueOnce({ insertId: 1 });

            await userData.addUser(testUser);

            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO UserCredentials (Username, PasswordHash) VALUES (?, ?)', 
                [testUser.username, testUser.password]
            );
        });

        it('should handle errors during user addition', async () => {
            const testUser = { username: 'testUser', password: 'hashedPassword' };
            const error = new Error('Database error');
            pool.query.mockRejectedValueOnce(error);

            await expect(userData.addUser(testUser)).rejects.toThrow('Database error');
        });
    });

    // describe('findUserByUsername', () => {
    //     it('should find a user by username', async () => {
    //         const username = 'testUser';
    //         const mockUser = { id: 1, username: 'testUser', passwordHash: 'hashedPassword' };
    //         const mockProfileData = {
    //             fullName: 'John Doe',
    //             address1: '123 Main St',
    //             address2: 'Apt 101',
    //             city: 'Anytown',
    //             state: 'NY',
    //             zipcode: '12345'
    //         };
    //         pool.query.mockResolvedValueOnce([[mockUser], []]);
    //         pool.query.mockResolvedValueOnce([[mockProfileData], []]);


    //         const result = await userData.findUserByUsername(username);

    //         expect(pool.query).toHaveBeenCalledWith(
    //             'SELECT * FROM UserCredentials WHERE Username = ?', 
    //             [username]
    //         );
    //         const correctOutput = { id: 1, username: 'testUser', password: 'hashedPassword', profileComplete: true };
    //         expect(result).toEqual(correctOutput);
    //     });

    //     it('should return null if no user is found', async () => {
    //         const username = 'nonExistentUser';
    //         pool.query.mockResolvedValueOnce([[], []]);

    //         const result = await userData.findUserByUsername(username);

    //         expect(result).toBeNull();
    //     });
    // });

    describe('findUserById', () => {
        it('should find a user by ID', async () => {
            const id = 1;
            const mockUser = { UserID: 1, Username: 'testUser', PasswordHash: 'hashedPassword' };
            const mockProfileData = {
                fullName: 'John Doe',
                address1: '123 Main St',
                address2: 'Apt 101',
                city: 'Anytown',
                state: 'NY',
                zipcode: '12345'
            };
            pool.query.mockResolvedValueOnce([[mockUser], []]);
            pool.query.mockResolvedValueOnce([[mockProfileData], []]);

            const result = await userData.findUserById(id);

            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM UserCredentials WHERE UserID = ?', 
                [id]
            );
            const correctOutput = { id: 1, username: 'testUser', password: 'hashedPassword', profileComplete: true };
            expect(result).toEqual(correctOutput);
        });

        it('should return null if no user is found', async () => {
            const id = 999;
            pool.query.mockResolvedValueOnce([[], []]);

            const result = await userData.findUserById(id);

            expect(result).toBeNull();
        });
    });

    describe('setUserProfileComplete', () => {
        const profileData = {
            fullName: 'John Doe',
            address1: '123 Main St',
            address2: 'Apt 101',
            city: 'Anytown',
            state: 'NY',
            zipcode: '12345'
        };
    
        it('should insert a new profile if one does not exist', async () => {
            const id = 1;
            // Simulate no existing profile
            pool.query.mockResolvedValueOnce([[], []]);
            // Mock the response of the INSERT query
            pool.query.mockResolvedValueOnce({ insertId: 1 });
    
            await userData.setUserProfileComplete(id, profileData);
    
            expect(pool.query).toHaveBeenNthCalledWith(1, 
                'SELECT * FROM ClientInformation WHERE UserID = ?', [id]);
            expect(pool.query).toHaveBeenNthCalledWith(2, 
                'INSERT INTO ClientInformation (UserID, FullName, Address1, Address2, City, State, ZipCode) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                [id, profileData.fullName, profileData.address1, profileData.address2, profileData.city, profileData.state, profileData.zipcode]);
        });
    
        it('should update the profile if one already exists', async () => {
            const id = 1;
            // Simulate existing profile
            pool.query.mockResolvedValueOnce([[{id: 1}], []]); // Mock the SELECT query to return non-empty result
            // Mock the response of the UPDATE query
            pool.query.mockResolvedValueOnce({ affectedRows: 1 });
    
            await userData.setUserProfileComplete(id, profileData);
    
            expect(pool.query).toHaveBeenNthCalledWith(1,
                'SELECT * FROM ClientInformation WHERE UserID = ?', [id]);
            expect(pool.query).toHaveBeenNthCalledWith(2,
                'UPDATE ClientInformation SET FullName = ?, Address1 = ?, Address2 = ?, City = ?, State = ?, ZipCode = ? WHERE UserID = ?', 
                [profileData.fullName, profileData.address1, profileData.address2, profileData.city, profileData.state, profileData.zipcode, id]);
        });
    
        it('should throw an error if the database query fails', async () => {
            const id = 1;
            const error = new Error('Database error');
            // Simulate a failure in the SELECT query
            pool.query.mockRejectedValueOnce(error);
    
            await expect(userData.setUserProfileComplete(id, profileData)).rejects.toThrow('Database error');
        });
    });
    

    describe('getProfileDataById', () => {
        const userId = 1;
    
        it('should return profile data if found', async () => {
            // Mock data for a user profile
            const mockProfileData = {
                FullName: 'John Doe',
                Address1: '123 Main St',
                Address2: 'Apt 101',
                City: 'Anytown',
                State: 'NY',
                Zipcode: '12345'
            };
    
            // Simulate database returning user profile
            pool.query.mockResolvedValueOnce([[mockProfileData], []]);
    
            const result = await userData.getProfileDataById(userId);
    
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM ClientInformation WHERE UserID = ?', [userId]
            );
            expect(result).toEqual({
                fullName: mockProfileData.FullName,
                address1: mockProfileData.Address1,
                address2: mockProfileData.Address2,
                city: mockProfileData.City,
                state: mockProfileData.State,
                zipcode: mockProfileData.Zipcode
            });
        });
    
        it('should return null if no profile data is found', async () => {
            // Simulate database returning no results
            pool.query.mockResolvedValueOnce([[], []]);
    
            const result = await userData.getProfileDataById(userId);
    
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM ClientInformation WHERE UserID = ?', [userId]
            );
            expect(result).toBeNull();
        });
    
        it('should throw an error if the database query fails', async () => {
            const error = new Error('Database error');
            // Simulate a failure in the database query
            pool.query.mockRejectedValueOnce(error);
    
            await expect(userData.getProfileDataById(userId)).rejects.toThrow('Database error');
        });
    });
    


    describe('storeFuelQuote', () => {
        const quoteDetails = {
            userId: 1,
            gallonsRequested: 100,
            deliveryAddress: '123 Main St',
            deliveryDate: '2024-04-01',
            suggestedPrice: 2.50,
            totalAmountDue: 250.00
        };
    
        it('should store a fuel quote and return the insert ID', async () => {
            // Mock the successful insertion response
            const mockInsertResponse = { insertId: 123 };
            pool.query.mockResolvedValueOnce([mockInsertResponse]);
    
            const result = await userData.storeFuelQuote(quoteDetails);
    
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO FuelQuote (UserID, GallonsRequested, DeliveryAddress, DeliveryDate, SuggestedPrice, TotalAmountDue) VALUES (?, ?, ?, ?, ?, ?)', 
                [quoteDetails.userId, quoteDetails.gallonsRequested, quoteDetails.deliveryAddress, quoteDetails.deliveryDate, quoteDetails.suggestedPrice, quoteDetails.totalAmountDue]
            );
            expect(result).toEqual(mockInsertResponse.insertId);
        });
    
        it('should throw an error if the database query fails', async () => {
            const error = new Error('Database error');
            // Simulate a failure in the database operation
            pool.query.mockRejectedValueOnce(error);
    
            await expect(userData.storeFuelQuote(quoteDetails)).rejects.toThrow('Database error');
        });
    });
    


    // 2 passed 1 failed

    describe('getFuelQuoteHistoryById', () => {
        const userId = 1;
    
        it('should return a list of fuel quote history for a given user ID', async () => {
            // Mock data representing fuel quote history
            const mockFuelQuoteHistory = [
                {
                    estimateDate: '2024-04-01',
                    gallonsRequested: 100,
                    deliveryAddress: '123 Main St',
                    deliveryDate: '2024-04-01',
                    suggestedPrice: 2.50,
                    quote: 250.00
                },
                {
                    estimateDate: '2024-05-01',
                    gallonsRequested: 150,
                    deliveryAddress: '123 Main St',
                    deliveryDate: '2024-05-01',
                    suggestedPrice: 3.00,
                    quote: 450.00
                }
            ];
            pool.query.mockResolvedValueOnce([mockFuelQuoteHistory]);
    
            const result = await userData.getFuelQuoteHistoryById(userId);
    
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM FuelQuote WHERE UserID = ?', [userId]
            );
            expect(result).toEqual(mockFuelQuoteHistory.map(row => ({
                gallonsRequested: row.GallonsRequested,
                deliveryAddress: row.DeliveryAddress,
                deliveryDate: row.DeliveryDate,
                suggestedPrice: row.SuggestedPrice,
                quote: row.TotalAmountDue
            })));
        });
    
        it('should return an empty array if no fuel quote history is found', async () => {
            pool.query.mockResolvedValueOnce([[], []]);  // Simulate no results found
    
            const result = await userData.getFuelQuoteHistoryById(userId);
    
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM FuelQuote WHERE UserID = ?', [userId]
            );
            expect(result).toEqual([]);
        });
    
        it('should throw an error if the database query fails', async () => {
            const error = new Error('Database error');
            pool.query.mockRejectedValueOnce(error);
    
            await expect(userData.getFuelQuoteHistoryById(userId)).rejects.toThrow('Database error');
        });
    });
    




});
