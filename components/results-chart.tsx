"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Label } from "@/components/ui/label";

interface GraphData {
  title?: string;
  x_label?: string;
  y_label?: string;
  slider_param?: string;
  slider_min?: number;
  slider_max?: number;
  slider_default?: number;
  data_points?: Array<{ x: number; y: number; param_value: number }>;
}

interface ResultsChartProps {
  data: { name: string; value: number }[] | GraphData;
}

export function ResultsChart({ data }: ResultsChartProps) {
  // Check if data has the new graph_data structure - do this check first
  const isParametricData = "data_points" in data && Array.isArray(data.data_points);
  const graphData = isParametricData ? (data as GraphData) : null;
  
  // Always call hooks in the same order
  const [sliderValue, setSliderValue] = useState(
    graphData?.slider_default ?? 50
  );

  const filteredData = useMemo(() => {
    if (!graphData?.data_points) return [];
    
    // Group data by param_value and find closest match to slider
    const grouped = new Map<number, Array<{ x: number; y: number }>>();
    
    for (const point of graphData.data_points) {
      if (!grouped.has(point.param_value)) {
        grouped.set(point.param_value, []);
      }
      grouped.get(point.param_value)?.push({ x: point.x, y: point.y });
    }
    
    // Find closest param_value to slider
    const paramValues = Array.from(grouped.keys()).sort((a, b) => a - b);
    if (paramValues.length === 0) return [];
    
    const closestParam = paramValues.reduce((prev, curr) => {
      return Math.abs(curr - sliderValue) < Math.abs(prev - sliderValue)
        ? curr
        : prev;
    });
    
    return grouped.get(closestParam) || [];
  }, [graphData?.data_points, sliderValue]);

  if (!isParametricData || !graphData) {
    // Legacy line chart for old data format
    const legacyData = data as { name: string; value: number }[];
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={legacyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // New parametric chart with slider
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="param-slider">
          {graphData.slider_param || "Parameter"}: {sliderValue}
        </Label>
        <input
          type="range"
          id="param-slider"
          min={graphData.slider_min ?? 0}
          max={graphData.slider_max ?? 100}
          step={1}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="x" 
            label={{ value: graphData.x_label || "X", position: "insideBottom", offset: -5 }}
          />
          <YAxis 
            label={{ value: graphData.y_label || "Y", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="y" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      {graphData.title && (
        <p className="text-center text-sm text-muted-foreground">
          {graphData.title}
        </p>
      )}
    </div>
  );
}
