import { styled } from "styled-components";

const Container = styled.div`
    background-color: var(--error);
    border-radius: 8px;
    padding: 8px;
    overflow: wrap;
`;

export default function ErrorMessage({ message }: { message: string }) {
    return <Container>{message}</Container>;
}
