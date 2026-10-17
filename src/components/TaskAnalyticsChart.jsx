import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * TaskAnalyticsChart Component
 * Demonstrates lazy loading of a heavy third-party library (Chart.js)
 * This component and its Chart.js dependencies are bundled into an isolated
 * chunk that is NEVER downloaded until the user visits this view.
 */
function TaskAnalyticsChart({ tasks = [] }) {
  const bundleChartRef = useRef(null);
  const taskChartRef = useRef(null);
  const bundleChartInstance = useRef(null);
  const taskChartInstance = useRef(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' || t.priority === 'High').length;
  const medPriorityCount = tasks.filter((t) => t.priority === 'medium' || t.priority === 'Medium').length;
  const lowPriorityCount = tasks.length - highPriorityCount - medPriorityCount;

  useEffect(() => {
    // 1. Render Bundle Size Comparison Chart
    if (bundleChartRef.current) {
      if (bundleChartInstance.current) {
        bundleChartInstance.current.destroy();
      }
      const ctx = bundleChartRef.current.getContext('2d');
      bundleChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [
            'Baseline (Single Bundle)',
            'Code-Split: Main Chunk',
            'Projects Route Chunk',
            'Contact Route Chunk',
            'Chart.js Analytics Chunk'
          ],
          datasets: [
            {
              label: 'Bundle / Chunk Size (kB)',
              data: [292.68, 142.5, 38.2, 12.8, 115.4],
              backgroundColor: [
                'rgba(239, 68, 68, 0.75)',
                'rgba(59, 130, 246, 0.75)',
                'rgba(16, 185, 129, 0.75)',
                'rgba(245, 158, 11, 0.75)',
                'rgba(139, 92, 246, 0.75)'
              ],
              borderColor: [
                'rgb(239, 68, 68)',
                'rgb(59, 130, 246)',
                'rgb(16, 185, 129)',
                'rgb(245, 158, 11)',
                'rgb(139, 92, 246)'
              ],
              borderWidth: 1.5,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => context.raw + ' kB'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Size in Kilobytes (kB)' },
              grid: { color: 'rgba(150, 150, 150, 0.15)' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 2. Render Tasks Breakdown Doughnut Chart
    if (taskChartRef.current) {
      if (taskChartInstance.current) {
        taskChartInstance.current.destroy();
      }
      const ctx2 = taskChartRef.current.getContext('2d');
      taskChartInstance.current = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: [
            'Completed Tasks',
            'Pending Tasks',
            'High Priority',
            'Med / Low Priority'
          ],
          datasets: [
            {
              data: [
                completedCount || 1,
                pendingCount || 1,
                highPriorityCount || 1,
                (medPriorityCount + lowPriorityCount) || 1
              ],
              backgroundColor: [
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#6366f1'
              ],
              borderWidth: 2,
              hoverOffset: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 14, padding: 12 }
            }
          }
        }
      });
    }

    return () => {
      if (bundleChartInstance.current) bundleChartInstance.current.destroy();
      if (taskChartInstance.current) taskChartInstance.current.destroy();
    };
  }, [completedCount, pendingCount, highPriorityCount, medPriorityCount, lowPriorityCount]);

  return (
    <div className="analytics-chart-container">
      <div className="chart-header-banner">
        <span className="chart-pill-badge">⚡ Code-Split Heavy Component</span>
        <h3 className="chart-section-title">Practical 8: Lazy Loaded Visualizations</h3>
        <p className="chart-section-desc">
          This entire charting module (powered by <code>Chart.js</code>) was loaded asynchronously
          in a separate JavaScript chunk. It did not bloat the initial page load time!
        </p>
      </div>

      <div className="chart-grid-layout">
        <div className="chart-card">
          <h4 className="chart-card-title">📊 Bundle Size Reduction (Before vs After)</h4>
          <p className="chart-card-subtitle">
            Initial bundle reduced from <strong>292.68 kB</strong> to <strong>~142 kB</strong> (-51.3% initial payload!)
          </p>
          <div className="chart-canvas-wrapper">
            <canvas ref={bundleChartRef}></canvas>
          </div>
        </div>

        <div className="chart-card">
          <h4 className="chart-card-title">🎯 Task Analytics & Priority Breakdown</h4>
          <p className="chart-card-subtitle">
            Live task distribution for current session ({tasks.length} total tasks)
          </p>
          <div className="chart-canvas-wrapper">
            <canvas ref={taskChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskAnalyticsChart;
