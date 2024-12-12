import { PrimaryButton } from "../components/Button.jsx";
import { styled } from "styled-components";
import { GameData } from "linebreak-shared/game";
import { MutableRefObject } from "react";
import { WsConnection, WsError } from "../ws.js";
import GameListing from "../components/GameListing.jsx";
import ErrorMessage from "./ErrorMessage.jsx";

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

const Divider = styled.div`
    border-left: 1px solid var(--border);
    margin: 16px;
    height: 90%;
    width: 1px;
`;

const Vertical = styled.div`
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
`;

const GameGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-row-gap: 1em;
    grid-column-gap: 1em;
`;

type LobbyProps = {
    ws: MutableRefObject<WsConnection | undefined>;
    games: GameData[];
    error: WsError | undefined;
};

export default function Lobby({ ws, games, error }: LobbyProps) {
    const joinGame = (game: GameData) => {
        ws.current?.sendMessage({ type: "join", id: game.gameId });
    };

    const createGame = () => {
        ws.current?.sendMessage({ type: "create", goal: "random" });
    };

    return (
        <Centered>
            <UiLayer>
                <div>
                    {error !== undefined && (
                        <ErrorMessage message={error.error} />
                    )}
                    <h1>Join Game</h1>
                    <GameGrid>
                        {games.map((game) => (
                            <GameListing
                                game={game}
                                key={game.gameId}
                                onClick={() => joinGame(game)}
                            />
                        ))}
                    </GameGrid>
                </div>

                <Divider />
                <Centered>
                    <Vertical>
                        <h1>Create Game</h1>
                        <PrimaryButton onClick={createGame}>
                            Create Game
                        </PrimaryButton>
                    </Vertical>
                </Centered>
            </UiLayer>
        </Centered>
    );
}
