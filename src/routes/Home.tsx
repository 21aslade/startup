import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "../components/Button.jsx";
import { styled } from "styled-components";
import { UserCredentials } from "linebreak-service";
import { ServerError } from "../endpoints.js";
import ErrorMessage from "../components/ErrorMessage.jsx";

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

const ErrorWrapper = styled.div`
    max-width: 100%;
`;

type LoginProps = {
    loggedInUsername?: string;
    onSubmit: (c: UserCredentials, register: boolean) => Promise<void>;
};
function Login({ onSubmit }: LoginProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);

    const submit = async (register: boolean) => {
        if (username.length > 0 && password.length > 0) {
            try {
                await onSubmit({ username, password }, register);
            } catch (e: unknown) {
                if (!(e instanceof ServerError)) {
                    throw e;
                }

                switch (e.status) {
                    case 409:
                        setError("Username already taken");
                        break;
                    case 401:
                        setError("Username or password is incorrect");
                        break;
                }
            }
        } else {
            setError("Username and password are required.");
        }
    };

    return (
        <LoginWrapper>
            {error !== undefined && (
                <ErrorWrapper>
                    <ErrorMessage message={error} />
                </ErrorWrapper>
            )}
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
                <PrimaryButton onClick={() => submit(false)}>
                    Login
                </PrimaryButton>
                <SecondaryButton onClick={() => submit(true)}>
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
