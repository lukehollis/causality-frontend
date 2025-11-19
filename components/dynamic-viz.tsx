"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

interface DynamicVizProps {
  vizType: string;
  vizData: any;
}

export function DynamicViz({ vizType, vizData }: DynamicVizProps) {
  const renderVisualization = useMemo(() => {
    // Validate that we have real data before attempting to render
    if (!vizData || (typeof vizData === 'object' && Object.keys(vizData).length === 0)) {
      return (
        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          No data available for visualization
        </div>
      );
    }

    switch (vizType) {
      case "coefficient_plot":
        return renderCoefficientPlot(vizData);
      
      case "subgroup_comparison":
        return renderSubgroupComparison(vizData);
      
      case "balance_plot":
        return renderBalancePlot(vizData);
      
      case "specification_curve":
        return renderSpecificationCurve(vizData);
      
      case "forest_plot":
        return renderForestPlot(vizData);
      
      case "bar_chart":
        return renderBarChart(vizData);
      
      case "line_chart":
        return renderLineChart(vizData);
      
      case "event_study":
        return renderEventStudy(vizData);
      
      case "trend_comparison":
        return renderTrendComparison(vizData);
      
      default:
        return (
          <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
            Visualization type "{vizType}" not yet implemented
          </div>
        );
    }
  }, [vizType, vizData]);

  return <div className="w-full">{renderVisualization}</div>;
}

function renderCoefficientPlot(data: any) {
  // Validate required fields
  if (!data.estimate || data.ci_lower === undefined || data.ci_upper === undefined) {
    return (
      <div className="text-sm text-muted-foreground">
        Invalid data for coefficient plot (missing estimate or confidence intervals)
      </div>
    );
  }

  const chartData = [
    {
      name: data.label || "Treatment Effect",
      estimate: data.estimate,
      ci_lower: data.ci_lower,
      ci_upper: data.ci_upper,
    },
  ];

  const significant = data.p_value < 0.05;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={100} />
        <Tooltip />
        <ReferenceLine x={0} stroke="#666" strokeWidth={2} />
        <Bar dataKey="estimate" fill={significant ? "#10b981" : "#6b7280"} />
        <Bar dataKey="ci_lower" fill="none" />
        <Bar dataKey="ci_upper" fill="none" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderSubgroupComparison(data: any) {
  const chartData = data.subgroups || [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={90} />
        <Tooltip />
        <Legend />
        <ReferenceLine x={0} stroke="#666" strokeWidth={2} />
        <Bar dataKey="effect" fill="#3b82f6">
          {chartData.map((entry: any) => (
            <Cell key={`cell-${entry.name}`} fill={entry.significant ? "#10b981" : "#6b7280"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderBalancePlot(data: any) {
  const chartData = data.covariates || [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ left: 100, right: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="std_diff"
          label={{ value: "Standardized Difference", position: "insideBottom", offset: -5 }}
        />
        <YAxis type="category" dataKey="name" width={90} />
        <Tooltip />
        <ReferenceLine x={0} stroke="#666" strokeWidth={2} />
        <ReferenceLine x={-0.1} stroke="#ef4444" strokeDasharray="5 5" />
        <ReferenceLine x={0.1} stroke="#ef4444" strokeDasharray="5 5" />
        <Scatter data={chartData} fill="#3b82f6">
          {chartData.map((entry: any) => (
            <Cell key={`cell-${entry.name}`} fill={entry.imbalanced ? "#ef4444" : "#10b981"} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function renderSpecificationCurve(data: any) {
  const chartData = (data.specifications || []).map((spec: any, idx: number) => ({
    ...spec,
    index: idx,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis label={{ value: "Effect Estimate", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <ReferenceLine y={0} stroke="#666" strokeWidth={2} />
        <Line type="monotone" dataKey="estimate" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5 }}>
          {chartData.map((entry: any) => (
            <Cell key={`cell-${entry.name}`} fill={entry.p_value < 0.05 ? "#10b981" : "#6b7280"} />
          ))}
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function renderForestPlot(data: any) {
  // Similar to subgroup comparison but with CI bars
  return renderSubgroupComparison(data);
}

function renderBarChart(data: any) {
  const chartData = data.data || [];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderLineChart(data: any) {
  const chartData = data.data || [];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function renderEventStudy(data: any) {
  const chartData = data.data || [];
  
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="x" 
          label={{ value: "Periods Relative to Treatment", position: "insideBottom", offset: -5 }}
        />
        <YAxis label={{ value: "Coefficient", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <ReferenceLine x={0} stroke="#ef4444" strokeWidth={2} label="Treatment" />
        <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
        <Line 
          type="monotone" 
          dataKey="y" 
          stroke="#3b82f6" 
          strokeWidth={2} 
          dot={{ r: 4 }}
          name="Effect Estimate"
        />
        <Line 
          type="monotone" 
          dataKey="ci_lower" 
          stroke="#3b82f6" 
          strokeWidth={1} 
          strokeDasharray="5 5"
          dot={false}
          name="95% CI Lower"
        />
        <Line 
          type="monotone" 
          dataKey="ci_upper" 
          stroke="#3b82f6" 
          strokeWidth={1} 
          strokeDasharray="5 5"
          dot={false}
          name="95% CI Upper"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function renderTrendComparison(data: any) {
  const chartData = data.data || [];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: "Time Period", position: "insideBottom", offset: -5 }} />
        <YAxis label={{ value: "Outcome", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="treated_mean" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Treated Group"
        />
        <Line 
          type="monotone" 
          dataKey="control_mean" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Control Group"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
