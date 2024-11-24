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
        username: body.username,
        password: body.password,
        statistics: { wins: 0, plays: 0 },
        friends: [],
    };
    users.set(body.username, user);

    return createSession(body.username);
}

export function deleteUser(
    { token }: AuthToken,
    params: { user: string }
): void {
    const { username } = requireUserAuth(params.user, token);

    if (!users.has(username)) {
        throw new RouteException(404, "User does not exist");
    }

    users.delete(username);
    auth = new Map(
        auth.entries().filter(([_, session]) => session.username !== username)
    );
}

export function getProfile(params: { user: string }): Profile {
    const username = params.user;
    const user = users.get(username);
    if (user === undefined) {
        throw new RouteException(404, "User not found");
    }
    const { password: _, ...profile } = users.get(username);

    return profile;
}

export function login(body: UserCredentials): AuthToken {
    const user = users.get(body.username);
    if (user === undefined || body.password !== user.password) {
        throw new RouteException(401, "Incorrect username or password");
    }

    return createSession(body.username);
}

export function logout({ token }: AuthToken): void {
    requireAuth(token);
    auth.delete(token);
}

export function friendRequest(
    { token }: AuthToken,
    params: { user: string; other: string }
): void {
    requireUserAuth(params.user, token);

    const user = users.get(params.user);

    if (!user.friends.includes(params.other)) {
        user.friends.push(params.other);
    }
}

export function unfriend(
    { token }: AuthToken,
    params: { user: string; other: string }
): void {
    requireUserAuth(params.user, token);

    const user = users.get(params.user);

    const userIndex = user.friends.indexOf(params.other);
    if (userIndex >= 0) {
        user.friends.splice(userIndex, 1);
    }
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

function requireUserAuth(user: string, token: string): Session {
    const session = requireAuth(token);
    if (user !== session.username) {
        throw new RouteException(401, "Unauthorized");
    }

    return session;
}
