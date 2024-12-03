import { MongoClient } from "mongodb";
import { Session, User } from "./user.js";

export type DBConfig = {
    hostname: string;
    username: string;
    password: string;
};

type Auth = {
    token: string;
    session: Session;
    expireAtDate: Date;
};

export interface DataAccess {
    getUser(username: string): Promise<User | undefined>;
    putUser(user: User): Promise<void>;
    deleteUser(username: string): Promise<void>;

    getSession(token: string): Promise<Session | undefined>;
    createSession(
        token: string,
        session: Session,
        expireAt: Date
    ): Promise<void>;
    deleteSession(token: string): Promise<void>;
}

export async function initializeDBClient(
    config: DBConfig
): Promise<DataAccess> {
    const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
    const client = new MongoClient(url);
    const db = client.db("linebreak");
    const users = db.collection<User>("users");
    const sessions = db.collection<Auth>("auth");

    await users.createIndex({ username: 1 }, { unique: true });

    await sessions.createIndex({ token: 1 }, { unique: true });
    await sessions.createIndex({ expireAtDate: 1 }, { expireAfterSeconds: 0 });

    return {
        async getUser(username: string) {
            return (await users.findOne({ username })) ?? undefined;
        },
        async putUser(user: User) {
            await users.replaceOne({ username: user.username }, user, {
                upsert: true,
            });
        },
        async deleteUser(username: string) {
            await sessions.deleteMany({ session: { username } });
            await users.deleteOne({ username });
        },

        async getSession(token: string) {
            return (await sessions.findOne({ token })).session;
        },
        async createSession(token: string, session: Session, expireAt: Date) {
            await sessions.insertOne({
                token,
                session,
                expireAtDate: expireAt,
            });
        },
        async deleteSession(token: string) {
            await sessions.deleteOne({ token });
        },
    };
}

export function isDBConfig(c: unknown): c is DBConfig {
    return (
        typeof c === "object" &&
        c !== null &&
        typeof (c as DBConfig).hostname === "string" &&
        typeof (c as DBConfig).username === "string" &&
        typeof (c as DBConfig).password === "string"
    );
}
