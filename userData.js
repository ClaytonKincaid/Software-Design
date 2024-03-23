let users = [] // Acts as simple in-memory database since we are not implementing it yet

const getUsers = () => users;

const addUser = (user) => {
    // users.push(user)
    users.push({...user, profileComplete: false}) // profileComplete field set to false by default when a new user is registered
}

const findUserByUsername = (username) => {
    return users.find(user => user.username === username)
}

const findUserById = (id) => {
    return users.find(user => user.id === id)
}

// // Adds a function to mark a user's profile as complete
// const setUserProfileComplete = (id) => {
//     const userIndex = users.findIndex(user => user.id === id)
//     if (userIndex !== -1) {
//         users[userIndex].profileComplete = true
//     }
// }


const setUserProfileComplete = (id, { fullName, address1, address2, city, state, zipcode }) => {
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex !== -1) {
        // Update the user's profile information along with setting the profileComplete flag
        users[userIndex] = {
            ...users[userIndex],
            fullName,
            address1,
            address2,
            city,
            state,
            zipcode,
            profileComplete: true
        }
    }
}

module.exports = {
    getUsers,
    addUser,
    findUserByUsername,
    findUserById,
    setUserProfileComplete, // Export this function
}
