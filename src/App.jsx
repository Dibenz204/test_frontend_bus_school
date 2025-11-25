
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
import DriverGPSView from "./components/DriverGPSView";
import AdminTrackingView from "./components/AdminTrackingView";
import Taixe from "./pages/Taixe";
import PhuHuynh from "./pages/PhuHuynh";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import Admin from "./pages/Admin";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Introduce />} />
          <Route path="/login" element={<LoginPage />} />

          {/*của Phong để test các chức năng khác */}
          <Route path="/test" element={<Test />} />
          <Route path="/test_parent" element={<Parent />} />
          <Route path="/map_component" element={<MapComponent />} />
          <Route path="/test-gps" element={<TestGPSLocation />} />
          {/* GPS Tracking Routes */}
          <Route path="/driver-gps" element={<DriverGPSView />} />
          <Route path="/admin-tracking" element={<AdminTrackingView />} />
          {/* Legacy GPS Route - giữ lại để tương thích */}
          <Route path="/gps-tracking" element={<GPSTrackingComponent />} />



          {/* Protected Routes với phân quyền */}

          {/* Route cho Phụ huynh */}
          <Route
            path="/PhuHuynh"
            element={
              <ProtectedRoute allowedRoles={["Phụ huynh"]}>
                <PhuHuynh />
              </ProtectedRoute>
            }
          />

          {/* Route cho Tài xế */}
          <Route
            path="/Taixe"
            element={
              <ProtectedRoute allowedRoles={["Tài xế"]}>
                <Taixe />
              </ProtectedRoute>
            }
          />

          {/* Route cho Quản trị viên */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Quản trị viên"]}>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Introduce />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;