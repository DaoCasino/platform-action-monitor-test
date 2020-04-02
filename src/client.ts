import { OPEN_STATE, createConnection, randomString } from './utils'
import { ResponseMessage, Method, Event } from './interfaces'
import WebSocket from 'ws'

const clientId = process.env.CLIENT_ID || 0
const serverEndpoint = process.env.SERVER_ENDPOINT || undefined

const subscribe = (topic: string, offset: number) => {
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
        console.log(clientId, event.offset)
    })
}

(async () => {
    const client: WebSocket = await createConnection(serverEndpoint)
    console.log('client connected', clientId)
    client.on('message', (message: string) => {
        const res = JSON.parse(message.toString()) as ResponseMessage
        parseEventMessage(res)
    })

    client.send(subscribe("event_0",  0))
    console.log('client send subscribe', clientId)
})()
