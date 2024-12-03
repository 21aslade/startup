import { Request, Response as ExpressResponse } from "express";
import { DataAccess } from "./database.js";

type ErrorResponse = {
    error: string;
};

export type Cookie = {
    key: string;
    value: string | undefined;
    expires?: Date;
};

export type HandlerResponse<U> = {
    body?: U;
    cookie?: Cookie;
};

type Guard<T> = (o: unknown) => o is T;
type Handler<P, T, U> = (
    data: DataAccess,
    body: T,
    params: P
) => Promise<HandlerResponse<U>>;

export async function routeHandler<P, T, U, Q, L>(
    data: DataAccess,
    req: Request<P, U, any, Q, L>,
    res: ExpressResponse<U | ErrorResponse, L>,
    handler: Handler<P, T, U>,
    isBody: Guard<T>
): Promise<void> {
    try {
        const body = req.body;
        if (!isBody(body)) {
            res.status(400).end();
            return;
        }

        const { body: response, cookie } = await handler(
            data,
            req.body,
            req.params
        );

        if (cookie !== undefined) {
            setCookie(res, cookie);
        }

        if (response !== undefined) {
            res.status(200).end(JSON.stringify(response));
        } else {
            res.status(204).end();
        }
    } catch (e: unknown) {
        if (e instanceof RouteException) {
            res.status(e.status).end(JSON.stringify({ error: e.message }));
        } else {
            throw e;
        }
    }
}

function setCookie(res: ExpressResponse<unknown, unknown>, cookie: Cookie) {
    if (cookie.value !== undefined) {
        res.cookie(cookie.key, cookie.value, {
            secure: true,
            httpOnly: true,
            sameSite: "strict",
            ...(cookie.expires ? { expires: cookie.expires } : {}),
        });
    } else {
        res.clearCookie(cookie.key);
    }
}

export class RouteException extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
