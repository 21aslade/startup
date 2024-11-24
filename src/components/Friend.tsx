import { NavLink } from "react-router-dom";
import { styled } from "styled-components";

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
};

export default function Friend({ username }: FriendProps) {
    const usernameUrl = encodeURIComponent(username);
    return (
        <FriendWrapper className="friend">
            <FriendName to={`/profile/${usernameUrl}`}>{username}</FriendName>
        </FriendWrapper>
    );
}
