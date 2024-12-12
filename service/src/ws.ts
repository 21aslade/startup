import { Server } from "http";
import { v4 as uuid } from "uuid";
import { RawData, WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { RouteException } from "./handler.js";
import { requireAuth } from "./routes.js";
import { DataAccess } from "./database.js";
import cookie from "cookie";
import { GameData, LobbyMessage, isLobbyMessage } from "linebreak-shared/game";
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

    const gameData = [...gameList(games.entries())];
    ws.send(JSON.stringify({ type: "game-list", games: gameData }));
}

function handleLobbyMessage(
    data: RawData,
    connection: Connection,
    ws: WebSocket
) {
    const message = JSON.parse(data.toString());
    if (!isLobbyMessage(message)) {
        throw new RouteException(400, "Bad request");
    }

    switch (message.type) {
        case "create":
            return handleCreateGame(message.goal, connection, ws);
        case "join":
            return handleJoinGame(message.id, connection, ws);
    }
}

function handleCreateGame(goal: string, connection: Connection, ws: WebSocket) {
    const chosenGoal = goal === "random" ? "4" : goal;
    const id = uuid();

    connection.state = { state: "game", gameId: id };
    games.set(id, { playerOne: connection, goal });

    notifyGameUpdate(connections.values(), games.entries());

    const game: GameData = {
        goal: chosenGoal,
        gameId: id,
    };
    ws.send(JSON.stringify({ type: "game", game }));
}

function handleJoinGame(gameId: string, connection: Connection, ws: WebSocket) {
    const game = games.get(gameId);
    if (game === undefined) {
        throw new RouteException(404, "Game not found");
    }

    const playerOne = game.playerOne;
    if (playerOne.username === connection.username) {
        throw new RouteException(400, "Cannot join as both players");
    }

    if (game.playerTwo !== undefined) {
        throw new RouteException(403, "Already taken");
    }

    connection.state = { state: "game", gameId };
    game.playerTwo = connection;

    notifyGameUpdate(connections.values(), games.entries());

    const gameData = toGameData(gameId, game);
    const message = JSON.stringify({ type: "start", game: gameData });
    game.playerOne.ws.send(message);
    game.playerTwo.ws.send(message);
}

function notifyGameUpdate(
    connections: Iter<Connection>,
    games: Iter<[string, GameConnections]>
) {
    const lobby = filter(connections, (v) => v.state.state === "lobby");

    const gameData: Iter<GameData> = gameList(games);
    sendAll(lobby, { games: [...gameData] });
}

function toGameData(id: string, game: GameConnections) {
    return {
        gameId: id,
        opponent: game.playerOne.username,
        goal: game.goal,
    };
}

function gameList(games: Iter<[string, GameConnections]>): Iter<GameData> {
    return map(
        filter(games, ([_, g]) => g.playerTwo === undefined),
        ([id, game]) => toGameData(id, game)
    );
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
