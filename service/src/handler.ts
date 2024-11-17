import { Request, Response as ExpressResponse, RequestHandler } from "express";

type Guard<T> = (o: unknown) => o is T;

export function routeHandler<P, T, U, Q, L>(
    handler: RequestHandler<P, U, T, Q, L>,
    isBody: Guard<T>
): RequestHandler<P, U, T, Q, L> {
    return async (req, res, next) => {
        try {
            const body = req.body;
            if (!isBody(body)) {
                res.status(400).end();
                return;
            }
            await handler(req, res, next);
        } catch (e: unknown) {
            if (e instanceof RouteException) {
                res.status(e.status).end({ error: e.message });
            } else {
                throw e;
            }
        }
    };
}

export class RouteException extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
