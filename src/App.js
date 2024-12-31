import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [principal, setPrincipal] = useState(10000000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(30);
  const [viewMode, setViewMode] = useState('chart');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const yearsToMonths = (years) => Math.round(years * 12);
  
  const formatPeriod = (months) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) {
      return `${remainingMonths}개월`;
    } else if (remainingMonths === 0) {
      return `${years}년`;
    }
    return `${years}년 ${remainingMonths}개월`;
  };

  const calculateReturnForPeriod = (months) => {
    const semiAnnualRate = rate / 100;
    const periods = months / 6;
    return Math.round(principal * Math.pow(1 + semiAnnualRate, periods));
  };

  const getAllPeriodReturns = () => {
    const returns = [];
    for (let i = 6; i <= yearsToMonths(years); i += 6) {
      returns.push({
        months: i,
        amount: calculateReturnForPeriod(i),
        profit: calculateReturnForPeriod(i) - principal
      });
    }
    return returns;
  };

  const chartData = {
    labels: getAllPeriodReturns().map(r => formatPeriod(r.months)),
    datasets: [
      {
        label: '예상 총 자산',
        data: getAllPeriodReturns().map(r => r.amount),
        borderColor: isDarkMode ? '#60a5fa' : '#2563eb',
        backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: isDarkMode ? '#60a5fa' : '#2563eb',
        pointBorderColor: isDarkMode ? '#1e293b' : '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
        pointHoverBorderColor: isDarkMode ? '#e2e8f0' : '#ffffff',
        pointHoverBorderWidth: 2,
      },
      {
        label: '투자 원금',
        data: getAllPeriodReturns().map(() => principal),
        borderColor: isDarkMode ? '#475569' : '#94a3b8',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: isDarkMode ? '#e2e8f0' : '#1a1a1a',
          font: {
            family: "'Pretendard', sans-serif",
            size: 12,
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: '기간별 예상 수익 추이',
        color: isDarkMode ? '#e2e8f0' : '#1a1a1a',
        font: {
          family: "'Pretendard', sans-serif",
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#e2e8f0' : '#1a1a1a',
        titleFont: {
          family: "'Pretendard', sans-serif",
          size: 14,
          weight: 'bold'
        },
        bodyColor: isDarkMode ? '#e2e8f0' : '#1a1a1a',
        bodyFont: {
          family: "'Pretendard', sans-serif",
          size: 13
        },
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? '#1e293b' : '#e2e8f0',
          drawBorder: false
        },
        ticks: {
          font: {
            family: "'Pretendard', sans-serif",
            size: 12
          },
          color: isDarkMode ? '#94a3b8' : '#64748b'
        }
      },
      y: {
        grid: {
          color: isDarkMode ? '#1e293b' : '#e2e8f0',
          drawBorder: false
        },
        ticks: {
          font: {
            family: "'Pretendard', sans-serif",
            size: 12
          },
          color: isDarkMode ? '#94a3b8' : '#64748b',
          callback: function(value) {
            return new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW',
              maximumFractionDigits: 0
            }).format(value);
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        borderWidth: 3
      }
    }
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="container">
        <div className="header">
          <h1>투자 수익 계산기</h1>
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="테마 변경"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
        <div className={`card calculator ${isDarkMode ? 'dark' : ''}`}>
          <div className="slider-container">
            <label>
              <span className="label-text">투자 금액</span>
              <span className="value">{principal.toLocaleString()}원</span>
            </label>
            <input
              type="range"
              min="10000000"
              max="100000000"
              step="1000000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
            />
          </div>

          <div className="slider-container">
            <label>
              <span className="label-text">6개월 수익률</span>
              <span className="value">{rate}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="200"
              step="1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>

          <div className="slider-container">
            <label>
              <span className="label-text">투자 기간</span>
              <span className="value">{formatPeriod(yearsToMonths(years))}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <h3>예상 총 수익</h3>
              <p>{(calculateReturnForPeriod(yearsToMonths(years)) - principal).toLocaleString()}원</p>
            </div>
            <div className="summary-card">
              <h3>예상 총 자산</h3>
              <p>{calculateReturnForPeriod(yearsToMonths(years)).toLocaleString()}원</p>
            </div>
            <div className="summary-card">
              <h3>연간 수익률</h3>
              <p>{((Math.pow(1 + rate/100, 2) - 1) * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="view-toggle">
            <button 
              className={viewMode === 'chart' ? 'active' : ''} 
              onClick={() => setViewMode('chart')}
            >
              차트로 보기
            </button>
            <button 
              className={viewMode === 'table' ? 'active' : ''} 
              onClick={() => setViewMode('table')}
            >
              표로 보기
            </button>
          </div>

          {viewMode === 'chart' ? (
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>기간</th>
                    <th>예상 총액</th>
                    <th>순수익</th>
                    <th>수익률</th>
                  </tr>
                </thead>
                <tbody>
                  {getAllPeriodReturns().map((result) => (
                    <tr key={result.months}>
                      <td>{formatPeriod(result.months)}</td>
                      <td>{result.amount.toLocaleString()}원</td>
                      <td>{result.profit.toLocaleString()}원</td>
                      <td>{((result.profit / principal) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
