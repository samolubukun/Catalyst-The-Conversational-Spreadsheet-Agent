"use client"

import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    LineChart, 
    Line, 
    PieChart, 
    Pie, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    Cell,
    AreaChart,
    Area,
    ComposedChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    RadarChart,
    Radar,
    ScatterChart,
    Scatter
} from 'recharts';
import { cn } from "@/lib/utils";

const THEME_PALETTES = {
    catalyst: {
        primary: '#10b981',
        secondary: '#3b82f6',
        grid: '#f1f5f9',
        text: '#64748b',
        pie: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    },
    executive: {
        primary: '#2563eb',
        secondary: '#4f46e5',
        grid: '#f8fafc',
        text: '#94a3b8',
        pie: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#1d4ed8']
    },
    midnight: {
        primary: '#6366f1',
        secondary: '#ec4899',
        grid: '#1e293b',
        text: '#94a3b8',
        pie: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#4f46e5', '#ec4899']
    },
    emerald: {
        primary: '#fbbf24',
        secondary: '#34d399',
        grid: '#064e3b/30',
        text: '#6ee7b7',
        pie: ['#fbbf24', '#f59e0b', '#d97706', '#34d399', '#059669', '#10b981']
    },
    cyberpunk: {
        primary: '#d946ef',
        secondary: '#06b6d4',
        grid: '#27104e/50',
        text: '#f472b6',
        pie: ['#d946ef', '#f472b6', '#a21caf', '#06b6d4', '#22d3ee', '#1e1b4b']
    },
    aurora: {
        primary: '#22d3ee',
        secondary: '#38bdf8',
        grid: '#ffffff/5',
        text: '#94a3b8',
        pie: ['#22d3ee', '#06b6d4', '#0891b2', '#00f5ff', '#38bdf8', '#0284c7']
    },
    corporate: {
        primary: '#0284c7',
        secondary: '#0f172a',
        grid: '#f1f5f9',
        text: '#475569',
        pie: ['#0284c7', '#0369a1', '#075985', '#38bdf8', '#0f172a', '#475569']
    },
    minimalist: {
        primary: '#d97706',
        secondary: '#78716c',
        grid: '#e7e5e4',
        text: '#78716c',
        pie: ['#d97706', '#b45309', '#f59e0b', '#78716c', '#a8a29e', '#d6d3d1']
    }
};

