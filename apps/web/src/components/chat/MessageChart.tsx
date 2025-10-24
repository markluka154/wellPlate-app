'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MessageChartProps {
  title: string
  data: Array<{ name: string; value: number }>
}

export default function MessageChart({ title, data }: MessageChartProps) {
  return (
    <div className="flex gap-3 animate-fadeIn">
      {/* Avatar */}
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
        <span className="text-white font-semibold text-sm">L</span>
      </div>

      {/* Chart Message */}
      <div className="max-w-[80%] bg-white px-4 py-3 rounded-[20px] rounded-bl-[6px] shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00C46A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
