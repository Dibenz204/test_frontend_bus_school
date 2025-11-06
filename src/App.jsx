// import { Toaster } from "sonner";
// import { BrowserRouter, Routes, Route } from "react-router-dom";


// function App() {
//   return (
//     <>
//       <Toaster richColors />

//       <BrowserRouter>
//         <Routes>
// <Route path="/trangchu" element={<Home_TrangChu />} />
// <Route path="/" element={<Introduce />} />
// <Route path="/login" element={<LoginPage />} />
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

function App() {
  return (
    <>


      <BrowserRouter>

        <Routes>
          {/* <Route path="/" element={<Home_TrangChu />} /> */}
          <Route path="/" element={<Introduce />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test_parent" element={<Parent />} />
          <Route path="/map_component" element={<MapComponent />} />


          {/* Trang GPS cho TÀI XẾ - Gửi vị trí realtime */}
          <Route path="/driver-gps" element={<GPSTrackingComponent />} />

          {/* Trang GPS cho ADMIN - Xem tất cả tài xế */}
          <Route path="/admin-tracking" element={<GPSTrackingComponent />} />

          {/* Trang GPS cho PHỤ HUYNH - Xem xe đưa đón con */}
          <Route path="/parent-tracking" element={<GPSTrackingComponent />} />

          <Route path="/test-gps" element={<TestGPSLocation />} />



        </Routes>
      </BrowserRouter>

    </>
  );
}

export default App;