export default function ChartRenderer({ config, theme = 'catalyst' }) {
    if (!config || !config.data || !Array.isArray(config.data)) {
        return <div className="p-4 text-slate-500 text-xs italic">Invalid chart configuration</div>;
    }

    const palette = THEME_PALETTES[theme] || THEME_PALETTES.catalyst;
    const PIE_COLORS = palette.pie;

    const formatYAxis = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value;
    };

    const isDarkTheme = ['midnight', 'emerald', 'cyberpunk', 'aurora', 'corporate_dark'].includes(theme);
    const gridColor = theme === 'emerald' ? 'rgba(52, 211, 153, 0.1)' : 
                      theme === 'cyberpunk' ? 'rgba(217, 70, 239, 0.1)' : 
                      theme === 'aurora' ? 'rgba(255, 255, 255, 0.05)' : 
                      theme === 'midnight' ? 'rgba(99, 102, 241, 0.1)' : 
                      '#e2e8f0';

    const tickColor = isDarkTheme ? '#94a3b8' : '#64748b';

    const renderChart = () => {
        const commonXAxisProps = {
            dataKey: config.xAxis,
            axisLine: false,
            tickLine: false,
            tick: { fontSize: 9, fill: tickColor },
            interval: config.data.length > 30 ? Math.ceil(config.data.length / 6) : 
                      config.data.length > 15 ? 2 : 0,
            angle: config.data.length > 5 ? -45 : 0,
            textAnchor: config.data.length > 5 ? 'end' : 'middle',
            height: 60
        };

        const tooltipContentStyle = {
            borderRadius: '12px',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : 'none',
            backgroundColor: isDarkTheme ? '#0f172a' : '#ffffff',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            fontSize: '12px',
            color: isDarkTheme ? '#ffffff' : '#0f172a'
        };

        switch (config.type?.toLowerCase()) {
            case 'bar':
                return (
                    <BarChart data={config.data} margin={{ top: 15, right: 15, left: -10, bottom: 35 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis {...commonXAxisProps} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} tickFormatter={formatYAxis} />
                        <Tooltip contentStyle={tooltipContentStyle} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                        <Bar dataKey={config.yAxis} fill={palette.primary} radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                );
            case 'horizontalbar':
            case 'horizontal-bar':
            case 'horizontal_bar':
                return (
                    <BarChart layout="vertical" data={config.data} margin={{ top: 15, right: 25, left: 30, bottom: 15 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} tickFormatter={formatYAxis} />
                        <YAxis type="category" dataKey={config.xAxis} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} width={80} />
                        <Tooltip contentStyle={tooltipContentStyle} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                        <Bar dataKey={config.yAxis} fill={palette.primary} radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={config.data} margin={{ top: 15, right: 15, left: -10, bottom: 35 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis {...commonXAxisProps} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} tickFormatter={formatYAxis} />
                        <Tooltip contentStyle={tooltipContentStyle} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                        <Line type="monotone" dataKey={config.yAxis} stroke={palette.primary} strokeWidth={3} dot={{ r: 4, fill: palette.primary }} activeDot={{ r: 6 }} />
                    </LineChart>
                );
            case 'pie':
                const pieTotal = config.data.reduce((sum, item) => sum + (Number(item[config.yAxis]) || 0), 0);
                return (
                    <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <Pie
                            data={config.data}
                            dataKey={config.yAxis}
                            nameKey={config.xAxis}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={40}
                            paddingAngle={4}
                            fill={palette.primary}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const RADIAN = Math.PI / 180;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                
                                return percent > 0.05 ? (
                                    <text 
                                        x={x} 
                                        y={y} 
                                        fill="#ffffff" 
                                        textAnchor="middle" 
                                        dominantBaseline="central"
                                        fontSize="10"
                                        fontWeight="black"
                                    >
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                ) : null;
                            }}
                            labelLine={false}
                        >
                            {config.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipContentStyle} />
                        <Legend 
                            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
                            formatter={(value, entry) => {
                                const rawVal = Number(entry.payload?.[config.yAxis]) || 0;
                                const percent = pieTotal > 0 ? (rawVal / pieTotal) : 0;
                                return `${value} (${(percent * 100).toFixed(0)}%)`;
                            }}
                        />
                    </PieChart>
                );
            case 'area':
                const gradientId = `colorArea-${theme}`;
                return (
                    <AreaChart data={config.data} margin={{ top: 15, right: 15, left: -10, bottom: 35 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={palette.primary} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={palette.primary} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis {...commonXAxisProps} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} tickFormatter={formatYAxis} />
                        <Tooltip contentStyle={tooltipContentStyle} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                        <Area type="monotone" dataKey={config.yAxis} stroke={palette.primary} strokeWidth={3} fillOpacity={1} fill={`url(#${gradientId})`} />
                    </AreaChart>
                );
            case 'composed':
                return (
                    <ComposedChart data={config.data} margin={{ top: 15, right: 15, left: -10, bottom: 35 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis {...commonXAxisProps} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} tickFormatter={formatYAxis} />
                        <Tooltip contentStyle={tooltipContentStyle} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                        <Bar dataKey={config.yAxis} fill={palette.secondary} opacity={0.7} radius={[4, 4, 0, 0]} barSize={30} />
                        <Line type="monotone" dataKey={config.yAxis} stroke={palette.primary} strokeWidth={3} dot={{ r: 4, fill: palette.primary }} />
                    </ComposedChart>
                );
            case 'radar':
                return (
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={config.data}>
                        <PolarGrid stroke={gridColor} />
                        <PolarAngleAxis dataKey={config.xAxis} tick={{ fontSize: 9, fill: tickColor }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 8, fill: tickColor }} />
                        <Radar name={config.yAxis} dataKey={config.yAxis} stroke={palette.primary} fill={palette.primary} fillOpacity={0.4} />
                        <Tooltip contentStyle={tooltipContentStyle} />
                    </RadarChart>
                );
            case 'scatter':
                return (
                    <ScatterChart margin={{ top: 15, right: 20, left: -10, bottom: 35 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis type="category" {...commonXAxisProps} />
                        <YAxis type="number" dataKey={config.yAxis} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} tickFormatter={formatYAxis} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipContentStyle} />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                        <Scatter name={config.yAxis} data={config.data} fill={palette.primary} />
                    </ScatterChart>
                );
            default:
                return <div className="p-4 text-slate-500 text-xs italic">Unsupported chart type: {config.type}</div>;
        }
    };

    return (
        <div className="w-full h-80 mt-4 bg-transparent p-0 border-none shadow-none">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
