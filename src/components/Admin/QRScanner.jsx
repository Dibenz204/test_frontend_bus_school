import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useTranslation } from "react-i18next";

const SimpleQRScanner = ({ onScan, disabled = false }) => {
    const { t } = useTranslation();
    const videoRef = useRef(null);
    const codeReader = useRef(null);

    useEffect(() => {
        if (disabled) return;

        codeReader.current = new BrowserMultiFormatReader();

        if (videoRef.current) {
            codeReader.current.decodeFromVideoDevice(
                null,
                videoRef.current,
                (result, err) => {
                    if (result) {
                        const code = result.getText();
                        if (onScan) onScan(code);
                    }
                }
            );
        }

        return () => {
            if (codeReader.current) {
                codeReader.current.reset();
            }
        };
    }, [disabled, onScan]);

    return (
        <div className="qr-scanner">
            <video
                ref={videoRef}
                className={`border-2 border-orange-400 rounded-xl w-full max-w-[300px] h-[220px] ${disabled ? 'opacity-50' : ''}`}
            />
            {disabled && (
                <div className="text-center mt-2 text-gray-500">
                    {t("qr_scanner.camera_paused")}
                </div>
            )}
        </div>
    );
};

export default SimpleQRScanner;

// import React, { useEffect, useRef, useState } from "react";
// import { BrowserMultiFormatReader } from "@zxing/library";

// const SimpleQRScanner = ({ onScan, disabled = false }) => {
//     const videoRef = useRef(null);
//     const codeReader = useRef(null);

//     useEffect(() => {
//         if (disabled) return;

//         codeReader.current = new BrowserMultiFormatReader();

//         if (videoRef.current) {
//             codeReader.current.decodeFromVideoDevice(
//                 null,
//                 videoRef.current,
//                 (result, err) => {
//                     if (result) {
//                         const code = result.getText();
//                         if (onScan) onScan(code);
//                     }
//                 }
//             );
//         }

//         return () => {
//             if (codeReader.current) {
//                 codeReader.current.reset();
//             }
//         };
//     }, [disabled, onScan]);

//     return (
//         <div className="qr-scanner">
//             <video
//                 ref={videoRef}
//                 className={`border-2 border-orange-400 rounded-xl w-full max-w-[300px] h-[220px] ${disabled ? 'opacity-50' : ''}`}
//             />
//             {disabled && (
//                 <div className="text-center mt-2 text-gray-500">
//                     Camera tạm dừng - Vui lòng xác nhận phụ huynh trước
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SimpleQRScanner;
