import { styled } from "styled-components";
import { NavLink } from "react-router-dom";

const buttonBaseStyles = `
    display: inline-block;
    color: var(--text);
    padding: 8px;
    margin: 4px;
    border: none;
    border-radius: 4px;
    font-size: 1.2rem;
    text-decoration: none;

    &:visited {
        color: var(--text);
    }

    &:active {
        color: var(--text);
    }
`;

const ButtonBase = styled.button`
    ${buttonBaseStyles}
`;

export const NavButton = styled(NavLink)`
    ${buttonBaseStyles};
    &:hover {
        background-color: var(--ghost-hover);
    }

    &:active,
    &.active {
        background-color: var(--ghost-click);
    }
`;

export const GhostButton = styled(ButtonBase)`
    background-color: transparent;

    &:hover {
        background-color: var(--ghost-hover);
    }

    &:active {
        background-color: var(--ghost-click);
    }
`;

export const PrimaryButton = styled(ButtonBase)`
    background-color: var(--button-primary-bg);
    &:hover {
        background-color: var(--primary-hover);
    }

    &:active {
        background-color: var(--primary-click);
    }
`;

export const SecondaryButton = styled(ButtonBase)`
    padding: 6px;
    border: 2px solid var(--button-primary-bg);

    &:hover {
        background-color: var(--primary-hover);
        border: 2px solid var(--primary-hover);
    }

    &:active {
        background-color: var(--primary-click);
        border: 2px solid var(--primary-click);
    }
`;
