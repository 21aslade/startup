import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { useLayoutEffect, useState } from "react";
import Home from "./routes/Home.jsx";
import Play from "./routes/Play.jsx";
import Profile from "./routes/Profile.jsx";
import { UserCredentials } from "linebreak-service";
import { createUser, login, logout } from "./endpoints.js";
import {
    RequireAuth,
    Session,
    SessionProvider,
    useSession,
} from "./session.jsx";

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

    return (
        <SessionProvider value={session}>
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
            console.log(userURL);
            navigate(`/profile/${userURL}`);
        } else {
            navigate("/");
        }
    }, [session]);

    return <></>;
}
