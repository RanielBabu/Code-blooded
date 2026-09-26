"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { StimulusType } from "@/types/participant";

interface StimulusItem {
  type: StimulusType;
  avgRt: number;
  accuracy: number;
  count: number;
}

export function StimulusComparisonChart({ data }: { data: StimulusItem[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.type.toUpperCase(),
  }));

  return (
    <div className="w-full h-[260px] lg:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 15, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#697386"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <YAxis
            stroke="#697386"
            fontSize={11}
            unit=" ms"
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as StimulusItem & { label: string };
                return (
                  <div className="glass-panel-elevated p-3 rounded-lg border border-white/15 text-xs space-y-1">
                    <p className="font-semibold text-white font-mono">{label} STIMULUS</p>
                    <p className="text-[#4F8CFF]">Latency: {item.avgRt} ms</p>
                    <p className="text-[#22C55E]">Accuracy: {item.accuracy}%</p>
                    <p className="text-[#A5ADBD]">Trials recorded: {item.count}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
            iconSize={8}
            formatter={(val) => <span className="text-[#A5ADBD]">{val}</span>}
          />
          <Bar name="Avg Reaction Time (ms)" dataKey="avgRt" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AccuracyBarChart({
  data,
}: {
  data: { name: string; accuracy: number }[];
}) {
  return (
    <div className="w-full h-[240px] lg:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#697386"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <YAxis
            stroke="#697386"
            fontSize={10}
            unit="%"
            domain={[60, 100]}
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="glass-panel-elevated p-2.5 rounded-lg border border-white/15 text-xs">
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-[#22C55E] font-medium mt-1">
                      {payload[0].value}% accuracy
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="accuracy" fill="#22C55E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
