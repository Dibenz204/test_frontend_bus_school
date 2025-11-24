import React, { useEffect, useState } from "react";
import { getAllStudent, createNewStudent, deleteStudent, updateStudent } from "../../services/studentService";
import { getUserByRole, getUserByPhone } from "../../services/userService"; // Cần thêm API getUserByPhone
import QRScanner from "./QRScanner"; // Component QR scanner riêng
import "../../styles/StudentManagement.css";

const StudentManagement = () => {
    const [activeTab, setActiveTab] = useState("view");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [busStops, setBusStops] = useState([]);

    // State cho form thêm học sinh
    const [parentPhone, setParentPhone] = useState("");
    const [parentInfo, setParentInfo] = useState(null);
    const [parentVerified, setParentVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        class: "",
        gender: "Nam",
        address_route: "",
        mssv: "",
        id_user: "",
        id_busstop: ""
    });

    // Fetch students khi tab thay đổi
    useEffect(() => {
        if (activeTab === "view") {
            fetchStudents();
        } else if (activeTab === "add") {
            // Reset form khi chuyển sang tab thêm
            resetAddForm();
        }
    }, [activeTab]);

    // Reset form thêm học sinh
    const resetAddForm = () => {
        setParentPhone("");
        setParentInfo(null);
        setParentVerified(false);
        setVerifying(false);
        setFormData({
            name: "",
            class: "",
            gender: "Nam",
            address_route: "",
            mssv: "",
            id_user: "",
            id_busstop: ""
        });
    };

    // Lấy danh sách students
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await getAllStudent("ALL");
            console.log("API Response:", res);

            if (res.data && Array.isArray(res.data.students)) {
                setStudents(res.data.students);
            } else if (res.data && Array.isArray(res.data.data)) {
                setStudents(res.data.data);
            } else {
                console.warn("Unexpected response structure:", res.data);
                setStudents([]);
            }
        } catch (e) {
            console.error("Error fetching students:", e);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    // Xác nhận số điện thoại phụ huynh
    const verifyParentPhone = async () => {
        if (!parentPhone.trim()) {
            alert("Vui lòng nhập số điện thoại phụ huynh");
            return;
        }

        setVerifying(true);
        try {
            // Giả sử có API getUserByPhone
            const res = await getUserByPhone(parentPhone);

            if (res.data && res.data.users && res.data.users.length > 0) {
                const user = res.data.users[0];

                // Kiểm tra có phải phụ huynh không
                if (user.role === "Phụ huynh") {
                    setParentInfo(user);
                    setParentVerified(true);

                    // Tự động điền id_user và address_route
                    setFormData(prev => ({
                        ...prev,
                        id_user: user.id_user,
                        address_route: user.address || ""
                    }));

                    alert(`✅ Xác nhận thành công! Phụ huynh: ${user.name}`);
                } else {
                    alert("❌ Số điện thoại này không thuộc về phụ huynh!");
                }
            } else {
                alert("❌ Không tìm thấy phụ huynh với số điện thoại này!");
            }
        } catch (error) {
            console.error("Error verifying parent:", error);
            alert("❌ Lỗi khi xác nhận số điện thoại!");
        } finally {
            setVerifying(false);
        }
    };

    // Xử lý quét QR code
    const handleQRScan = (qrCode) => {
        if (parentVerified) {
            setFormData(prev => ({
                ...prev,
                mssv: qrCode
            }));
            alert(`✅ Đã quét mã QR: ${qrCode}`);
        } else {
            alert("⚠️ Vui lòng xác nhận số điện thoại phụ huynh trước!");
        }
    };

    // Xử lý lỗi quét QR
    const handleQRError = (error) => {
        console.error("QR Scanner Error:", error);
    };

    // Xử lý thay đổi form input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Xử lý submit form thêm student
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!parentVerified) {
            alert("⚠️ Vui lòng xác nhận số điện thoại phụ huynh trước!");
            return;
        }

        try {
            await createNewStudent(formData);
            alert("Thêm học sinh thành công!");

            // Reset form
            resetAddForm();

            // Refresh data và chuyển về tab xem
            fetchStudents();
            setActiveTab("view");
        } catch (error) {
            console.error("Error creating student:", error);
            alert("Có lỗi xảy ra khi thêm học sinh!");
        }
    };

    // Xử lý xóa student
    const handleDeleteStudent = async (studentId, studentName) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}"?`)) {
            try {
                await deleteStudent(studentId);
                alert("Xóa học sinh thành công!");
                fetchStudents();
            } catch (error) {
                console.error("Error deleting student:", error);
                alert("Có lỗi xảy ra khi xóa học sinh!");
            }
        }
    };

    // Mở modal chỉnh sửa
    const handleEditClick = (student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name || "",
            class: student.class || "",
            gender: student.gender || "Nam",
            address_route: student.address_route || "",
            mssv: student.mssv || "",
            id_user: student.id_user || "",
            id_busstop: student.id_busstop || ""
        });
        setShowEditModal(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingStudent(null);
    };

    // Xử lý cập nhật student
    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            await updateStudent({
                id_student: editingStudent.id_student,
                name: formData.name,
                class: formData.class,
                id_busstop: formData.id_busstop,
                gender: editingStudent.gender,
                address_route: editingStudent.address_route,
                mssv: editingStudent.mssv,
                id_user: editingStudent.id_user
            });
            alert("Cập nhật học sinh thành công!");
            handleCloseModal();
            fetchStudents();
        } catch (error) {
            console.error("Error updating student:", error);
            alert("Có lỗi xảy ra khi cập nhật học sinh!");
        }
    };

    // Render nội dung theo tab
    const renderRightContent = () => {
        switch (activeTab) {
            case "view":
                return renderViewTab();
            case "add":
                return renderAddTab();
            default:
                return null;
        }
    };

    // Tab xem danh sách
    const renderViewTab = () => {
        return (
            <div>
                {loading ? (
                    <div className="loading-text">Đang tải dữ liệu...</div>
                ) : !Array.isArray(students) || students.length === 0 ? (
                    <div className="empty-text">Không có dữ liệu học sinh</div>
                ) : (
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th style={{ width: '20%' }}>Tên học sinh</th>
                                <th style={{ width: '15%' }}>Tên phụ huynh</th>
                                <th style={{ width: '10%' }}>Lớp</th>
                                <th style={{ width: '15%' }}>Trạm xe</th>
                                <th style={{ width: '15%' }}>MSSV</th>
                                <th style={{ width: '15%' }}>Giới tính</th>
                                <th style={{ width: '10%' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.name}</td>
                                    <td>{student.user?.name || "N/A"}</td>
                                    <td>{student.class}</td>
                                    <td>{student.busstop?.name_station || "N/A"}</td>
                                    <td>{student.mssv}</td>
                                    <td>{student.gender}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleEditClick(student)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteStudent(student.id_student, student.name)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    // Tab thêm student
    const renderAddTab = () => {
        return (
            <div className="form-container">
                <h3 className="form-title">Thêm học sinh mới</h3>

                {/* Bước 1: Xác nhận phụ huynh */}
                <div className="parent-verification-section mb-6 p-4 border border-gray-300 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3">1. Xác nhận thông tin phụ huynh</h4>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label className="form-label">Số điện thoại phụ huynh</label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    value={parentPhone}
                                    onChange={(e) => setParentPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại phụ huynh"
                                    className="form-input flex-1"
                                    disabled={parentVerified}
                                />
                                <button
                                    type="button"
                                    onClick={verifyParentPhone}
                                    disabled={verifying || parentVerified}
                                    className="bg-orange-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                >
                                    {verifying ? "Đang xác nhận..." : parentVerified ? "✅ Đã xác nhận" : "Xác nhận"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {parentInfo && (
                        <div className="parent-info mt-3 p-3 bg-green-50 rounded border border-green-200">
                            <p className="text-green-700">
                                <strong>Thông tin phụ huynh:</strong> {parentInfo.name} |
                                <strong> SĐT:</strong> {parentInfo.phone} |
                                <strong> Email:</strong> {parentInfo.email}
                            </p>
                            <p className="text-green-600 text-sm mt-1">
                                <strong>Địa chỉ:</strong> {parentInfo.address || "Chưa cập nhật"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Bước 2: Thông tin học sinh (chỉ enabled khi đã xác nhận phụ huynh) */}
                <div className={`student-info-section ${!parentVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h4 className="text-lg font-semibold mb-3">2. Thông tin học sinh</h4>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Tên học sinh</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên học sinh"
                                    required
                                    className="form-input"
                                    disabled={!parentVerified}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Lớp</label>
                                <input
                                    type="text"
                                    name="class"
                                    value={formData.class}
                                    onChange={handleInputChange}
                                    placeholder="Nhập lớp"
                                    required
                                    className="form-input"
                                    disabled={!parentVerified}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">MSSV (Mã QR)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="mssv"
                                        value={formData.mssv}
                                        onChange={handleInputChange}
                                        placeholder="Nhập MSSV hoặc quét QR"
                                        required
                                        className="form-input flex-1"
                                        disabled={!parentVerified}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Có thể nhập tay hoặc quét QR code bên dưới
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Giới tính</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    disabled={!parentVerified}
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Mã Trạm xe</label>
                                <input
                                    type="text"
                                    name="id_busstop"
                                    value={formData.id_busstop}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mã trạm xe"
                                    className="form-input"
                                    disabled={!parentVerified}
                                />
                            </div>
                        </div>

                        {/* QR Scanner */}
                        <div className="qr-section mt-4 p-4 border border-gray-300 rounded-lg">
                            <h5 className="font-semibold mb-3">Quét mã QR học sinh</h5>
                            <QRScanner
                                onScan={handleQRScan}
                                onError={handleQRError}
                                disabled={!parentVerified}
                            />
                        </div>

                        <div className="form-actions mt-6">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={!parentVerified}
                            >
                                Thêm học sinh
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Modal chỉnh sửa (giữ nguyên)
    const renderEditModal = () => {
        if (!showEditModal || !editingStudent) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Chỉnh sửa học sinh</h3>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                    </div>

                    <form onSubmit={handleUpdateStudent}>
                        <div className="modal-body">
                            {/* ... giữ nguyên modal edit ... */}
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                                Hủy
                            </button>
                            <button type="submit" className="submit-btn">
                                Cập nhật
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="student-management-container">
            {/* LEFT PANEL */}
            <div className="left-panel">
                <div className="section">
                    <span className="section-label">Chức năng:</span>
                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeTab === "view" ? "active" : ""}`}
                            onClick={() => setActiveTab("view")}
                        >
                            👁️ Xem
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
                            onClick={() => setActiveTab("add")}
                        >
                            ➕ Thêm
                        </button>
                    </div>
                </div>

                <div className="stats-container">
                    <h3 className="stats-title">Thống kê học sinh</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">{students.length}</span>
                            <span className="stat-label">Tổng số HS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">
                {renderRightContent()}
            </div>

            {/* MODAL CHỈNH SỬA */}
            {renderEditModal()}
        </div>
    );
};

export default StudentManagement;

// import React, { useEffect, useState } from "react";
// import { getAllStudent, createNewStudent, deleteStudent, updateStudent } from "../../services/studentService";
// import "../../styles/StudentManagement.css";

// const StudentManagement = () => {
//     const [activeTab, setActiveTab] = useState("view");
//     const [students, setStudents] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [editingStudent, setEditingStudent] = useState(null);
//     const [busStops, setBusStops] = useState([]); // Danh sách trạm xe

//     // Form state
//     const [formData, setFormData] = useState({
//         name: "",
//         class: "",
//         gender: "Nam",
//         address_route: "",
//         mssv: "",
//         id_user: "",
//         id_busstop: ""
//     });

//     // Fetch students khi tab thay đổi
//     useEffect(() => {
//         if (activeTab === "view") {
//             fetchStudents();
//         }
//     }, [activeTab]);

//     // Lấy danh sách students
//     const fetchStudents = async () => {
//         setLoading(true);
//         try {
//             const res = await getAllStudent("ALL");
//             console.log("API Response:", res);

//             // Xử lý nhiều định dạng response
//             if (res.data && Array.isArray(res.data.students)) {
//                 setStudents(res.data.students);
//             } else if (res.data && Array.isArray(res.data.data)) {
//                 setStudents(res.data.data);
//             } else {
//                 console.warn("Unexpected response structure:", res.data);
//                 setStudents([]);
//             }
//         } catch (e) {
//             console.error("Error fetching students:", e);
//             setStudents([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Lấy danh sách trạm xe (giả sử có API để lấy)
//     const fetchBusStops = async () => {
//         try {
//             // Giả sử có API lấy danh sách trạm xe
//             // const res = await getBusStops();
//             // setBusStops(res.data);

//             // Tạm thời dùng mock data
//             setBusStops([
//                 { id_busstop: "BS001", name_station: "Trạm A - Trường THPT ABC" },
//                 { id_busstop: "BS002", name_station: "Trạm B - Siêu thị CoopMart" },
//                 { id_busstop: "BS003", name_station: "Trạm C - Công viên 23/9" },
//                 { id_busstop: "BS004", name_station: "Trạm D - Bến xe Miền Tây" }
//             ]);
//         } catch (e) {
//             console.error("Error fetching bus stops:", e);
//         }
//     };

//     // Xử lý thay đổi form input
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     // Xử lý submit form thêm student
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await createNewStudent(formData);
//             alert("Thêm học sinh thành công!");

//             // Reset form
//             setFormData({
//                 name: "",
//                 class: "",
//                 gender: "Nam",
//                 address_route: "",
//                 mssv: "",
//                 id_user: "",
//                 id_busstop: ""
//             });

//             // Refresh data
//             fetchStudents();
//         } catch (error) {
//             console.error("Error creating student:", error);
//             alert("Có lỗi xảy ra khi thêm học sinh!");
//         }
//     };

//     // Xử lý xóa student
//     const handleDeleteStudent = async (studentId, studentName) => {
//         if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${studentName}"?`)) {
//             try {
//                 await deleteStudent(studentId);
//                 alert("Xóa học sinh thành công!");
//                 fetchStudents();
//             } catch (error) {
//                 console.error("Error deleting student:", error);
//                 alert("Có lỗi xảy ra khi xóa học sinh!");
//             }
//         }
//     };

//     // Mở modal chỉnh sửa
//     const handleEditClick = (student) => {
//         setEditingStudent(student);
//         setFormData({
//             name: student.name || "",
//             class: student.class || "",
//             gender: student.gender || "Nam",
//             address_route: student.address_route || "",
//             mssv: student.mssv || "",
//             id_user: student.id_user || "",
//             id_busstop: student.id_busstop || ""
//         });
//         fetchBusStops(); // Lấy danh sách trạm xe khi mở modal
//         setShowEditModal(true);
//     };

//     // Đóng modal
//     const handleCloseModal = () => {
//         setShowEditModal(false);
//         setEditingStudent(null);
//     };

//     // Xử lý cập nhật student
//     const handleUpdateStudent = async (e) => {
//         e.preventDefault();
//         try {
//             await updateStudent({
//                 id_student: editingStudent.id_student,
//                 name: formData.name,
//                 class: formData.class,
//                 id_busstop: formData.id_busstop,
//                 // Giữ nguyên các trường khác
//                 gender: editingStudent.gender,
//                 address_route: editingStudent.address_route,
//                 mssv: editingStudent.mssv,
//                 id_user: editingStudent.id_user
//             });
//             alert("Cập nhật học sinh thành công!");
//             handleCloseModal();
//             fetchStudents();
//         } catch (error) {
//             console.error("Error updating student:", error);
//             alert("Có lỗi xảy ra khi cập nhật học sinh!");
//         }
//     };

//     // Render nội dung theo tab
//     const renderRightContent = () => {
//         switch (activeTab) {
//             case "view":
//                 return renderViewTab();
//             case "add":
//                 return renderAddTab();
//             default:
//                 return null;
//         }
//     };

//     // Tab xem danh sách
//     const renderViewTab = () => {
//         return (
//             <div>
//                 {loading ? (
//                     <div className="loading-text">Đang tải dữ liệu...</div>
//                 ) : !Array.isArray(students) || students.length === 0 ? (
//                     <div className="empty-text">Không có dữ liệu học sinh</div>
//                 ) : (
//                     <table className="student-table">
//                         <thead>
//                             <tr>
//                                 <th style={{ width: '20%' }}>Tên học sinh</th>
//                                 <th style={{ width: '15%' }}>Tên phụ huynh</th>
//                                 <th style={{ width: '10%' }}>Lớp</th>
//                                 <th style={{ width: '15%' }}>Trạm xe</th>
//                                 <th style={{ width: '15%' }}>MSSV</th>
//                                 <th style={{ width: '15%' }}>Giới tính</th>
//                                 <th style={{ width: '10%' }}>Thao tác</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {students.map((student, index) => (
//                                 <tr key={index}>
//                                     <td>{student.name}</td>
//                                     <td>{student.user?.name || "N/A"}</td>
//                                     <td>{student.class}</td>
//                                     <td>{student.busstop?.name_station || "N/A"}</td>
//                                     <td>{student.mssv}</td>
//                                     <td>{student.gender}</td>
//                                     <td>
//                                         <div className="action-buttons">
//                                             <button
//                                                 className="edit-btn"
//                                                 onClick={() => handleEditClick(student)}
//                                             >
//                                                 Sửa
//                                             </button>
//                                             <button
//                                                 className="delete-btn"
//                                                 onClick={() => handleDeleteStudent(student.id_student, student.name)}
//                                             >
//                                                 Xóa
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//         );
//     };

//     // Tab thêm student
//     const renderAddTab = () => {
//         return (
//             <div className="form-container">
//                 <h3 className="form-title">Thêm học sinh mới</h3>

//                 <form onSubmit={handleSubmit}>
//                     <div className="form-row">
//                         <div className="form-group">
//                             <label className="form-label">Tên học sinh</label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={formData.name}
//                                 onChange={handleInputChange}
//                                 placeholder="Nhập tên học sinh"
//                                 required
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Lớp</label>
//                             <input
//                                 type="text"
//                                 name="class"
//                                 value={formData.class}
//                                 onChange={handleInputChange}
//                                 placeholder="Nhập lớp"
//                                 required
//                                 className="form-input"
//                             />
//                         </div>
//                     </div>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label className="form-label">MSSV</label>
//                             <input
//                                 type="text"
//                                 name="mssv"
//                                 value={formData.mssv}
//                                 onChange={handleInputChange}
//                                 placeholder="Nhập MSSV"
//                                 required
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Giới tính</label>
//                             <select
//                                 name="gender"
//                                 value={formData.gender}
//                                 onChange={handleInputChange}
//                                 className="form-select"
//                             >
//                                 <option value="Nam">Nam</option>
//                                 <option value="Nữ">Nữ</option>
//                                 <option value="Khác">Khác</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label className="form-label">Mã User</label>
//                             <input
//                                 type="text"
//                                 name="id_user"
//                                 value={formData.id_user}
//                                 onChange={handleInputChange}
//                                 placeholder="Nhập mã user"
//                                 required
//                                 className="form-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">Mã Trạm xe</label>
//                             <input
//                                 type="text"
//                                 name="id_busstop"
//                                 value={formData.id_busstop}
//                                 onChange={handleInputChange}
//                                 placeholder="Nhập mã trạm xe"
//                                 className="form-input"
//                             />
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label">Địa chỉ tuyến đường</label>
//                         <input
//                             type="text"
//                             name="address_route"
//                             value={formData.address_route}
//                             onChange={handleInputChange}
//                             placeholder="Nhập địa chỉ tuyến đường"
//                             className="form-input"
//                         />
//                     </div>

//                     <div className="form-actions">
//                         <button type="submit" className="submit-btn">
//                             Thêm học sinh
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         );
//     };

//     // Modal chỉnh sửa
//     const renderEditModal = () => {
//         if (!showEditModal || !editingStudent) return null;

//         return (
//             <div className="modal-overlay">
//                 <div className="modal-content">
//                     <div className="modal-header">
//                         <h3 className="modal-title">Chỉnh sửa học sinh</h3>
//                         <button className="modal-close" onClick={handleCloseModal}>×</button>
//                     </div>

//                     <form onSubmit={handleUpdateStudent}>
//                         <div className="modal-body">
//                             <div className="form-row">
//                                 <div className="form-group">
//                                     <label className="form-label">Tên học sinh</label>
//                                     <input
//                                         type="text"
//                                         name="name"
//                                         value={formData.name}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="form-input"
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label className="form-label">Lớp</label>
//                                     <input
//                                         type="text"
//                                         name="class"
//                                         value={formData.class}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="form-input"
//                                     />
//                                 </div>
//                             </div>

//                             <div className="form-row">
//                                 <div className="form-group">
//                                     <label className="form-label">Tên phụ huynh</label>
//                                     <input
//                                         type="text"
//                                         value={editingStudent.user?.name || "N/A"}
//                                         disabled
//                                         className="form-input disabled"
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label className="form-label">Giới tính</label>
//                                     <input
//                                         type="text"
//                                         value={editingStudent.gender}
//                                         disabled
//                                         className="form-input disabled"
//                                     />
//                                 </div>
//                             </div>

//                             <div className="form-row">
//                                 <div className="form-group">
//                                     <label className="form-label">MSSV</label>
//                                     <input
//                                         type="text"
//                                         value={editingStudent.mssv}
//                                         disabled
//                                         className="form-input disabled"
//                                     />
//                                 </div>

//                                 <div className="form-group">
//                                     <label className="form-label">Trạm xe</label>
//                                     <select
//                                         name="id_busstop"
//                                         value={formData.id_busstop}
//                                         onChange={handleInputChange}
//                                         className="form-select"
//                                     >
//                                         <option value="">Chọn trạm xe</option>
//                                         {busStops.map(busStop => (
//                                             <option key={busStop.id_busstop} value={busStop.id_busstop}>
//                                                 {busStop.name_station}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="modal-actions">
//                             <button type="button" className="cancel-btn" onClick={handleCloseModal}>
//                                 Hủy
//                             </button>
//                             <button type="submit" className="submit-btn">
//                                 Cập nhật
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="student-management-container">
//             {/* LEFT PANEL */}
//             <div className="left-panel">
//                 {/* Section 1: Chức năng */}
//                 <div className="section">
//                     <span className="section-label">Chức năng:</span>
//                     <div className="tab-navigation">
//                         <button
//                             className={`tab-btn ${activeTab === "view" ? "active" : ""}`}
//                             onClick={() => setActiveTab("view")}
//                         >
//                             👁️ Xem
//                         </button>
//                         <button
//                             className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
//                             onClick={() => setActiveTab("add")}
//                         >
//                             ➕ Thêm
//                         </button>
//                     </div>
//                 </div>

//                 {/* Section 2: Thống kê */}
//                 <div className="stats-container">
//                     <h3 className="stats-title">Thống kê học sinh</h3>
//                     <div className="stats-grid">
//                         <div className="stat-item">
//                             <span className="stat-value">{students.length}</span>
//                             <span className="stat-label">Tổng số HS</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* RIGHT PANEL */}
//             <div className="right-panel">
//                 {renderRightContent()}
//             </div>

//             {/* MODAL CHỈNH SỬA */}
//             {renderEditModal()}
//         </div>
//     );
// };

// export default StudentManagement;
