import { getProfile } from "../endpoints.js";
import Friend from "../components/Friend.jsx";
import type { Profile, Statistics } from "linebreak-service";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";

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

function Permalink({ username }: { username: string }) {
    const usernameUrl = encodeURIComponent(username);
    const url = `https://startup.linebreak.click/profile/${usernameUrl}`;
    const encodedUrl = encodeURIComponent(url);
    return (
        <FriendCode>
            <h3>Profile Permalink:</h3>
            <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodedUrl}`}
            />
        </FriendCode>
    );
}

export default function Profile() {
    const navigate = useNavigate();
    const username = useParams()["username"];
    const [profile, setProfile] = useState<Profile | undefined>(undefined);

    useEffect(() => {
        if (username === undefined) {
            navigate("/profile");
            return;
        }
        getProfile(username)
            .then(setProfile)
            .catch(() => navigate("/"));
    }, [username]);

    const friends = profile?.friends ?? [];
    const statistics = profile?.statistics;

    return (
        <Wrapper>
            <h1>{username}'s profile</h1>
            <ProfileWrapper>
                {statistics !== undefined && (
                    <Statistics statistics={statistics} />
                )}
                <FriendsWrapper>
                    {username && <Permalink username={username} />}
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
