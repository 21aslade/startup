import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { PropsWithChildren, useEffect, useState } from "react";
import Home from "./routes/Home.jsx";
import Play from "./routes/Play.jsx";
import Profile from "./routes/Profile.jsx";

export default function App() {
    const [username, setUsername] = useState<string | undefined>(undefined);

    return (
        <BrowserRouter>
            <Header username={username} />
            <main>
                <AppRoutes username={username} setUsername={setUsername} />
            </main>
            <Footer />
        </BrowserRouter>
    );
}

type AppRoutesProps = {
    username: string | undefined;
    setUsername: (s?: string) => void;
};
function AppRoutes({ username, setUsername }: AppRoutesProps) {
    const navigate = useNavigate();

    const onLogin = (n?: string) => {
        setUsername(n);
        if (n !== undefined) {
            navigate("/profile");
        }
    };

    const authenticated = username !== undefined;

    return (
        <Routes>
            <Route
                path="/"
                element={<Home onLogin={onLogin} username={username} />}
            />
            <Route
                path="/profile"
                element={
                    <RequireAuth authenticated={authenticated} backupRoute="/">
                        <Profile username={username!!} />
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
