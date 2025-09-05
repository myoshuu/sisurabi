import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Sidebar from "./layouts/Sidebar";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>

        <Route path="/dashboard" element={<Sidebar />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
