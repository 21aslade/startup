import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
    return (<BrowserRouter>
        <Header />
        <main>
            <Routes>
                <Route path="/" element={"Home"} />
                <Route path="/profile" element={"Profile"} />
                <Route path="/play" element={"Play"} />
            </Routes>
        </main>
        <Footer />
    </BrowserRouter>);
}