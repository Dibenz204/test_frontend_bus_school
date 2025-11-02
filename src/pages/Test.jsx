// import React, { useEffect, useState } from "react";
// import "../styles/Test.css";
// import { getAllUsers } from "../services/userService";

// const Test = () => {
//     const [userBuffer, setuserBuffer] = useState([]);

//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const res = await getAllUsers("ALL");
//                 setuserBuffer(res.data.usser);
//                 console.log(res.data.usser);
//             } catch (e) {
//                 console.error("Error fetching users:", e);
//             }
//         };

//         fetchUser();
//     }, []);

//     return (
//         <div style={{ padding: "20px" }}>
//             <h2 style={{ marginBottom: "10px" }}>Danh sách người dùng</h2>

//             <h3> Tổng số quản trị: </h3>
//             <h3> Tổng số tài xế: </h3>
//             <h3 style={{ marginBottom: "20px" }}> Tổng số phụ huynh: </h3>

//             {userBuffer.length === 0 ? (
//                 <p>Đang tải dữ liệu...</p>
//             ) : (
//                 <table id="customers">
//                     <thead>
//                         <tr>
//                             <th>Mã user</th>
//                             <th>Tên</th>
//                             <th>Email</th>
//                             <th>SĐT</th>
//                             <th>Ngày sinh</th>
//                             <th>Vai trò</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {userBuffer.map((user, index) => (
//                             <tr key={index}>
//                                 <td>{user.id_user}</td>
//                                 <td>{user.name}</td>
//                                 <td>{user.email}</td>
//                                 <td>{user.phone}</td>
//                                 <td>{user.birthday}</td>
//                                 <td>{user.role}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// };

// export default Test;
import React, { useEffect, useState } from "react";
import "../styles/Test.css";
import { getAllUsers, getUserCountByRole } from "../services/userService";

const Test = () => {
    const [userBuffer, setUserBuffer] = useState([]);
    const [roleCount, setRoleCount] = useState({
        "Quản trị viên": 0,
        "Tài xế": 0,
        "Phụ huynh": 0,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getAllUsers("ALL");
                setUserBuffer(res.data.usser);
                console.log(res.data.usser);          // Dùng để trả dữ liệu trên console (F12)
            } catch (e) {
                console.error("Error fetching users:", e);
            }
        };

        const fetchRoleCount = async () => {
            try {
                const res = await getUserCountByRole();
                const roleData = res.data.data;

                // chuyển mảng [{role: "...", count: n}, ...] -> object
                const roleMap = {
                    "Quản trị viên": 0,
                    "Tài xế": 0,
                    "Phụ huynh": 0,
                };
                roleData.forEach(r => {
                    roleMap[r.role] = r.count;
                });
                setRoleCount(roleMap);
            } catch (e) {
                console.error("Error fetching role count:", e);
            }
        };

        fetchUser();
        fetchRoleCount();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2 style={{ marginBottom: "10px" }}>Danh sách người dùng</h2>

            <div style={{ marginBottom: "20px" }}>
                <h3> Tổng số quản trị: {roleCount["Quản trị viên"]}</h3>
                <h3> Tổng số tài xế: {roleCount["Tài xế"]}</h3>
                <h3> Tổng số phụ huynh: {roleCount["Phụ huynh"]}</h3>
            </div>

            {userBuffer.length === 0 ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <table id="customers">
                    <thead>
                        <tr>
                            <th>Mã user</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>SĐT</th>
                            <th>Ngày sinh</th>
                            <th>Vai trò</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userBuffer.map((user, index) => (
                            <tr key={index}>
                                <td>{user.id_user}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.birthday}</td>
                                <td>{user.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Test;
