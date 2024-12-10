import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { useCallback, useEffect, useState } from "react";
import Home from "./routes/Home.jsx";
import Practice from "./routes/Practice.jsx";
import Profile from "./routes/Profile.jsx";
import { Session, UserCredentials } from "linebreak-shared/user";
import { createUser, getSession, login, logout } from "./endpoints.js";
import { ProfileRedirect, RequireAuth, SessionProvider } from "./session.jsx";
import NotFound from "./routes/NotFound.jsx";
import Play from "./routes/Play.jsx";

export default function App() {
    const [session, setSession] = useState<Session | undefined | null>();

    useEffect(() => {
        if (session === undefined) {
            getSession()
                .then(setSession)
                .catch(() => setSession(null));
        }
    }, [session]);

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
    session?: Session | null;
    setSession: (s?: Session | null) => void;
};
function AppRoutes({ session, setSession }: AppRoutesProps) {
    const navigate = useNavigate();

    const onLogin = async (c: UserCredentials, register: boolean) => {
        const session = await (register ? createUser(c) : login(c));
        setSession(session);
        navigate("/profile");
    };

    const onLogout = useCallback(async () => {
        if (session !== undefined && session !== null) {
            // Consider self logged out even if unknown error occurs
            await logout().catch(() => {});
        }
        setSession(null);
    }, [session]);

    return (
        <SessionProvider value={session}>
            <Routes>
                <Route path="*" element={<NotFound />} />
                <Route
                    path="/"
                    element={<Home onLogin={onLogin} onLogout={onLogout} />}
                />
                <Route path="/profile">
                    <Route index element={<ProfileRedirect />}></Route>
                    <Route path=":username" element={<Profile />}></Route>
                </Route>
                <Route
                    path="/play"
                    element={
                        <RequireAuth backupRoute="/">
                            <Play />
                        </RequireAuth>
                    }
                />
                <Route path="/practice" element={<Practice />} />
            </Routes>
        </SessionProvider>
    );
}
