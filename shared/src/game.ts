export type GameData = {
    gameId: string;
    opponent?: string;
    goal: string;
};

export type LobbyMessage =
    | {
          type: "create";
          goal: string;
      }
    | {
          type: "join";
          id: string;
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

export function isLobbyMessage(r: unknown): r is LobbyMessage {
    if (typeof r === "object" || r === null) {
        return false;
    }

    const request = r as LobbyMessage;
    switch (request.type) {
        case "create":
            return typeof request.goal === "string";
        case "join":
            return typeof request.id === "string";
        default:
            return false;
    }
}
