import Friend from "../components/Friend.jsx";
import { useMemo, useState } from "react";
import { styled } from "styled-components";

const Wrapper = styled.div`
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const ProfileWrapper = styled.section`
    min-width: 500px;
    width: 66%;
    max-width: 1000px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
`;

const StatisticsWrapper = styled.section`
    flex: 1;
    & > h2 {
        margin-top: 0;
    }
`;

const FriendsWrapper = styled.section`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: end;
`;

const FriendList = styled.div`
    width: 100%;
    max-width: 300px;
    display: flex;
    flex-direction: column;
`;

const FriendCode = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid var(--border);
    padding: 0 24px 24px 24px;
    width: fit-content;
`;

export type ProfileProps = {
    username: string;
};

export default function Profile({ username }: ProfileProps) {
    const [friendRequests, setFriendRequests] = useState<string[]>([
        "Ralph Jung",
        "jonhoo",
    ]);

    const [friends, setFriends] = useState<string[]>([
        "Aria Bessinger",
        "oli-obk",
    ]);

    const statistics = useMemo(
        () => ({
            plays: 110,
            wins: 97,
        }),
        []
    );

    const winPercentage = Math.floor(
        (statistics.wins / statistics.plays) * 100
    );
    const losses = statistics.plays - statistics.wins;

    const onResolveRequest = (username: string, accept: boolean) => {
        const newFriendRequests = friendRequests.filter((f) => f !== username);
        setFriendRequests(newFriendRequests);

        if (accept) {
            setFriends([...friends, username]);
        }
    };

    return (
        <Wrapper>
            <h1>{username}'s profile</h1>
            <ProfileWrapper>
                <StatisticsWrapper>
                    <h2>Statistics</h2>
                    <p>
                        <b>Win percentage:</b> {winPercentage}%
                    </p>
                    <p>
                        <b>Games played:</b> {statistics.plays}
                    </p>
                    <p>
                        <b>Games won:</b> {statistics.wins}
                    </p>
                    <p>
                        <b>Games lost:</b> {losses}
                    </p>
                </StatisticsWrapper>
                <FriendsWrapper>
                    <FriendCode>
                        <h3>Friend Code:</h3>
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https%3A%2F%2Fstartup.linebreak.click%2Fplay.html" />
                    </FriendCode>
                    {friendRequests.length > 0 && (
                        <FriendList>
                            <h3>Friend Requests</h3>
                            {friendRequests.map((username) => (
                                <Friend
                                    username={username}
                                    onResolveRequest={onResolveRequest}
                                />
                            ))}
                        </FriendList>
                    )}
                    {friends.length > 0 && (
                        <FriendList>
                            <h3>Friends</h3>
                            {friends.map((username) => (
                                <Friend username={username} />
                            ))}
                        </FriendList>
                    )}
                </FriendsWrapper>
            </ProfileWrapper>
        </Wrapper>
    );
}
