import { NavLink } from "react-router-dom";
import { styled } from "styled-components";
import { PrimaryButton, SecondaryButton } from "./Button.jsx";

const FriendWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;

    & + .friend {
        border-top: 1px solid var(--border);
    }
`;

const FriendName = styled(NavLink)`
    color: var(--text);
    font-weight: bold;
    text-decoration: none;

    &:visited {
        color: var(--text);
    }

    &:hover {
        text-decoration: underline;
    }
`;

export type FriendProps = {
    username: string;
    onResolveRequest?: (username: string, accept: boolean) => void;
};

export default function Friend({ username, onResolveRequest }: FriendProps) {
    return (
        <FriendWrapper className="friend">
            <FriendName to="/profile">{username}</FriendName>
            {onResolveRequest !== undefined && (
                <div>
                    <PrimaryButton
                        onClick={() => onResolveRequest(username, true)}
                    >
                        Accept
                    </PrimaryButton>
                    <SecondaryButton
                        onClick={() => onResolveRequest(username, false)}
                    >
                        Reject
                    </SecondaryButton>
                </div>
            )}
        </FriendWrapper>
    );
}
