import React, { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Clock,
    ArrowUpRight,
    Download,
    ChevronDown,
    Layers,
    PieChart as PieChartIcon,
    BarChart2,
    Activity,
    FileText,
    AlertCircle,
    Calendar,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area
} from 'recharts';

// Mock Data
const mockData = {
    overview: {
        kpis: [
            { label: 'This Week Sales', value: 'Rs. 124,500', trend: '+12.5%', isUp: true, icon: Activity },
            { label: 'Total Profit', value: 'Rs. 42,300', trend: '+8.2%', isUp: true, icon: TrendingUp },
            { label: 'Profit Margin (%)', value: '34.2%', trend: '-1.5%', isUp: false, icon: BarChart2 },
            { label: 'Avg. Transaction', value: 'Rs. 1,240', trend: '+4.3%', isUp: true, icon: DollarSign },
        ],
        salesProfitTrend: [
            { name: 'Mon', sales: 4000, profit: 1200 },
            { name: 'Tue', sales: 3000, profit: 900 },
            { name: 'Wed', sales: 5000, profit: 1500 },
            { name: 'Thu', sales: 2780, profit: 800 },
            { name: 'Fri', sales: 1890, profit: 500 },
            { name: 'Sat', sales: 2390, profit: 700 },
            { name: 'Sun', sales: 3490, profit: 1100 },
        ],
        paymentMethods: [
            { name: 'Cash', value: 45000, color: '#21c45d' },
            { name: 'Card', value: 32000, color: '#f59f0a' },
            { name: 'EasyPaisa', value: 15000, color: '#e61919' },
            { name: 'JazzCash', value: 12000, color: '#2671d9' },
        ],
        salesByCategory: [
            { name: 'Antibiotics', percentage: 75, color: '#21c45d' },
            { name: 'Painkillers', percentage: 60, color: '#e61919' },
            { name: 'Multivitamins', percentage: 45, color: '#f59f0a' },
            { name: 'Inhalers', percentage: 35, color: '#0ea5e9' },
            { name: 'Topical', percentage: 25, color: '#d946ef' },
            { name: 'Syrups', percentage: 20, color: '#8b5cf6' },
        ],
        topMedicines: [
            { name: 'Panadol CF', sold: 450, revenue: 'Rs. 11,250', growth: '+15%', isUp: true },
            { name: 'Amoxil 500mg', sold: 320, revenue: 'Rs. 16,000', growth: '+8%', isUp: true },
            { name: 'Arinac Forte', sold: 280, revenue: 'Rs. 8,400', growth: '-5%', isUp: false },
            { name: 'Surbex-Z', sold: 210, revenue: 'Rs. 14,700', growth: '+12%', isUp: true },
            { name: 'Ventolin', sold: 195, revenue: 'Rs. 5,850', growth: '+2%', isUp: true },
        ]
    },
    sales: {
        kpis: [
            { label: 'Total Transactions', value: '1,245', icon: Activity },
            { label: 'Items Sold', value: '4,820', icon: Layers },
            { label: 'GST Collected', value: 'Rs. 18,340', icon: DollarSign },
            { label: 'Discounts', value: 'Rs. 5,120', icon: TrendingDown },
        ],
        monthlyTrend: [
            { month: 'Jan', sales: 45000 },
            { month: 'Feb', sales: 52000 },
            { month: 'Mar', sales: 48000 },
            { month: 'Apr', sales: 61000 },
            { month: 'May', sales: 55000 },
            { month: 'Jun', sales: 67000 },
            { month: 'Jul', sales: 72000 },
            { month: 'Aug', sales: 68000 },
            { month: 'Sep', sales: 75000 },
            { month: 'Oct', sales: 82000 },
            { month: 'Nov', sales: 78000 },
            { month: 'Dec', sales: 95000 },
        ],
        peakHours: [
            { hour: '9AM', sales: 12 },
            { hour: '10AM', sales: 18 },
            { hour: '11AM', sales: 25 },
            { hour: '12PM', sales: 32 },
            { hour: '1PM', sales: 28 },
            { hour: '2PM', sales: 22 },
            { hour: '3PM', sales: 19 },
            { hour: '4PM', sales: 26 },
            { hour: '5PM', sales: 38 },
            { hour: '6PM', sales: 45 },
            { hour: '7PM', sales: 42 },
            { hour: '8PM', sales: 30 },
        ],
        creditSales: { total: 45000, collected: 32000, percentage: 71 },
        returns: { total: 12000, processed: 9500, percentage: 79 },
    },
    inventory: {
        kpis: [
            { label: 'Retail Value', value: 'Rs. 2.4M', icon: DollarSign },
            { label: 'Cost Value', value: 'Rs. 1.8M', icon: Package },
            { label: 'Potential Profit', value: 'Rs. 600K', icon: TrendingUp },
            { label: 'Unique Products', value: '1,840', icon: Layers },
        ],
        categoryStock: [
            { name: 'Antibiotics', stock: 850, color: '#21c45d' },
            { name: 'Painkillers', stock: 1200, color: '#e61919' },
            { name: 'Vitamins', stock: 650, color: '#f59f0a' },
            { name: 'Cardiac', stock: 400, color: '#d946ef' },
            { name: 'Diabetes', stock: 320, color: '#8b5cf6' },
            { name: 'Skin Care', stock: 580, color: '#0ea5e9' },
        ],
        alerts: [
            { title: 'Expired Items', count: 12, color: 'text-red-600 bg-red-50 border-red-100', icon: AlertCircle },
            { title: 'Expiring Soon', count: 45, color: 'text-yellow-600 bg-yellow-50 border-yellow-100', icon: Clock },
            { title: 'Low Stock', count: 28, color: 'text-orange-600 bg-orange-50 border-orange-100', icon: AlertCircle },
            { title: 'Total Stock Summary', count: '14,250 Units', color: 'text-green-600 bg-green-50 border-green-100', icon: CheckCircle2 },
        ]
    },
    quickReports: [
        { title: 'Daily Sales Report', desc: 'Sales breakdown by day', icon: FileText },
        { title: 'Stock Valuation', desc: 'Current inventory value', icon: Package },
        { title: 'Profit & Loss', desc: 'Revenue and expenses', icon: TrendingUp },
        { title: 'GST Report', desc: 'Tax collection summary', icon: FileText },
        { title: 'Top Selling Items', desc: 'Best performing products', icon: BarChart2 },
        { title: 'Category Analysis', desc: 'Sales by category', icon: PieChartIcon },
        { title: 'Payment Methods', desc: 'Payment type breakdown', icon: DollarSign },
        { title: 'Monthly Trend', desc: 'Month-over-month analysis', icon: Activity },
    ],
    quickReportSummary: [
        { label: 'Period Sales', value: 'Rs 437,569', color: 'text-gray-900' },
        { label: 'Period Profit', value: 'Rs 89,832', color: 'text-green-600' },
        { label: 'Inventory Value', value: 'Rs 516,300', color: 'text-gray-900' },
        { label: 'GST Collected', value: 'Rs 21,878', color: 'text-gray-900' },
    ]
};

