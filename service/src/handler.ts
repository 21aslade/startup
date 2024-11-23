import {
    Request,
    Response as ExpressResponse,
    RequestHandler,
    NextFunction,
} from "express";

type ErrorResponse = {
    error: string;
};

type Guard<T> = (o: unknown) => o is T;
type Handler<P, T, U> = (body: T, params: P) => U;

export async function routeHandler<P, T, U, Q, L>(
    req: Request<P, U, any, Q, L>,
    res: ExpressResponse<U | ErrorResponse, L>,
    next: NextFunction,
    handler: Handler<P, T, U>,
    isBody: Guard<T>
): Promise<void> {
    try {
        const body = req.body;
        if (!isBody(body)) {
            res.status(400).end();
            return;
        }

        const response = await handler(req.body, req.params);
        if (response !== undefined) {
            res.status(200).end(response);
        } else {
            res.status(204).end();
        }
    } catch (e: unknown) {
        if (e instanceof RouteException) {
            res.status(e.status).end({ error: e.message });
        } else {
            throw e;
        }
    }
}

export class RouteException extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
