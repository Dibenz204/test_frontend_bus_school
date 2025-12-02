import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe, User, LogOut, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({
  menuItems = [],
  loginButton = true,
  showLogin = true,
  onMenuClick,
  variant = "normal",
}) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isParent = variant === "parent";

  // ✅ LẤY THÔNG TIN USER CHO CẢ 3 ROLE
  const getUserInfo = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      return userInfo;
    } catch (error) {
      return null;
    }
  };

  const userInfo = getUserInfo();
  const isLoggedIn = userInfo && ["Tài xế", "Quản trị viên", "Phụ huynh"].includes(userInfo.role);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  const handleClick = (item) => {
    if (onMenuClick && item.linkType === "section") {
      onMenuClick(item.link);
      setOpen(false);
      return;
    }

    if (item.linkType === "scroll") {
      const element = document.getElementById(item.link);
      if (element) element.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
      return;
    }

    if (item.linkType === "link") {
      navigate(item.link);
      setOpen(false);
      return;
    }
  };

  // ✅ XỬ LÝ LOGOUT CHO CẢ 3 ROLE
  const handleLogout = () => {
    const confirmLogout = window.confirm(t("header.confirm_logout"));
    if (confirmLogout) {
      // ✅ Tắt GPS nếu là tài xế
      if (userInfo && userInfo.role === "Tài xế") {
        console.log(t("header.gps_logout_message"));
      }

      // Xóa thông tin user
      localStorage.removeItem("userInfo");

      // Chuyển về trang login
      navigate("/login");
      setUserDropdownOpen(false);
      setOpen(false);
    }
  };

  // ✅ XỬ LÝ VỀ TRANG TƯƠNG ỨNG CHO CẢ 3 ROLE
  const handleBackToDashboard = () => {
    if (!userInfo) return;

    switch (userInfo.role) {
      case "Tài xế":
        navigate("/taixe");
        break;
      case "Quản trị viên":
        navigate("/admin");
        break;
      case "Phụ huynh":
        navigate("/phuhuynh");
        break;
      default:
        navigate("/");
        break;
    }
    setUserDropdownOpen(false);
    setOpen(false);
  };

  // ✅ LẤY TÊN HIỂN THỊ CHO USER
  const getUserDisplayName = () => {
    if (!userInfo) return "";

    if (userInfo.role === "Tài xế") {
      return userInfo.name || userInfo.id_driver;
    } else if (userInfo.role === "Quản trị viên") {
      return userInfo.name || userInfo.id_admin;
    } else if (userInfo.role === "Phụ huynh") {
      return userInfo.name || userInfo.id_parent;
    }
    return userInfo.name || t("header.user");
  };

  // ✅ LẤY ID HIỂN THỊ CHO USER
  const getUserDisplayId = () => {
    if (!userInfo) return "";

    if (userInfo.role === "Tài xế") {
      return userInfo.id_driver;
    } else if (userInfo.role === "Quản trị viên") {
      return userInfo.id_admin;
    } else if (userInfo.role === "Phụ huynh") {
      return userInfo.id_parent;
    }
    return userInfo.id || "";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 mt-2 ${isParent
        ? "bg-orange-500 rounded-xl shadow-md max-w-[97%] mx-auto px-6"
        : scrolled
          ? "bg-white/95 shadow-md backdrop-blur-md max-w-[95%] mx-auto px-6"
          : "bg-transparent shadow-none max-w-[95%] mx-auto px-6"
        }`}
    >
      <nav className="w-full flex items-center justify-between px-4 md:px-6 py-3">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer transform -translate-x-10"
        >
          <img src="logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span
            className={`text-2xl font-bold transition-colors duration-300 ${isParent
              ? "text-white"
              : scrolled
                ? "text-gray-800"
                : "text-black"
              }`}
          >
            Smart
            <span className={isParent ? "text-black" : "text-orange-500"}>
              Bus
            </span>
          </span>
        </div>

        <div
          className={`hidden md:flex items-center gap-10 text-lg font-medium transition-colors duration-500 ${isParent ? "text-white" : scrolled ? "text-gray-600" : "text-black"
            }`}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
                }`}
            >
              {t(item.label)}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* ✅ NÚT NGÔN NGỮ - LUÔN LUÔN HIỆN */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${isParent
              ? "border-white text-white hover:bg-white hover:text-black"
              : scrolled
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-gray-400 text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Globe size={18} />
            <span className="text-sm font-medium">
              {i18n.language.toUpperCase()}
            </span>
          </button>

          {/* ✅ DESKTOP: DROPDOWN USER CHO CẢ 3 ROLE KHI ĐÃ LOGIN */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isParent
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : scrolled
                    ? "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
                    : "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
                  }`}
              >
                <User size={18} />
                <span className="font-medium">
                  {getUserDisplayName()}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    {userInfo.role} • {getUserDisplayId()}
                  </div>
                  <button
                    onClick={handleBackToDashboard}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Home size={16} />
                    {t("header.back_to_your_page")}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    {t("header.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ✅ HIỂN THỊ NÚT LOGIN KHI CHƯA LOGIN */
            showLogin &&
            (loginButton ? (
              <button
                onClick={() => navigate("/login")}
                className={`px-5 py-2 rounded-full border font-medium transition ${isParent
                  ? "border-white bg-white text-black hover:bg-black hover:text-white"
                  : "border-orange-500 bg-orange-500 text-black hover:bg-black hover:text-white"
                  }`}
              >
                {t("header.login")}
              </button>
            ) : (
              <button
                onClick={() => navigate("/logout")}
                className="px-5 py-2 rounded-full border border-red-500 bg-red-500 text-white font-medium hover:bg-black transition"
              >
                {t("header.logout")}
              </button>
            ))
          )}
        </div>

        {/* ✅ MOBILE: CHỈ CÓ NÚT MENU, MỌI THỨ VÀO DROPDOWN */}
        <button
          className={`md:hidden transition-colors ${isParent ? "text-white" : scrolled ? "text-gray-800" : "text-black"
            }`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

        {open && (
          <div
            className={`absolute top-16 right-6 ${isParent ? "bg-orange-500 text-white" : "bg-white text-gray-800"
              } shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-lg font-medium md:hidden animate-fadeIn z-50`}
          >
            {/* MENU ITEMS */}
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
                  }`}
              >
                {t(item.label)}
              </button>
            ))}

            {/* NÚT NGÔN NGỮ TRONG DROPDOWN */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isParent
                ? "border-white text-white hover:bg-white hover:text-black"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
            >
              <Globe size={18} />
              <span>{t("header.language")} ({i18n.language.toUpperCase()})</span>
            </button>

            {/* ✅ USER DROPDOWN TRONG MENU MOBILE */}
            {isLoggedIn ? (
              <div className="flex flex-col gap-3 mt-2 w-full items-center border-t pt-4 border-gray-300">
                {/* Thông tin user */}
                <div className="text-center mb-2">
                  <p className={`font-semibold ${isParent ? "text-white" : "text-gray-800"}`}>
                    👋 {t("header.hello")}, {getUserDisplayName()}
                  </p>
                  <p className={`text-sm ${isParent ? "text-white opacity-80" : "text-gray-600"}`}>
                    {userInfo.role} • {getUserDisplayId()}
                  </p>
                </div>

                {/* Nút về trang của bạn */}
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border border-white text-white font-medium hover:bg-white hover:text-black transition-colors"
                >
                  <Home size={16} />
                  {t("header.back_to_your_page")}
                </button>

                {/* Nút đăng xuất */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border border-white text-white font-medium hover:bg-white hover:text-black transition-colors"
                >
                  <LogOut size={16} />
                  {t("header.logout")}
                </button>
              </div>
            ) : (
              /* NÚT LOGIN TRONG DROPDOWN MOBILE */
              showLogin &&
              (loginButton ? (
                <button
                  onClick={() => {
                    navigate("/login");
                    setOpen(false);
                  }}
                  className={`px-4 py-2 rounded-full border font-medium transition ${isParent
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                    }`}
                >
                  {t("header.login")}
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/logout");
                    setOpen(false);
                  }}
                  className="px-4 py-2 rounded-full border border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-colors"
                >
                  {t("header.logout")}
                </button>
              ))
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

// import React, { useState, useEffect } from "react";
// import { useTranslation } from "react-i18next";
// import { Menu, X, Globe, User, LogOut, Home } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const Header = ({
//   menuItems = [],
//   loginButton = true,
//   showLogin = true,
//   onMenuClick,
//   variant = "normal",
// }) => {
//   const [open, setOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const [userDropdownOpen, setUserDropdownOpen] = useState(false);
//   const { t, i18n } = useTranslation();
//   const navigate = useNavigate();

//   const isParent = variant === "parent";

//   // ✅ LẤY THÔNG TIN USER CHO CẢ 3 ROLE
//   const getUserInfo = () => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//       return userInfo;
//     } catch (error) {
//       return null;
//     }
//   };

//   const userInfo = getUserInfo();
//   const isLoggedIn = userInfo && ["Tài xế", "Quản trị viên", "Phụ huynh"].includes(userInfo.role);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 50);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const toggleLanguage = () => {
//     const newLang = i18n.language === "vi" ? "en" : "vi";
//     i18n.changeLanguage(newLang);
//   };

//   const handleClick = (item) => {
//     if (onMenuClick && item.linkType === "section") {
//       onMenuClick(item.link);
//       setOpen(false);
//       return;
//     }

//     if (item.linkType === "scroll") {
//       const element = document.getElementById(item.link);
//       if (element) element.scrollIntoView({ behavior: "smooth" });
//       setOpen(false);
//       return;
//     }

//     if (item.linkType === "link") {
//       navigate(item.link);
//       setOpen(false);
//       return;
//     }
//   };

//   // ✅ XỬ LÝ LOGOUT CHO CẢ 3 ROLE
//   const handleLogout = () => {
//     const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất không?");
//     if (confirmLogout) {
//       // ✅ Tắt GPS nếu là tài xế
//       if (userInfo && userInfo.role === "Tài xế") {
//         console.log("🔴 Đăng xuất - GPS sẽ tự động tắt");
//       }

//       // Xóa thông tin user
//       localStorage.removeItem("userInfo");

//       // Chuyển về trang login
//       navigate("/login");
//       setUserDropdownOpen(false);
//       setOpen(false);
//     }
//   };

//   // ✅ XỬ LÝ VỀ TRANG TƯƠNG ỨNG CHO CẢ 3 ROLE
//   const handleBackToDashboard = () => {
//     if (!userInfo) return;

//     switch (userInfo.role) {
//       case "Tài xế":
//         navigate("/taixe");
//         break;
//       case "Quản trị viên":
//         navigate("/admin");
//         break;
//       case "Phụ huynh":
//         navigate("/phuhuynh");
//         break;
//       default:
//         navigate("/");
//         break;
//     }
//     setUserDropdownOpen(false);
//     setOpen(false);
//   };

//   // ✅ LẤY TÊN HIỂN THỊ CHO USER
//   const getUserDisplayName = () => {
//     if (!userInfo) return "";

//     if (userInfo.role === "Tài xế") {
//       return userInfo.name || userInfo.id_driver;
//     } else if (userInfo.role === "Quản trị viên") {
//       return userInfo.name || userInfo.id_admin;
//     } else if (userInfo.role === "Phụ huynh") {
//       return userInfo.name || userInfo.id_parent;
//     }
//     return userInfo.name || "User";
//   };

//   // ✅ LẤY ID HIỂN THỊ CHO USER
//   const getUserDisplayId = () => {
//     if (!userInfo) return "";

//     if (userInfo.role === "Tài xế") {
//       return userInfo.id_driver;
//     } else if (userInfo.role === "Quản trị viên") {
//       return userInfo.id_admin;
//     } else if (userInfo.role === "Phụ huynh") {
//       return userInfo.id_parent;
//     }
//     return userInfo.id || "";
//   };

//   return (
//     <header
//       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 mt-2 ${isParent
//         ? "bg-orange-500 rounded-xl shadow-md max-w-[97%] mx-auto px-6"
//         : scrolled
//           ? "bg-white/95 shadow-md backdrop-blur-md max-w-[95%] mx-auto px-6"
//           : "bg-transparent shadow-none max-w-[95%] mx-auto px-6"
//         }`}
//     >
//       <nav className="w-full flex items-center justify-between px-4 md:px-6 py-3">
//         <div
//           onClick={() => navigate("/")}
//           className="flex items-center gap-2 cursor-pointer"
//         >
//           <img src="logo.png" alt="Logo" className="w-10 h-10 object-contain" />
//           <span
//             className={`text-2xl font-bold transition-colors duration-300 ${isParent
//               ? "text-white"
//               : scrolled
//                 ? "text-gray-800"
//                 : "text-black"
//               }`}
//           >
//             Smart
//             <span className={isParent ? "text-black" : "text-orange-500"}>
//               Bus
//             </span>
//           </span>
//         </div>

//         <div
//           className={`hidden md:flex items-center gap-10 text-lg font-medium transition-colors duration-500 ${isParent ? "text-white" : scrolled ? "text-gray-600" : "text-black"
//             }`}
//         >
//           {menuItems.map((item) => (
//             <button
//               key={item.label}
//               onClick={() => handleClick(item)}
//               className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
//                 }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>

//         <div className="hidden md:flex items-center gap-3">
//           {/* ✅ NÚT NGÔN NGỮ - LUÔN LUÔN HIỆN */}
//           <button
//             onClick={toggleLanguage}
//             className={`flex items-center gap-1 px-3 py-2 rounded-full border transition ${isParent
//               ? "border-white text-white hover:bg-white hover:text-black"
//               : scrolled
//                 ? "border-gray-300 text-gray-700 hover:bg-gray-100"
//                 : "border-gray-400 text-gray-700 hover:bg-gray-100"
//               }`}
//           >
//             <Globe size={18} />
//             <span className="text-sm font-medium">
//               {i18n.language.toUpperCase()}
//             </span>
//           </button>

//           {/* ✅ DESKTOP: DROPDOWN USER CHO CẢ 3 ROLE KHI ĐÃ LOGIN */}
//           {isLoggedIn ? (
//             <div className="relative">
//               <button
//                 onClick={() => setUserDropdownOpen(!userDropdownOpen)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isParent
//                   ? "border-white text-white hover:bg-white hover:text-black"
//                   : scrolled
//                     ? "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
//                     : "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
//                   }`}
//               >
//                 <User size={18} />
//                 <span className="font-medium">
//                   {getUserDisplayName()}
//                 </span>
//               </button>

//               {userDropdownOpen && (
//                 <div className="absolute right-0 top-12 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
//                   <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
//                     {userInfo.role} • {getUserDisplayId()}
//                   </div>
//                   <button
//                     onClick={handleBackToDashboard}
//                     className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                   >
//                     <Home size={16} />
//                     Về trang của bạn
//                   </button>
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                   >
//                     <LogOut size={16} />
//                     Đăng xuất
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             /* ✅ HIỂN THỊ NÚT LOGIN KHI CHƯA LOGIN */
//             showLogin &&
//             (loginButton ? (
//               <button
//                 onClick={() => navigate("/login")}
//                 className={`px-5 py-2 rounded-full border font-medium transition ${isParent
//                   ? "border-white bg-white text-black hover:bg-black hover:text-white"
//                   : "border-orange-500 bg-orange-500 text-black hover:bg-black hover:text-white"
//                   }`}
//               >
//                 {t("header.login")}
//               </button>
//             ) : (
//               <button
//                 onClick={() => navigate("/logout")}
//                 className="px-5 py-2 rounded-full border border-red-500 bg-red-500 text-white font-medium hover:bg-black transition"
//               >
//                 {t("header.logout")}
//               </button>
//             ))
//           )}
//         </div>

//         {/* ✅ MOBILE: CHỈ CÓ NÚT MENU, MỌI THỨ VÀO DROPDOWN */}
//         <button
//           className={`md:hidden transition-colors ${isParent ? "text-white" : scrolled ? "text-gray-800" : "text-black"
//             }`}
//           onClick={() => setOpen(!open)}
//         >
//           {open ? <X size={28} /> : <Menu size={28} />}
//         </button>

//         {open && (
//           <div
//             className={`absolute top-16 right-6 ${isParent ? "bg-orange-500 text-white" : "bg-white text-gray-800"
//               } shadow-lg rounded-xl flex flex-col items-center gap-4 py-4 px-8 text-lg font-medium md:hidden animate-fadeIn z-50`}
//           >
//             {/* MENU ITEMS */}
//             {menuItems.map((item) => (
//               <button
//                 key={item.label}
//                 onClick={() => handleClick(item)}
//                 className={`transition-colors ${isParent ? "hover:text-black" : "hover:text-orange-500"
//                   }`}
//               >
//                 {item.label}
//               </button>
//             ))}

//             {/* NÚT NGÔN NGỮ TRONG DROPDOWN */}
//             <button
//               onClick={toggleLanguage}
//               className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${isParent
//                 ? "border-white text-white hover:bg-white hover:text-black"
//                 : "border-gray-300 text-gray-700 hover:bg-gray-100"
//                 }`}
//             >
//               <Globe size={18} />
//               <span>Ngôn ngữ ({i18n.language.toUpperCase()})</span>
//             </button>

//             {/* ✅ USER DROPDOWN TRONG MENU MOBILE */}
//             {isLoggedIn ? (
//               <div className="flex flex-col gap-3 mt-2 w-full items-center border-t pt-4 border-gray-300">
//                 {/* Thông tin user */}
//                 <div className="text-center mb-2">
//                   <p className={`font-semibold ${isParent ? "text-white" : "text-gray-800"}`}>
//                     👋 Xin chào, {getUserDisplayName()}
//                   </p>
//                   <p className={`text-sm ${isParent ? "text-white opacity-80" : "text-gray-600"}`}>
//                     {userInfo.role} • {getUserDisplayId()}
//                   </p>
//                 </div>

//                 {/* Nút về trang của bạn */}
//                 <button
//                   onClick={handleBackToDashboard}
//                   className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border border-white text-white font-medium hover:bg-white hover:text-black transition-colors"
//                 >
//                   <Home size={16} />
//                   Về trang của bạn
//                 </button>

//                 {/* Nút đăng xuất */}
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-full border border-white text-white font-medium hover:bg-white hover:text-black transition-colors"
//                 >
//                   <LogOut size={16} />
//                   Đăng xuất
//                 </button>
//               </div>
//             ) : (
//               /* NÚT LOGIN TRONG DROPDOWN MOBILE */
//               showLogin &&
//               (loginButton ? (
//                 <button
//                   onClick={() => {
//                     navigate("/login");
//                     setOpen(false);
//                   }}
//                   className={`px-4 py-2 rounded-full border font-medium transition ${isParent
//                     ? "border-white text-white hover:bg-white hover:text-black"
//                     : "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
//                     }`}
//                 >
//                   {t("header.login")}
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => {
//                     navigate("/logout");
//                     setOpen(false);
//                   }}
//                   className="px-4 py-2 rounded-full border border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-colors"
//                 >
//                   {t("header.logout")}
//                 </button>
//               ))
//             )}
//           </div>
//         )}
//       </nav>
//     </header>
//   );
// };

// export default Header;

