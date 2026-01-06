import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface PriceHistoryChartProps {
  productName: string;
}

// Generates simulated historical data for visualization purposes
// In a real app with a DB, this would be fetched real data.
const generateSimulatedData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date();
  let basePrice = Math.floor(Math.random() * 200) + 50;

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    
    // Random fluctuation
    const fluctuation = (Math.random() - 0.5) * 20;
    basePrice += fluctuation;
    
    data.push({
      date: date.toLocaleString('default', { month: 'short' }),
      price: Math.max(0, Math.round(basePrice))
    });
  }
  return data;
};

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ productName }) => {
  const data = React.useMemo(() => generateSimulatedData(), []);

  return (
    <div className="w-full h-64 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
        價格趨勢 (預估近 6 個月)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#64748b'}} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#64748b'}}
            tickFormatter={(value) => `$${value}`} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`$${value}`, '平均價格']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#6366f1" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryChart;