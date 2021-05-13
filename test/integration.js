const expect = require('chai').expect
const axios = require('axios')
const url = 'http://localhost:3000'

describe('Yggdrasil integration tests', function () {
    it ('GET /room/', async function () {
        let response = await axios.get(url + '/room')
        expect(response.status).to.equal(200)
        expect(response.request.res.responseUrl).to.exist // Redirects. Should probably test to ensure that it redirects to a room. RegEx maybe?
        expect(response.data.startsWith('<!DOCTYPE html>')).to.be.true // Returns HTML document
    })

    it ('GET /room/:roomId', async function () {
        let response = await axios.get(url + '/room')
        let responseToRoom = await axios.get(response.request.res.responseUrl)
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