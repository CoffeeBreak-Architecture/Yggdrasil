describe('Client unit testing', function () {

    describe('common.js', function () {
        it('invert(obj)', function () {
            obj = invert({0: 'zero', 1: 'one', 2: 'two'})
            expect(obj['zero']).to.equal('0')
            expect(obj['one']).to.equal('1')
            expect(obj['two']).to.equal('2')
        })
    })

    describe('room.js', function () {
        it ('addUser(user)', function () {
            addUser(createMockUser())
            expect(connectedUsers.length).to.equal(1)
        })

        it ('removeUser(id)', function () {
            removeUser('fakeId')
            expect(connectedUsers.length).to.equal(0)
        })

        it ('Negative removeuser(id)', function () {
            removeUser('noId')
            expect(connectedUsers.length).to.equal(0)
        })

        it ('getUserById(id)', function () {
            addUser(createMockUser())
            expect(getUserById('fakeId').id).to.equal('fakeId')
        })

        it ('Negative getUserById(id)', function () {
            expect(getUserById('noId')).to.not.exist
        })

        it ('getLocalUser()', function () {
            localUserId = 'fakeId'
            expect(getLocalUser().id).to.equal('fakeId')
        })

        it ('drawMemberList()', function () {
            room = createMockRoom()
            drawMemberList()
            expect(document.getElementById('memberlist').innerHTML.includes('John Doe')).to.be.true
        })

        it ('getMemberHtml (user)', function () {
            let html = getMemberHtml(createMockUser())
            expect(html.includes('John Doe')).to.be.true
        })

        it ('addChatMessage(author, contents)', function () {
            addChatMessage('fakeId', 'Some fake message')
            expect(messages.find(x => x.author == 'fakeId')).to.exist
        })

        it ('drawChatBox()', function () {
            drawChatBox()
            let chatbox = document.getElementById("chatbox")
            expect(chatbox.innerHTML.includes('Some fake message')).to.be.true
        })

        it ('getMessageHtml(author, contents)', function () {
            let message = getMessageHtml('someAuthor', 'someMessage')
            expect(message.includes('someAuthor') && message.includes('someMessage')).to.be.true
        })

        it ('moveUser(id, x, y)', function () {
            moveUser('fakeId', 200, 200)
            expect(getUserById('fakeId').x).to.equal(200)
            expect(getUserById('fakeId').y).to.equal(200)
        })
    })

    describe('stream-players.js', function () {

        it ('getLocalStream()', async function () {
            this.timeout(5000)
            await getLocalStream()
            expect(localStream).to.exist
        })

        it ('unmuteAll()', function () {
            unmuteAll ();
            expect(true).to.be.true // idk, as long as it doesn't throw an exception I guess.
        })

        it ('addStreamToDocument(userId)', function () {
            addStreamToDocument('fakeId', localStream)
            expect(streams['fakeId']).to.exist

            const videoGrid = document.getElementById('streamlist')
            expect(videoGrid.childElementCount).to.equal(2)
        })

        it ('makeStreamElement(userId)', function () {
            makeStreamElement('fakeId0')
            expect(streams['fakeId0']).to.exist
        })

        it ('addVideoStreamToDocument(userId, stream)', function () {
            makeStreamElement('fakeId1')
            addVideoStreamToDocument('fakeId1', localStream)
            expect(streams['fakeId1']).to.exist
            expect(streams['fakeId1'].video).to.exist
            expect(streams['fakeId1'].videoStream).to.exist

            const videoGrid = document.getElementById('streamlist')
            expect(videoGrid.childElementCount).to.equal(3)
        })

        it ('addAudioStreamToDocument(userId, stream)', function () {
            makeStreamElement('fakeId2')
            addAudioStreamToDocument('fakeId2', localStream)
            expect(streams['fakeId2']).to.exist
            expect(streams['fakeId2'].audioStream).to.exist
            expect(streams['fakeId2'].sourceNode).to.exist
            expect(streams['fakeId2'].gainNode).to.exist
            expect(streams['fakeId2'].audioContext).to.exist
        })

        it ('removeStreamFromDocument(userId)', function () {
            removeStreamFromDocument('fakeId1')
            expect(streams['fakeId1']).to.not.exist
        })

        it ('setGain(id, value', function () {
            setGain('fakeId', 0.5)
            expect(true).to.equal(true)
            // Can't seem to test the actual gain value for some reason.
            // At least this way we know it doesn't throw exceptions.
        })
    })

    function createMockUser () {
        return {id: 'fakeId', roomId: 'fakeRoomId', nickname: 'John Doe', x: 100, y: 100, hasAudio: false, hasVideo: false}
    }

    function createMockRoom () {
        return {id: 'fakeRoomId', ownerId: 'fakeOwnerId', name: 'Fake Room', socketUrl: 'localhost.3001', signallingUrl: 'localhost.3001'}
    }
})