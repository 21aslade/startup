import { styled } from "styled-components";

const Container = styled.footer`
    background-color: var(--bg-zero-s);
    border-top: 1px solid var(--border);
    flex: 0 40px;

    padding: 0 16px;
    width: 100%;
    box-sizing: border-box;
`;

export default function Footer() {
    return (
        <Container>
            <p>
                LineBreak was created by&nbsp;
                <a href="https://github.com/21aslade">Andrew Slade</a> for BYU's
                CS 260. View the source code on&nbsp;
                <a href="https://github.com/21aslade/startup">GitHub</a>
            </p>
        </Container>
    );
}
