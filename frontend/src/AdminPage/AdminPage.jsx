import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// 注册 ChartJS 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// 修改打印样式
const printStyles = `
  @media print {
    /* 隐藏不需要的元素 */
    .sidebar, .no-print {
      display: none !important;
    }
    
    /* 调整主内容区 */
    #dashboard-content {
      margin: 0 !important;
      padding: 20px !important;
      width: 100% !important;
    }
    
    /* 修改标题样式 */
    .print-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    /* 确保图表容器不会溢出 */
    .chart-container {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 20px;
      overflow: hidden !important;
    }
    
    /* 调整卡片样式 */
    .card {
      border: 1px solid #ddd !important;
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 20px !important;
    }
    
    /* 确保白色背景 */
    body {
      background-color: white !important;
    }
    
    /* 添加页眉页脚 */
    @page {
      margin: 2cm;
      size: portrait;
    }
    
    /* 调整图表容器大小和溢出处理 */
    .chart-wrapper {
      position: relative;
      height: 250px !important; /* 减小高度 */
      width: 100% !important;
      margin-bottom: 20px !important;
    }
    
    /* 确保图表完全在容器内 */
    canvas {
      max-width: 100% !important;
      max-height: 100% !important;
    }
    
    /* 调整卡片内边距 */
    .card-body {
      padding: 15px !important;
    }
    
    /* 调整标题大小 */
    .card-title {
      font-size: 14px !important;
      margin-bottom: 10px !important;
    }
    
    /* 确保页面分隔正确 */
    .page-break {
      page-break-before: always;
    }
  }
`;

