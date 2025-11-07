// // import React from "react";

// // const DanhSachHocSinh = () => {
// //   const hocSinh = [
// //     {
// //       tenHocSinh: "Nguyễn Văn A",
// //       lop: "10A1",
// //       tram: "Trạm Nguyễn Trãi",
// //       trangThai: "Đang hoạt động",
// //     },
// //     {
// //       tenHocSinh: "Trần Thị B",
// //       lop: "11B2",
// //       tram: "Trạm Lê Lợi",
// //       trangThai: "Tạm ngưng",
// //     },
// //     {
// //       tenHocSinh: "Lê Văn C",
// //       lop: "10A3",
// //       tram: "Trạm Trần Hưng Đạo",
// //       trangThai: "Đang hoạt động",
// //     },
// //     {
// //       tenHocSinh: "Phạm Thị D",
// //       lop: "12C1",
// //       tram: "Trạm Hai Bà Trưng",
// //       trangThai: "Chờ xác nhận",
// //     },
// //   ];

// //   // Hàm đổi màu trạng thái
// //   const getTrangThaiColor = (status) => {
// //     switch (status) {
// //       case "Đang hoạt động":
// //         return "text-green-600";
// //       case "Tạm ngưng":
// //         return "text-red-600";
// //       case "Chờ xác nhận":
// //         return "text-yellow-600";
// //       default:
// //         return "text-gray-600";
// //     }
// //   };

// //   return (
// //     <div className="bg-white shadow-md rounded-2xl p-6">
// //       <h2 className="text-2xl font-bold text-orange-600 mb-4">
// //         🚌 Danh sách học sinh & trạm đón trả
// //       </h2>

// //       <div className="overflow-x-auto">
// //         <table className="min-w-full border border-gray-200 rounded-lg">
// //           <thead>
// //             <tr className="bg-orange-100 text-orange-800 text-left">
// //               <th className="py-3 px-4 border-b">Tên học sinh</th>
// //               <th className="py-3 px-4 border-b">Lớp</th>
// //               <th className="py-3 px-4 border-b">Trạm đón/trả</th>
// //               <th className="py-3 px-4 border-b">Trạng thái</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {hocSinh.map((hs, index) => (
// //               <tr
// //                 key={index}
// //                 className={`hover:bg-orange-50 transition ${
// //                   index % 2 === 0 ? "bg-white" : "bg-gray-50"
// //                 }`}
// //               >
// //                 <td className="py-3 px-4 border-b">{hs.tenHocSinh}</td>
// //                 <td className="py-3 px-4 border-b">{hs.lop}</td>
// //                 <td className="py-3 px-4 border-b">{hs.tram}</td>
// //                 <td
// //                   className={`py-3 px-4 border-b font-medium ${getTrangThaiColor(
// //                     hs.trangThai
// //                   )}`}
// //                 >
// //                   {hs.trangThai}
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       <p className="text-sm text-gray-500 mt-3 italic">
// //         👉 Lưu ý: Thông tin học sinh, trạm và trạng thái có thể thay đổi theo
// //         tuần.
// //       </p>
// //     </div>
// //   );
// // };

// // export default DanhSachHocSinh;

// import React, { useState } from "react";
// import { QrReader } from "react-qr-reader";

// const DanhSachHocSinh = () => {
//   const [maQuet, setMaQuet] = useState("");
//   const [hocSinh] = useState([
//     {
//       ma: "HS001",
//       tenHocSinh: "Nguyễn Văn A",
//       lop: "10A1",
//       tram: "Trạm Nguyễn Trãi",
//       trangThai: "Đang hoạt động",
//     },
//     {
//       ma: "HS002",
//       tenHocSinh: "Trần Thị B",
//       lop: "11B2",
//       tram: "Trạm Lê Lợi",
//       trangThai: "Tạm ngưng",
//     },
//     {
//       ma: "HS003",
//       tenHocSinh: "Lê Văn C",
//       lop: "10A3",
//       tram: "Trạm Trần Hưng Đạo",
//       trangThai: "Đang hoạt động",
//     },
//     {
//       ma: "HS004",
//       tenHocSinh: "Phạm Thị D",
//       lop: "12C1",
//       tram: "Trạm Hai Bà Trưng",
//       trangThai: "Chờ xác nhận",
//     },
//   ]);

//   const [hocSinhQuet, setHocSinhQuet] = useState(null);

//   const handleDecode = (result) => {
//     if (result) {
//       setMaQuet(result);
//       const found = hocSinh.find((hs) => hs.ma === result);
//       setHocSinhQuet(found || null);
//     }
//   };

//   const getTrangThaiColor = (status) => {
//     switch (status) {
//       case "Đang hoạt động":
//         return "text-green-600";
//       case "Tạm ngưng":
//         return "text-red-600";
//       case "Chờ xác nhận":
//         return "text-yellow-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   return (
//     <div className="bg-white shadow-md rounded-2xl p-6">
//       <h2 className="text-2xl font-bold text-orange-600 mb-6">
//         🧑‍🎓 Danh sách học sinh & quét mã vạch
//       </h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Cột trái - Danh sách học sinh */}
//         <div className="overflow-x-auto">
//           <table className="min-w-full border border-gray-200 rounded-lg">
//             <thead>
//               <tr className="bg-orange-100 text-orange-800 text-left">
//                 <th className="py-3 px-4 border-b">Mã học sinh</th>
//                 <th className="py-3 px-4 border-b">Tên học sinh</th>
//                 <th className="py-3 px-4 border-b">Lớp</th>
//                 <th className="py-3 px-4 border-b">Trạng thái</th>
//               </tr>
//             </thead>
//             <tbody>
//               {hocSinh.map((hs, index) => (
//                 <tr
//                   key={index}
//                   className={`hover:bg-orange-50 transition ${
//                     index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                   } ${
//                     hocSinhQuet?.ma === hs.ma ? "ring-2 ring-orange-400" : ""
//                   }`}
//                 >
//                   <td className="py-3 px-4 border-b">{hs.ma}</td>
//                   <td className="py-3 px-4 border-b">{hs.tenHocSinh}</td>
//                   <td className="py-3 px-4 border-b">{hs.lop}</td>
//                   <td
//                     className={`py-3 px-4 border-b font-medium ${getTrangThaiColor(
//                       hs.trangThai
//                     )}`}
//                   >
//                     {hs.trangThai}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Cột phải - Camera quét mã */}
//         <div className="flex flex-col items-center">
//           <h3 className="text-lg font-semibold mb-3 text-orange-700">
//             📷 Camera quét mã học sinh
//           </h3>

