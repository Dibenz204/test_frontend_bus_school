import React from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white text-gray-700 py-16 px-6 md:px-20 border-t border-orange-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Cột 1 - Logo và mô tả */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="logo.png" alt="Logo" className="w-10 h-10" />
            <h2 className="text-2xl font-bold text-gray-900">
              Smart<span className="text-orange-500">Bus</span>.
            </h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-xs">
            {t("footer.description")}
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
            >
              <Twitter size={18} />
            </a>
          </div>
        </div>

        {/* Cột 2 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t("footer.company.title")}
          </h3>
          <ul className="space-y-2">
            <li>
              <a href="#home" className="hover:text-orange-500">
                {t("footer.company.home")}
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-orange-500">
                {t("footer.company.about")}
              </a>
            </li>
            <li>
              <a href="#menu" className="hover:text-orange-500">
                {t("footer.company.features")}
              </a>
            </li>
            <li>
              <a href="#docs" className="hover:text-orange-500">
                {t("footer.company.docs")}
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 3 - Support */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t("footer.support.title")}
          </h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-orange-500">
                {t("footer.support.help")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-orange-500">
                {t("footer.support.press")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-orange-500">
                {t("footer.support.affiliates")}
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-orange-500">
                {t("footer.support.partners")}
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 4 - Contact */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t("footer.contact.title")}
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="text-orange-500 w-5 h-5 mt-1" />
              <span>{t("footer.contact.address")}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-orange-500 w-5 h-5" />
              <span>{t("footer.contact.phone")}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-orange-500 w-5 h-5" />
              <span>{t("footer.contact.email")}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Dòng bản quyền */}
      <div className="text-center text-gray-500 text-sm mt-12 border-t border-gray-200 pt-6">
        © {new Date().getFullYear()} SmartBus.
      </div>
    </footer>
  );
};

export default Footer;


// import React from "react";
// import {
//   Facebook,
//   Instagram,
//   Twitter,
//   Mail,
//   Phone,
//   MapPin,
// } from "lucide-react";

// const Footer = () => {
//   return (
//     <footer className="bg-white text-gray-700 py-16 px-6 md:px-20 border-t border-orange-200">
//       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
//         {/* Cột 1 - Logo và mô tả */}
//         <div>
//           <div className="flex items-center gap-2 mb-4">
//             <img src="logo.png" alt="Logo" className="w-10 h-10" />
//             <h2 className="text-2xl font-bold text-gray-900">
//               Smart<span className="text-orange-500">Bus</span>.
//             </h2>
//           </div>
//           <p className="text-gray-600 mb-6 max-w-xs">
//             Quản lý, theo dõi và tận hưởng mỗi chuyến xe — tất cả trong một ứng
//             dụng.
//           </p>
//           <div className="flex gap-4">
//             <a
//               href="#"
//               className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
//             >
//               <Facebook size={18} />
//             </a>
//             <a
//               href="#"
//               className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
//             >
//               <Instagram size={18} />
//             </a>
//             <a
//               href="#"
//               className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-orange-500 hover:text-white transition"
//             >
//               <Twitter size={18} />
//             </a>
//           </div>
//         </div>

//         {/* Cột 2 */}
//         <div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Company</h3>
//           <ul className="space-y-2">
//             <li>
//               <a href="#home" className="hover:text-orange-500">
//                 Home
//               </a>
//             </li>
//             <li>
//               <a href="#about" className="hover:text-orange-500">
//                 About Us
//               </a>
//             </li>
//             <li>
//               <a href="#menu" className="hover:text-orange-500">
//                 Salient points
//               </a>
//             </li>
//             <li>
//               <a href="#docs" className="hover:text-orange-500">
//                 Documentation
//               </a>
//             </li>
//           </ul>
//         </div>

//         {/* Cột 3 - Support */}
//         <div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Support</h3>
//           <ul className="space-y-2">
//             <li>
//               <a href="#" className="hover:text-orange-500">
//                 Help / FAQ
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-orange-500">
//                 Press
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-orange-500">
//                 Affiliates
//               </a>
//             </li>
//             <li>
//               <a href="#" className="hover:text-orange-500">
//                 Partners
//               </a>
//             </li>
//           </ul>
//         </div>

//         {/* Cột 4 - Contact */}
//         <div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact</h3>
//           <ul className="space-y-4">
//             <li className="flex items-start gap-3">
//               <MapPin className="text-orange-500 w-5 h-5 mt-1" />
//               <span>273 An Dương Vương, Phường Chợ Quán, TP.HCM</span>
//             </li>
//             <li className="flex items-center gap-3">
//               <Phone className="text-orange-500 w-5 h-5" />
//               <span>1234567890</span>
//             </li>
//             <li className="flex items-center gap-3">
//               <Mail className="text-orange-500 w-5 h-5" />
//               <span>info@smartbus.com</span>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Dòng bản quyền */}
//       <div className="text-center text-gray-500 text-sm mt-12 border-t border-gray-200 pt-6">
//         © {new Date().getFullYear()} SmartBus.
//       </div>
//     </footer>
//   );
// };

// export default Footer;
