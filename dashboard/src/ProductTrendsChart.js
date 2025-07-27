import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProductTrendsChart() {
  const [imageErrors, setImageErrors] = useState({});
  const handleImgError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  }
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/product-trends')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!Array.isArray(data) || data.length === 0) return <p>No data available.</p>;

  const chartData = {
    labels: data.map(d => d.product_name),
    datasets: [
      {
        label: 'Purchase Count',
        data: data.map(d => d.purchase_count),
        backgroundColor: 'rgba(25, 118, 210, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Product Purchase Trends' },
    },
    scales: {
      x: { title: { display: true, text: 'Product Name' } },
      y: { title: { display: true, text: 'Purchase Count' }, beginAtZero: true },
    },
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <Bar data={chartData} options={options} />
      {/* Product Images Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
        {data.map((d, idx) => (
          <div key={d.product_id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 16px' }}>
            {imageErrors[d.product_id] || !d.image_url ? (
              <span style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>No Image</span>
            ) : (
              <img
                src={d.image_url}
                alt=""
                style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, border: '1px solid #ccc', marginBottom: 4 }}
                onError={() => handleImgError(d.product_id)}
              />
            )}
            <span style={{ fontSize: 12, textAlign: 'center', maxWidth: 80 }}>{d.product_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
