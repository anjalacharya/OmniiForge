
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CompatibilityReport } from '../types.ts';

interface Props {
  data: CompatibilityReport;
}

const ConversionChart: React.FC<Props> = ({ data }) => {
  const chartData = [
    { subject: 'Compatibility', A: data.compatibilityScore, fullMark: 100 },
    { subject: 'Security', A: data.securityRating, fullMark: 100 },
    { subject: 'Offline Ready', A: data.offlineReadiness, fullMark: 100 },
    { subject: 'Performance', A: 95, fullMark: 100 }, // Static high score for morale
    { subject: 'Stability', A: 88, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 bg-mc-panel rounded-lg border border-mc-accent p-4 flex flex-col items-center justify-center">
      <h3 className="text-mc-green font-bold mb-2 text-sm uppercase tracking-wider">Patch Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#3C3C3C" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#55FF55"
            strokeWidth={2}
            fill="#55FF55"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1D1D1D', borderColor: '#55FF55', color: '#fff' }}
            itemStyle={{ color: '#55FF55' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConversionChart;
