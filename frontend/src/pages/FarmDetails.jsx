import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';
import Tabs from '../components/Tabs';
import LeafHealthWidget from '../components/widgets/LeafHealthWidget';
import TemperatureWidget from '../components/widgets/TemperatureWidget';
import HumidityWidget from '../components/widgets/HumidityWidget';
import LightWidget from '../components/widgets/LightWidget';
import AIAnalysis from '../components/AIAnalysis';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

const mockStatus = {
  FARM1: { temperature: 27, humidity: 65, sunlight: 90 },
  FARM2: { temperature: 24, humidity: 72, sunlight: 60 },
  FARM3: { temperature: 29, humidity: 58, sunlight: 95 },
};

const getGradient = (ctx, colorTop, colorBottom) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, colorTop);
  gradient.addColorStop(1, colorBottom);
  return gradient;
};

const FarmDetails = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();
  const storageKey = `farmStatus_${farmId?.toUpperCase()}`;
  
  const getInitialStatus = () => {
    const local = localStorage.getItem(storageKey);
    if (local) return JSON.parse(local);
    return mockStatus[farmId?.toUpperCase()] || { temperature: 0, humidity: 0, sunlight: 0 };
  };

  // Chart data state
  const [chartData, setChartData] = useState({
    temperature: {
      labels: [],
      datasets: [{
        label: 'Temperature (°C)',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 10,
        shadowColor: 'rgba(255,99,132,0.3)'
      }]
    },
    humidity: {
      labels: [],
      datasets: [{
        label: 'Humidity (%)',
        data: [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        pointBackgroundColor: 'rgb(53, 162, 235)',
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 10,
        shadowColor: 'rgba(53,162,235,0.3)'
      }]
    },
    sunlight: {
      labels: [],
      datasets: [{
        label: 'Sunlight (lux)',
        data: [],
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        pointBackgroundColor: 'rgb(255, 206, 86)',
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 10,
        shadowColor: 'rgba(255,206,86,0.3)'
      }]
    }
  });

  // Refs for chart instances
  const tempRef = useRef();
  const humRef = useRef();

  // Chart options
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Time',
          color: '#888',
          font: { weight: 'bold' }
        },
        grid: { color: '#eee' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#eee' },
        ticks: { color: '#888' }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { weight: 'bold' }, color: '#444' }
      },
      title: {
        display: true,
        text: 'Real-time Farm Data',
        color: '#2e7d32',
        font: { size: 18, weight: 'bold' }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#fff',
        titleColor: '#2e7d32',
        bodyColor: '#333',
        borderColor: '#2e7d32',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        caretSize: 8,
        displayColors: false
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setChartData(prevData => ({
        temperature: {
          ...prevData.temperature,
          labels: [...prevData.temperature.labels, now].slice(-20),
          datasets: [{
            ...prevData.temperature.datasets[0],
            data: [...prevData.temperature.datasets[0].data, getInitialStatus().temperature ?? (Math.random() * 30 + 10)].slice(-20)
          }]
        },
        humidity: {
          ...prevData.humidity,
          labels: [...prevData.humidity.labels, now].slice(-20),
          datasets: [{
            ...prevData.humidity.datasets[0],
            data: [...prevData.humidity.datasets[0].data, getInitialStatus().humidity ?? (Math.random() * 50 + 30)].slice(-20)
          }]
        },
        sunlight: {
          ...prevData.sunlight,
          labels: [...prevData.sunlight.labels, now].slice(-20),
          datasets: [{
            ...prevData.sunlight.datasets[0],
            data: [...prevData.sunlight.datasets[0].data, getInitialStatus().sunlight ?? (Math.random() * 1000 + 500)].slice(-20)
          }]
        }
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getChartDataWithGradient = (data, ref, colorTop, colorBottom) => {
    if (ref.current && ref.current.ctx) {
      const ctx = ref.current.ctx;
      const gradient = getGradient(ctx, colorTop, colorBottom);
      return {
        ...data,
        datasets: data.datasets.map(ds => ({
          ...ds,
          backgroundColor: gradient
        }))
      };
    }
    return data;
  };

  // Xóa sunlight chart và thêm chart mới
  const dliRef = useRef();
  const [dliChartData, setDliChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'daily_light_integral',
        data: [],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33,150,243,0.1)',
        yAxisID: 'y',
        pointRadius: 4,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'DLI Progress (%)',
        data: [],
        borderColor: '#43a047',
        backgroundColor: 'rgba(67,160,71,0.1)',
        yAxisID: 'y1',
        pointRadius: 4,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Elapsed hours (h)',
        data: [],
        borderColor: '#e53935',
        backgroundColor: 'rgba(229,57,53,0.1)',
        yAxisID: 'y2',
        pointRadius: 4,
        tension: 0.3,
        fill: false,
      }
    ]
  });

  const dliOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    plugins: {
      legend: { position: 'top', labels: { font: { weight: 'bold' }, color: '#444' } },
      title: { display: true, text: 'Time series chart', color: '#2196f3', font: { size: 18, weight: 'bold' } },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            if (label === 'daily_light_integral') {
              return `DLI: ${value.toFixed(3)} mol·m⁻²·day⁻¹`;
            } else if (label === 'DLI Progress (%)') {
              return `Tiến độ DLI: ${value.toFixed(2)} %`;
            } else if (label === 'Elapsed hours (h)') {
              return `Elapsed hours: ${value.toFixed(2)} h`;
            }
            return `${label}: ${value}`;
          }
        }
      },
      datalabels: {
        display: true,
        align: 'end',
        anchor: 'end',
        formatter: function(value, context) {
          // Hiển thị giá trị cuối cùng trên mỗi đường
          const dataset = context.dataset.data;
          if (context.dataIndex === dataset.length - 1) {
            if (context.dataset.label === 'daily_light_integral') {
              return value.toFixed(2);
            } else if (context.dataset.label === 'DLI Progress (%)') {
              return value.toFixed(1) + '%';
            } else if (context.dataset.label === 'Elapsed hours (h)') {
              return value.toFixed(2) + 'h';
            }
          }
          return '';
        },
        color: function(context) {
          return context.dataset.borderColor;
        },
        font: { weight: 'bold', size: 12 }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'minute', displayFormats: { minute: 'HH:mm:ss' } },
        title: { display: true, text: 'Thời gian', color: '#888', font: { weight: 'bold' } },
        grid: { color: '#eee' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'DLI (mol·m⁻²·day⁻¹)', color: '#2196f3', font: { weight: 'bold' } },
        grid: { color: '#eee' },
        ticks: { color: '#2196f3' },
        min: 0, max: 25
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'DLI Progress (%)', color: '#43a047', font: { weight: 'bold' } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#43a047', callback: val => val + '%' },
        min: 0, max: 100
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        offset: true,
        title: { display: true, text: 'Elapsed hours (h)', color: '#e53935', font: { weight: 'bold' } },
        grid: { drawOnChartArea: false },
        ticks: { color: '#e53935' },
        min: 0, max: 24
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setDliChartData(prev => {
        const lastDli = prev.datasets[0].data.length > 0 ? prev.datasets[0].data[prev.datasets[0].data.length-1] : 0;
        const lastProgress = prev.datasets[1].data.length > 0 ? prev.datasets[1].data[prev.datasets[1].data.length-1] : 0;
        const lastHour = prev.datasets[2].data.length > 0 ? prev.datasets[2].data[prev.datasets[2].data.length-1] : 0;
        // Giả lập dữ liệu tăng dần
        const newDli = Math.min(25, lastDli + Math.random()*2);
        const newProgress = Math.min(100, lastProgress + Math.random()*2);
        const newHour = Math.min(24, lastHour + 0.05 + Math.random()*0.05);
        return {
          labels: [...prev.labels, now].slice(-20),
          datasets: [
            { ...prev.datasets[0], data: [...prev.datasets[0].data, newDli].slice(-20) },
            { ...prev.datasets[1], data: [...prev.datasets[1].data, newProgress].slice(-20) },
            { ...prev.datasets[2], data: [...prev.datasets[2].data, newHour].slice(-20) }
          ]
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0f7fa 0%, #f5f8f5 100%)', padding: 0 }}>
      {/* Header with return button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '32px 0 16px 0',
        maxWidth: 1200,
        margin: '0 auto',
        gap: 16
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 22px',
            fontWeight: 600,
            fontSize: 16,
            boxShadow: '0 2px 8px rgba(46,125,50,0.15)',
            cursor: 'pointer',
            marginRight: 24,
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#256025'}
          onMouseOut={e => e.currentTarget.style.background = '#2e7d32'}
        >
          ← Dashboard
        </button>
        <FaLeaf size={32} color="#2e7d32" style={{ marginRight: 12 }} />
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#2e7d32', margin: 0 }}>Farm Monitoring Dashboard</h1>
          <div style={{ color: '#666', fontSize: 16, marginTop: 2 }}>Real-time environmental data</div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0 48px 0' }}>
        <Tabs tabs={['Graph', 'Monitoring', 'AI']}>
          {/* Tab 1: Graph */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
            {/* Temperature Chart */}
            <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px rgba(255,99,132,0.08)', padding: 32 }}>
              <h2 style={{ color: '#ff6384', fontWeight: 700, fontSize: 22, marginBottom: 12 }}>🌡️ Temperature</h2>
              <div style={{ height: 300 }}>
                <Line
                  ref={tempRef}
                  options={baseOptions}
                  data={getChartDataWithGradient(chartData.temperature, tempRef, 'rgba(255,99,132,0.7)', 'rgba(255,99,132,0.05)')}
                />
              </div>
            </div>
            {/* Humidity Chart */}
            <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px rgba(53,162,235,0.08)', padding: 32 }}>
              <h2 style={{ color: '#3592eb', fontWeight: 700, fontSize: 22, marginBottom: 12 }}>💧 Humidity</h2>
              <div style={{ height: 300 }}>
                <Line
                  ref={humRef}
                  options={baseOptions}
                  data={getChartDataWithGradient(chartData.humidity, humRef, 'rgba(53,162,235,0.7)', 'rgba(53,162,235,0.05)')}
                />
              </div>
            </div>
            {/* Sunlight Chart */}
            {/* DLI Multi-line Chart */}
            <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px rgba(33,150,243,0.08)', padding: 32 }}>
              <h2 style={{ color: '#2196f3', fontWeight: 700, fontSize: 22, marginBottom: 12 }}>☀️ DLI & Progress</h2>
              <div style={{ height: 340 }}>
                <Line
                  ref={dliRef}
                  options={dliOptions}
                  data={dliChartData}
                />
              </div>
            </div>
          </div>

          {/* Tab 2: Monitoring */}
          <div>
            <h2 style={{ color: '#2e7d32', fontWeight: 700, fontSize: 22, marginBottom: 24, textAlign: 'center' }}>Adjust Parameters</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 24,
              marginBottom: 32,
              minHeight: 320,
              alignItems: 'stretch'
            }}>
              <div style={{ gridColumn: '1/2', gridRow: '1/2' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
                  borderRadius: 18,
                  boxShadow: '0 4px 24px rgba(255,183,71,0.10)',
                  padding: 32,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 200
                }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>
                    Temperature 🌡️
                  </h2>
                  <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                    32°C
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                    SCHEDULED
                  </div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>
                    Sunscreens between 11:00 - 16:00
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: '2/3', gridRow: '1/2' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%)',
                  borderRadius: 18,
                  boxShadow: '0 4px 24px rgba(53,162,235,0.10)',
                  padding: 32,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 200
                }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>
                    Humidity 💧
                  </h2>
                  <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                    63%
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                    AUTOMATIC
                  </div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>
                    Keeping around 10%
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: '1/2', gridRow: '2/3' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  borderRadius: 18,
                  boxShadow: '0 4px 24px rgba(67,233,123,0.10)',
                  padding: 32,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 200
                }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>
                    Light ☀️
                  </h2>
                  <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                    780 lux
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                    MANUAL
                  </div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>
                    Warnings & fail-safe actions on
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <button style={{ background: '#e0e0e0', color: '#333', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Manual Mode</button>
                    <button style={{ background: '#ffb347', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Light ON</button>
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: '2/3', gridRow: '2/3' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
                  borderRadius: 18,
                  boxShadow: '0 4px 24px rgba(255,88,88,0.10)',
                  padding: 32,
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 200
                }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>
                    Soil Moisture 🌱
                  </h2>
                  <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                    18%
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
                    LOW
                  </div>
                  <div style={{ width: '100%', height: 12, background: 'rgba(255,255,255,0.2)', borderRadius: 6, marginTop: 8 }}>
                    <div style={{ width: '18%', height: '100%', background: '#fff', borderRadius: 6 }}></div>
                  </div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>
                    Soil moisture is low. Consider watering soon.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab 3: AI */}
          <AIAnalysis />
        </Tabs>
      </div>
    </div>
  );
};

export default FarmDetails; 