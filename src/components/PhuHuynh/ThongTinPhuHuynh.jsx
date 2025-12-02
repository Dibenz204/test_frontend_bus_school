import React, { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Calendar, Users } from "lucide-react";
import { getStudentsByParent } from "../../services/studentService"; // ✅ Import service
import { useTranslation } from "react-i18next";

export default function PhuHuynhPage() {
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const userData = JSON.parse(storedUserInfo);
      setUserInfo(userData);
      fetchStudentsByParent(userData.id_user);
    } else {
      setLoading(false);
    }
  }, []);

  // Hàm lấy danh sách học sinh theo id_user (phụ huynh)
  const fetchStudentsByParent = async (parentId) => {
    try {
      const response = await getStudentsByParent(parentId);

      if (response.data.errCode === 0) {
        setStudents(response.data.students || []);
      } else {
        console.error(t("parent_page.fetch_students_error"), response.data.message);
      }
    } catch (error) {
      console.error(t("parent_page.fetch_students_generic_error"), error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("parent_page.loading_info")}</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-lg">{t("parent_page.user_info_not_found")}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {t("parent_page.back_to_login")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <User className="text-blue-600" size={36} />
                {t("parent_page.parent_page")}
              </h1>
              <p className="text-gray-600 mt-2">{t("parent_page.page_description")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {userInfo.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Thông tin phụ huynh */}
          <div className="lg:col-span-1 space-y-6">

            {/* Card thông tin cá nhân */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                <User className="text-blue-600" size={24} />
                {t("parent_page.personal_info")}
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{userInfo.name}</p>
                    <p className="text-sm text-gray-600">ID: {userInfo.id_user}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={18} className="text-blue-500" />
                    <span className="text-sm">{userInfo.email}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={18} className="text-green-500" />
                    <span className="text-sm">{userInfo.phone}</span>
                  </div>

                  {userInfo.address && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MapPin size={18} className="text-red-500 mt-0.5" />
                      <span className="text-sm flex-1">{userInfo.address}</span>
                    </div>
                  )}

                  {userInfo.birthday && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar size={18} className="text-purple-500" />
                      <span className="text-sm">
                        {new Date(userInfo.birthday).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thống kê nhanh */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                {/* <Users className="text-green-600" size={24} /> */}
                {/* {t("parent_page.statistics")} */}
              </h2>

              <div className="flex justify-center">
                <div className="bg-blue-50 p-4 rounded-lg text-center w-40">
                  <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                  <p className="text-sm text-gray-600">{t("parent_page.students")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách học sinh */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="text-purple-600" size={24} />
                  {t("parent_page.student_list")}
                </h2>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {students.length} {t("parent_page.students")}
                </span>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t("parent_page.no_students_registered")}</p>
                  {/* <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    {t("parent_page.register_student")}
                  </button> */}
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student, index) => (
                    <div
                      key={student.id_student}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-purple-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{student.name}</h3>
                            <p className="text-sm text-gray-600">
                              {t("parent_page.class")}: {student.class} • {t("parent_page.student_id")}: {student.mssv}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {/* {student.status === 'active' ? t("parent_page.studying") : t("parent_page.temporarily_absent")} */}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {t("parent_page.pickup_point")}: {student.busstop?.name_station || t("parent_page.not_available")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { User, Phone, Mail, MapPin, Calendar, Users } from "lucide-react";
// import { getStudentsByParent } from "../../services/studentService"; // ✅ Import service

// export default function PhuHuynhPage() {
//   const [userInfo, setUserInfo] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Lấy thông tin user từ localStorage khi component mount
//   useEffect(() => {
//     const storedUserInfo = localStorage.getItem("userInfo");
//     if (storedUserInfo) {
//       const userData = JSON.parse(storedUserInfo);
//       setUserInfo(userData);
//       fetchStudentsByParent(userData.id_user);
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   // Hàm lấy danh sách học sinh theo id_user (phụ huynh)
//   const fetchStudentsByParent = async (parentId) => {
//     try {
//       const response = await getStudentsByParent(parentId);

//       if (response.data.errCode === 0) {
//         setStudents(response.data.students || []);
//       } else {
//         console.error("Lỗi khi lấy học sinh:", response.data.message);
//       }
//     } catch (error) {
//       console.error("❌ Lỗi khi lấy danh sách học sinh:", error);
//     } finally {
//       setLoading(false);
//     }
//   };


//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!userInfo) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <p className="text-red-500 text-lg">Không tìm thấy thông tin người dùng</p>
//           <button
//             onClick={() => window.location.href = '/login'}
//             className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
//           >
//             Quay lại đăng nhập
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
//       <div className="max-w-6xl mx-auto">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
//                 <User className="text-blue-600" size={36} />
//                 Trang Phụ Huynh
//               </h1>
//               <p className="text-gray-600 mt-2">Quản lý thông tin và theo dõi học sinh</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
//                 {userInfo.role}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//           {/* Thông tin phụ huynh */}
//           <div className="lg:col-span-1 space-y-6">

//             {/* Card thông tin cá nhân */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
//                 <User className="text-blue-600" size={24} />
//                 Thông Tin Cá Nhân
//               </h2>

//               <div className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                     <User className="text-blue-600" size={20} />
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-800">{userInfo.name}</p>
//                     <p className="text-sm text-gray-600">ID: {userInfo.id_user}</p>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3 text-gray-700">
//                     <Mail size={18} className="text-blue-500" />
//                     <span className="text-sm">{userInfo.email}</span>
//                   </div>

//                   <div className="flex items-center gap-3 text-gray-700">
//                     <Phone size={18} className="text-green-500" />
//                     <span className="text-sm">{userInfo.phone}</span>
//                   </div>

//                   {userInfo.address && (
//                     <div className="flex items-start gap-3 text-gray-700">
//                       <MapPin size={18} className="text-red-500 mt-0.5" />
//                       <span className="text-sm flex-1">{userInfo.address}</span>
//                     </div>
//                   )}

//                   {userInfo.birthday && (
//                     <div className="flex items-center gap-3 text-gray-700">
//                       <Calendar size={18} className="text-purple-500" />
//                       <span className="text-sm">
//                         {new Date(userInfo.birthday).toLocaleDateString('vi-VN')}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Thống kê nhanh */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
//                 {/* <Users className="text-green-600" size={24} /> */}
//                 {/* Thống Kê */}
//               </h2>

//               <div className="flex justify-center">
//                 <div className="bg-blue-50 p-4 rounded-lg text-center w-40">
//                   <p className="text-2xl font-bold text-blue-600">{students.length}</p>
//                   <p className="text-sm text-gray-600">Học sinh</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Danh sách học sinh */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                   <Users className="text-purple-600" size={24} />
//                   Danh Sách Học Sinh
//                 </h2>
//                 <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
//                   {students.length} học sinh
//                 </span>
//               </div>

//               {students.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Users size={48} className="text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-500">Chưa có học sinh nào được đăng ký</p>
//                   <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
//                     Đăng ký học sinh
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {students.map((student, index) => (
//                     <div
//                       key={student.id_student}
//                       className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//                     >
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-4">
//                           <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
//                             <span className="font-semibold text-purple-600">
//                               {index + 1}
//                             </span>
//                           </div>
//                           <div>
//                             <h3 className="font-semibold text-gray-800">{student.name}</h3>
//                             <p className="text-sm text-gray-600">
//                               Lớp: {student.class} • MSSV: {student.mssv}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.status === 'active'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-gray-100 text-gray-800'
//                             }`}>
//                             {/* {student.status === 'active' ? 'Đang học' : 'Tạm nghỉ'} */}
//                           </span>
//                           <p className="text-xs text-gray-500 mt-1">
//                             Điểm đón: {student.busstop?.name_station || 'Chưa có'}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }