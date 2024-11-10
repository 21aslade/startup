import { styled } from "styled-components";
import { useDoc } from "./DocsViewer.jsx";

const Container = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-row-gap: 1em;
`;

const DocsItem = styled.span<{ $active: boolean }>`
    font-size: 1em;
    ${({ $active }) => ($active ? "font-weight: bold" : "")};
    cursor: pointer;
`;

export type DocsListProps = {
    items: [string, string][];
};

export default function DocsList({ items }: DocsListProps) {
    const [doc, setDoc] = useDoc();

    return (
        <Container>
            {items.map(([key, label]) => (
                <DocsItem
                    key={key}
                    $active={doc === key}
                    onClick={() => setDoc(key)}
                >
                    {label}
                </DocsItem>
            ))}
        </Container>
    );
}
