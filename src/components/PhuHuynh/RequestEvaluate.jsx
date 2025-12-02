import React, { useState, useEffect } from "react";
import { getRequestsByParent, createNewRequest, updateRequest } from "../../services/requestService";
import { getEvaluatesByParent, createNewEvaluate, updateEvaluate } from "../../services/evaluateService";
import { getStudentsByParent } from "../../services/studentService";
import { getAllSchedules } from "../../services/scheduleService";
import { useTranslation } from "react-i18next";
import "../../styles/RequestEvaluate.css";

const RequestEvaluate = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("request");
    const [currentUser, setCurrentUser] = useState(null);

    // Request states
    const [requests, setRequests] = useState([]);
    const [requestForm, setRequestForm] = useState({
        request_type: "Xe bus",
        content: ""
    });
    const [editingRequest, setEditingRequest] = useState(null);

    // Evaluate states
    const [evaluates, setEvaluates] = useState([]);
    const [evaluateForm, setEvaluateForm] = useState({
        id_schedule: "",
        star: 5,
        content: ""
    });
    const [editingEvaluate, setEditingEvaluate] = useState(null);

    // Data for forms
    const [students, setStudents] = useState([]);
    const [completedSchedules, setCompletedSchedules] = useState([]);

    const [loading, setLoading] = useState(false);

    // Lấy thông tin user từ localStorage
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setCurrentUser(userInfo);
    }, []);

    // Load data khi user thay đổi hoặc tab thay đổi
    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser, activeTab]);

    // Load tất cả data cần thiết
    const loadData = async () => {
        setLoading(true);
        try {
            // Load requests
            const requestsRes = await getRequestsByParent(currentUser.id_user);
            if (requestsRes.data.errCode === 0) {
                setRequests(requestsRes.data.data || []);
            }

            // Load evaluates
            const evaluatesRes = await getEvaluatesByParent(currentUser.id_user);
            if (evaluatesRes.data.errCode === 0) {
                setEvaluates(evaluatesRes.data.data || []);
            }

            // Load students của phụ huynh
            const studentsRes = await getStudentsByParent(currentUser.id_user);
            if (studentsRes.data.errCode === 0) {
                setStudents(studentsRes.data.students || []);
            }

            // Load schedules đã hoàn thành có học sinh của phụ huynh
            await loadCompletedSchedules();

        } catch (error) {
            console.error(t("request_evaluate.load_data_error"), error);
        } finally {
            setLoading(false);
        }
    };

    // Load schedules đã hoàn thành mà có học sinh của phụ huynh này
    const loadCompletedSchedules = async () => {
        try {
            const schedulesRes = await getAllSchedules('ALL', { status: 'Hoàn thành' });

            if (schedulesRes.data && Array.isArray(schedulesRes.data.data)) {
                const studentIds = students.map(student => student.id_student);

                const filteredSchedules = schedulesRes.data.data.filter(schedule => {
                    return schedule.students?.some(student =>
                        studentIds.includes(student.id_student)
                    );
                });

                setCompletedSchedules(filteredSchedules);
            }
        } catch (error) {
            console.error(t("request_evaluate.load_schedules_error"), error);
        }
    };

    // ========== REQUEST FUNCTIONS ==========
    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!requestForm.content.trim()) {
            alert(t("request_evaluate.enter_request_content"));
            return;
        }

        try {
            const requestData = {
                id_user: currentUser.id_user,
                request_type: requestForm.request_type,
                content: requestForm.content
            };

            const res = await createNewRequest(requestData);
            if (res.data.errCode === 0) {
                alert(t("request_evaluate.request_sent_success"));
                setRequestForm({ request_type: "Xe bus", content: "" });
                loadData();
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error(t("request_evaluate.send_request_error"), error);
            alert(t("request_evaluate.send_request_generic_error"));
        }
    };

    const handleRequestEdit = (request) => {
        setEditingRequest(request);
        setRequestForm({
            request_type: request.request_type,
            content: request.content
        });
    };

    const handleRequestUpdate = async (e) => {
        e.preventDefault();
        if (!requestForm.content.trim()) {
            alert(t("request_evaluate.enter_request_content"));
            return;
        }

        try {
            const updateData = {
                id_request: editingRequest.id_request,
                request_type: requestForm.request_type,
                content: requestForm.content
            };

            const res = await updateRequest(updateData);
            if (res.data.errCode === 0) {
                alert(t("request_evaluate.request_updated_success"));
                setEditingRequest(null);
                setRequestForm({ request_type: "Xe bus", content: "" });
                loadData();
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error(t("request_evaluate.update_request_error"), error);
            alert(t("request_evaluate.update_request_generic_error"));
        }
    };

    const cancelRequestEdit = () => {
        setEditingRequest(null);
        setRequestForm({ request_type: "Xe bus", content: "" });
    };

    // ========== EVALUATE FUNCTIONS ==========
    const handleEvaluateSubmit = async (e) => {
        e.preventDefault();
        if (!evaluateForm.id_schedule) {
            alert(t("request_evaluate.select_schedule"));
            return;
        }

        try {
            const evaluateData = {
                id_user: currentUser.id_user,
                id_schedule: evaluateForm.id_schedule,
                star: evaluateForm.star,
                content: evaluateForm.content
            };

            const res = await createNewEvaluate(evaluateData);
            if (res.data.errCode === 0) {
                alert(t("request_evaluate.evaluate_sent_success"));
                setEvaluateForm({ id_schedule: "", star: 5, content: "" });
                loadData();
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error(t("request_evaluate.send_evaluate_error"), error);
            alert(t("request_evaluate.send_evaluate_generic_error"));
        }
    };

    const handleEvaluateEdit = (evaluate) => {
        setEditingEvaluate(evaluate);
        setEvaluateForm({
            id_schedule: evaluate.id_schedule,
            star: evaluate.star,
            content: evaluate.content
        });
    };

    const handleEvaluateUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                id_evaluate: editingEvaluate.id_evaluate,
                star: evaluateForm.star,
                content: evaluateForm.content
            };

            const res = await updateEvaluate(updateData);
            if (res.data.errCode === 0) {
                alert(t("request_evaluate.evaluate_updated_success"));
                setEditingEvaluate(null);
                setEvaluateForm({ id_schedule: "", star: 5, content: "" });
                loadData();
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error(t("request_evaluate.update_evaluate_error"), error);
            alert(t("request_evaluate.update_evaluate_generic_error"));
        }
    };

    const cancelEvaluateEdit = () => {
        setEditingEvaluate(null);
        setEvaluateForm({ id_schedule: "", star: 5, content: "" });
    };

    // ========== RENDER FUNCTIONS ==========
    const renderRequestTab = () => (
        <div className="tab-content">
            <div className="form-section">
                <h3>{editingRequest ? t("request_evaluate.edit_request") : t("request_evaluate.send_new_request")}</h3>
                <form onSubmit={editingRequest ? handleRequestUpdate : handleRequestSubmit}>
                    <div className="form-group">
                        <label>{t("request_evaluate.request_type")}:</label>
                        <select
                            value={requestForm.request_type}
                            onChange={(e) => setRequestForm({ ...requestForm, request_type: e.target.value })}
                            className="form-input"
                        >
                            <option value="Xe bus">{t("request_evaluate.bus")}</option>
                            <option value="Trạm đón/trả">{t("request_evaluate.pickup_dropoff")}</option>
                            <option value="Tuyến đường">{t("request_evaluate.route")}</option>
                            <option value="Khác">{t("request_evaluate.other")}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t("request_evaluate.content")}:</label>
                        <textarea
                            value={requestForm.content}
                            onChange={(e) => setRequestForm({ ...requestForm, content: e.target.value })}
                            placeholder={t("request_evaluate.request_content_placeholder")}
                            rows="4"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-actions">
                        {editingRequest ? (
                            <>
                                <button type="submit" className="submit-btn">{t("request_evaluate.update")}</button>
                                <button type="button" onClick={cancelRequestEdit} className="cancel-btn">{t("request_evaluate.cancel")}</button>
                            </>
                        ) : (
                            <button type="submit" className="submit-btn">{t("request_evaluate.send_request")}</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="list-section">
                <h3>{t("request_evaluate.sent_requests")} ({requests.length})</h3>
                {loading ? (
                    <div className="loading">{t("request_evaluate.loading")}</div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">{t("request_evaluate.no_requests")}</div>
                ) : (
                    <div className="request-list">
                        {requests.map(request => (
                            <div key={request.id_request} className="request-item">
                                <div className="request-header">
                                    <span className={`request-type ${request.request_type.replace('/', '-')}`}>
                                        {request.request_type}
                                    </span>
                                    <span className="request-date">
                                        {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <div className="request-content">
                                    {request.content}
                                </div>
                                <div className="request-actions">
                                    <button
                                        onClick={() => handleRequestEdit(request)}
                                        className="edit-btn"
                                    >
                                        {t("request_evaluate.edit")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderEvaluateTab = () => (
        <div className="tab-content">
            <div className="form-section">
                <h3>{editingEvaluate ? t("request_evaluate.edit_evaluate") : t("request_evaluate.add_new_evaluate")}</h3>
                <form onSubmit={editingEvaluate ? handleEvaluateUpdate : handleEvaluateSubmit}>
                    <div className="form-group">
                        <label>{t("request_evaluate.select_schedule")}:</label>
                        <select
                            value={evaluateForm.id_schedule}
                            onChange={(e) => setEvaluateForm({ ...evaluateForm, id_schedule: e.target.value })}
                            className="form-input"
                            disabled={!!editingEvaluate}
                        >
                            <option value="">-- {t("request_evaluate.select_schedule")} --</option>
                            {completedSchedules.map(schedule => (
                                <option key={schedule.id_schedule} value={schedule.id_schedule}>
                                    {schedule.Sdate} - {schedule.Stime} - {schedule.routes?.name_street}
                                </option>
                            ))}
                        </select>
                        <small>{t("request_evaluate.schedule_hint")}</small>
                    </div>

                    <div className="form-group">
                        <label>{t("request_evaluate.rating")}:</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= evaluateForm.star ? 'active' : ''}`}
                                    onClick={() => setEvaluateForm({ ...evaluateForm, star })}
                                >
                                    ★
                                </button>
                            ))}
                            <span className="star-text">{evaluateForm.star} {t("request_evaluate.stars")}</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t("request_evaluate.comment")} ({t("request_evaluate.optional")}):</label>
                        <textarea
                            value={evaluateForm.content}
                            onChange={(e) => setEvaluateForm({ ...evaluateForm, content: e.target.value })}
                            placeholder={t("request_evaluate.comment_placeholder")}
                            rows="4"
                            className="form-input"
                        />
                    </div>

                    <div className="form-actions">
                        {editingEvaluate ? (
                            <>
                                <button type="submit" className="submit-btn">{t("request_evaluate.update")}</button>
                                <button type="button" onClick={cancelEvaluateEdit} className="cancel-btn">{t("request_evaluate.cancel")}</button>
                            </>
                        ) : (
                            <button type="submit" className="submit-btn">{t("request_evaluate.send_evaluate")}</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="list-section">
                <h3>{t("request_evaluate.sent_evaluates")} ({evaluates.length})</h3>
                {loading ? (
                    <div className="loading">{t("request_evaluate.loading")}</div>
                ) : evaluates.length === 0 ? (
                    <div className="empty-state">{t("request_evaluate.no_evaluates")}</div>
                ) : (
                    <div className="evaluate-list">
                        {evaluates.map(evaluate => (
                            <div key={evaluate.id_evaluate} className="evaluate-item">
                                <div className="evaluate-header">
                                    <div className="evaluate-info">
                                        <span className="evaluate-schedule">
                                            {evaluate.schedule?.Sdate} - {evaluate.schedule?.Stime}
                                        </span>
                                        <span className="evaluate-route">
                                            {evaluate.schedule?.routes?.name_street}
                                        </span>
                                    </div>
                                    <div className="evaluate-rating">
                                        <span className="stars">
                                            {'★'.repeat(evaluate.star)}{'☆'.repeat(5 - evaluate.star)}
                                        </span>
                                        <span className="evaluate-date">
                                            {new Date(evaluate.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                                {evaluate.content && (
                                    <div className="evaluate-content">
                                        {evaluate.content}
                                    </div>
                                )}
                                <div className="evaluate-actions">
                                    <button
                                        onClick={() => handleEvaluateEdit(evaluate)}
                                        className="edit-btn"
                                    >
                                        {t("request_evaluate.edit")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (!currentUser) {
        return <div className="loading">{t("request_evaluate.loading_user_info")}</div>;
    }

    return (
        <div className="request-evaluate-container">
            <div className="left-panel">
                <div className="section">
                    <span className="section-label">{t("request_evaluate.functions")}:</span>
                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeTab === "request" ? "active" : ""}`}
                            onClick={() => setActiveTab("request")}
                        >
                            📝 {t("request_evaluate.send_request")}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "evaluate" ? "active" : ""}`}
                            onClick={() => setActiveTab("evaluate")}
                        >
                            ⭐ {t("request_evaluate.evaluate")}
                        </button>
                    </div>
                </div>

                <div className="section">
                    <span className="section-label">{t("request_evaluate.information")}:</span>
                    <div className="user-info">
                        <p><strong>{t("request_evaluate.parent")}:</strong> {currentUser.name}</p>
                        <p><strong>{t("request_evaluate.request_count")}:</strong> {requests.length}</p>
                        <p><strong>{t("request_evaluate.evaluate_count")}:</strong> {evaluates.length}</p>
                        <p><strong>{t("request_evaluate.children_count")}:</strong> {students.length}</p>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                {activeTab === "request" ? renderRequestTab() : renderEvaluateTab()}
            </div>
        </div>
    );
};

export default RequestEvaluate;

// import React, { useState, useEffect } from "react";
// import { getRequestsByParent, createNewRequest, updateRequest } from "../../services/requestService";
// import { getEvaluatesByParent, createNewEvaluate, updateEvaluate } from "../../services/evaluateService";
// import { getStudentsByParent } from "../../services/studentService";
// import { getAllSchedules } from "../../services/scheduleService";
// import "../../styles/RequestEvaluate.css";

// const RequestEvaluate = () => {
//     const [activeTab, setActiveTab] = useState("request");
//     const [currentUser, setCurrentUser] = useState(null);

//     // Request states
//     const [requests, setRequests] = useState([]);
//     const [requestForm, setRequestForm] = useState({
//         request_type: "Xe bus",
//         content: ""
//     });
//     const [editingRequest, setEditingRequest] = useState(null);

//     // Evaluate states
//     const [evaluates, setEvaluates] = useState([]);
//     const [evaluateForm, setEvaluateForm] = useState({
//         id_schedule: "",
//         star: 5,
//         content: ""
//     });
//     const [editingEvaluate, setEditingEvaluate] = useState(null);

//     // Data for forms
//     const [students, setStudents] = useState([]);
//     const [completedSchedules, setCompletedSchedules] = useState([]);

//     const [loading, setLoading] = useState(false);

//     // Lấy thông tin user từ localStorage
//     useEffect(() => {
//         const userInfo = JSON.parse(localStorage.getItem("userInfo"));
//         setCurrentUser(userInfo);
//     }, []);

//     // Load data khi user thay đổi hoặc tab thay đổi
//     useEffect(() => {
//         if (currentUser) {
//             loadData();
//         }
//     }, [currentUser, activeTab]);

//     // Load tất cả data cần thiết
//     const loadData = async () => {
//         setLoading(true);
//         try {
//             // Load requests
//             const requestsRes = await getRequestsByParent(currentUser.id_user);
//             if (requestsRes.data.errCode === 0) {
//                 setRequests(requestsRes.data.data || []);
//             }

//             // Load evaluates
//             const evaluatesRes = await getEvaluatesByParent(currentUser.id_user);
//             if (evaluatesRes.data.errCode === 0) {
//                 setEvaluates(evaluatesRes.data.data || []);
//             }

//             // Load students của phụ huynh
//             const studentsRes = await getStudentsByParent(currentUser.id_user);
//             if (studentsRes.data.errCode === 0) {
//                 setStudents(studentsRes.data.students || []);
//             }

//             // Load schedules đã hoàn thành có học sinh của phụ huynh
//             await loadCompletedSchedules();

//         } catch (error) {
//             console.error("Lỗi load data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Load schedules đã hoàn thành mà có học sinh của phụ huynh này
//     const loadCompletedSchedules = async () => {
//         try {
//             const schedulesRes = await getAllSchedules('ALL', { status: 'Hoàn thành' });

//             if (schedulesRes.data && Array.isArray(schedulesRes.data.data)) {
//                 const studentIds = students.map(student => student.id_student);

//                 const filteredSchedules = schedulesRes.data.data.filter(schedule => {
//                     return schedule.students?.some(student =>
//                         studentIds.includes(student.id_student)
//                     );
//                 });

//                 setCompletedSchedules(filteredSchedules);
//             }
//         } catch (error) {
//             console.error("Lỗi load schedules:", error);
//         }
//     };

//     // ========== REQUEST FUNCTIONS ==========
//     const handleRequestSubmit = async (e) => {
//         e.preventDefault();
//         if (!requestForm.content.trim()) {
//             alert("Vui lòng nhập nội dung yêu cầu!");
//             return;
//         }

//         try {
//             const requestData = {
//                 id_user: currentUser.id_user,
//                 request_type: requestForm.request_type,
//                 content: requestForm.content
//             };

//             const res = await createNewRequest(requestData);
//             if (res.data.errCode === 0) {
//                 alert("Gửi yêu cầu thành công!");
//                 setRequestForm({ request_type: "Xe bus", content: "" });
//                 loadData();
//             } else {
//                 alert(res.data.message);
//             }
//         } catch (error) {
//             console.error("Lỗi gửi yêu cầu:", error);
//             alert("Lỗi khi gửi yêu cầu!");
//         }
//     };

//     const handleRequestEdit = (request) => {
//         setEditingRequest(request);
//         setRequestForm({
//             request_type: request.request_type,
//             content: request.content
//         });
//     };

//     const handleRequestUpdate = async (e) => {
//         e.preventDefault();
//         if (!requestForm.content.trim()) {
//             alert("Vui lòng nhập nội dung yêu cầu!");
//             return;
//         }

//         try {
//             const updateData = {
//                 id_request: editingRequest.id_request,
//                 request_type: requestForm.request_type,
//                 content: requestForm.content
//             };

//             const res = await updateRequest(updateData);
//             if (res.data.errCode === 0) {
//                 alert("Cập nhật yêu cầu thành công!");
//                 setEditingRequest(null);
//                 setRequestForm({ request_type: "Xe bus", content: "" });
//                 loadData();
//             } else {
//                 alert(res.data.message);
//             }
//         } catch (error) {
//             console.error("Lỗi cập nhật yêu cầu:", error);
//             alert("Lỗi khi cập nhật yêu cầu!");
//         }
//     };

//     const cancelRequestEdit = () => {
//         setEditingRequest(null);
//         setRequestForm({ request_type: "Xe bus", content: "" });
//     };

//     // ========== EVALUATE FUNCTIONS ==========
//     const handleEvaluateSubmit = async (e) => {
//         e.preventDefault();
//         if (!evaluateForm.id_schedule) {
//             alert("Vui lòng chọn lịch trình!");
//             return;
//         }

//         try {
//             const evaluateData = {
//                 id_user: currentUser.id_user,
//                 id_schedule: evaluateForm.id_schedule,
//                 star: evaluateForm.star,
//                 content: evaluateForm.content
//             };

//             const res = await createNewEvaluate(evaluateData);
//             if (res.data.errCode === 0) {
//                 alert("Đánh giá thành công!");
//                 setEvaluateForm({ id_schedule: "", star: 5, content: "" });
//                 loadData();
//             } else {
//                 alert(res.data.message);
//             }
//         } catch (error) {
//             console.error("Lỗi gửi đánh giá:", error);
//             alert("Lỗi khi gửi đánh giá!");
//         }
//     };

//     const handleEvaluateEdit = (evaluate) => {
//         setEditingEvaluate(evaluate);
//         setEvaluateForm({
//             id_schedule: evaluate.id_schedule,
//             star: evaluate.star,
//             content: evaluate.content
//         });
//     };

//     const handleEvaluateUpdate = async (e) => {
//         e.preventDefault();
//         try {
//             const updateData = {
//                 id_evaluate: editingEvaluate.id_evaluate,
//                 star: evaluateForm.star,
//                 content: evaluateForm.content
//             };

//             const res = await updateEvaluate(updateData);
//             if (res.data.errCode === 0) {
//                 alert("Cập nhật đánh giá thành công!");
//                 setEditingEvaluate(null);
//                 setEvaluateForm({ id_schedule: "", star: 5, content: "" });
//                 loadData();
//             } else {
//                 alert(res.data.message);
//             }
//         } catch (error) {
//             console.error("Lỗi cập nhật đánh giá:", error);
//             alert("Lỗi khi cập nhật đánh giá!");
//         }
//     };

//     const cancelEvaluateEdit = () => {
//         setEditingEvaluate(null);
//         setEvaluateForm({ id_schedule: "", star: 5, content: "" });
//     };

//     // ========== RENDER FUNCTIONS ==========
//     const renderRequestTab = () => (
//         <div className="tab-content">
//             <div className="form-section">
//                 <h3>{editingRequest ? "Chỉnh sửa yêu cầu" : "Gửi yêu cầu mới"}</h3>
//                 <form onSubmit={editingRequest ? handleRequestUpdate : handleRequestSubmit}>
//                     <div className="form-group">
//                         <label>Loại yêu cầu:</label>
//                         <select
//                             value={requestForm.request_type}
//                             onChange={(e) => setRequestForm({ ...requestForm, request_type: e.target.value })}
//                             className="form-input"
//                         >
//                             <option value="Xe bus">Xe bus</option>
//                             <option value="Trạm đón/trả">Trạm đón/trả</option>
//                             <option value="Tuyến đường">Tuyến đường</option>
//                             <option value="Khác">Khác</option>
//                         </select>
//                     </div>

//                     <div className="form-group">
//                         <label>Nội dung:</label>
//                         <textarea
//                             value={requestForm.content}
//                             onChange={(e) => setRequestForm({ ...requestForm, content: e.target.value })}
//                             placeholder="Nhập nội dung yêu cầu của bạn..."
//                             rows="4"
//                             className="form-input"
//                             required
//                         />
//                     </div>

//                     <div className="form-actions">
//                         {editingRequest ? (
//                             <>
//                                 <button type="submit" className="submit-btn">Cập nhật</button>
//                                 <button type="button" onClick={cancelRequestEdit} className="cancel-btn">Hủy</button>
//                             </>
//                         ) : (
//                             <button type="submit" className="submit-btn">Gửi yêu cầu</button>
//                         )}
//                     </div>
//                 </form>
//             </div>

//             <div className="list-section">
//                 <h3>Yêu cầu đã gửi ({requests.length})</h3>
//                 {loading ? (
//                     <div className="loading">Đang tải...</div>
//                 ) : requests.length === 0 ? (
//                     <div className="empty-state">Chưa có yêu cầu nào</div>
//                 ) : (
//                     <div className="request-list">
//                         {requests.map(request => (
//                             <div key={request.id_request} className="request-item">
//                                 <div className="request-header">
//                                     <span className={`request-type ${request.request_type.replace('/', '-')}`}>
//                                         {request.request_type}
//                                     </span>
//                                     <span className="request-date">
//                                         {new Date(request.createdAt).toLocaleDateString('vi-VN')}
//                                     </span>
//                                 </div>
//                                 <div className="request-content">
//                                     {request.content}
//                                 </div>
//                                 <div className="request-actions">
//                                     <button
//                                         onClick={() => handleRequestEdit(request)}
//                                         className="edit-btn"
//                                     >
//                                         Chỉnh sửa
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );

//     const renderEvaluateTab = () => (
//         <div className="tab-content">
//             <div className="form-section">
//                 <h3>{editingEvaluate ? "Chỉnh sửa đánh giá" : "Thêm đánh giá mới"}</h3>
//                 <form onSubmit={editingEvaluate ? handleEvaluateUpdate : handleEvaluateSubmit}>
//                     <div className="form-group">
//                         <label>Chọn lịch trình:</label>
//                         <select
//                             value={evaluateForm.id_schedule}
//                             onChange={(e) => setEvaluateForm({ ...evaluateForm, id_schedule: e.target.value })}
//                             className="form-input"
//                             disabled={!!editingEvaluate}
//                         >
//                             <option value="">-- Chọn lịch trình --</option>
//                             {completedSchedules.map(schedule => (
//                                 <option key={schedule.id_schedule} value={schedule.id_schedule}>
//                                     {schedule.Sdate} - {schedule.Stime} - {schedule.routes?.name_street}
//                                 </option>
//                             ))}
//                         </select>
//                         <small>Chỉ hiển thị các lịch trình đã hoàn thành có con bạn tham gia</small>
//                     </div>

//                     <div className="form-group">
//                         <label>Đánh giá:</label>
//                         <div className="star-rating">
//                             {[1, 2, 3, 4, 5].map(star => (
//                                 <button
//                                     key={star}
//                                     type="button"
//                                     className={`star-btn ${star <= evaluateForm.star ? 'active' : ''}`}
//                                     onClick={() => setEvaluateForm({ ...evaluateForm, star })}
//                                 >
//                                     ★
//                                 </button>
//                             ))}
//                             <span className="star-text">{evaluateForm.star} sao</span>
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label>Nhận xét (tùy chọn):</label>
//                         <textarea
//                             value={evaluateForm.content}
//                             onChange={(e) => setEvaluateForm({ ...evaluateForm, content: e.target.value })}
//                             placeholder="Nhập nhận xét của bạn..."
//                             rows="4"
//                             className="form-input"
//                         />
//                     </div>

//                     <div className="form-actions">
//                         {editingEvaluate ? (
//                             <>
//                                 <button type="submit" className="submit-btn">Cập nhật</button>
//                                 <button type="button" onClick={cancelEvaluateEdit} className="cancel-btn">Hủy</button>
//                             </>
//                         ) : (
//                             <button type="submit" className="submit-btn">Gửi đánh giá</button>
//                         )}
//                     </div>
//                 </form>
//             </div>

//             <div className="list-section">
//                 <h3>Đánh giá đã gửi ({evaluates.length})</h3>
//                 {loading ? (
//                     <div className="loading">Đang tải...</div>
//                 ) : evaluates.length === 0 ? (
//                     <div className="empty-state">Chưa có đánh giá nào</div>
//                 ) : (
//                     <div className="evaluate-list">
//                         {evaluates.map(evaluate => (
//                             <div key={evaluate.id_evaluate} className="evaluate-item">
//                                 <div className="evaluate-header">
//                                     <div className="evaluate-info">
//                                         <span className="evaluate-schedule">
//                                             {evaluate.schedule?.Sdate} - {evaluate.schedule?.Stime}
//                                         </span>
//                                         <span className="evaluate-route">
//                                             {evaluate.schedule?.routes?.name_street}
//                                         </span>
//                                     </div>
//                                     <div className="evaluate-rating">
//                                         <span className="stars">
//                                             {'★'.repeat(evaluate.star)}{'☆'.repeat(5 - evaluate.star)}
//                                         </span>
//                                         <span className="evaluate-date">
//                                             {new Date(evaluate.createdAt).toLocaleDateString('vi-VN')}
//                                         </span>
//                                     </div>
//                                 </div>
//                                 {evaluate.content && (
//                                     <div className="evaluate-content">
//                                         {evaluate.content}
//                                     </div>
//                                 )}
//                                 <div className="evaluate-actions">
//                                     <button
//                                         onClick={() => handleEvaluateEdit(evaluate)}
//                                         className="edit-btn"
//                                     >
//                                         Chỉnh sửa
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );

//     if (!currentUser) {
//         return <div className="loading">Đang tải thông tin...</div>;
//     }

//     return (
//         <div className="request-evaluate-container">
//             <div className="left-panel">
//                 <div className="section">
//                     <span className="section-label">Chức năng:</span>
//                     <div className="tab-navigation">
//                         <button
//                             className={`tab-btn ${activeTab === "request" ? "active" : ""}`}
//                             onClick={() => setActiveTab("request")}
//                         >
//                             📝 Gửi yêu cầu
//                         </button>
//                         <button
//                             className={`tab-btn ${activeTab === "evaluate" ? "active" : ""}`}
//                             onClick={() => setActiveTab("evaluate")}
//                         >
//                             ⭐ Đánh giá
//                         </button>
//                     </div>
//                 </div>

//                 <div className="section">
//                     <span className="section-label">Thông tin:</span>
//                     <div className="user-info">
//                         <p><strong>Phụ huynh:</strong> {currentUser.name}</p>
//                         <p><strong>Số yêu cầu:</strong> {requests.length}</p>
//                         <p><strong>Số đánh giá:</strong> {evaluates.length}</p>
//                         <p><strong>Số con:</strong> {students.length}</p>
//                     </div>
//                 </div>
//             </div>

//             <div className="right-panel">
//                 {activeTab === "request" ? renderRequestTab() : renderEvaluateTab()}
//             </div>
//         </div>
//     );
// };

// export default RequestEvaluate;