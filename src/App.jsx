import ParentPage from "./pages/ParentPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "sonner";
import Test from "./pages/Test";
import Parent from "./pages/Parent";
import Home_TrangChu from "./pages/Home_TrangChu";
import LoginPage from "./pages/LoginPage";
import Introduce from "./pages/Introduce";
import Taixe from "./pages/Taixe";
import PhuHuynh from "./pages/PhuHuynh";
import ProtectedRoute from "./components/ui/ProtectedRoute";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/*  đi theo cách router navigate đổi url */}
          {/* <Route path="/" element={<Home_TrangChu />} /> */}
          <Route path="/" element={<Introduce />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/parent" element={<ParentPage />} />

    {/* protect driver route */}
     <Route
            path="/Taixe"
            element={
              <ProtectedRoute allowedRoles={["Tài xế"]}>
                <Taixe />
              </ProtectedRoute>
            }
          />    
                {/*protect parent route  */}
            <Route
            path="/PhuHuynh"
            element={
              <ProtectedRoute allowedRoles={["Phụ huynh"]}>
                <PhuHuynh />
              </ProtectedRoute>
            }
          />
      
          <Route path="/test" element={<Test />} />

          {/* protect admin route */}
             <Route
            path="/test_parent"
            element={
              <ProtectedRoute allowedRoles={["Quản trị viên"]}>
                <Parent />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
