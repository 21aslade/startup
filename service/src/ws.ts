import { Server } from "http";
import { v4 as uuid } from "uuid";
import { RawData, WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { RouteException } from "./handler.js";
import { requireAuth } from "./routes.js";
import { DataAccess } from "./database.js";
import cookie from "cookie";
import {
    GameData,
    CreateGameRequest,
    isCreateGameRequest,
} from "linebreak-shared/game";
import { filter, Iter, map } from "linebreak-shared/util";

type ConnectionState =
    | {
          state: "lobby";
      }
    | { state: "game"; gameId: string };

type Connection = {
    username: string;
    alive: boolean;
    ws: WebSocket;
    state: ConnectionState;
};

type GameConnections = {
    playerOne: Connection;
    playerTwo?: Connection;
    goal: string;
};

const games = new Map<string, GameConnections>();

const connections = new Map<string, Connection>();

export function addWsListener(httpServer: Server, data: DataAccess) {
    const wss = new WebSocketServer({ server: httpServer });

    wss.on("connection", async (ws, req) => {
        try {
            const cookies = cookie.parse(req.headers["cookie"] ?? "");
            const { username } = await requireAuth(data, cookies);
            addConnection(ws, username);
        } catch (e: unknown) {
            if (e instanceof RouteException) {
                console.error("Closed connection!");
                ws.close();
                return;
            } else {
                console.error("Error: ", e);
                throw e;
            }
        }
    });
}

function addConnection(ws: WebSocket, username: string) {
    const id = uuid();
    const connection = {
        alive: true,
        ws,
        username,
        state: { state: "lobby" } as const,
    };

    connections.set(id, connection);

    ws.on("error", console.error);

    ws.on("message", (data) => {
        try {
            if (connection.state.state === "lobby") {
                handleLobbyMessage(data, connection, ws);
            }
        } catch (e: unknown) {
            if (e instanceof RouteException) {
                ws.send(JSON.stringify({ error: e.message, code: e.status }));
            } else {
                console.error("Error: ", e);
                throw e;
            }
        }
    });

    ws.on("close", () => {
        connections.delete(id);
    });

    ws.on("pong", () => {
        connection.alive = true;
    });

    const gameData = [...getGameData()];
    ws.send(JSON.stringify({ games: gameData }));
}

function handleLobbyMessage(
    data: RawData,
    connection: Connection,
    ws: WebSocket
) {
    const message = JSON.parse(data.toString());
    if (!isCreateGameRequest(message)) {
        throw new RouteException(400, "Bad request");
    }

    const goal = message.goal === "random" ? "4" : message.goal;
    const id = uuid();

    connection.state = { state: "game", gameId: id };

    const lobby = filter(
        connections.values(),
        (v) => v.state.state === "lobby"
    );

    const gameData: Iter<GameData> = getGameData();
    sendAll(lobby, { games: [...gameData] });

    games.set(id, { playerOne: connection, goal });

    const game: GameData = {
        goal,
        gameId: id,
    };
    ws.send(JSON.stringify(game));
}

function getGameData(): Iter<GameData> {
    return map(games.entries(), ([id, game]) => ({
        gameId: id,
        opponent: game.playerOne.username,
        goal: game.goal,
    }));
}

setInterval(() => {
    connections.forEach((c, id) => {
        if (!c.alive) {
            console.info(`Deleting connection with ${c.username}`);
            c.ws.terminate();
            connections.delete(id);
        } else {
            c.alive = false;
            c.ws.ping();
        }
    });
}, 10000);

function sendAll(i: Iter<Connection>, data: unknown) {
    for (const { ws } of i) {
        ws.send(JSON.stringify(data));
    }
}
