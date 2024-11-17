export type UserCredentials = {
    username: string;
    password: string;
};

export type User = {
    credentials: UserCredentials;
    statistics: Statistics;
    friendRequests: string[];
    friends: string[];
};

export type Statistics = {
    wins: number;
    plays: number;
};

export type Session = {
    expiresAt: number;
    username: string;
};

export type AuthToken = {
    token: string;
};

export function isUserCredentials(obj: unknown): obj is UserCredentials {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof (obj as UserCredentials).username === "string" &&
        typeof (obj as UserCredentials).password === "string"
    );
}

export function isUser(obj: unknown): obj is User {
    return (
        typeof obj === "object" &&
        obj !== null &&
        isUserCredentials((obj as User).credentials) &&
        isStatistics((obj as User).statistics) &&
        Array.isArray((obj as User).friendRequests) &&
        (obj as User).friendRequests.every((s) => typeof s === "string") &&
        Array.isArray((obj as User).friends) &&
        (obj as User).friends.every((s) => typeof s === "string")
    );
}

export function isStatistics(obj: unknown): obj is Statistics {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof (obj as Statistics).plays === "number" &&
        typeof (obj as Statistics).wins === "number"
    );
}

export function isAuthToken(obj: unknown): obj is AuthToken {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof (obj as AuthToken).token === "string"
    );
}
