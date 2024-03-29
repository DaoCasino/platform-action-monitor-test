import { expect } from 'chai'
import { OPEN_STATE, createConnection, randomString } from './utils'
import { EventEmitter } from 'events'
import { ResponseMessage, Method } from './interfaces'
import WebSocket from 'ws'

const NUM_CLIENTS = process.env.NUM_CLIENTS || 3

describe('Platform Action Monitor', () => {
    const eventEmitter = new EventEmitter()
    const waitMessage = (id: string): Promise<any> => new Promise((resolve, reject) => {
        eventEmitter.once(`${id}`, ({ result, error }) => {
            if (error) {
                reject(new Error(error.message))
            } else {
                resolve(result)
            }
        })
    })

    describe('Topics', () => {
        const clients:WebSocket[] = []
        const topicName = 'event_0'

        it(`When a ${NUM_CLIENTS} client connects, then a connection is established`, async () => {
            for (let i = 0; i < NUM_CLIENTS; i++) {
                const client = await createConnection()
                expect(client.readyState).to.equal(OPEN_STATE)
                client.on('message', (message) => {
                    const res = JSON.parse(message.toString()) as ResponseMessage
                    eventEmitter.emit(res.id, res)
                })
                clients.push(client)
            }
        })

        it('When subscribe("' + topicName + '"), then topic started and returns true', async () => {
            const results = []
            for (let i = 0; i < clients.length; i++) {
                const client = clients[i]
                const id = randomString()

                client.send(JSON.stringify({
                    method: Method.SUBSCRIBE,
                    params: { topic: topicName, offset: 25 },
                    id
                }))

                const result = await waitMessage(id)
                expect(result).to.be.true
                results.push(result)
            }

            expect(results.length).to.be.equal(NUM_CLIENTS)
        })

        it('When unsubscribe("' + topicName + '") all clints, then returns true', async () => {
            const results = []
            for (let i = 0; i < clients.length; i++) {
                const client = clients[i]
                const id = randomString()

                client.send(JSON.stringify({
                    method: Method.UNSUBSCRIBE,
                    params: { topic: topicName },
                    id
                }))

                const result = await waitMessage(id)
                expect(result).to.be.true
                results.push(result)
            }

            expect(results.length).to.be.equal(NUM_CLIENTS)
        })

        it('When unsubscribe("' + topicName + '") againg, then returns error', async () => {
            const client = clients[0]
            const id = randomString()

            client.send(JSON.stringify({
                method: Method.UNSUBSCRIBE,
                params: { topic: topicName },
                id
            }))

            try {
                await waitMessage(id)
            } catch (error) {
                expect(error.message).to.be.equal('topic '+ topicName +' not exist')
            }
        })

        after(() => {
            clients.forEach(client => {
                // если сетевое соединение открывается, оно должно закрываться
                if (client && 'terminate' in client) {
                    client.terminate()
                }
            })
        })
    })

    /* describe('Messaging', () => {
        const clients:WebSocket[] = []
        const topicName = 'messagingTest'

        before(async () => {
            for (let i = 0; i < NUM_CLIENTS; i++) {
                const client = await createConnection()
                expect(client.readyState).to.equal(OPEN_STATE)

                client.on('message', (message) => {
                    const res = JSON.parse(message.toString()) as ResponseMessage
                    eventEmitter.emit(res.id, res)
                })

                clients.push(client)
            }
        })

        it('When clients subscribe("' + topicName + '"), then topic started and returns true', async () => {
            let num = 0
            for (let i = 0; i < clients.length; i++) {
                const client = clients[i]
                const id = randomString()

                client.send(JSON.stringify({
                        method: Method.SUBSCRIBE,
                        params: { topic: topicName },
                        id,
                }))

                const result = await waitMessage(id)
                expect(result).to.be.true
                num++
            }
            expect(num).to.be.equal(NUM_CLIENTS)
        })

        it('Broadcast message in topic ' + topicName, done => {
            const client = clients[0]
            const id = randomString()
            const message = 'message'
            client.send(JSON.stringify({
                method: Method.BROADCAST,
                params: { topic: roomName, message },
                id,
                roomName
            }))

            let receivedMessages = 0
            const expectedMessages = clients.length - 2

            const listener = (res: ResponseMessage) => {
                expect(res.id).to.be.equal(id)
                expect(res.from).to.be.equal(from)
                expect(res.result).to.be.equal(message)

                receivedMessages++

                if (receivedMessages === expectedMessages) {
                    eventEmitter.off(id + ':' + Method.MESSAGE, listener)
                    done()
                }
            }

            eventEmitter.on(id + ':' + Method.MESSAGE, listener)
        })

        after(() => {
            clients.forEach(client => {
                // если сетевое соединение открывается, оно должно закрываться
                if (client && 'terminate' in client) {
                    client.terminate()
                }
            })
        })
    }) */
})