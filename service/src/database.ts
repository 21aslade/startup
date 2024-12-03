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
};

export interface DataAccess {
    getUser(username: string): Promise<User | undefined>;
    putUser(user: User): Promise<void>;
    deleteUser(username: string): Promise<void>;

    getAuth(authToken: string): Promise<Session | undefined>;
    createAuth(authToken: string, session: Session): Promise<void>;
    deleteAuth(authToken: string): Promise<void>;
}

export function initializeDBClient(config: DBConfig): DataAccess {
    const url = `mongodb+srv://${config.username}:${config.password}@${config.hostname}`;
    const client = new MongoClient(url);
    const db = client.db("linebreak");
    const users = db.collection<User>("users");
    const auth = db.collection<Auth>("auth");

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
            await users.deleteOne({ username });
        },

        async getAuth(token: string) {
            return (await auth.findOne({ token }))?.session;
        },
        async createAuth(token: string, session: Session) {
            await auth.insertOne({ token, session });
        },
        async deleteAuth(token: string) {
            await auth.deleteOne({ token });
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
