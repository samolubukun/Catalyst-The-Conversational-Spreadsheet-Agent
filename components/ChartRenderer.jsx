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
    Cell 
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ChartRenderer({ config }) {
    if (!config || !config.data || !Array.isArray(config.data)) {
        return <div className="p-4 text-slate-500 text-xs italic">Invalid chart configuration</div>;
    }

    const formatYAxis = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value;
    };

    const renderChart = () => {
        const commonXAxisProps = {
            dataKey: config.xAxis,
            axisLine: false,
            tickLine: false,
            tick: { fontSize: 9, fill: '#64748b' },
            interval: 0,
            angle: config.data.length > 5 ? -45 : 0,
            textAnchor: config.data.length > 5 ? 'end' : 'middle',
            height: 60
        };

        switch (config.type?.toLowerCase()) {
            case 'bar':
                return (
                    <BarChart data={config.data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis {...commonXAxisProps} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatYAxis} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                        <Bar dataKey={config.yAxis} fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={config.data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis {...commonXAxisProps} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatYAxis} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                        <Line type="monotone" dataKey={config.yAxis} stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    </LineChart>
                );
            case 'pie':
                return (
                    <PieChart margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                        <Pie
                            data={config.data}
                            dataKey={config.yAxis}
                            nameKey={config.xAxis}
                            cx="50%"
                            cy="50%"
                            outerRadius={55}
                            innerRadius={35}
                            paddingAngle={5}
                            fill="#8884d8"
                            label={({ name, percent, x, y, cx, cy, midAngle }) => (
                                <text 
                                    x={x} 
                                    y={y} 
                                    fill="#64748b" 
                                    textAnchor={x > cx ? 'start' : 'end'} 
                                    dominantBaseline="central"
                                    fontSize="10"
                                    fontWeight="bold"
                                >
                                    {`${name} (${(percent * 100).toFixed(0)}%)`}
                                </text>
                            )}
                            labelLine={true}
                        >
                            {config.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                );
            default:
                return <div className="p-4 text-slate-500 text-xs italic">Unsupported chart type: {config.type}</div>;
        }
    };

    return (
        <div className="w-full h-80 mt-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
