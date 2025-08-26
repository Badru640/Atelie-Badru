import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface ConfirmationData {
  name: string;
  value: number;
  percent: number;
}

interface Guest {
  id: string;
  nome: string;
  familia: string;
  confirmou?: 'sim' | 'não';
  chegou?: boolean;
  convite_enviado?: 'sim' | 'não';
  lado?: 'noiva' | 'noivo';
  mesa?: string;
}

interface GuestChartsProps {
  guests: Guest[];
}

const CONFIRMATION_COLORS = ['#60A5FA', '#EF5350'];
const SIDE_COLORS = ['#60A5FA', '#FACC15', '#A78BFA'];
// Rótulo externo personalizado para o gráfico de Donut
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.value || data.convidados;
    const name = data.name;

    let percentage = null;
    if (typeof data.percent === 'number') {
      percentage = `Porcentagem: ${(data.percent * 100).toFixed(0)}%`;
    }

    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg text-sm">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-gray-700">{`Convidados: ${value}`}</p>
        {percentage && <p className="text-gray-700">{percentage}</p>}
      </div>
    );
  }
  return null;
};

// Custom Legend Component to resolve typing issues
const CustomLegend = ({ payload }: any) => {
  if (!payload) return null;
  return (
    <ul className="flex flex-col items-center pt-5">
      {payload.map((entry: any, index: number) => {
        const { name, value, color } = entry;
        const percent = entry.payload?.percent;

        return (
          <li
            key={`item-${index}`}
            className="flex items-center gap-2 mb-1 text-sm text-gray-700"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            ></span>
            <span>{`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}</span>
          </li>
        );
      })}
    </ul>
  );
};

const GuestCharts: React.FC<GuestChartsProps> = ({ guests }) => {
  const confirmationData = useMemo(() => {
    const confirmed = guests.filter((g) => g.confirmou?.toLowerCase() === 'sim').length;
    const notConfirmed = guests.filter((g) => g.confirmou?.toLowerCase() !== 'sim').length;
    
    const total = confirmed + notConfirmed;
    
    return [
      { name: 'Confirmados', value: confirmed, percent: total > 0 ? confirmed / total : 0 },
      { name: 'Não Confirmados', value: notConfirmed, percent: total > 0 ? notConfirmed / total : 0 },
    ];
  }, [guests]);

  const sideData = useMemo(() => {
    const noiva = guests.filter((g) => g.lado?.toLowerCase() === 'noiva').length;
    const noivo = guests.filter((g) => g.lado?.toLowerCase() === 'noivo').length;
    const outros = guests.length - (noiva + noivo);

    return [
      { name: 'Lado da Noiva', convidados: noiva },
      { name: 'Lado do Noivo', convidados: noivo },
      { name: 'Outros', convidados: outros },
    ];
  }, [guests]);

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-16">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
          Status de Confirmação
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={confirmationData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              label={renderCustomizedLabel}
              labelLine={false}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
              stroke="#FFFFFF"
              strokeWidth={3}
            >
              {confirmationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CONFIRMATION_COLORS[index % CONFIRMATION_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              content={<CustomLegend />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
          Convidados por Lado
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sideData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
              tick={{ fill: '#4B5563', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}`}
              tick={{ fill: '#4B5563', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
              formatter={(value) => <span className="text-gray-700 text-sm">{value}</span>}
            />
            <Bar
              dataKey="convidados"
              fill={SIDE_COLORS[0]}
              radius={[10, 10, 0, 0]}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {sideData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SIDE_COLORS[index % SIDE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GuestCharts;