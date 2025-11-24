import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

const SimpleQRScanner = ({ onScan, disabled = false }) => {
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
                    Camera tạm dừng - Vui lòng xác nhận phụ huynh trước
                </div>
            )}
        </div>
    );
};

export default SimpleQRScanner;

// import React, { useEffect, useRef, useState } from "react";
// import { BrowserMultiFormatReader } from "@zxing/library";

// const QRScanner = ({ onScan, onError, disabled = false }) => {
//     const videoRef = useRef(null);
//     const codeReader = useRef(null);
//     const [isScanning, setIsScanning] = useState(false);
//     const [lastScannedCode, setLastScannedCode] = useState("");

//     useEffect(() => {
//         if (disabled) return;

//         codeReader.current = new BrowserMultiFormatReader();
//         setIsScanning(true);

//         if (videoRef.current) {
//             codeReader.current.decodeFromVideoDevice(
//                 null,
//                 videoRef.current,
//                 (result, err) => {
//                     if (result) {
//                         const code = result.getText();

//                         // Tránh scan cùng 1 mã liên tục
//                         if (code !== lastScannedCode) {
//                             setLastScannedCode(code);
//                             onScan(code);
//                         }
//                     }
//                     if (err && !(err.name === "NotFoundException")) {
//                         console.error("QR Scan Error:", err);
//                         onError(err);
//                     }
//                 }
//             );
//         }

//         return () => {
//             if (codeReader.current) {
//                 codeReader.current.reset();
//                 setIsScanning(false);
//             }
//         };
//     }, [disabled, lastScannedCode, onScan, onError]);

//     const startScanner = () => {
//         if (codeReader.current && videoRef.current && !disabled) {
//             setIsScanning(true);
//         }
//     };

//     const stopScanner = () => {
//         if (codeReader.current) {
//             codeReader.current.reset();
//             setIsScanning(false);
//         }
//     };

//     return (
//         <div className="qr-scanner-container">
//             <div className="scanner-view">
//                 <video
//                     ref={videoRef}
//                     className={`border-2 border-orange-400 rounded-xl w-full max-w-[300px] h-[220px] ${disabled ? 'opacity-50' : ''}`}
//                 />
//                 {disabled && (
//                     <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center rounded-xl">
//                         <p className="text-gray-600 font-medium">Camera tạm dừng</p>
//                     </div>
//                 )}
//             </div>

//             <div className="scanner-controls mt-3 flex gap-2">
//                 <button
//                     onClick={startScanner}
//                     disabled={disabled}
//                     className="bg-green-500 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300"
//                 >
//                     ▶️ Bật quét
//                 </button>
//                 <button
//                     onClick={stopScanner}
//                     className="bg-red-500 text-white px-3 py-1 rounded text-sm"
//                 >
//                     ⏸️ Dừng quét
//                 </button>
//             </div>

//             {isScanning && !disabled && (
//                 <p className="text-sm text-green-600 mt-2">
//                     📷 Đang quét mã QR...
//                 </p>
//             )}
//         </div>
//     );
// };

// export default QRScanner;