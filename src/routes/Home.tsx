import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "../components/Button.jsx";
import { styled } from "styled-components";
import { UserCredentials } from "linebreak-service";

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
    loggedInUsername?: string;
    onSubmit: (c: UserCredentials, register: boolean) => void;
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
                            onSubmit({ username, password }, false);
                        }
                    }}
                >
                    Login
                </PrimaryButton>
                <SecondaryButton
                    onClick={() => {
                        if (username.length > 0 && password.length > 0) {
                            onSubmit({ username, password }, true);
                        }
                    }}
                >
                    Register
                </SecondaryButton>
            </div>
        </LoginWrapper>
    );
}

export type HomeProps = {
    username?: string;
    onLogin: (c: UserCredentials, r: boolean) => Promise<void>;
    onLogout: () => Promise<void>;
};

export default function Home({ username, onLogin, onLogout }: HomeProps) {
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
                {username === undefined ? (
                    <Login onSubmit={onLogin} />
                ) : (
                    <LoginWrapper>
                        <h3>Welcome back, {username}</h3>
                        <SecondaryButton onClick={onLogout}>
                            Logout
                        </SecondaryButton>
                    </LoginWrapper>
                )}
            </section>
        </Layout>
    );
}
