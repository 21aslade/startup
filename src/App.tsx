import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Play from "./routes/Play.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={"Home"} />
                    <Route path="/profile" element={"Profile"} />
                    <Route path="/play" element={<Play />} />
                </Routes>
            </main>
            <Footer />
        </BrowserRouter>
    );
}