const Report = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [dateRange, setDateRange] = useState('This Month');
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const tabs = ['Overview', 'Sales Analysis', 'Inventory', 'Quick Reports'];
    const dateOptions = ['Today', 'This Week', 'This Month', 'Year'];

    const handleExport = (report) => {
        setSelectedReport(report);
        setShowExportModal(true);
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-500 text-sm">Business insights and performance metrics</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Range Picker */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDateDropdown(!showDateDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-teal-500 transition-colors"
                        >
                            <Calendar className="w-4 h-4 text-[#0D9488]" />
                            <span className="text-sm font-medium text-gray-700">{dateRange}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showDateDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                                {dateOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setDateRange(option);
                                            setShowDateDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Export Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportDropdown(!showExportDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-xl shadow-sm hover:bg-[#0F766E] transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm font-medium">Export</span>
                            <ChevronDown className="w-4 h-4 opacity-70" />
                        </button>
                        {showExportDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                                {['CSV', 'PDF', 'JSON'].map((format) => (
                                    <button
                                        key={format}
                                        onClick={() => setShowExportDropdown(false)}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                                    >
                                        Export as {format}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-6 border-b border-gray-200 mb-8 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-sm font-semibold whitespace-nowrap transition-all relative ${activeTab === tab
                            ? 'text-[#0D9488]'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D9488] rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300">
                {activeTab === 'Overview' && <OverviewTab />}
                {activeTab === 'Sales Analysis' && <SalesAnalysisTab />}
                {activeTab === 'Inventory' && <InventoryTab />}
                {activeTab === 'Quick Reports' && <QuickReportsTab onExport={handleExport} />}
            </div>

            {/* Export Modal Mockup */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                                    <FileText className="text-[#0D9488] w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Export Report</h3>
                                    <p className="text-sm text-gray-500">{selectedReport?.title}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-6">Choose your preferred format to download this report.</p>

                            <div className="grid grid-cols-1 gap-3">
                                {['PDF Document', 'Excel Spreadsheet (CSV)', 'JSON Data'].map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setShowExportModal(false)}
                                        className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-teal-500 hover:bg-teal-50/50 transition-all group"
                                    >
                                        <span className="text-sm font-semibold text-gray-700">{item}</span>
                                        <Download className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="px-6 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-components (Tabs) ---

const OverviewTab = () => (
    <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockData.overview.kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-teal-100 transition-all">
                    <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                                {kpi.trend && (
                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${kpi.isUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                        }`}>
                                        {kpi.isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                        {kpi.trend}
                                    </div>
                                )}
                            </div>
                            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 transition-colors group-hover:bg-teal-100 shrink-0">
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales & Profit Trend */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-gray-900">Sales & Profit Trend</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-teal-500 rounded-full" />
                            <span className="text-xs text-gray-500 font-medium">Sales</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-400 rounded-full" />
                            <span className="text-xs text-gray-500 font-medium">Profit</span>
                        </div>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockData.overview.salesProfitTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: '#F8FAFC' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="sales" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={32} />
                            <Line type="monotone" dataKey="profit" stroke="#FB923C" strokeWidth={3} dot={{ r: 4, fill: '#FB923C', strokeWidth: 2, stroke: '#fff' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-8">Payment Methods</h3>
                <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={mockData.overview.paymentMethods}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {mockData.overview.paymentMethods.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-6">
                    {mockData.overview.paymentMethods.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-sm text-gray-600 font-medium">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">Rs. {entry.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Category */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Sales by Category</h3>
                <div className="space-y-6">
                    {mockData.overview.salesByCategory.map((cat, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span className="text-gray-700">{cat.name}</span>
                                <span className="text-teal-600 font-bold">{cat.percentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-1000"
                                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Selling Medicines */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Top Selling Medicines</h3>
                <div className="space-y-1">
                    {mockData.overview.topMedicines.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 font-bold text-xs group-hover:bg-teal-100 transition-colors">
                                    0{idx + 1}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                                    <p className="text-xs text-gray-500">{item.sold} units sold</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{item.revenue}</p>
                                <div className={`flex items-center gap-1 text-[10px] font-bold justify-end ${item.isUp ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {item.isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                    {item.growth}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const SalesAnalysisTab = () => (
    <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockData.sales.kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-teal-100 transition-all">
                    <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 transition-colors group-hover:bg-teal-100 shrink-0">
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Monthly Sales Trend */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-8">Monthly Sales Trend</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData.sales.monthlyTrend}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Peak Hours */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-8 text-sm uppercase tracking-wider text-gray-400">Transaction Volume by Hour</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockData.sales.peakHours}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                            <Tooltip
                                cursor={{ fill: '#F8FAFC' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="sales" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Credit & Returns */}
            <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-500 text-sm">Credit Sales</h4>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">{mockData.sales.creditSales.percentage}%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">Rs. {mockData.sales.creditSales.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mb-4">Collected: Rs. {mockData.sales.creditSales.collected.toLocaleString()}</p>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400" style={{ width: `${mockData.sales.creditSales.percentage}%` }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-500 text-sm">Returns & Refunds</h4>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">{mockData.sales.returns.percentage}%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">Rs. {mockData.sales.returns.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mb-4">Processed: Rs. {mockData.sales.returns.processed.toLocaleString()}</p>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400" style={{ width: `${mockData.sales.returns.percentage}%` }} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const InventoryTab = () => (
    <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockData.inventory.kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-teal-100 transition-all">
                    <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 transition-colors group-hover:bg-teal-100 shrink-0">
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Horizontal Bar Chart */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-8">Stock Distribution by Category</h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={mockData.inventory.categoryStock} margin={{ left: 40, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 13, fontWeight: 600 }} width={120} />
                            <Tooltip
                                cursor={{ fill: '#F8FAFC' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={24}>
                                {mockData.inventory.categoryStock.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alerts Sidebar */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 px-2 mb-4 text-sm uppercase tracking-tighter">Inventory Alerts</h3>
                {mockData.inventory.alerts.map((alert, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border ${alert.color.split(' ').slice(-1)[0]} flex items-start gap-4 transition-all hover:translate-x-1 cursor-pointer bg-white`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.color.split(' ').slice(1, 2)[0]} border border-white`}>
                            <alert.icon className={`w-6 h-6 ${alert.color.split(' ')[0]}`} />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">{alert.title}</h4>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-bold text-gray-900">{alert.count}</p>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${alert.title.includes('Expired') ? 'bg-red-500' : 'bg-orange-500'
                                    } ${alert.title.includes('Total') ? 'hidden' : ''}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const QuickReportsTab = ({ onExport }) => (
    <div className="space-y-8">
        {/* Generate Reports Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Generate Reports</h3>
                <p className="text-sm text-gray-500">Select a report type and export in your preferred format</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockData.quickReports.map((report, idx) => (
                    <button
                        key={idx}
                        onClick={() => onExport(report)}
                        className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-teal-500 hover:bg-teal-50/10 transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 shrink-0 transition-colors">
                            <report.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{report.title}</h4>
                            <p className="text-xs text-gray-500">{report.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Report Summary Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Report Summary</h3>
                <p className="text-sm text-gray-500">Key metrics at a glance</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockData.quickReportSummary.map((item, idx) => (
                    <div key={idx} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-sm font-medium text-gray-500 mb-2">{item.label}</p>
                        <h4 className={`text-xl font-black ${item.color}`}>{item.value}</h4>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default Report;
