const expect = require('chai').expect
const axios = require('axios')
const url = 'http://localhost:3000'

describe('Yggdrasil integration tests', function () {
    it ('GET /room', async function () {
        let response = await axios.get(url + '/room')
        expect(response.status).to.equal(200)
        expect(response.request.res.responseUrl).to.exist
        expect(response.data.startsWith('<!DOCTYPE html>')).to.be.true
    })

    it ('GET /room/:roomId', async function () {
        let response = await axios.get(url + '/room')
        let responseToRoom = await axios.get(response.request.res.responseUrl)

        let redirect = response.request.res.responseUrl
        let id = redirect.substring(redirect.lastIndexOf('/') + 1)

        const uuidRegex = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
        expect(uuidRegex.exec(id).length).to.equal(1)
        
        expect(responseToRoom.status).to.equal(200)
        expect(responseToRoom.data.startsWith('<!DOCTYPE html>')).to.be.true
    })

    it ('Negative GET /room/:roomId', async function () {
        try {
            let response = await axios.get(url + '/room/roommcdoesntexist')
            expect(response.status).to.equal(404)
        } catch (error) {
            expect(error.response.status).to.equal(404)
        }
    })
})