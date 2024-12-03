import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { useCallback, useLayoutEffect, useState } from "react";
import Home from "./routes/Home.jsx";
import Play from "./routes/Play.jsx";
import Profile from "./routes/Profile.jsx";
import { Session, UserCredentials } from "linebreak-service";
import { createUser, login, logout } from "./endpoints.js";
import { RequireAuth, SessionProvider, useSession } from "./session.jsx";
import NotFound from "./routes/NotFound.jsx";

const sessionStorageKey = "session";

export default function App() {
    const [session, setSession] = useState<Session | undefined>(() => {
        const session = localStorage.getItem(sessionStorageKey);
        if (session === null) {
            return undefined;
        }

        try {
            return JSON.parse(session);
        } catch (e) {
            return undefined;
        }
    });

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
        const session = await (register ? createUser(c) : login(c));
        localStorage.setItem(sessionStorageKey, JSON.stringify(session));
        setSession(session);
        navigate("/profile");
    };

    const onLogout = useCallback(async () => {
        if (session !== undefined) {
            // Consider self logged out even if unknown
            await logout().catch(() => {});
        }
        setSession(undefined);
        localStorage.removeItem(sessionStorageKey);
    }, [session]);

    return (
        <SessionProvider value={{ session, logout: onLogout }}>
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
            </Routes>
        </SessionProvider>
    );
}

function ProfileRedirect() {
    const navigate = useNavigate();
    const session = useSession();
    useLayoutEffect(() => {
        if (session !== undefined) {
            const userURL = encodeURIComponent(session.username);
            navigate(`/profile/${userURL}`);
        } else {
            navigate("/");
        }
    }, [session]);

    return <></>;
}
