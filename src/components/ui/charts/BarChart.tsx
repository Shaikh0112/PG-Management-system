'use client';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function BarChart({ data, xAxisKey, dataKey, color = 'var(--primary)', height = 300 }: any) {
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
        <RechartsBar data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: tooltipText, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: color, fontWeight: 'bold' }}
          />
          <Bar 
            dataKey={dataKey} 
            fill={color} 
            radius={[4, 4, 0, 0]}
            barSize={40}
          />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}
