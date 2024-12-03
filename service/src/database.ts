import { MongoClient } from "mongodb";
import { Session, User } from "./user.js";

export type DBConfig = {
    hostname: string;
    username: string;
    password: string;
};

export interface DataAccess {
    getUser(username: string): Promise<User>;
    putUser(user: User): Promise<void>;
    deleteUser(username: string): Promise<void>;

    getAuth(authToken: string): Promise<Session>;
    putAuth(authToken: string, session: Session): Promise<void>;
    deleteAuth(authToken: string): Promise<void>;
}

export function initializeDBClient(config: DBConfig): DataAccess {
    throw new Error("todo");
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
