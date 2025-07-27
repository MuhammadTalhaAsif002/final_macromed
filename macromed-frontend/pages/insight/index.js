import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, CardBody, Spinner, Table } from "reactstrap";

const StatCard = ({ title, value, icon, iconColor, bgColor }) => (
    <Card className="mb-4" style={{ borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' }}>
        <CardBody>
            <Row className="align-items-center">
                <Col xs="4" className="d-flex align-items-center justify-content-center">
                    <div style={{ backgroundColor: bgColor, borderRadius: '50%', padding: '15px', width: '40px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`${icon} la-2x`} style={{ color: iconColor }}></i>
                    </div>
                </Col>
                <Col xs="8">
                    <h2 className="mb-0 fw-bold">{value}</h2>
                    <p className="text-muted mb-0">{title}</p>
                </Col>
            </Row>
        </CardBody>
    </Card>
);


const Insight = () => {
  const [analytics, setAnalytics] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [interests, setInterests] = useState(null);
  const [engagementScore, setEngagementScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, searchHistoryRes, interestsRes, engagementScoreRes] = await Promise.all([
          axios.get('http://localhost:8000/api/insights/analytics'),
          axios.get('http://localhost:8000/api/insights/search-history'),
          axios.get('http://localhost:8000/api/insights/interests'),
          axios.get('http://localhost:8000/api/insights/engagement-score')
        ]);

        setAnalytics(analyticsRes.data);
        setSearchHistory(searchHistoryRes.data.search_history);
        setInterests(interestsRes.data);
        setEngagementScore(engagementScoreRes.data);
      } catch (err) {
        setError("Failed to fetch insights data. Please ensure the API is running.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner style={{ width: '2rem', height: '2rem' }} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-5 alert alert-danger">{error}</div>;
  }
  
  const interactionViews = analytics.interaction_types.find(i => i.interaction_type === 'view')?.count || 0;
  const interactionCarts = analytics.interaction_types.find(i => i.interaction_type === 'add_to_cart')?.count || 0;
  const interactionPurchases = analytics.interaction_types.find(i => i.interaction_type === 'purchase')?.count || 0;


  return (
    <Container style={{ paddingTop: "50px", paddingBottom: "50px" }}>
      <h3 className="text-start mb-5 fw-bold">User Engagement Insights</h3>
      {analytics && (
        <Row>
          <Col md="6" lg="3">
            <StatCard
              title="Product Views"
              value={interactionViews}
              icon="las la-eye"
              iconColor="#8A2BE2"
              bgColor="rgba(138, 43, 226, 0.1)"
            />
          </Col>
          <Col md="6" lg="3">
            <StatCard
              title="Added to Cart"
              value={interactionCarts}
              icon="las la-shopping-cart"
              iconColor="#32CD32"
              bgColor="rgba(50, 205, 50, 0.1)"
            />
          </Col>
          <Col md="6" lg="3">
            <StatCard
              title="Purchases"
              value={interactionPurchases}
              icon="las la-credit-card"
              iconColor="#1E90FF"
              bgColor="rgba(30, 144, 255, 0.1)"
            />
          </Col>
          <Col md="6" lg="3">
            <StatCard
              title="Total Interactions"
              value={analytics.total_interactions}
              icon="las la-chart-bar"
              iconColor="#FFD700"
              bgColor="rgba(255, 215, 0, 0.1)"
            />
          </Col>
        </Row>
      )}
      {engagementScore && (
        <Row className="mt-5">
            <Col>
                <h3 className="text-start mb-4 fw-bold">User Engagement Score</h3>
                <Row>
                    <Col md="4">
                        <StatCard
                            title="Engagement Level"
                            value={engagementScore.engagement_level}
                            icon="las la-trophy"
                            iconColor="#ff9800"
                            bgColor="rgba(255, 152, 0, 0.1)"
                        />
                    </Col>
                    <Col md="4">
                        <StatCard
                            title={`Recent Score (${engagementScore.periods.recent})`}
                            value={engagementScore.recent_score}
                            icon="las la-star"
                            iconColor="#4caf50"
                            bgColor="rgba(76, 175, 80, 0.1)"
                        />
                    </Col>
                    <Col md="4">
                        <StatCard
                            title={`Recent Interactions (${engagementScore.periods.recent})`}
                            value={engagementScore.recent_interactions}
                            icon="las la-mouse-pointer"
                            iconColor="#2196f3"
                            bgColor="rgba(33, 150, 243, 0.1)"
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
      )}
      {searchHistory && searchHistory.length > 0 && (
          <Row className="mt-5">
              <Col>
                  <h3 className="text-start mb-4 fw-bold">Recent Search Queries</h3>
                  <Card style={{ borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' }}>
                      <CardBody>
                          <Table responsive hover className="mb-0">
                              <thead>
                                  <tr>
                                      <th className="fw-bold">Search Query</th>
                                      <th className="fw-bold">Timestamp</th>
                                      <th className="fw-bold">Device Type</th>
                                      <th className="fw-bold">Source Page</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {searchHistory.map((item, index) => (
                                      <tr key={index}>
                                          <td>{item.search_query}</td>
                                          <td>{new Date(item.timestamp).toLocaleString()}</td>
                                          <td className="text-capitalize">{item.device_type}</td>
                                          <td className="text-capitalize">{item.source_page}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </Table>
                      </CardBody>
                  </Card>
              </Col>
          </Row>
      )}
      
      {interests && (
        <>
            <Row className="mt-5">
                <Col>
                    <h3 className="text-start mb-4 fw-bold">Category Preferences</h3>
                    <p className="text-muted small">Based on activity in the {interests.analysis_period ? interests.analysis_period : 'N/A'}</p>
                    <Card style={{ borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' }}>
                        <CardBody>
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr>
                                        <th className="fw-bold">Category</th>
                                        <th className="fw-bold text-center">Views</th>
                                        <th className="fw-bold text-center">Cart Adds</th>
                                        <th className="fw-bold text-center">Purchases</th>
                                        <th className="fw-bold text-center">Total Interactions</th>
                                        <th className="fw-bold text-center">Engagement Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.values(interests.category_preferences || {}).sort((a,b) => (b.engagement_score || 0) - (a.engagement_score || 0)).map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.category || 'N/A'}</td>
                                            <td className="text-center">{item.views != null ? item.views : 'N/A'}</td>
                                            <td className="text-center">{item.cart_adds != null ? item.cart_adds : 'N/A'}</td>
                                            <td className="text-center">{item.purchases != null ? item.purchases : 'N/A'}</td>
                                            <td className="text-center">{item.total_interactions != null ? item.total_interactions : 'N/A'}</td>
                                            <td className="text-center">{item.engagement_score != null ? item.engagement_score : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col>
                    <h3 className="text-start mb-4 fw-bold">Brand Preferences</h3>
                    <Card style={{ borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' }}>
                        <CardBody>
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr>
                                        <th className="fw-bold">Brand</th>
                                        <th className="fw-bold text-center">Interactions</th>
                                        <th className="fw-bold text-center">Purchases</th>
                                        <th className="fw-bold text-center">Preference Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.values(interests.brand_preferences || {}).sort((a,b) => (b.preference_score || 0) - (a.preference_score || 0)).map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.brand || 'N/A'}</td>
                                            <td className="text-center">{item.interactions != null ? item.interactions : 'N/A'}</td>
                                            <td className="text-center">{item.purchases != null ? item.purchases : 'N/A'}</td>
                                            <td className="text-center">{item.preference_score != null ? item.preference_score : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            
            <Row className="mt-5">
                <Col>
                    <h3 className="text-start mb-4 fw-bold">Price Analysis</h3>
                     <Card style={{ borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' }}>
                        <CardBody>
                            <Row>
                                <Col md="6">
                                    <h4 className="fw-bold">Viewed Products</h4>
                                    <p className="mb-1"><strong>Average Price:</strong> ${interests.price_analysis.average_viewed_price != null ? interests.price_analysis.average_viewed_price.toFixed(2) : 'N/A'}</p>
                                    <p><strong>Price Range:</strong> {interests.price_analysis.price_range_viewed?.min != null ? `$${interests.price_analysis.price_range_viewed.min.toFixed(2)}` : 'N/A'} - {interests.price_analysis.price_range_viewed?.max != null ? `$${interests.price_analysis.price_range_viewed.max.toFixed(2)}` : 'N/A'}</p>
                                </Col>
                                <Col md="6">
                                    <h4 className="fw-bold">Purchased Products</h4>
                                    <p className="mb-1"><strong>Average Price:</strong> ${interests.price_analysis.average_purchased_price != null ? interests.price_analysis.average_purchased_price.toFixed(2) : 'N/A'}</p>
                                    <p><strong>Price Range:</strong> {interests.price_analysis.price_range_purchased?.min != null ? `$${interests.price_analysis.price_range_purchased.min.toFixed(2)}` : 'N/A'} - {interests.price_analysis.price_range_purchased?.max != null ? `$${interests.price_analysis.price_range_purchased.max.toFixed(2)}` : 'N/A'}</p>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </>
      )}
    </Container>
  );
};

export default Insight; 