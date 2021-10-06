const users = []

//add user, remove user, get user, get user in room

//add new user
const addUser = ({ id, username, room}) => {
    //converting to lowercase & removing the empty spaces.
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validating the data
    if(!username || !room) {
        return {
            error : "Please provide the username & room!!"
        }
    }

    //check for existing user
    const existingUser = users.find((user) =>{
         return user.room === room && user.username === username
    })

    //validating username
    if(existingUser) {
        return {
            error : "Username in use!"
        }
    }

    //store user
    const user = { id , username, room }
    users.push(user)
    return { user }
}

//removeuser
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    //findindex give the index of where we found match in an array.
    //index = -1 if we didnt found match & (0 or 1 if we found match)
    if(index !== -1) {
        return users.splice(index,1)[0]
    }
}

//get user
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

//get users in room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()

    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


// addUser({
//     id: 22,
//     username : 'Hardik',
//     room: 'Indore'
// })

// addUser({
//     id: 33,
//     username : 'Anurag',
//     room: 'Indore'
// })

// addUser({
//     id: 44,
//     username : 'Hardik',
//     room: 'Bhopal'
// })

// const user = getUser(22)
// console.log(user);

// const userList = getUsersInRoom('Bhopal')
// console.log(userList);