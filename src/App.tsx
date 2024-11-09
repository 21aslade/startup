import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { PropsWithChildren, useEffect, useState } from "react";
import Home from "./routes/Home.jsx";
import Play from "./routes/Play.jsx";

export default function App() {
    const [username, setUsername] = useState<string | undefined>(undefined);

    return (
        <BrowserRouter>
            <Header username={username} />
            <main>
                <AppRoutes
                    authenticated={username !== undefined}
                    setUsername={setUsername}
                />
            </main>
            <Footer />
        </BrowserRouter>
    );
}

type AppRoutesProps = {
    authenticated: boolean;
    setUsername: (s: string) => void;
};
function AppRoutes({ authenticated, setUsername }: AppRoutesProps) {
    const navigate = useNavigate();

    const onLogin = (n: string) => {
        setUsername(n);
        navigate("/profile");
    };

    return (
        <Routes>
            <Route path="/" element={<Home onLogin={onLogin} />} />
            <Route
                path="/profile"
                element={
                    <RequireAuth authenticated={authenticated} backupRoute="/">
                        {"Profile"}
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