export default function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    users: null,
    orders: null,
    dailyTrends: null,
    hotelPerformance: null,
    userActivity: null,
    commissions: null,
    dailyCommission: null,
  });
  const [chartsReady, setChartsReady] = useState(false);

  // 添加角色检查
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!role || role !== 'admin') {
      // 如果不是管理员，重定向到对应角色的页面
      switch (role) {
        case 'user':
          navigate('/');
          break;
        case 'owner':
          navigate('/owner');
          break;
        default:
          navigate('/login');
      }
      return;
    }

    // 如果是管理员，继续加载数据
    fetchAllStatistics();
  }, [navigate]);

  useEffect(() => {
    if (statistics.dailyTrends && statistics.userActivity && statistics.hotelPerformance) {
      // 当所有数据都加载完成后，等待一小段时间确保图表渲染完成
      setTimeout(() => setChartsReady(true), 1000);
    }
  }, [statistics]);

  // 添加打印样式到 head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    document.title = 'Admin Dashboard - EasyBook';
    return () => {
      document.title = 'EasyBook'; // 组件卸载时恢复默认标题
    };
  }, []);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      const [users, orders, dailyTrends, hotelPerformance, userActivity, commissions, dailyCommission] = await Promise.all([
        adminAPI.getUserStatistics(),
        adminAPI.getOrderStatistics(),
        adminAPI.getDailyTrends(),
        adminAPI.getHotelPerformance(),
        adminAPI.getUserActivity(),
        adminAPI.getCommissionStatistics(),
        adminAPI.getDailyCommissionStatistics()
      ]);

      setStatistics({
        users,
        orders,
        dailyTrends,
        hotelPerformance,
        userActivity,
        commissions,
        dailyCommission,
      });
    } catch (err) {
      setError("Failed to fetch statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const captureChart = async (chartId) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      throw new Error(`Chart element ${chartId} not found`);
    }
    
    // 等待一小段时间确保图表完全渲染
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(chartElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    return canvas;
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取内容元素
      const contentElement = document.getElementById('dashboard-content');
      if (!contentElement) {
        throw new Error('Dashboard content element not found');
      }

      // 创建 PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // 添加标题
      pdf.setFontSize(20);
      pdf.text('Administrator Dashboard Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // 添加生成时间
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // 等待图表完全渲染
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 使用 html2canvas 捕获内容
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        useCORS: true,
        logging: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: contentElement.offsetWidth,
        height: contentElement.offsetHeight,
        onclone: (clonedDoc) => {
          // 在克隆的文档中调整样式
          const clonedContent = clonedDoc.getElementById('dashboard-content');
          if (clonedContent) {
            clonedContent.style.marginLeft = '0';
            // 确保所有图表都是可见的
            const charts = clonedContent.querySelectorAll('canvas');
            charts.forEach(chart => {
              chart.style.maxHeight = 'none';
              chart.style.maxWidth = 'none';
            });
          }
        }
      });

      // 将内容分页添加到 PDF
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = yPosition;

      // 添加第一页
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - position);

      // 如果内容超过一页，添加新页面
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // 保存 PDF
      pdf.save(`dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      setError('Failed to generate PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // 每日订单趋势图配置
  const dailyTrendsData = {
    labels: statistics.dailyTrends?.daily_trends?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Orders',
        data: statistics.dailyTrends?.daily_trends?.map(item => item.order_count) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        yAxisID: 'y',
        fill: true
      },
      {
        label: 'Revenue ($)',
        data: statistics.dailyTrends?.daily_trends?.map(item => item.total_revenue) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        yAxisID: 'y1',
        fill: true
      }
    ]
  };

  const dailyTrendsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Order Count'
        },
        grid: {
          drawBorder: false
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
          drawBorder: false
        },
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      }
    }
  };

  // 酒店表现柱状图配置
  const hotelPerformanceData = {
    labels: statistics.hotelPerformance?.top_hotels.map(hotel => hotel.name) || [],
    datasets: [
      {
        label: 'Revenue',
        data: statistics.hotelPerformance?.top_hotels.map(hotel => hotel.total_revenue) || [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // 用户角色分布饼图配置
  const userRoleData = {
    labels: statistics.userActivity?.users_by_role.map(role => role.role) || [],
    datasets: [
      {
        data: statistics.userActivity?.users_by_role.map(role => role.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  // 修改统计卡片部分，添加更多信息
  const statsCards = [
    {
      title: 'Total Users',
      value: statistics.users?.total_users || 0,
      icon: 'bi-people',
      color: 'primary'
    },
    {
      title: 'Total Owners',
      value: statistics.users?.total_owners || 0,
      icon: 'bi-house',
      color: 'success'
    },
    {
      title: 'Total Orders',
      value: statistics.orders?.total_orders || 0,
      icon: 'bi-cart',
      color: 'warning'
    },
    {
      title: 'Total Commission',
      value: `$${statistics.commissions?.total_commission?.toFixed(2) || 0}`,
      icon: 'bi-cash-stack',
      color: 'danger'
    }
  ];

  // 订单状态数据
  const orderStatusData = {
    labels: ['Pending', 'Completed'],
    datasets: [{
      data: [
        statistics.orders?.pending_orders || 0,
        statistics.orders?.completed_orders || 0
      ],
      backgroundColor: ['#ffc107', '#28a745']
    }]
  };

  // 修改佣金趋势数据配置
  const commissionTrendData = {
    labels: statistics.dailyCommission?.daily_commission?.map(item => item.date) || [],
    datasets: [
      {
        label: 'Commission Amount ($)',
        data: statistics.dailyCommission?.daily_commission?.map(item => item.total_commission) || [],
        borderColor: '#17a2b8',
        backgroundColor: 'rgba(23, 162, 184, 0.1)',
        yAxisID: 'y',
        fill: true
      },
      {
        label: 'Order Count',
        data: statistics.dailyCommission?.daily_commission?.map(item => item.order_count) || [],
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        yAxisID: 'y1',
        fill: true
      }
    ]
  };

  const commissionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          padding: 10,
          font: {
            size: 10
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        position: 'left',
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          font: {
            size: 10
          }
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 20
      }
    }
  };

  // 添加最活跃用户数据配置
  const activeUsersData = {
    labels: statistics.userActivity?.most_active_users?.map(user => user.username) || [],
    datasets: [{
      label: 'Orders',
      data: statistics.userActivity?.most_active_users?.map(user => user.order_count) || [],
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderColor: 'rgb(153, 102, 255)',
      borderWidth: 1
    }]
  };

  const activeUsersOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10 // 减小字体大小
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false
        },
        ticks: {
          font: {
            size: 10 // 减小字体大小
          }
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 20 // 为旋转的标签留出空间
      }
    }
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  const pieOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  // Daily Commission Trends 图表配置
  const dailyCommissionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Daily Commission Trends'
      },
      legend: {
        position: 'top',
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MM-DD'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Commission Amount ($)'
        },
        beginAtZero: true
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Order Count'
        },
        beginAtZero: true,
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  // 在图表渲染前添加数据检查
  const dailyCommissionData = statistics.dailyCommission?.daily_commission;

  return (
    <div className="d-flex">
      {/* 侧边栏 */}
      <div className="sidebar bg-dark text-white" style={{ width: '250px', minHeight: '100vh', position: 'fixed' }}>
        <div className="p-3">
          <h4 className="text-center mb-4">Admin Dashboard</h4>
          <div className="d-flex flex-column gap-3">
            <button 
              className="btn btn-outline-light w-100"
              onClick={handlePrint}
            >
              <i className="bi bi-printer me-2"></i>
              Print Report (⌘ + P)
            </button>
            <button className="btn btn-danger w-100" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div id="dashboard-content" className="flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
        {/* 打印时显示的标题 */}
        <div className="d-none d-print-block print-header">
          <h1 className="text-center mb-3">EasyBook</h1>
          <h2 className="text-center mb-3">Administrator Dashboard Report</h2>
          <p className="text-center text-muted">
            Generated on: {new Date().toLocaleString()}
          </p>
          <hr className="mb-4" />
        </div>

        {/* 统计卡片 */}
        <div className="row row-cols-1 row-cols-md-4 g-4 mb-4">
          {statsCards.map((card, index) => (
            <div key={index} className="col">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className={`rounded-circle p-3 bg-${card.color} bg-opacity-10`}>
                      <i className={`bi ${card.icon} fs-4 text-${card.color}`}></i>
                    </div>
                    <div className="ms-3">
                      <h6 className="text-muted mb-1">{card.title}</h6>
                      <h3 className="mb-0">{card.value}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 图表区域 */}
        <div className="row g-4">
          {/* 日订单趋势 */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body" style={{ overflow: 'hidden' }}>
                <h5 className="card-title">Daily Order Trends</h5>
                <div style={{ height: '350px' }}>
                  <Line data={dailyTrendsData} options={dailyTrendsOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* 用户分布 */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">User Distribution</h5>
                <div style={{ height: '350px' }}>
                  <Pie data={userRoleData} options={pieOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* 订单状态和最活跃用户并排显示 */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Order Status</h5>
                <div style={{ height: '300px' }}>
                  <Pie data={orderStatusData} options={pieOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* 最活跃用户 */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Most Active Users</h5>
                <div className="chart-wrapper" style={{ 
                  height: '250px',
                  position: 'relative',
                  margin: '0 auto'
                }}>
                  <Bar 
                    data={activeUsersData} 
                    options={activeUsersOptions}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 佣金趋势 */}
          <div className="col-md-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Daily Commission Trends</h5>
                <div className="chart-wrapper" style={{ 
                  height: '250px',
                  position: 'relative',
                  margin: '0 auto'
                }}>
                  {dailyCommissionData && dailyCommissionData.datasets?.[0]?.data?.length > 0 ? (
                    <Line 
                      options={dailyCommissionOptions} 
                      data={dailyCommissionData} 
                      height={300}
                    />
                  ) : (
                    <div className="text-center py-4">
                      <p>No commission data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
