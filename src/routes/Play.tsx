import { PrimaryButton } from "../components/Button.jsx";
import { styled } from "styled-components";
import { GameData, isGameData } from "linebreak-shared/game";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { WsConnection, WsError } from "../ws.js";
import { Result } from "wombo/result";

export default function Play() {
    const ws = useRef<WsConnection>();

    return <Lobby ws={ws} />;
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
    flex-direction: column;
    border: 1px solid var(--border);
    background-color: var(--bg-zero-s);
    border-radius: 4px;
    padding: 16px;
`;

type LobbyProps = {
    ws: MutableRefObject<WsConnection | undefined>;
};

function Lobby({ ws }: LobbyProps) {
    const [games, setGames] = useState<GameData[]>([]);

    useEffect(() => {
        if (ws.current === undefined) {
            ws.current = new WsConnection();
        }

        ws.current.handler = (r: Result<unknown, WsError>) => {
            if (r.isErr()) {
                return;
            }

            const { games } = r.value as { games: unknown };

            if (Array.isArray(games) && games.every(isGameData)) {
                setGames(games);
            }
        };

        return () => {
            ws.current?.close();
            ws.current?.setHandler(undefined);
            ws.current = undefined;
        };
    }, []);

    const createGame = async () => {
        if (!ws.current) {
            return;
        }

        ws.current.sendMessage({ goal: "random" });
    };

    return (
        <Centered>
            <UiLayer>
                {games.map((game) => (
                    <GameListing game={game} key={game.gameId} />
                ))}
                <h1>Create Game</h1>
                <PrimaryButton onClick={createGame}>Create Game</PrimaryButton>
            </UiLayer>
        </Centered>
    );
}

function GameListing({ game }: { game: GameData }) {
    return (
        <div>
            <h3>{game.opponent}</h3>
            <p>{game.goal}</p>
        </div>
    );
}
