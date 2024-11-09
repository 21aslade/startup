import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Play from "./routes/Play.jsx";
import { useState } from "react";
import Home from "./routes/Home.jsx";

export default function App() {
    const [username, setUsername] = useState<string | undefined>(undefined);

    return (
        <BrowserRouter>
            <Header authenticated={username !== undefined} />
            <main>
                <Routes>
                    <Route
                        path="/"
                        element={<Home setUsername={setUsername} />}
                    />
                    <Route path="/profile" element={"Profile"} />
                    <Route path="/play" element={<Play />} />
                </Routes>
            </main>
            <Footer />
        </BrowserRouter>
    );
}
