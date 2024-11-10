import { PropsWithChildren, useState, JSX } from "react";
import { styled } from "styled-components";

const Container = styled.div`
    margin: 4px;
`;

const ArrowContainer = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
`;

const Arrow = styled.span`
    font-family: monospace;
    font-size: 1.5em;
    font-weight: bold;
    margin: 8px;
    user-select: none;
`;

const ContentContainer = styled.div`
    border-left: 1px solid var(--border);
    padding: 16px;
    margin-left: 6px;
`;

export type CollapsibleProps = PropsWithChildren<{
    title: JSX.Element | string;
    collapse?: boolean;
    defaultCollapse?: boolean;
    handleClick?: () => void;
}>;

export function Collapsible({
    title,
    collapse,
    defaultCollapse = true,
    handleClick,
    children,
}: CollapsibleProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapse);

    if (collapse !== undefined && collapse !== isCollapsed) {
        setIsCollapsed(collapse);
    }

    const contentHidden = collapse ?? isCollapsed;

    const arrow = contentHidden ? "+" : "-";

    const onClick = () => {
        if (collapse === undefined) {
            setIsCollapsed(!isCollapsed);
        }
        if (handleClick !== undefined) {
            handleClick();
        }
    };

    return (
        <Container>
            <ArrowContainer onClick={onClick}>
                <Arrow>{arrow}</Arrow>
                {title}
            </ArrowContainer>
            {!contentHidden && <ContentContainer>{children}</ContentContainer>}
        </Container>
    );
}
