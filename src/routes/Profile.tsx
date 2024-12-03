import { friendRequest, getProfile, ServerError } from "../endpoints.js";
import Friend from "../components/Friend.jsx";
import type { Profile, Statistics } from "linebreak-service";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import NotFound from "./NotFound.jsx";
import { useSession } from "../session.jsx";
import { PrimaryButton } from "../components/Button.jsx";

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
    align-items: end;
`;

const FriendCode = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid var(--border);
    padding: 0 24px 24px 24px;
    margin-bottom: 16px;
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
    const session = useSession();
    const username = useParams()["username"];
    const [myProfile, setMyProfile] = useState<Profile | undefined>(undefined);
    const [profile, setProfile] = useState<Profile | null | undefined>(
        undefined
    );

    useEffect(() => {
        if (username === undefined) {
            navigate("/");
            return;
        }
        getProfile(username)
            .then(setProfile)
            .catch((e: unknown) => {
                if (e instanceof ServerError && e.status === 404) {
                    setProfile(null);
                } else {
                    throw e;
                }
            });
        if (session !== undefined) {
            getProfile(session.username).then(setMyProfile);
        }
    }, [username, session]);

    const follow = async () => {
        if (session === undefined || username == undefined) {
            return;
        }
        await friendRequest(session.auth, session.username, username);

        setMyProfile(await getProfile(session.username));
    };

    if (profile === null) {
        return <NotFound />;
    }

    const friends = profile?.friends ?? [];
    const statistics = profile?.statistics;

    const canFollow =
        username !== undefined &&
        myProfile !== undefined &&
        myProfile.username !== username &&
        !myProfile.friends.includes(username);

    return (
        <Wrapper>
            <h1>{username}'s profile</h1>
            <ProfileWrapper>
                {statistics !== undefined && (
                    <Statistics statistics={statistics} />
                )}
                <FriendsWrapper>
                    {username && <Permalink username={username} />}
                    {canFollow && (
                        <PrimaryButton onClick={follow}>Follow</PrimaryButton>
                    )}
                    {friends.length > 0 && (
                        <FriendList>
                            <h3>Following</h3>
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
