import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

type Stats = {
  correct: number;
  accuracy: number;
  patternsPerMin: number;
  total: number;
};

type StatsSummaryProps = {
  stats: Stats;
};

const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  const barRef = useRef<HTMLCanvasElement>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let barChart: Chart | null = null;
    let pieChart: Chart | null = null;
    if (barRef.current) {
      try {
        barChart = new Chart(barRef.current, {
          type: 'bar',
          data: {
            labels: ['Correct', 'Incorrect'],
            datasets: [{
              label: 'Answers',
              data: [stats.correct, stats.total - stats.correct],
              backgroundColor: ['#22c55e', '#ef4444'],
            }]
          },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      } catch (e) {}
    }
    if (pieRef.current) {
      try {
        pieChart = new Chart(pieRef.current, {
          type: 'pie',
          data: {
            labels: ['Accuracy', 'Misses'],
            datasets: [{
              data: [stats.accuracy, 100 - stats.accuracy],
              backgroundColor: ['#3b82f6', '#fbbf24'],
            }]
          },
          options: { responsive: true, plugins: { legend: { display: true } } }
        });
      } catch (e) {}
    }
    return () => {
      barChart && barChart.destroy();
      pieChart && pieChart.destroy();
    };
  }, [stats]);

  return (
    <div className="mt-8 p-4 bg-white bg-opacity-80 rounded-xl shadow-lg">
      <div className="font-bold text-lg mb-2">Session Summary</div>
      <div>Correct: {stats.correct}</div>
      <div>Accuracy: {stats.accuracy}%</div>
      <div>Patterns/min: {stats.patternsPerMin}</div>
      <div className="flex gap-8 mt-4">
        <div>
          <canvas ref={barRef} width={120} height={120} />
        </div>
        <div>
          <canvas ref={pieRef} width={120} height={120} />
        </div>
      </div>
    </div>
  );
};

export default StatsSummary; 