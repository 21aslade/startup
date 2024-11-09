import { useState } from "react";
import { PrimaryButton } from "../components/Button.jsx";
import { styled } from "styled-components";

const Layout = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
`;

const Logo = styled.img`
    padding: auto;
    width: 100%;
    max-width: 800px;
`;

const Promotion = styled.div`
    padding: 0 24px;
    border-top: 1px solid var(--border);
`;

const PromotionB = styled(Promotion)`
    display: flex;
    flex-direction: column;
    align-items: end;
`;

const LoginWrapper = styled.section`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 8px;
`;

const LoginInput = styled.input`
    display: block;
    margin: 12px 0;
    color: var(--text);
    background-color: var(--bg-code);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 1.1rem;
`;

type LoginProps = {
    onSubmit: (s: string) => void;
};
function Login({ onSubmit }: LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <LoginWrapper>
            <LoginInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                autoComplete="username"
                aria-label="username"
                placeholder="Username"
            />
            <LoginInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                aria-label="password"
                placeholder="Password"
            />
            <div>
                <PrimaryButton
                    onClick={() => {
                        if (username.length > 0 && password.length > 0) {
                            onSubmit(username);
                        }
                    }}
                >
                    Login
                </PrimaryButton>
            </div>
        </LoginWrapper>
    );
}

export type HomeProps = {
    onLogin: (s: string) => void;
};

export default function Home({ onLogin }: HomeProps) {
    return (
        <Layout>
            <section>
                <Logo src="logo.png" alt="LineBreak logo" />
                <Promotion>
                    <h2>
                        Put the <code>conflict</code> in{" "}
                        <code>merge conflict</code>
                    </h2>
                    <p>
                        In LineBreak, your opponent modifies the same code as
                        you - at the same time. You each get to insert one
                        instruction per turn.
                    </p>
                </Promotion>
                <PromotionB>
                    <h2>A true race condition</h2>
                    <p>
                        Work to outwit your opponent and meet your objective
                        before they can meet theirs. Whoever is first wins!
                    </p>
                </PromotionB>
            </section>
            <section>
                <Login onSubmit={onLogin} />
            </section>
        </Layout>
    );
}
