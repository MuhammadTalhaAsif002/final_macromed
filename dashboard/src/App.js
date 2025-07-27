import React, { useEffect, useState } from 'react';
import './App.css';
import ProductTrendsChart from './ProductTrendsChart';
import WeightManager from './WeightManager';

function App() {
  const [imageErrors, setImageErrors] = useState({});
  const handleImgError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  }
  const [topProducts, setTopProducts] = useState([]);
  const [userId, setUserId] = useState('');
  const [userTrends, setUserTrends] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [userPurchases, setUserPurchases] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingAllProducts, setLoadingAllProducts] = useState(false);
  const [allProductsSearch, setAllProductsSearch] = useState('');
  const [selectedProductTop, setSelectedProductTop] = useState(null);
  const [selectedProductAll, setSelectedProductAll] = useState(null);
  const [selectedProductUser, setSelectedProductUser] = useState(null);

  useEffect(() => {
    setLoadingProducts(true);
    fetch('http://localhost:5000/top-products')
      .then(res => res.json())
      .then(data => {
        setTopProducts(data);
        setLoadingProducts(false);
      });
  }, []);

  const fetchUserTrends = () => {
    if (!userId) return;
    setLoadingTrends(true);
    fetch(`http://localhost:5000/user-trends?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setUserTrends(data);
        setLoadingTrends(false);
      });
    // Fetch user purchases
    fetch(`http://localhost:5000/user-purchases?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setUserPurchases(data);
      });
  };

  useEffect(() => {
    if (activeTab === 'all') {
      setLoadingAllProducts(true);
      fetch('http://localhost:5000/all-products')
        .then(res => res.json())
        .then(data => {
          setAllProducts(data);
          setLoadingAllProducts(false);
        });
    }
  }, [activeTab]);

  return (
    <div className="App" style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Macromed Dashboard</h1>
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '8px 24px',
            marginRight: 8,
            background: activeTab === 'products' ? '#1976d2' : '#eee',
            color: activeTab === 'products' ? '#fff' : '#222',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Top Selling Products
        </button>
        <button
          onClick={() => setActiveTab('user')}
          style={{
            padding: '8px 24px',
            background: activeTab === 'user' ? '#1976d2' : '#eee',
            color: activeTab === 'user' ? '#fff' : '#222',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          User Trends
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          style={{
            padding: '8px 24px',
            marginLeft: 8,
            background: activeTab === 'trends' ? '#1976d2' : '#eee',
            color: activeTab === 'trends' ? '#fff' : '#222',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Product Trends
        </button>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '8px 24px',
            marginLeft: 8,
            background: activeTab === 'all' ? '#1976d2' : '#eee',
            color: activeTab === 'all' ? '#fff' : '#222',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          All Products
        </button>
        <button
          onClick={() => setActiveTab('weights')}
          style={{
            padding: '8px 24px',
            marginLeft: 8,
            background: activeTab === 'weights' ? '#1976d2' : '#eee',
            color: activeTab === 'weights' ? '#fff' : '#222',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Change Weights
        </button>
      </div>
      {activeTab === 'products' && (
        <div style={{ marginBottom: 32 }}>
          <h2>Top Selling Products</h2>
          {loadingProducts ? <p>Loading...</p> : (
            Array.isArray(topProducts) && (
              <table border="1" cellPadding="8" style={{ margin: 'auto' }}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Sales Count</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedProductTop && topProducts.map(p => (
                    <tr key={p.product_id}>
                      <td>
                        {imageErrors[p.product_id] || !p.image_url ? (
                          <span style={{ color: '#aaa' }}>No Image</span>
                        ) : (
                          <img
                            src={p.image_url}
                            alt=""
                            style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 6, border: '1px solid #ccc' }}
                            onError={() => handleImgError(p.product_id)}
                          />
                        )}
                      </td>
                      <td>{p.product_id}</td>
                      <td>{p.product_name}</td>
                      <td>{p.sales_count}</td>
                      <td>
                        <button onClick={() => setSelectedProductTop(p)} style={{padding: '4px 12px', borderRadius: 4, cursor: 'pointer'}}>Show Details</button>
                      </td>
                    </tr>
                  ))}
                  {selectedProductTop && (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: 32}}>
                      <div style={{display: 'inline-block', textAlign: 'left', background: '#f9f9f9', borderRadius: 8, padding: 24, border: '1px solid #ddd'}}>
                        <h3>Product Details</h3>
                        <div style={{marginBottom: 16}}>
                          {imageErrors[selectedProductTop.product_id] || !selectedProductTop.image_url ? (
                            <span style={{ color: '#aaa', fontSize: 16 }}>No Image</span>
                          ) : (
                            <img
                              src={selectedProductTop.image_url}
                              alt=""
                              style={{ width: 96, height: 96, objectFit: 'contain', borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }}
                              onError={() => handleImgError(selectedProductTop.product_id)}
                            />
                          )}
                        </div>
                        <div><b>Product ID:</b> {selectedProductTop.product_id}</div>
                        <div><b>Name:</b> {selectedProductTop.product_name}</div>
                        {selectedProductTop.sales_count !== undefined && <div><b>Sales Count:</b> {selectedProductTop.sales_count}</div>}
                        {selectedProductTop.price !== undefined && <div><b>Price:</b> {selectedProductTop.price}</div>}
                        {selectedProductTop.brand && <div><b>Brand:</b> {selectedProductTop.brand}</div>}
                        {selectedProductTop.stock_quantity !== undefined && <div><b>Stock:</b> {selectedProductTop.stock_quantity}</div>}
                        {selectedProductTop.description && <div><b>Description:</b> {selectedProductTop.description}</div>}
                        {/* Show any other fields dynamically */}
                        {Object.entries(selectedProductTop).map(([key, value]) => {
                          if ([
                            'product_id','product_name','image_url','sales_count','price','brand','stock_quantity','description'
                          ].includes(key)) return null;
                          if (value === null || value === undefined) return null;
                          return <div key={key}><b>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</b> {String(value)}</div>;
                        })}
                        <button onClick={() => setSelectedProductTop(null)} style={{marginTop: 24, padding: '6px 18px', borderRadius: 4, cursor: 'pointer'}}>Close</button>
                      </div>
                    </td></tr>
                  )}


                </tbody>
              </table>
            )
          )}
        </div>
      )}
      {activeTab === 'trends' && (
        <div>
          <h2>Product Trends</h2>
          <ProductTrendsChart />
        </div>
      )}
      {activeTab === 'all' && (
        <div style={{ marginBottom: 32 }}>
          <h2>All Products</h2>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={allProductsSearch}
            onChange={e => setAllProductsSearch(e.target.value)}
            style={{ marginBottom: 16, padding: 8, width: 300, fontSize: 16 }}
          />
          {loadingAllProducts ? <p>Loading...</p> : (
            Array.isArray(allProducts) && (
              <table border="1" cellPadding="8" style={{ margin: 'auto' }}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedProductAll && allProducts
                    .filter(p => {
                      const search = allProductsSearch.trim().toLowerCase();
                      if (!search) return true;
                      return (
                        p.product_name?.toLowerCase() === search ||
                        String(p.product_id) === allProductsSearch.trim()
                      );
                    })
                    .map(p => (
                      <tr key={p.product_id}>
                        <td>
                          {imageErrors[p.product_id] || !p.image_url ? (
                            <span style={{ color: '#aaa' }}>No Image</span>
                          ) : (
                            <img
                              src={p.image_url}
                              alt=""
                              style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 6, border: '1px solid #ccc' }}
                              onError={() => handleImgError(p.product_id)}
                            />
                          )}
                        </td>
                        <td>{p.product_id}</td>
                        <td>{p.product_name}</td>
                        <td>{p.stock_quantity}</td>
                        <td>
                          <button onClick={() => setSelectedProductAll(p)} style={{padding: '4px 12px', borderRadius: 4, cursor: 'pointer'}}>Show Details</button>
                        </td>
                      </tr>
                    ))}
                  {selectedProductAll && (
                    <tr><td colSpan="7" style={{textAlign: 'center', padding: 32}}>
                      <div style={{display: 'inline-block', textAlign: 'left', background: '#f9f9f9', borderRadius: 8, padding: 24, border: '1px solid #ddd'}}>
                        <h3>Product Details</h3>
                        <div style={{marginBottom: 16}}>
                          {imageErrors[selectedProductAll.product_id] || !selectedProductAll.image_url ? (
                            <span style={{ color: '#aaa', fontSize: 16 }}>No Image</span>
                          ) : (
                            <img
                              src={selectedProductAll.image_url}
                              alt=""
                              style={{ width: 96, height: 96, objectFit: 'contain', borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }}
                              onError={() => handleImgError(selectedProductAll.product_id)}
                            />
                          )}
                        </div>
                        <div><b>Product ID:</b> {selectedProductAll.product_id}</div>
                        <div><b>Name:</b> {selectedProductAll.product_name}</div>
                        <div><b>Price:</b> {selectedProductAll.price}</div>
                        <div><b>Brand:</b> {selectedProductAll.brand}</div>
                        <div><b>Stock:</b> {selectedProductAll.stock_quantity}</div>
                        {selectedProductAll.description && <div><b>Description:</b> {selectedProductAll.description}</div>}
                        <button onClick={() => setSelectedProductAll(null)} style={{marginTop: 24, padding: '6px 18px', borderRadius: 4, cursor: 'pointer'}}>Close</button>
                      </div>
                    </td></tr>
                  )}

                </tbody>
              </table>
            )
          )}
        </div>
      )}
      {activeTab === 'user' && (
        <div>
          <h2>User Trends</h2>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
          />
          <button onClick={fetchUserTrends} style={{ marginLeft: 8 }}>Fetch Trends</button>
          {loadingTrends ? <p>Loading...</p> : (Array.isArray(userTrends) && userTrends.length > 0 && (
            <table border="1" cellPadding="8" style={{ margin: '16px auto' }}>
              <thead>
                <tr>
                  <th>Interaction Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {userTrends.map((t, idx) => (
                  <tr key={idx}>
                    <td>{t.interaction_type}</td>
                    <td>{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
          {/* User Purchases Table */}
          {Array.isArray(userPurchases) && userPurchases.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3>Products Purchased by User</h3>
              <table border="1" cellPadding="8" style={{ margin: 'auto' }}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Purchase Count</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedProductUser && userPurchases.map((p) => (
                    <tr key={p.product_id}>
                      <td>
                      {imageErrors[p.product_id] || !p.image_url ? (
  <span style={{ color: '#aaa' }}>No Image</span>
) : (
  <img
    src={p.image_url}
    alt=""
    style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 6, border: '1px solid #ccc' }}
    onError={() => handleImgError(p.product_id)}
  />
)}
                      </td>
                      <td>{p.product_id}</td>
                      <td>{p.product_name}</td>
                      <td>{p.purchase_count}</td>
                      <td>
                        <button onClick={() => setSelectedProductUser(p)} style={{padding: '4px 12px', borderRadius: 4, cursor: 'pointer'}}>Show Details</button>
                      </td>
                    </tr>
                  ))}
                  {selectedProductUser && (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: 32}}>
                      <div style={{display: 'inline-block', textAlign: 'left', background: '#f9f9f9', borderRadius: 8, padding: 24, border: '1px solid #ddd'}}>
                        <h3>Product Details</h3>
                        <div style={{marginBottom: 16}}>
                          {imageErrors[selectedProductUser.product_id] || !selectedProductUser.image_url ? (
                            <span style={{ color: '#aaa', fontSize: 16 }}>No Image</span>
                          ) : (
                            <img
                              src={selectedProductUser.image_url}
                              alt=""
                              style={{ width: 96, height: 96, objectFit: 'contain', borderRadius: 8, border: '1px solid #ccc', marginBottom: 8 }}
                              onError={() => handleImgError(selectedProductUser.product_id)}
                            />
                          )}
                        </div>
                        <div><b>Product ID:</b> {selectedProductUser.product_id}</div>
                        <div><b>Name:</b> {selectedProductUser.product_name}</div>
                        {selectedProductUser.purchase_count !== undefined && <div><b>Purchase Count:</b> {selectedProductUser.purchase_count}</div>}
                        {selectedProductUser.timestamp && (() => {
  let dateObj = new Date(selectedProductUser.timestamp);
  if (!isNaN(dateObj)) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return <div><b>Order Date:</b> {year}-{month}-{day}</div>;
  } else {
    // fallback to string split if parsing fails
    const datePart = selectedProductUser.timestamp.split(' ')[0];
    return <div><b>Order Date:</b> {datePart}</div>;
  }
})()}
                        {selectedProductUser.pieces !== undefined && <div><b>Pieces:</b> {selectedProductUser.pieces}</div>}
                        {/* Show any other fields dynamically */}
                        {Object.entries(selectedProductUser).map(([key, value]) => {
                          if ([
                            'product_id','product_name','image_url','purchase_count','order_date','pieces','timestamp'
                          ].includes(key)) return null;
                          if (value === null || value === undefined) return null;
                          return <div key={key}><b>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</b> {String(value)}</div>;
                        })}
                        <button onClick={() => setSelectedProductUser(null)} style={{marginTop: 24, padding: '6px 18px', borderRadius: 4, cursor: 'pointer'}}>Close</button>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {activeTab === 'weights' && (
        <div>
          <WeightManager />
        </div>
      )}
    </div>
  );
}

export default App;
