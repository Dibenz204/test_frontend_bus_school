// import ParentPage from "./pages/ParentPage";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { Toaster, toast } from "sonner";
// import Test from "./pages/Test";
// import Parent from "./pages/Parent";
// import Home_TrangChu from "./pages/Home_TrangChu";
// import LoginPage from "./pages/LoginPage";
// import Introduce from "./pages/Introduce";
// import MapComponent from "./components/MapComponent";
// import Taixe from "./pages/Taixe";
// import PhuHuynh from "./pages/PhuHuynh";
// import ProtectedRoute from "./components/ui/ProtectedRoute";
// function App() {
//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           {/* <Route path="/" element={<Home_TrangChu />} /> */}
//           <Route path="/" element={<Introduce />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/test" element={<Test />} />
//           <Route path="/test_parent" element={<Parent />} />
//           {/* <Route path="/map_component" element={<MapComponent />} /> */}

//           {/*  đi theo cách router navigate đổi url */}
//           {/* <Route path="/" element={<Home_TrangChu />} /> */}
//           <Route path="/" element={<Introduce />} />
//           <Route path="/login" element={<LoginPage />} />

//           <Route path="/parent" element={<ParentPage />} />

//           {/* protect driver route */}
//           <Route
//             path="/Taixe"
//             element={
//               // <ProtectedRoute allowedRoles={["Tài xế"]}>
//               <Taixe />
//               // </ProtectedRoute>
//             }
//           />

//           {/*protect parent route  */}
//           <Route
//             path="/PhuHuynh"
//             element={
//               <ProtectedRoute allowedRoles={["Phụ huynh"]}>
//                 <PhuHuynh />
//               </ProtectedRoute>
//             }
//           />

//           <Route path="/test" element={<Test />} />

//           {/* protect admin route */}
//           <Route
//             path="/test_parent"
//             element={
//               <ProtectedRoute allowedRoles={["Quản trị viên"]}>
//                 <Parent />
//               </ProtectedRoute>
//             }
//           />

//         </Routes>
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;
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
import ParentPage from "./pages/ParentPage";
import Taixe from "./pages/Taixe";
import PhuHuynh from "./pages/PhuHuynh";
import ProtectedRoute from "./components/ui/ProtectedRoute";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Introduce />} />
          <Route path="/login" element={<LoginPage />} />
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
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={["Phụ huynh"]}>
                <ParentPage />
              </ProtectedRoute>
            }
          />

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
              <ProtectedRoute allowedRoles={["Tài xế"]}>?
                <Taixe />
              </ProtectedRoute>
            }
          />

          {/* Route cho Quản trị viên */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Quản trị viên"]}>
                <Parent /> {/* Giữ nguyên component Parent cho admin */}
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