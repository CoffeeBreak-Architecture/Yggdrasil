describe('Client integration testing', function () {

    describe ('common.js', function () {
        it('getCookie (roomId)', function () {
            expect(getCookie('roomId')).to.exist
        })

        it('getCookie (socketUrl)', function () {
            expect(getCookie('socketUrl')).to.exist
        })

        it('getCookie (signallingUrl)', function () {
            expect(getCookie('signallingUrl')).to.exist
        })
    })

    describe ('room.js', function () {
        localUserId = undefined // Reset from previous tests.

        it ('Logs in', async function () {
            await delayUntill (() => localUserId)
            expect(localUserId).to.exist
        })

        it ('moveLocalUser (x, y)', async function () {
            moveLocalUser(300, 300)
            await delayUntill(() => getLocalUser().x == 300)
            expect(getLocalUser().x).to.equal(300)
            expect(getLocalUser().y).to.equal(300)
        })

        it ('Recieves nearby', function () {
            expect(nearby).to.exist
        })

        it ('transmitChatMessage(author, content)', async function () {
            messages = []
            transmitChatMessage('someId', 'Some message content')
            await delayUntill(() => messages.length == 1)
            expect(messages[0].author).to.equal('someId')
            expect(messages[0].contents).to.equal('Some message content')
        })

        it ('modifyLocalUserName(name)', async function () {
            modifyLocalUserName ('Jane Doe')
            await delayUntill(() => getLocalUser().nickname != 'John Doe')
            expect(getLocalUser().nickname).to.equal('Jane Doe')
        })
    })

})

async function delay (ms) {
    await new Promise(resolve => setTimeout(resolve, ms))
}

async function delayUntill (predicate) {
    while(!predicate()) {
        await delay(100)
    }
}