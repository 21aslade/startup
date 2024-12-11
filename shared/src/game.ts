export type GameData = {
    gameId: string;
    opponent?: string;
    goal: string;
};

export type CreateGameRequest = {
    goal: string;
};

export function isGameData(d: unknown): d is GameData {
    return (
        typeof d === "object" &&
        d !== null &&
        ((d as GameData).opponent === undefined ||
            typeof (d as GameData).opponent === "string") &&
        typeof (d as GameData).goal === "string" &&
        typeof (d as GameData).gameId === "string"
    );
}

export function isCreateGameRequest(r: unknown): r is CreateGameRequest {
    return (
        typeof r === "object" &&
        r !== null &&
        typeof (r as CreateGameRequest).goal === "string"
    );
}
