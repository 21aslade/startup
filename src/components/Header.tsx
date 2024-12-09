import { styled } from "styled-components";
import { NavButton } from "./Button.jsx";
import { NavLink } from "react-router-dom";

const Bar = styled.header`
    background-color: var(--bg-zero-s);
    border-bottom: 1px solid var(--border);

    flex: 0 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    width: 100%;
    box-sizing: border-box;
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    height: 100%;
`;

const MainNav = styled.nav`
    margin: 8px 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

export default function Header({ username }: { username?: string }) {
    return (
        <Bar>
            <Container>
                <NavLink to="/">
                    <img src="/logo.png" width="100px"></img>
                </NavLink>
                <MainNav>
                    {username !== undefined ? (
                        <>
                            <NavButton to="/profile">Profile</NavButton>
                            <NavButton to="/play">Play</NavButton>
                        </>
                    ) : undefined}
                    <NavButton to="/practice">Practice</NavButton>
                </MainNav>
            </Container>
            {username !== undefined ? (
                <div>
                    <h3>{username}</h3>
                </div>
            ) : undefined}
        </Bar>
    );
}
