import { PropsWithChildren } from "react";
import { styled } from "styled-components";
import { GhostButton } from "./Button.jsx";

const Backdrop = styled.div`
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
`;

const PopUpContainer = styled.div`
    border: 1px solid var(--border);
    background-color: var(--bg-zero-s);
    padding: 8px;
`;

const PopUpHeader = styled.div`
    border-bottom: 1px solid var(--border);
    padding-bottom: 8px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const PopUpTitle = styled.h1`
    margin: 0;
`;

const CloseButton = styled(GhostButton)`
    font-size: 32px;
    padding-top: 0;
    padding-bottom: 3px;
`;

export type PopUpProps = PropsWithChildren<{
    title?: string;
    onClose?: () => void;
}>;
export default function PopUp({
    onClose = () => {},
    title,
    children,
}: PopUpProps) {
    return (
        <Backdrop>
            <PopUpContainer>
                <PopUpHeader>
                    {title !== undefined && <PopUpTitle>{title}</PopUpTitle>}
                    <CloseButton onClick={onClose}>×</CloseButton>
                </PopUpHeader>
                {children}
            </PopUpContainer>
        </Backdrop>
    );
}
