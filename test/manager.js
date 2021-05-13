const expect = require('chai').expect
const manager = require('../manager')

describe('Manager tests.', function () {

    it ('createRoom', async function () {
        let room = await manager.createRoom()
        expect(room.id).to.exist
    })

    it ('getRoom (roomId)', async function () {
        let room = await manager.createRoom()
        let get = await manager.getRoom(room.id)
        expect(room.id).to.equal(get.id)
    })

    it ('Negative getRoom', async function () {
        try {
            let room = await manager.getRoom('TheCrimsonFuckr')
            expect(room).to.not.exist
        }catch (error) {
            expect(error.response.status).to.equal(404)
        }
    })
})