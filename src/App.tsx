import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { PropsWithChildren, useEffect, useState } from "react";
import Home from "./routes/Home.jsx";
import Play from "./routes/Play.jsx";
import Profile from "./routes/Profile.jsx";
import { AuthToken, UserCredentials } from "linebreak-service";
import { createUser, login, logout } from "./endpoints.js";

type Session = {
    auth: AuthToken;
    username: string;
};

export default function App() {
    const [session, setSession] = useState<Session | undefined>(undefined);

    return (
        <BrowserRouter>
            <Header username={session?.username} />
            <main>
                <AppRoutes session={session} setSession={setSession} />
            </main>
            <Footer />
        </BrowserRouter>
    );
}

type AppRoutesProps = {
    session?: Session;
    setSession: (s?: Session) => void;
};
function AppRoutes({ session, setSession }: AppRoutesProps) {
    const navigate = useNavigate();

    const onLogin = async (c: UserCredentials, register: boolean) => {
        const auth = await (register ? createUser(c) : login(c));
        setSession({ username: c.username, auth });
        navigate("/profile");
    };

    const onLogout = async () => {
        if (session !== undefined) {
            await logout(session.auth);
            setSession(undefined);
        }
    };

    const authenticated = session !== undefined;

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Home
                        onLogin={onLogin}
                        onLogout={onLogout}
                        username={session?.username}
                    />
                }
            />
            <Route
                path="/profile"
                element={
                    <RequireAuth authenticated={authenticated} backupRoute="/">
                        <Profile username={session?.username!!} />
                    </RequireAuth>
                }
            />
            <Route
                path="/play"
                element={
                    <RequireAuth authenticated={authenticated} backupRoute="/">
                        <Play />
                    </RequireAuth>
                }
            />
        </Routes>
    );
}

type RequireAuthProps = PropsWithChildren<{
    authenticated: boolean;
    backupRoute: string;
}>;

function RequireAuth({
    authenticated,
    backupRoute,
    children,
}: RequireAuthProps) {
    const navigate = useNavigate();
    useEffect(() => {
        if (!authenticated) {
            navigate(backupRoute);
            return;
        }
    }, [authenticated]);

    return authenticated ? <>{children}</> : <></>;
}
