import {
    isProfile,
    isSession,
    Profile,
    Session,
    UserCredentials,
} from "linebreak-shared/user";

export async function createUser(
    credentials: UserCredentials
): Promise<Session> {
    const result = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: { "content-type": "application/json" },
    });

    return handleResponse(result, isSession);
}

export async function deleteUser(user: string): Promise<void> {
    const uriUser = encodeURIComponent(user);
    const result = await fetch(`/api/user/${uriUser}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
    });

    if (!result.ok) {
        const body: unknown = await result.text();
        throw new Error(`Request failed: code ${result.status} body ${body}`);
    }
}

export async function getProfile(user: string): Promise<Profile> {
    const uriUser = encodeURIComponent(user);
    const result = await fetch(`/api/user/${uriUser}`);

    return handleResponse(result, isProfile);
}

export async function friendRequest(
    user: string,
    other: string
): Promise<void> {
    const uriUser = encodeURIComponent(user);
    const uriOther = encodeURIComponent(other);
    const result = await fetch(`/api/user/${uriUser}/friend/${uriOther}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
    });

    if (!result.ok) {
        const body: unknown = await result.text();
        throw new Error(`Request failed: code ${result.status} body ${body}`);
    }
}

export async function unfriend(user: string, other: string): Promise<void> {
    const uriUser = encodeURIComponent(user);
    const uriOther = encodeURIComponent(other);
    const result = await fetch(`/api/user/${uriUser}/friend/${uriOther}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
    });

    if (!result.ok) {
        const body: unknown = await result.text();
        throw new Error(`Request failed: code ${result.status} body ${body}`);
    }
}

export async function getSession(): Promise<Session> {
    const result = await fetch("/api/session");
    return handleResponse(result, isSession);
}

export async function login(credentials: UserCredentials): Promise<Session> {
    const result = await fetch("/api/session", {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: { "content-type": "application/json" },
    });

    return handleResponse(result, isSession);
}

export async function logout(): Promise<void> {
    const result = await fetch("/api/session", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
    });

    if (!result.ok) {
        const body: unknown = await result.text();
        throw new Error(`Request failed: code ${result.status} body ${body}`);
    }
}

export class ServerError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function handleResponse<T>(
    res: Response,
    guard: (o: unknown) => o is T
): Promise<T> {
    try {
        const body = await res.json();
        if (res.ok && guard(body)) {
            return body;
        } else {
            const bodyText = JSON.stringify(body, null, 2);
            throw new ServerError(
                res.status,
                `Request failed: code ${res.status} body ${bodyText}`
            );
        }
    } catch (e) {
        throw new ServerError(res.status, `Request failed: code ${res.status}`);
    }
}
