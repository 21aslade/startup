import { getProfile } from "../endpoints.js";
import Friend from "../components/Friend.jsx";
import type { Profile, Statistics } from "linebreak-service";
import { useEffect, useState } from "react";
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

function Statistics({ statistics }: { statistics: Statistics }) {
    const winPercentage =
        statistics.plays > 0
            ? Math.floor((statistics.wins / statistics.plays) * 100)
            : 0;
    const losses = statistics.plays - statistics.wins;

    return (
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
    );
}

export default function Profile({ username }: ProfileProps) {
    const [profile, setProfile] = useState<Profile | undefined>(undefined);

    useEffect(() => {
        getProfile(username).then(setProfile);
    }, [username]);

    const friends = profile?.friends ?? [];

    const [friendRequests, setFriendRequests] = useState<string[]>([
        "Ralph Jung",
        "jonhoo",
    ]);

    const statistics = profile?.statistics;

    const onResolveRequest = (username: string, accept: boolean) => {
        const newFriendRequests = friendRequests.filter((f) => f !== username);
        setFriendRequests(newFriendRequests);
    };

    return (
        <Wrapper>
            <h1>{username}'s profile</h1>
            <ProfileWrapper>
                {statistics !== undefined && (
                    <Statistics statistics={statistics} />
                )}
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
                                    key={username}
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
                                <Friend key={username} username={username} />
                            ))}
                        </FriendList>
                    )}
                </FriendsWrapper>
            </ProfileWrapper>
        </Wrapper>
    );
}
