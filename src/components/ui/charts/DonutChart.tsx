'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function DonutChart({ data, dataKey = 'value', nameKey = 'name', height = 300 }: any) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height }} className="w-full animate-pulse bg-[var(--bg-page)] rounded-lg"></div>;

  const tooltipBg = theme === 'dark' ? 'var(--bg-card)' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? 'var(--border)' : '#E2E8F0';
  const tooltipText = theme === 'dark' ? '#FFFFFF' : '#0F172A';

  // Default color palette based on standard CSS vars (adjust if needed)
  const COLORS = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--info)'];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
            stroke="none"
          >
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: tooltipText, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: tooltipText }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
