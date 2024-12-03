import { DataAccess } from "./database.js";
import { RouteException } from "./handler.js";
import { AuthToken, Profile, Session, User, UserCredentials } from "./user.js";
import { v4 as uuid } from "uuid";
import * as bcrypt from "bcrypt";

// auth tokens last for one week
const tokenDuration = 7 * 24 * 60 * 60 * 1000;

export async function createUser(
    data: DataAccess,
    body: UserCredentials
): Promise<Session> {
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
    { token }: AuthToken,
    params: { user: string }
): Promise<void> {
    const { username } = await requireUserAuth(data, params.user, token);

    if ((await data.getUser(username)) === undefined) {
        throw new RouteException(404, "User does not exist");
    }

    await data.deleteUser(username);
}

export async function getProfile(
    data: DataAccess,
    params: { user: string }
): Promise<Profile> {
    const username = params.user;
    const user = await data.getUser(username);
    if (user === undefined) {
        throw new RouteException(404, "User not found");
    }
    const { passwordHash: _, ...profile } = user;

    return profile;
}

export async function login(
    data: DataAccess,
    body: UserCredentials
): Promise<Session> {
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
    { token }: AuthToken
): Promise<void> {
    await requireAuth(data, token);
    await data.deleteSession(token);
}

export async function friendRequest(
    data: DataAccess,
    { token }: AuthToken,
    params: { user: string; other: string }
): Promise<void> {
    await requireUserAuth(data, params.user, token);

    const user = await data.getUser(params.user);

    if (!user.friends.includes(params.other)) {
        user.friends.push(params.other);
    }

    await data.putUser(user);
}

export async function unfriend(
    data: DataAccess,
    { token }: AuthToken,
    params: { user: string; other: string }
): Promise<void> {
    await requireUserAuth(data, params.user, token);

    const user = await data.getUser(params.user);

    const userIndex = user.friends.indexOf(params.other);
    if (userIndex >= 0) {
        user.friends.splice(userIndex, 1);
    }

    await data.putUser(user);
}

async function createSession(
    data: DataAccess,
    username: string
): Promise<Session> {
    const now = Date.now();

    const session: Session = {
        token: uuid(),
        expireAt: now + tokenDuration,
        username,
    };

    await data.createSession(session);

    return session;
}

async function requireAuth(data: DataAccess, token: string): Promise<Session> {
    const session = await data.getSession(token);
    const now = Date.now();
    if (session === undefined || session.expireAt < now) {
        throw new RouteException(401, "Unauthorized");
    }

    return session;
}

async function requireUserAuth(
    data: DataAccess,
    user: string,
    token: string
): Promise<Session> {
    const session = await requireAuth(data, token);
    if (user !== session.username) {
        throw new RouteException(401, "Unauthorized");
    }

    return session;
}
