import { Result } from "wombo/result";

export type WsError = {
    error: string;
    code: number;
};

function isWsError(e: unknown): e is WsError {
    return (
        typeof e === "object" &&
        e !== null &&
        typeof (e as WsError).error === "string" &&
        typeof (e as WsError).code === "number"
    );
}

export class WsConnection {
    #ws: WebSocket;
    handler?: (message: Result<unknown, WsError>) => void;

    constructor() {
        let port = window.location.port;
        const protocol = window.location.protocol === "http:" ? "ws" : "wss";
        this.#ws = new WebSocket(
            `${protocol}://${window.location.hostname}:${port}/ws`
        );

        this.#ws.onopen = () => {};
        this.#ws.onclose = () => {};
        this.#ws.onmessage = (msg) => this.onMessage(msg);
    }

    close() {
        this.#ws.close();
    }

    setHandler(handler?: (message: Result<unknown, WsError>) => void) {
        this.handler = handler;
    }

    sendMessage(message: unknown): void {
        this.#ws.send(JSON.stringify(message));
    }

    async onMessage(msg: MessageEvent<any>) {
        try {
            const message: unknown = JSON.parse(msg.data);
            const result: Result<unknown, WsError> = !isWsError(message)
                ? Result.ok(message)
                : Result.err(message);
            if (this.handler !== undefined) {
                this.handler(result);
            }
        } catch (e: unknown) {
            console.error(e);
        }
    }
}
