interface ReponseErrorMessage {
    code: number
    message: string
}

export interface ResponseMessage {
    result?: any
    error?: ReponseErrorMessage
    id: string
}

export enum Method {
    SUBSCRIBE = "subscribe",
    UNSUBSCRIBE = "unsubscribe",
    BROADCAST = "broadcast"
}

export interface Event {
	offset: string
	sender: string
	casino_id: string
	game_id: string
    req_id: string
    event_type: number
	data?: any
}
