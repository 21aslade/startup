import {
    AuthToken,
    isAuthToken,
    isProfile,
    Profile,
    UserCredentials,
} from "linebreak-service";

export async function createUser(
    credentials: UserCredentials
): Promise<AuthToken> {
    const result = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: { "content-type": "application/json" },
    });

    return handleResponse(result, isAuthToken);
}

export async function deleteUser(
    token: AuthToken,
    user: string
): Promise<void> {
    const uriUser = encodeURIComponent(user);
    const result = await fetch(`/api/user/${uriUser}`, {
        method: "DELETE",
        body: JSON.stringify(token),
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
    auth: AuthToken,
    user: string,
    other: string
): Promise<void> {
    const uriUser = encodeURIComponent(user);
    const uriOther = encodeURIComponent(other);
    const result = await fetch(`/api/user/${uriUser}/friend/${uriOther}`, {
        method: "PUT",
        body: JSON.stringify(auth),
        headers: { "content-type": "application/json" },
    });

    if (!result.ok) {
        const body: unknown = await result.text();
        throw new Error(`Request failed: code ${result.status} body ${body}`);
    }
}

export async function unfriend(
    auth: AuthToken,
    user: string,
    other: string
): Promise<void> {
    const uriUser = encodeURIComponent(user);
    const uriOther = encodeURIComponent(other);
    const result = await fetch(`/api/user/${uriUser}/friend/${uriOther}`, {
        method: "DELETE",
        body: JSON.stringify(auth),
        headers: { "content-type": "application/json" },
    });

    if (!result.ok) {
        const body: unknown = await result.text();
        throw new Error(`Request failed: code ${result.status} body ${body}`);
    }
}

export async function login(credentials: UserCredentials): Promise<AuthToken> {
    const result = await fetch("/api/session", {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: { "content-type": "application/json" },
    });

    return handleResponse(result, isAuthToken);
}

export async function logout(token: AuthToken): Promise<void> {
    const result = await fetch("/api/session", {
        method: "DELETE",
        body: JSON.stringify(token),
        headers: { "content-type": "application/json" },
    });

    if (!result.ok) {
        const body: unknown = await result.text();
        throw new Error(`Request failed: code ${result.status} body ${body}`);
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
            throw new Error(
                `Request failed: code ${res.status} body ${bodyText}`
            );
        }
    } catch (e) {
        throw new Error(`Request failed: code ${res.status}`);
    }
}
