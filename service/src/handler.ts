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
    cookies: Record<string, string>,
    body: T,
    params: P
) => Promise<HandlerResponse<U>>;

export async function routeHandler<P, T, U, Q>(
    data: DataAccess,
    req: Request<P, U, any, Q, Record<string, any>>,
    res: ExpressResponse<U | ErrorResponse, Record<string, any>>,
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
            req.cookies,
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

function setCookie<T>(
    res: ExpressResponse<T, Record<string, any>>,
    cookie: Cookie
) {
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
