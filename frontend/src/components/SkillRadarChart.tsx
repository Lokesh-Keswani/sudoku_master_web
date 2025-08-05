import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { SkillRatings } from '../store/aiCoachStore';
import { motion } from 'framer-motion';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SkillRadarChartProps {
  skillRatings: SkillRatings;
  className?: string;
  height?: number;
  width?: number;
  showLegend?: boolean;
  showTooltips?: boolean;
  animate?: boolean;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  skillRatings,
  className = '',
  height = 400,
  width = 400,
  showLegend = true,
  showTooltips = true,
  animate = true,
}) => {
  const chartRef = useRef<ChartJS<'radar'>>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Format skill names for display
  const formatSkillName = (skill: string): string => {
    return skill.replace(/([A-Z])/g, ' $1').trim();
  };

  // Get color based on rating
  const getRatingColor = (rating: number): string => {
    if (rating >= 80) return 'rgba(34, 197, 94, 0.8)'; // Green
    if (rating >= 60) return 'rgba(59, 130, 246, 0.8)'; // Blue
    if (rating >= 40) return 'rgba(245, 158, 11, 0.8)'; // Yellow
    return 'rgba(239, 68, 68, 0.8)'; // Red
  };

  // Get border color based on rating
  const getBorderColor = (rating: number): string => {
    if (rating >= 80) return 'rgb(34, 197, 94)'; // Green
    if (rating >= 60) return 'rgb(59, 130, 246)'; // Blue
    if (rating >= 40) return 'rgb(245, 158, 11)'; // Yellow
    return 'rgb(239, 68, 68)'; // Red
  };

  const chartData: ChartData<'radar'> = {
    labels: Object.keys(skillRatings).map(formatSkillName),
    datasets: [
      {
        label: 'Current Skills',
        data: Object.values(skillRatings),
        backgroundColor: Object.values(skillRatings).map(getRatingColor),
        borderColor: Object.values(skillRatings).map(getBorderColor),
        borderWidth: 2,
        pointBackgroundColor: Object.values(skillRatings).map(getBorderColor),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: Object.values(skillRatings).map(getBorderColor),
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: 500,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: showTooltips,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            return `Skill: ${context[0].label}`;
          },
          label: (context) => {
            const rating = context.parsed.r;
            let level = '';
            if (rating >= 80) level = 'Expert';
            else if (rating >= 60) level = 'Advanced';
            else if (rating >= 40) level = 'Intermediate';
            else level = 'Beginner';
            
            return `Rating: ${rating}% (${level})`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          color: '#6b7280',
          font: {
            size: 10,
          },
          callback: (value) => `${value}%`,
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
          lineWidth: 1,
        },
        angleLines: {
          color: 'rgba(107, 114, 128, 0.3)',
          lineWidth: 1,
        },
        pointLabels: {
          color: '#374151',
          font: {
            size: 11,
            weight: 500,
          },
          padding: 15,
        },
      },
    },
    elements: {
      line: {
        tension: 0.1,
      },
    },
  };

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsLoaded(true);
    }
  }, [animate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const chartVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.2,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isLoaded ? 'visible' : 'hidden'}
      style={{ height, width }}
    >
      <motion.div
        className="w-full h-full"
        variants={chartVariants}
        initial="hidden"
        animate={isLoaded ? 'visible' : 'hidden'}
      >
        <Radar
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          height={height}
          width={width}
        />
      </motion.div>
      
      {/* Skill level indicators */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-green-600 font-medium">Expert (80-100%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-blue-600 font-medium">Advanced (60-79%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-yellow-600 font-medium">Intermediate (40-59%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-red-600 font-medium">Beginner (0-39%)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillRadarChart; 