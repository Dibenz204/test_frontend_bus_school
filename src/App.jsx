import ParentPage from "./pages/ParentPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "sonner";
import Test from "./pages/Test";
import Parent from "./pages/Parent";
import Home_TrangChu from "./pages/Home_TrangChu";
import LoginPage from "./pages/LoginPage";
import Introduce from "./pages/Introduce";
import MapComponent from "./components/MapComponent";
import GPSTrackingComponent from "./components/GPSTrackingComponent";
import TestGPSLocation from "./components/TestGPSLocation";
import DriverGPSView from "./components/DriverGPSView"; // ✅ Component tài xế
import AdminTrackingView from "./components/AdminTrackingView";
import Taixe from "./pages/Taixe";
import PhuHuynh from "./pages/PhuHuynh";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Route chính - chỉ giữ 1 route "/" */}
          <Route path="/" element={<Introduce />} />

          {/* Các route khác */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test_parent" element={<Parent />} />
          <Route path="/map_component" element={<MapComponent />} />

          {/* Trang GPS cho TÀI XẾ - Gửi vị trí realtime */}
          <Route path="/driver-gps" element={<DriverGPSView />} />

          {/* Trang GPS cho ADMIN - Xem tất cả tài xế */}
          <Route path="/admin-tracking" element={<AdminTrackingView />} />

          {/* Trang cho các role */}
          <Route path="/Taixe" element={<Taixe />} />
          <Route path="/PhuHuynh" element={<PhuHuynh />} />

          {/* Route test GPS */}
          <Route path="/test-gps" element={<TestGPSLocation />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;