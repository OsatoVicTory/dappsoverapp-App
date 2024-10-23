import { Route, Routes } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/landingPage";
import TestingPreview from "./test";

const RootApp = () => {
    return (
        <Routes>
            <Route path='/test' element={<TestingPreview />} />
            <Route path='/' element={<LandingPage />} />
            <Route path='/app/*' element={<App />} />
        </Routes>
    )
};

export default RootApp;