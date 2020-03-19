import { OPEN_STATE, createConnection, randomString } from './utils'
import { ResponseMessage, Method } from './interfaces'
import WebSocket from 'ws'

const subscribe = (topic: string, offset: number) => {
    const id = randomString()
    return JSON.stringify({
        method: Method.SUBSCRIBE,
        params: { topic, offset },
        id
    })
}

(async () => {
    const client: WebSocket = await createConnection()
    client.on('message', (message: string) => {
        const res = JSON.parse(message.toString()) as ResponseMessage
        console.log(res)
    })


    client.send(subscribe("event_0",  0))
})()
