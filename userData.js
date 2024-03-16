let users = [] // Acts as simple in-memory database since we are not implementing it yet

const getUsers = () => users;

const addUser = (user) => {
    users.push(user)
}

const findUserByUsername = (username) => {
    return users.find(user => user.username === username)
}

const findUserById = (id) => {
    return users.find(user => user.id === id)
}


module.exports = {
    getUsers,
    addUser,
    findUserByUsername,
    findUserById,
}
