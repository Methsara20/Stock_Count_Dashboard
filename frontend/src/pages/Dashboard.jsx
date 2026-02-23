import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  Package,
  BarChart3,
  AlertTriangle,
  Activity,
  DollarSign,
  Coins,
  ScanLine,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getDashboardData } from '../services/api';
import './Dashboard.css';

/* ================= FORMATTERS ================= */
const numberFmt = new Intl.NumberFormat("en-LK");
const currencyFmt = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/* ================= CUSTOM CHART TOOLTIP ================= */
// This creates the "pop up" card when hovering
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3" style={{ minWidth: '180px' }}>
        <p className="fw-bold mb-2 text-dark">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="d-flex justify-content-between align-items-center mb-1">
            <span style={{ color: entry.color, fontSize: '0.85rem' }}>{entry.name}</span>
            <strong style={{ color: '#334155' }}>{numberFmt.format(entry.value)}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ================= COMPONENT ================= */
export default function Dashboard() {
  const [live, setLive] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window size
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Data Logic
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardData();
      setApiData(data);
      setLastSync(new Date());
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(fetchData, 60000);
    return () => clearInterval(t);
  }, [live]);

  // Data Transformations
  const departments = useMemo(() => {
    if (!apiData?.departments) return [];
    return apiData.departments
      .filter(dept => (dept.available > 0 || dept.counted > 0))
      .map(dept => ({
        dept: dept.department || 'Unknown',
        availableQty: dept.available || 0,
        countedQty: dept.counted || 0,
        variance: dept.variance_qty || 0,
        varianceValue: dept.variance_value || 0,
      }));
  }, [apiData]);

  const totals = useMemo(() => {
    if (!apiData?.summary) {
      return { available: 0, counted: 0, varianceQty: 0, variancePct: 0, varianceValue: 0 };
    }
    return {
      available: apiData.summary.totalSystemStock || 0,
      counted: apiData.summary.totalScannedQty || 0,
      varianceQty: apiData.summary.difference || 0,
      variancePct: (apiData.summary.difference || 0) / (apiData.summary.totalSystemStock || 1),
      varianceValue: apiData.summary.differenceValue || 0,
    };
  }, [apiData]);

  const chartData = useMemo(() => {
    return departments.map(r => ({
      dept: r.dept,
      available: r.availableQty,
      counted: r.countedQty,
      diff: r.countedQty - r.availableQty,
      variancePct: r.availableQty ? (r.countedQty - r.availableQty) / r.availableQty : 0,
    }));
  }, [departments]);

  const topVariance = useMemo(() => {
    return [...chartData].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 6);
  }, [chartData]);

  // Chart Responsive Config
  const chartConfig = useMemo(() => {
    const isMobile = windowWidth < 768;
    return {
      yAxisWidth: isMobile ? 100 : 180,
      barSize: isMobile ? 20 : 28,
      fontSize: isMobile ? 11 : 13,
      minHeight: Math.max(400, chartData.length * (isMobile ? 50 : 65)),
    };
  }, [windowWidth, chartData.length]);

  // Render States
  if (loading && !apiData) return <LoadingScreen />;
  if (error && !apiData) return <ErrorScreen error={error} retry={fetchData} />;

  return (
    <div className="modern-bg min-vh-100">
      {/* Animated Background Shapes */}
      <div className="animated-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Header */}
      <nav className="navbar sticky-top glass-header">
        <div className="container-fluid py-3">
          <div className="d-flex align-items-center">
            <div className="brand-icon-modern me-3">
              <BarChart3 size={26} className="text-white" />
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-gradient-brand">COOL PLANET</h5>
              <small className="text-muted d-none d-sm-block">Inventory Stock Count</small>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-md-block text-end me-2">
              <small className="text-muted d-block">Last Sync</small>
              <small className="fw-bold text-dark">
                {lastSync.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
            
            <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm">
              <span className={`rounded-circle ${live ? 'bg-success' : 'bg-warning'} me-2`} style={{ width: 8, height: 8 }}></span>
              <span className="fw-semibold small">{live ? "Live" : "Paused"}</span>
              <button 
                className="btn btn-sm p-0 border-0 bg-transparent" 
                onClick={() => setLive(v => !v)}
              >
                {live ? <PauseCircle size={18} className="text-secondary" /> : <PlayCircle size={18} className="text-success" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div 
        className={`container-fluid py-4 position-relative ${loading ? 'opacity-50' : ''}`} 
        style={{ zIndex: 1, transition: 'opacity 0.2s ease' }}
      >
        
        {/* Top KPI Grid */}
        <div className="row g-4 mb-4">
          {/* System Stock */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-card border-accent-blue h-100 p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="text-label">System Stock</span>
                <div className="bg-blue-100 p-2 rounded-circle">
                  <Package size={20} className="text-primary" />
                </div>
              </div>
              <div className="text-value-xl mb-1">
                {numberFmt.format(totals.available)}
              </div>
              <small className="text-muted">Stock in Hand</small>
            </div>
          </div>

          {/* Counted Stock */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-card border-accent-green h-100 p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="text-label">Counted Stock</span>
                <div className="p-2 rounded-circle" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <ScanLine size={20} style={{ color: '#10b981' }} />
                </div>
              </div>
              <div className="text-value-xl mb-1" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {numberFmt.format(totals.counted)}
              </div>
              <small className="text-muted">Physical Count</small>
            </div>
          </div>

          {/* Variance Qty */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-card border-accent-red h-100 p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="text-label">Variance Qty</span>
                <div className="p-2 rounded-circle" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <TrendingUp size={20} style={{ color: '#ef4444' }} />
                </div>
              </div>
              <div className={`text-value-xl mb-1 ${totals.varianceQty >= 0 ? 'text-success' : 'text-danger'}`}>
                {totals.varianceQty > 0 ? '+' : ''}{numberFmt.format(totals.varianceQty)}
              </div>
              <small className="text-muted">Difference</small>
            </div>
          </div>

          {/* Coverage */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-card border-accent-purple h-100 p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="text-label">Coverage</span>
                <div className="p-2 rounded-circle" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                  <Activity size={20} style={{ color: '#8b5cf6' }} />
                </div>
              </div>
              <div className="text-value-xl mb-1">
                {apiData?.summary?.coveragePercent || 0}%
              </div>
              <div className="progress mt-2" style={{ height: '6px', borderRadius: '10px' }}>
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${apiData?.summary?.coveragePercent || 0}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financials Row */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center mb-3">
                <DollarSign size={24} className="text-warning me-3" />
                <div>
                  <span className="text-label d-block">Total Stock Value</span>
                  <h3 className="mb-0 fw-bold mt-1">{currencyFmt.format(apiData?.summary?.totalStockValue || 0)}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center mb-3">
                <Coins size={24} className="text-danger me-3" />
                <div>
                  <span className="text-label d-block">Variance Value</span>
                  <h3 className={`mb-0 fw-bold mt-1 ${totals.varianceValue >= 0 ? 'text-success' : 'text-danger'}`}>
                    {totals.varianceValue >= 0 ? '+' : ''}{currencyFmt.format(totals.varianceValue)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="glass-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold mb-0 d-flex align-items-center">
                  <BarChart3 size={20} className="me-2 text-primary" />
                  Department Breakdown
                </h6>
              </div>
              <div className="chart-wrapper" style={{ background: '#f8fafc' }}>
                <div style={{ height: chartConfig.minHeight, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical" 
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      barCategoryGap="20%"
                    >
                      <defs>
                        <linearGradient id="gradAvailable" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#e0e7ff" />
                          <stop offset="100%" stopColor="#c7d2fe" />
                        </linearGradient>
                        <linearGradient id="gradCounted" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                      </defs>
                      
                      {/* XAxis tick={false} hides the numbers at the bottom */}
                      <XAxis type="number" axisLine={false} tickLine={false} tick={false} />
                      
                      <YAxis 
                        type="category" 
                        dataKey="dept" 
                        width={chartConfig.yAxisWidth} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: chartConfig.fontSize, fontWeight: 500 }}
                      />
                      
                      {/* Tooltip creates the pop-up on hover */}
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                      
                      <Legend verticalAlign="top" height={36} iconType="circle" iconSize={10} />
                      
                      {/* Bars do NOT have <LabelList>, so no numbers appear on the bars */}
                      <Bar dataKey="available" fill="url(#gradAvailable)" name="Available" radius={[0, 4, 4, 0]} barSize={chartConfig.barSize} />
                      <Bar dataKey="counted" fill="url(#gradCounted)" name="Counted" radius={[0, 4, 4, 0]} barSize={chartConfig.barSize} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="glass-card p-0 overflow-hidden">
              <div className="p-4 border-bottom">
                <h6 className="fw-bold mb-0">Department Summary</h6>
              </div>
              <div className="table-responsive">
                <table className="table modern-table mb-0">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th className="text-end">Available</th>
                      <th className="text-end">Counted</th>
                      <th className="text-end">Var Qty</th>
                      <th className="text-end">Var %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{item.dept}</td>
                        <td className="text-end text-secondary">{numberFmt.format(item.available)}</td>
                        <td className="text-end fw-medium">{numberFmt.format(item.counted)}</td>
                        <td className={`text-end fw-bold ${item.diff >= 0 ? 'text-success' : 'text-danger'}`}>
                          {item.diff > 0 ? '+' : ''}{numberFmt.format(item.diff)}
                        </td>
                        <td className={`text-end fw-bold ${item.variancePct >= 0 ? 'text-success' : 'text-danger'}`}>
                          {(item.variancePct * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f8fafc' }}>
                      <td className="fw-bold text-dark">TOTAL</td>
                      <td className="text-end fw-bold">{numberFmt.format(totals.available)}</td>
                      <td className="text-end fw-bold">{numberFmt.format(totals.counted)}</td>
                      <td className={`text-end fw-bold ${totals.varianceQty >= 0 ? 'text-success' : 'text-danger'}`}>
                        {totals.varianceQty > 0 ? '+' : ''}{numberFmt.format(totals.varianceQty)}
                      </td>
                      <td className={`text-end fw-bold ${totals.variancePct >= 0 ? 'text-success' : 'text-danger'}`}>
                        {(totals.variancePct * 100).toFixed(2)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Variance Highlights */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center mb-3">
              <AlertTriangle size={20} className="text-danger me-2" />
              <h6 className="mb-0 fw-bold text-danger">Top Variances to Review</h6>
            </div>
            <div className="row g-3">
              {topVariance.map((item, index) => (
                <div key={index} className="col-md-6 col-lg-4 col-xl-2">
                  <div className="variance-mini-card">
                    <h6 className="text-dark fw-bold mb-3 text-truncate" style={{ fontSize: '0.9rem' }}>{item.dept}</h6>
                    <div className="d-flex justify-content-between align-items-end">
                      <div>
                        <small className="text-muted d-block">Qty Diff</small>
                        <span className={`h5 mb-0 fw-bold ${item.diff >= 0 ? 'text-success' : 'text-danger'}`}>
                          {item.diff > 0 ? '+' : ''}{numberFmt.format(item.diff)}
                        </span>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">%</small>
                        <span className={`fw-bold ${item.variancePct >= 0 ? 'text-success' : 'text-danger'}`}>
                          {(item.variancePct * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center py-4">
          <button 
            className="btn btn-modern-primary me-2" 
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw 
              size={18} 
              className={`me-2 ${loading ? 'spin-icon' : ''}`} 
            />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button className="btn btn-modern-outline" onClick={() => alert('Coming soon')}>
            <BarChart3 size={18} className="me-2" /> Detailed Report
          </button>
          <div className="row">
          <div className="col-12">
            <div className="text-center py-3">
              <small className="text-muted">
                Powered by CP IT
              </small>
            </div>
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}

// Sub-components
function LoadingScreen() {
  return (
    <div className="modern-bg min-vh-100 d-flex align-items-center justify-content-center">
      <div className="animated-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      <div className="glass-card p-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="fw-bold">Initializing Dashboard</h5>
      </div>
    </div>
  );
}

function ErrorScreen({ error, retry }) {
  return (
    <div className="modern-bg min-vh-100 d-flex align-items-center justify-content-center">
      <div className="animated-bg-shapes"><div className="shape shape-1"></div></div>
      <div className="glass-card p-5 text-center">
        <AlertTriangle size={48} className="text-danger mb-3" />
        <h5 className="text-danger mb-2">{error}</h5>
        <button className="btn btn-modern-primary mt-3" onClick={retry}>
          Retry Connection
        </button>
      </div>
    </div>
  );
  
}
    