const axios = require('axios')
const roomManagerUrl = process.env.ROOM_MANAGER_URL

module.exports = {
    createRoom: async function () {
        return (await axios.post(roomManagerUrl + '/rooms')).data
    },

    getRoom: async function (roomId) {
        return (await axios.get(roomManagerUrl + '/rooms/' + roomId)).data
    },
}