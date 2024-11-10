import { styled } from "styled-components";
import { useSetDoc } from "./DocsViewer.jsx";

const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-row-gap: 1em;
`;

const DocsItem = styled.span`
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
`;

export type DocsListProps = {
    items: [string, string][];
};

export default function DocsList({ items }: DocsListProps) {
    const setDoc = useSetDoc();

    return (
        <Container>
            {items.map(([key, label]) => (
                <DocsItem key={key} onClick={() => setDoc(key)}>
                    {label}
                </DocsItem>
            ))}
        </Container>
    );
}
