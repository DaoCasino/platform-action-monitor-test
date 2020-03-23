import { OPEN_STATE, createConnection, randomString } from './utils'
import { ResponseMessage, Method, Event } from './interfaces'
import WebSocket from 'ws'

const subscribe = (topic: string, offset: string) => {
    const id = randomString()
    return JSON.stringify({
        method: Method.SUBSCRIBE,
        params: { topic, offset },
        id
    })
}

const parseEventMessage = (res: ResponseMessage) => {
    if (res.id !== null || !('events' in res.result)) {
        return
    }

    res.result.events.map((event: Event) => {
        console.log(event.offset)
    })
}

(async () => {
    const client: WebSocket = await createConnection()
    client.on('message', (message: string) => {
        const res = JSON.parse(message.toString()) as ResponseMessage
        console.log(res)
        parseEventMessage(res)
    })


    client.send(subscribe("event_0",  "0"))
})()
