import { RouteException } from "./handler.js";
import { AuthToken, Profile, Session, User, UserCredentials } from "./user.js";
import { v4 as uuid } from "uuid";

const users: Map<string, User> = new Map();
let auth: Map<string, Session> = new Map();

// auth tokens last for one week
const tokenDuration = 7 * 24 * 60 * 60 * 1000;

export function createUser(body: UserCredentials): AuthToken {
    if (users.get(body.username) !== undefined) {
        throw new RouteException(409, "Username already taken");
    }

    const user: User = {
        credentials: body,
        statistics: { wins: 0, plays: 0 },
        friendRequests: [],
        friends: [],
    };
    users.set(body.username, user);

    return createSession(body.username);
}

export function deleteUser(
    { token }: AuthToken,
    params: { user: string }
): void {
    const { username } = requireAuth(token);

    if (username !== params.user) {
        throw new RouteException(401, "Unauthorized");
    }

    if (!users.has(username)) {
        throw new RouteException(404, "User does not exist");
    }

    users.delete(username);
    auth = new Map(
        auth.entries().filter(([_, session]) => session.username !== username)
    );
}

export function getProfile(_body: void, params: { user: string }): Profile {
    const username = params.user;
    const { statistics } = users.get(username);

    return { username, statistics };
}

export function login(body: UserCredentials): AuthToken {
    const user = users.get(body.username);
    if (body.password !== user.credentials.password) {
        throw new RouteException(401, "Incorrect username or password");
    }

    return createSession(body.username);
}

export function logout({ token }: AuthToken): void {
    requireAuth(token);
    auth.delete(token);
}

function createSession(username: string): AuthToken {
    const now = Date.now();
    const session: Session = {
        expiresAt: now + tokenDuration,
        username,
    };

    const token = uuid();
    auth.set(token, session);

    return { token };
}

function requireAuth(token: string): Session {
    const session = auth.get(token);
    const now = Date.now();
    if (session === undefined || session.expiresAt < now) {
        throw new RouteException(401, "Unauthorized");
    }

    return session;
}
