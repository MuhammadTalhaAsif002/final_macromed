import React, { useState, useEffect } from 'react';

const WeightManager = () => {
  const [weightTypes, setWeightTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [weights, setWeights] = useState({});
  const [weightLimits, setWeightLimits] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeightTypes();
  }, []);

  const fetchWeightTypes = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/weights');
      const data = await response.json();
      setWeightTypes(data.weight_types || []);
      setWeightLimits(data.limits || {});
    } catch (err) {
      setError('Failed to fetch weight types');
    }
  };

  const fetchWeights = async (type) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`http://localhost:5001/api/weights/${type}`);
      if (response.ok) {
        const data = await response.json();
        setWeights(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch weights');
      }
    } catch (err) {
      setError('Failed to fetch weights');
    } finally {
      setLoading(false);
    }
  };

  const updateWeights = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`http://localhost:5001/api/weights/${selectedType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weights),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage('Weights updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update weights');
      }
    } catch (err) {
      setError('Failed to update weights');
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Get limits for the current weight type
      const limits = weightLimits[selectedType];
      let clampedValue = numValue;
      
      if (selectedType === 'config' && key === 'alpha') {
        // Special handling for alpha value
        const alphaLimits = limits?.alpha || { min: 0, max: 1 };
        clampedValue = Math.max(alphaLimits.min, Math.min(alphaLimits.max, numValue));
      } else if (limits) {
        // Regular weight validation
        clampedValue = Math.max(limits.min, Math.min(limits.max, numValue));
      }
      
      setWeights(prev => ({
        ...prev,
        [key]: clampedValue
      }));
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    fetchWeights(type);
  };

  const getWeightTypeDescription = (type) => {
    const descriptions = {
      'dynamic_history': 'Weights for brand, category, subcategory, and material in dynamic history-based recommendations',
      'product_to_product': 'Weights for product-to-product similarity (brand, category, subcategory, material)',
      'static_history': 'Weights for static historical data analysis (brand, category, subcategory, material)',
      'interaction': 'Weights for different user interaction types (purchase, view, add_to_cart, etc.)',
      'config': 'General configuration parameters including alpha value (0-1) for dynamic history weight retention'
    };
    return descriptions[type] || '';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Change Recommendation Weights</h2>
      
      {/* Weight Type Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Select Weight Type:
        </label>
        <select 
          value={selectedType} 
          onChange={(e) => handleTypeChange(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            fontSize: '16px', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            width: '300px'
          }}
        >
          <option value="">Choose a weight type...</option>
          {weightTypes.map(type => (
            <option key={type} value={type}>
              {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      {selectedType && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          borderLeft: '4px solid #1976d2'
        }}>
          <strong>Description:</strong> {getWeightTypeDescription(selectedType)}
        </div>
      )}

      {/* Weights Editor */}
      {selectedType && Object.keys(weights).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Current Weights</h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            padding: '16px',
            backgroundColor: '#fafafa'
          }}>
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <label style={{ 
                  minWidth: '150px', 
                  fontWeight: 'bold',
                  marginRight: '12px'
                }}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </label>
                <input
                  type="number"
                  step={selectedType === 'config' && key === 'alpha' ? "0.01" : "0.1"}
                  min={(() => {
                    if (selectedType === 'config' && key === 'alpha') {
                      return weightLimits[selectedType]?.alpha?.min || 0;
                    }
                    return weightLimits[selectedType]?.min || 0;
                  })()}
                  max={(() => {
                    if (selectedType === 'config' && key === 'alpha') {
                      return weightLimits[selectedType]?.alpha?.max || 1;
                    }
                    return weightLimits[selectedType]?.max || 10;
                  })()}
                  value={value}
                  onChange={(e) => handleWeightChange(key, e.target.value)}
                  style={{
                    padding: '6px 8px',
                    fontSize: '14px',
                    borderRadius: '4px',
                    border: (() => {
                      const limits = selectedType === 'config' && key === 'alpha' 
                        ? weightLimits[selectedType]?.alpha 
                        : weightLimits[selectedType];
                      if (limits && (value <= limits.min || value >= limits.max)) {
                        return '2px solid #ff6b6b';
                      }
                      return '1px solid #ccc';
                    })(),
                    width: '100px',
                    backgroundColor: (() => {
                      const limits = selectedType === 'config' && key === 'alpha' 
                        ? weightLimits[selectedType]?.alpha 
                        : weightLimits[selectedType];
                      if (limits && (value <= limits.min || value >= limits.max)) {
                        return '#fff5f5';
                      }
                      return 'white';
                    })()
                  }}
                />
                                 <div style={{ 
                   marginLeft: '12px', 
                   fontSize: '12px', 
                   color: '#666',
                   fontStyle: 'italic'
                 }}>
                   {(() => {
                     if (selectedType === 'config' && key === 'alpha') {
                       const limits = weightLimits[selectedType]?.alpha || { min: 0, max: 1 };
                       return `(${limits.min}-${limits.max}: Higher values keep more old weights)`;
                     }
                     const limits = weightLimits[selectedType] || { min: 0, max: 10 };
                     return `(${limits.min}-${limits.max}: Higher values = more importance)`;
                   })()}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedType && Object.keys(weights).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={updateWeights}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginRight: '12px'
            }}
          >
            {loading ? 'Updating...' : 'Update Weights'}
          </button>
          
          <button
            onClick={() => fetchWeights(selectedType)}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Reset to Original
          </button>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div style={{
          padding: '12px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          border: '1px solid #c3e6cb',
          marginBottom: '16px'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          border: '1px solid #f5c6cb',
          marginBottom: '16px'
        }}>
          Error: {error}
        </div>
      )}

      {/* Help Section */}
      <div style={{ 
        marginTop: '30px', 
        padding: '16px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '4px',
        border: '1px solid #bbdefb'
      }}>
        <h4 style={{ marginTop: 0, color: '#1565c0' }}>How to Use Weight Management</h4>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li><strong>Dynamic History:</strong> Adjust weights for brand, category, subcategory, and material in history-based recommendations</li>
          <li><strong>Product to Product:</strong> Modify similarity weights for product comparison algorithms</li>
          <li><strong>Static History:</strong> Configure weights for static historical data analysis</li>
          <li><strong>Interaction:</strong> Set importance levels for different user actions (purchase, view, etc.)</li>
          <li><strong>Config:</strong> Set alpha value (0-1) for dynamic history weight retention - higher values keep more old weights</li>
        </ul>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#1976d2' }}>
          <strong>Tip:</strong> Higher weight values give more importance to that factor in recommendations.
        </p>
      </div>
    </div>
  );
};

export default WeightManager; 