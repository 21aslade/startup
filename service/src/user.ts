export type UserCredentials = {
    username: string;
    password: string;
};

export type User = Profile & { passwordHash: string };

export type Profile = {
    username: string;
    statistics: Statistics;
    friends: string[];
};

export type Statistics = {
    wins: number;
    plays: number;
};

export type Session = {
    username: string;
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
        typeof (obj as User).username === "string" &&
        typeof (obj as User).passwordHash === "string" &&
        isStatistics((obj as User).statistics)
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

export function isSession(obj: unknown): obj is Session {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof (obj as Session).username === "string"
    );
}

export function isProfile(obj: unknown): obj is Profile {
    return (
        typeof obj === "object" &&
        typeof (obj as Profile)?.username === "string" &&
        isStatistics((obj as Profile).statistics)
    );
}
