'use client';
import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function AreaChart({ data, xAxisKey, dataKey, color = 'var(--primary)', height = 300 }: any) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height }} className="w-full animate-pulse bg-[var(--bg-page)] rounded-lg"></div>;

  const textColor = theme === 'dark' ? '#94A3B8' : '#64748B'; // slate-400 : slate-500
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const tooltipBg = theme === 'dark' ? 'var(--bg-card)' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? 'var(--border)' : '#E2E8F0';
  const tooltipText = theme === 'dark' ? '#FFFFFF' : '#0F172A';

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsArea data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey={xAxisKey} 
            stroke={textColor} 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke={textColor} 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value/1000}k`}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: tooltipText, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: color, fontWeight: 'bold' }}
            formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill={`url(#color-${dataKey})`} 
          />
        </RechartsArea>
      </ResponsiveContainer>
    </div>
  );
}
