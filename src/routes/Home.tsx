import { PrimaryButton, SecondaryButton } from "../components/Button.jsx";
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

function Login() {
    return (
        <LoginWrapper>
            <LoginInput
                type="text"
                autoComplete="username"
                aria-label="username"
                placeholder="Username"
            />
            <LoginInput
                type="password"
                autoComplete="current-password"
                aria-label="password"
                placeholder="Password"
            />
            <div>
                <PrimaryButton type="submit">Login</PrimaryButton>
                <SecondaryButton type="submit">Register</SecondaryButton>
            </div>
        </LoginWrapper>
    );
}

export type HomeProps = {
    setUsername: (s: string) => void;
};

export default function Home({ setUsername: _ }: HomeProps) {
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
                <Login />
            </section>
        </Layout>
    );
}
