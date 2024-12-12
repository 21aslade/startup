import { GameData } from "linebreak-shared/game";
import { styled } from "styled-components";

const GameListingWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    max-width: 100px;
    text-overflow: ellipsis;
    & > h3 {
        margin: 0px;
        margin: 0px;
    }

    & > p {
        margin: 0px;
    }

    &:hover {
        background-color: var(--ghost-hover);
    }

    padding: 4px;
`;

export type GameListingProps = {
    game: GameData;
    onClick: () => void;
};
export default function GameListing({ game, onClick }: GameListingProps) {
    return (
        <GameListingWrapper onClick={onClick}>
            <h3>{game.opponent}</h3>
            <p>{game.goal}</p>
        </GameListingWrapper>
    );
}
