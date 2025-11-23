import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, MapPin, Route, Bus } from 'lucide-react';
import { getAllDashboardStats, getStudentsByMonth, getAvailableYears, getStudentsByRoute } from '../../services/dashboardService';

const AdminDashboard = () => {
  const [showRouteTable, setShowRouteTable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalUsers: 0,
    totalBusStops: 0,
    totalRoutes: 0,
    userRoleStats: [],
    userRoleTotal: 0
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [studentTrendData, setStudentTrendData] = useState([]);
  const [routeData, setRouteData] = useState({ top5: [], all: [] });

  // Fetch dữ liệu dashboard chính
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getAllDashboardStats();

        if (response.data.errCode === 0) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch danh sách các năm
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await getAvailableYears();
        if (response.data.errCode === 0) {
          setAvailableYears(response.data.years);
          if (response.data.years.length > 0 && !response.data.years.includes(selectedYear)) {
            setSelectedYear(response.data.years[0]);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách năm:', error);
      }
    };

    fetchYears();
  }, []);

  // Fetch dữ liệu học sinh theo tháng khi đổi năm
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await getStudentsByMonth(selectedYear);
        if (response.data.errCode === 0) {
          const formattedData = response.data.data.map(item => ({
            month: `T${item.month}`,
            students: item.students
          }));
          setStudentTrendData(formattedData);
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy dữ liệu học sinh theo tháng:', error);
      }
    };

    if (selectedYear) {
      fetchMonthlyData();
    }
  }, [selectedYear]);

  // Fetch dữ liệu tuyến đường
  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const response = await getStudentsByRoute();
        if (response.data.errCode === 0) {
          const top5 = response.data.top5Routes.map(item => ({
            route: item.name_street,
            students: item.student_count
          }));

          const all = response.data.allRoutes.map(item => ({
            code: item.id_route,
            name: item.name_street,
            students: item.student_count
          }));

          setRouteData({ top5, all });
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy dữ liệu tuyến đường:', error);
      }
    };

    fetchRouteData();
  }, []);

  // Dữ liệu cho 4 cards
  const statsCards = [
    {
      title: 'Tổng số trạm',
      value: loading ? '...' : dashboardData.totalBusStops.toString(),
      unit: 'trạm',
      icon: MapPin,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Tổng số tuyến đường',
      value: loading ? '...' : dashboardData.totalRoutes.toString(),
      unit: 'tuyến',
      icon: Route,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Tổng số học sinh',
      value: loading ? '...' : dashboardData.totalStudents.toString(),
      unit: 'học sinh',
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Tổng số người dùng',
      value: loading ? '...' : dashboardData.totalUsers.toString(),
      unit: 'người dùng',
      icon: Bus,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  // Dữ liệu cho biểu đồ tròn - Phân loại người dùng (từ API)
  const userTypeData = dashboardData.userRoleStats.map(item => {
    let color = '#3b82f6';
    if (item.name === 'Admin') color = '#3b82f6';
    else if (item.name === 'Tài xế') color = '#10b981';
    else if (item.name === 'Phụ huynh') color = '#f59e0b';

    return {
      name: item.name,
      value: item.value,
      color: color
    };
  });

  const totalUsers = dashboardData.userRoleTotal || userTypeData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip cho biểu đồ cột
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].payload.route}</p>
          <p className="text-sm text-gray-600">
            Tổng số học sinh: <span className="font-bold text-blue-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip cho biểu đồ tròn
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = totalUsers > 0 ? ((payload[0].value / totalUsers) * 100).toFixed(1) : '0.0';
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Số tài khoản: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Tỷ lệ: <span className="font-bold">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Quản trị</h1>
        <p className="text-gray-600 mt-2">Tổng quan hệ thống quản lý xe buýt học sinh</p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">{card.title}</p>
                <h3 className={`text-3xl font-bold ${card.textColor}`}>{card.value}</h3>
                <p className="text-gray-400 text-xs mt-1">{card.unit}</p>
              </div>
              <div className={`${card.color} p-4 rounded-full`}>
                <card.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biểu đồ đường - Số học sinh sử dụng dịch vụ */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                📈 Số học sinh sử dụng dịch vụ theo tháng
              </h2>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>Năm {year}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={studentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Số học sinh"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ cột - Top 5 tuyến đường */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                🚌 Top 5 tuyến đường có học sinh đông nhất
              </h2>
              <button
                onClick={() => setShowRouteTable(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Xem tất cả tuyến
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routeData.top5}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="route" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="students" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column - Pie Chart */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              👥 Phân loại người dùng
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">Đang tải dữ liệu...</div>
              </div>
            ) : userTypeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend với màu sắc */}
                <div className="mt-6 space-y-3">
                  {userTypeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-700 font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-800">{item.value}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          ({((item.value / totalUsers) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">Không có dữ liệu</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal - Bảng danh sách tuyến đường */}
      {showRouteTable && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[84vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                📋 Danh sách tất cả tuyến đường
              </h3>
              <button
                onClick={() => setShowRouteTable(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã tuyến
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên tuyến đường
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số học sinh
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routeData.all.map((route, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {route.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {route.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                          {route.students}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowRouteTable(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;