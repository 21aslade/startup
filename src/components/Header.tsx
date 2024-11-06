import { styled } from "styled-components";
import { NavButton } from "./Button.jsx";
import { NavLink } from "react-router-dom";
const Container = styled.header`
    background-color: var(--bg-zero-s);
    border-bottom: 1px solid var(--border);

    flex: 0 40px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    width: 100%;
    box-sizing: border-box;
`;

const MainNav = styled.nav`
    margin: 8px 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

export default function Header() {
    return (
        <Container>
            <NavLink to="/">
                <img src="/logo.png" width="100px"></img>
            </NavLink>
            <MainNav>
                <NavButton to="/profile">Profile</NavButton>
                <NavButton to="/play">Play</NavButton>
            </MainNav>
        </Container>
    );
}
