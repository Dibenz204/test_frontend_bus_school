import ParentPage from "./pages/ParentPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "sonner";
import Test from "./pages/Test";
import Parent from "./pages/Parent";
import Home_TrangChu from "./pages/Home_TrangChu";
import LoginPage from "./pages/LoginPage";
import Introduce from "./pages/Introduce";
import MapComponent from "./components/MapComponent";
import Taixe from "./pages/Taixe";
import PhuHuynh from "./pages/PhuHuynh";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Home_TrangChu />} /> */}
          <Route path="/map_component" element={<Introduce />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test_parent" element={<Parent />} />
          <Route path="/" element={<MapComponent />} />

          {/*  đi theo cách router navigate đổi url */}
          {/* <Route path="/" element={<Home_TrangChu />} /> */}
          <Route path="/" element={<Introduce />} />
          <Route path="/" element={<ParentPage />} />
          <Route path="/Taixe" element={<Taixe />} />
          <Route path="/PhuHuynh" element={<PhuHuynh />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test_parent" element={<Parent />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