//           <div className="border-2 border-orange-400 rounded-xl overflow-hidden shadow-md w-[300px] h-[220px]">
//             <QrReader
//               onResult={(result, error) => {
//                 if (!!result) handleDecode(result.text);
//                 if (!!error) console.error(error);
//               }}
//               constraints={{ facingMode: "environment" }}
//               style={{ width: "100%", height: "100%" }}
//             />
//           </div>

//           {hocSinhQuet ? (
//             <div className="mt-4 text-center">
//               <p className="text-green-600 font-semibold">
//                 ✅ Đã nhận dạng: {hocSinhQuet.tenHocSinh}
//               </p>
//               <p className="text-gray-600 text-sm">
//                 Lớp: {hocSinhQuet.lop} - {hocSinhQuet.tram}
//               </p>
//             </div>
//           ) : maQuet ? (
//             <p className="text-red-600 mt-4">
//               ❌ Không tìm thấy học sinh có mã: {maQuet}
//             </p>
//           ) : (
//             <p className="text-gray-500 mt-4 italic">
//               Đưa mã vạch học sinh trước camera để quét...
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DanhSachHocSinh;

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

const DanhSachHocSinh = () => {
  const [hocSinhQuet, setHocSinhQuet] = useState(null);
  const [maQuet, setMaQuet] = useState("");
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  const hocSinh = [
    {
      ma: "HS001",
      tenHocSinh: "Nguyễn Văn A",
      lop: "10A1",
      tram: "Trạm Nguyễn Trãi",
      trangThai: "Đang hoạt động",
    },
    {
      ma: "HS002",
      tenHocSinh: "Trần Thị B",
      lop: "11B2",
      tram: "Trạm Lê Lợi",
      trangThai: "Tạm ngưng",
    },
    {
      ma: "HS003",
      tenHocSinh: "Lê Văn C",
      lop: "10A3",
      tram: "Trạm Trần Hưng Đạo",
      trangThai: "Đang hoạt động",
    },
    {
      ma: "HS004",
      tenHocSinh: "Phạm Thị D",
      lop: "12C1",
      tram: "Trạm Hai Bà Trưng",
      trangThai: "Chờ xác nhận",
    },
  ];

  const getTrangThaiColor = (status) => {
    switch (status) {
      case "Đang hoạt động":
        return "text-green-600";
      case "Tạm ngưng":
        return "text-red-600";
      case "Chờ xác nhận":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    if (videoRef.current) {
      codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText();
            setMaQuet(code);

            const found = hocSinh.find((hs) => hs.ma === code);
            setHocSinhQuet(found || null);
          }
          if (err && !(err.name === "NotFoundException")) {
            console.error(err);
          }
        }
      );
    }

    return () => {
      codeReader.current.reset();
    };
  }, []);

  return (
    <div className="bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">
        🧑‍🎓 Danh sách học sinh & quét mã vạch
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái - Danh sách học sinh */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-orange-100 text-orange-800 text-left">
                <th className="py-3 px-4 border-b">Mã học sinh</th>
                <th className="py-3 px-4 border-b">Tên học sinh</th>
                <th className="py-3 px-4 border-b">Lớp</th>
                <th className="py-3 px-4 border-b">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {hocSinh.map((hs, index) => (
                <tr
                  key={index}
                  className={`hover:bg-orange-50 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } ${
                    hocSinhQuet?.ma === hs.ma ? "ring-2 ring-orange-400" : ""
                  }`}
                >
                  <td className="py-3 px-4 border-b">{hs.ma}</td>
                  <td className="py-3 px-4 border-b">{hs.tenHocSinh}</td>
                  <td className="py-3 px-4 border-b">{hs.lop}</td>
                  <td
                    className={`py-3 px-4 border-b font-medium ${getTrangThaiColor(
                      hs.trangThai
                    )}`}
                  >
                    {hs.trangThai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cột phải - Camera quét mã */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-3 text-orange-700">
            📷 Camera quét mã học sinh
          </h3>
          <video
            ref={videoRef}
            className="border-2 border-orange-400 rounded-xl w-[300px] h-[220px]"
          />
          {hocSinhQuet ? (
            <div className="mt-4 text-center">
              <p className="text-green-600 font-semibold">
                ✅ Đã nhận dạng: {hocSinhQuet.tenHocSinh}
              </p>
              <p className="text-gray-600 text-sm">
                Lớp: {hocSinhQuet.lop} - {hocSinhQuet.tram}
              </p>
            </div>
          ) : maQuet ? (
            <p className="text-red-600 mt-4">
              ❌ Không tìm thấy học sinh có mã: {maQuet}
            </p>
          ) : (
            <p className="text-gray-500 mt-4 italic">
              Đưa mã vạch học sinh trước camera để quét...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DanhSachHocSinh;
