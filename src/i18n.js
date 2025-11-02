import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./translate/vi.json";
import en from "./translate/en.json";

// Lấy ngôn ngữ từ localStorage, nếu không có thì dùng "vi"
const savedLanguage = localStorage.getItem("language") || "vi";

i18n.use(initReactI18next).init({
    resources: {
        vi: { translation: vi },
        en: { translation: en },
    },
    lng: savedLanguage, // Dùng ngôn ngữ đã lưu
    fallbackLng: "vi",
    interpolation: {
        escapeValue: false,
    },
});

// Lắng nghe sự kiện thay đổi ngôn ngữ và lưu vào localStorage
i18n.on("languageChanged", (lng) => {
    localStorage.setItem("language", lng);
});

export default i18n;