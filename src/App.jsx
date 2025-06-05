import React from 'react';
import Navbar from "./component/global/navbar.jsx";
import {Routes , Route} from "react-router-dom";
import Samiti from "./component/samiti.jsx";
import Acharya from "./component/acharya.jsx";
import Adhyaksh from "./component/adhyaksh.jsx";

function App() {
    return (
        <>
        <Navbar/>
            <Routes>
                <Route path="/" element={<Samiti />} />
                <Route path="/acharya" element={<Acharya />} />
                <Route path="/adhyaksh" element={<Adhyaksh />} />
            </Routes>
        </>
    );
}

export default App;