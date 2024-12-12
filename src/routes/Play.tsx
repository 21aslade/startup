import { useEffect, useReducer, useRef, useState } from "react";
import { WsConnection, WsError } from "../ws.js";
import Lobby from "../components/Lobby.jsx";
import { GameData, isLobbyResponse } from "linebreak-shared/game";
import { Result } from "wombo/result";
import { styled } from "styled-components";

type PlayState =
    | {
          type: "lobby";
          games: GameData[];
      }
    | { type: "waiting"; game: GameData }
    | { type: "playing"; game: GameData };

type PlayAction = LobbyAction;

export type LobbyAction =
    | { type: "join-game"; game: GameData }
    | { type: "set-games"; games: GameData[] }
    | WaitAction;
export type WaitAction = { type: "start-game"; game: GameData };

function dispatchPlay(prev: PlayState, action: PlayAction): PlayState {
    switch (action.type) {
        case "join-game":
            return { type: "waiting", game: action.game };
        case "start-game":
            return { type: "playing", game: action.game };
        case "set-games":
            if (prev.type === "lobby") {
                return { type: "lobby", games: action.games };
            }
            break;
    }
    return prev;
}

function lobbyHandler(
    dispatch: (action: LobbyAction) => void,
    setError: (e: WsError) => void
) {
    return (r: Result<unknown, WsError>) => {
        if (r.isErr()) {
            setError(r.error);
            return;
        }

        const message = r.value;
        if (!isLobbyResponse(message)) {
            setError({ error: "received invalid response", code: 500 });
            return;
        }

        console.log(message);

        switch (message.type) {
            case "game":
                return dispatch({ type: "join-game", game: message.game });
            case "start":
                return dispatch({ type: "start-game", game: message.game });
            case "game-list":
                return dispatch({ type: "set-games", games: message.games });
        }
    };
}

export default function Play() {
    const ws = useRef<WsConnection>();
    const [error, setError] = useState<WsError | undefined>(undefined);
    const [state, dispatch] = useReducer(dispatchPlay, {
        type: "lobby",
        games: [],
    });

    useEffect(() => {
        if (ws.current === undefined) {
            ws.current = new WsConnection();
        }

        ws.current.handler = lobbyHandler(dispatch, setError);

        return () => {
            ws.current?.close();
            ws.current?.setHandler(undefined);
            ws.current = undefined;
        };
    }, []);

    switch (state.type) {
        case "lobby":
            return <Lobby ws={ws} games={state.games} error={error} />;
        case "waiting":
            return <Waiting goal={state.game.goal} />;
        case "playing":
            return <></>;
    }
}

function Waiting({ goal }: { goal: string }) {
    return (
        <Centered>
            <UiLayer>
                <h1>Waiting to start game...</h1>
                <p>Goal: {goal}</p>
            </UiLayer>
        </Centered>
    );
}

const Centered = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

const UiLayer = styled.section`
    display: flex;
    flex-direction: row;
    height: 60%;
    width: 30%;
    max-height: 300px;
    border: 1px solid var(--border);
    background-color: var(--bg-zero-s);
    border-radius: 4px;
    padding: 16px;
    justify-content: space-between;
`;
