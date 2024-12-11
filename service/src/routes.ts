import { DataAccess } from "./database.js";
import { HandlerResponse, RouteException } from "./handler.js";
import { Profile, Session, User, UserCredentials } from "linebreak-shared/user";
import { v4 as uuid } from "uuid";
import * as bcrypt from "bcrypt";

// auth tokens last for one week
const tokenDuration = 7 * 24 * 60 * 60 * 1000;
const authCookieKey = "authToken";

export async function createUser(
    data: DataAccess,
    body: UserCredentials
): Promise<HandlerResponse<Session>> {
    if ((await data.getUser(body.username)) !== undefined) {
        throw new RouteException(409, "Username already taken");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user: User = {
        username: body.username,
        passwordHash,
        statistics: { wins: 0, plays: 0 },
        friends: [],
    };
    await data.putUser(user);

    return createSession(data, body.username);
}

export async function deleteUser(
    data: DataAccess,
    cookies: Record<string, string>,
    params: { user: string }
): Promise<HandlerResponse<void>> {
    const { username } = await requireUserAuth(data, params.user, cookies);

    if ((await data.getUser(username)) === undefined) {
        throw new RouteException(404, "User does not exist");
    }

    await data.deleteUser(username);

    return { cookie: { key: authCookieKey, value: undefined } };
}

export async function getProfile(
    data: DataAccess,
    params: { user: string }
): Promise<HandlerResponse<Profile>> {
    const username = params.user;
    const user = await data.getUser(username);
    if (user === undefined) {
        throw new RouteException(404, "User not found");
    }
    const { passwordHash: _, ...profile } = user;

    return { body: profile };
}

export async function login(
    data: DataAccess,
    body: UserCredentials
): Promise<HandlerResponse<Session>> {
    const user = await data.getUser(body.username);
    if (
        user === undefined ||
        !(await bcrypt.compare(body.password, user.passwordHash))
    ) {
        throw new RouteException(401, "Incorrect username or password");
    }

    return createSession(data, body.username);
}

export async function logout(
    data: DataAccess,
    cookies: Record<string, string>
): Promise<HandlerResponse<void>> {
    const token = cookies[authCookieKey];
    if (token === undefined) {
        throw new RouteException(401, "Unauthorized");
    }
    await requireAuth(data, cookies);
    await data.deleteSession(token);
    return { cookie: { key: authCookieKey, value: undefined } };
}

export async function getSession(
    data: DataAccess,
    cookies: Record<string, string>
): Promise<HandlerResponse<Session>> {
    return { body: await requireAuth(data, cookies) };
}

export async function friendRequest(
    data: DataAccess,
    cookies: Record<string, string>,
    params: { user: string; other: string }
): Promise<HandlerResponse<void>> {
    await requireUserAuth(data, params.user, cookies);

    const user = await data.getUser(params.user);
    if (user === undefined) {
        throw new RouteException(404, "User not found");
    }

    if (!user.friends.includes(params.other)) {
        user.friends.push(params.other);
    }

    await data.putUser(user);

    return {};
}

export async function unfriend(
    data: DataAccess,
    cookies: Record<string, string>,
    params: { user: string; other: string }
): Promise<HandlerResponse<void>> {
    await requireUserAuth(data, params.user, cookies);

    const user = await data.getUser(params.user);
    if (user === undefined) {
        throw new RouteException(404, "User not found");
    }

    const other = await data.getUser(params.other);
    if (other === undefined) {
        throw new RouteException(404, "User not found");
    }

    const userIndex = user.friends.indexOf(params.other);
    if (userIndex >= 0) {
        user.friends.splice(userIndex, 1);
    }

    await data.putUser(user);

    return {};
}

async function createSession(
    data: DataAccess,
    username: string
): Promise<HandlerResponse<Session>> {
    const now = Date.now();
    const expireAt = new Date(now + tokenDuration);

    const token = uuid();
    const session: Session = {
        username,
    };

    await data.createSession(token, session, expireAt);

    return {
        body: session,
        cookie: {
            key: authCookieKey,
            value: token,
            expires: expireAt,
        },
    };
}

export async function requireAuth(
    data: DataAccess,
    cookies: Record<string, string | undefined>
): Promise<Session> {
    const token = cookies[authCookieKey];
    if (token === undefined) {
        throw new RouteException(401, "Unauthorized");
    }
    const session = await data.getSession(token);

    if (session === undefined) {
        throw new RouteException(401, "Unauthorized");
    }

    return session;
}

async function requireUserAuth(
    data: DataAccess,
    user: string,
    cookies: Record<string, string>
): Promise<Session> {
    const session = await requireAuth(data, cookies);
    if (user !== session.username) {
        throw new RouteException(403, "Forbidden");
    }

    return session;
}
