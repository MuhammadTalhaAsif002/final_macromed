import React from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Input,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import s from "./Product.module.scss";

import InfoBlock from 'components/e-commerce/InfoBlock';
import InstagramWidget from 'components/e-commerce/Instagram';
import chevronRightIcon from "public/images/e-commerce/details/chevron-right.svg";
import chevronLeftIcon from "public/images/e-commerce/details/chevron-left.svg";
import axios from "axios";
import Head from "next/head";
import productsListActions from "redux/actions/products/productsListActions";
import config from "constants/config";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';
import { products as allProductsData } from '../../data/products';

const Id = () => {
  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = React.useState(true);
  const [recommendationSource, setRecommendationSource] = React.useState('');
  const [recommendationType, setRecommendationType] = React.useState('');
  const [width, setWidth] = React.useState(1440);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  const [quantity, setQuantity] = React.useState(1);
  const router = useRouter();
  const { id } = router.query;
  const [sameCategoryProducts, setSameCategoryProducts] = React.useState([]);
  const [contentBasedRecs, setContentBasedRecs] = React.useState([]);
  const [priceBasedRecs, setPriceBasedRecs] = React.useState([]);
  const [hybridRecs, setHybridRecs] = React.useState([]);
  const [pythonContentRecs, setPythonContentRecs] = React.useState([]);
  const [pythonPriceRecs, setPythonPriceRecs] = React.useState([]);
  const [pythonHybridRecs, setPythonHybridRecs] = React.useState([]);

  React.useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      console.log(`[Product Page] Fetching data for product ID: ${id}`);
      setLoading(true);
      try {
        const api_url = `${config.baseURLApi}/products/${id}`;
        console.log(`[Product Page] Calling API (POST): ${api_url}`);
        const response = await axios.get(api_url);
        console.log('[Product Page] API call successful. Received product data:', response.data);
        setProduct(response.data);
        
        // Track the product view (always)
        try {
          const token = localStorage.getItem('token');
          const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const trackResponse = await axios.post(`${config.baseURLApi}/track/view`, {
            product_id: parseInt(Array.isArray(id) ? id[0] : id),
            device_type: "desktop",
            source_page: "product_detail"
          }, { headers });
          
          console.log('[Product Page] Tracking API call successful:', trackResponse.data);
        } catch (trackError) {
          console.error('[Product Page] Tracking API call failed:', trackError);
          // Don't show error to user, just log it
        }
      } catch (error) {
        console.error('[Product Page] API call failed:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Check if product is in wishlist
    const wishlistItems = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const productId = parseInt(Array.isArray(id) ? id[0] : id);
    const isInWishlist = wishlistItems.some(item => item.product === productId);
    setIsInWishlist(isInWishlist);
  }, [id]);

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setRecommendationsLoading(true);
        const token = typeof window !== "undefined" && localStorage.getItem("token");
        
        // First try to get Python API-based recommendations
        const pythonResponse = await fetch(`http://localhost:8000/api/recommendations/hybrid?product_id=${product.product_id}`, {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (pythonResponse.ok) {
          const data = await pythonResponse.json();
          console.log('🤖 AI-powered recommendations received:', data);
          console.log('📊 Recommendation details:', {
            source: data.source,
            type: data.type,
            count: data.recommendations?.length || 0,
            reason: data.reason
          });
          setRecommendations(data.recommendations || []);
          setRecommendationSource('Python AI');
          setRecommendationType(data.type || 'Hybrid');
        } else {
          // Fallback to Laravel-based recommendations
          console.log('🔄 Python API unavailable, falling back to Laravel recommendations');
          const fallbackResponse = await fetch('http://localhost:8000/api/insights/recommendations', {
            method: 'GET',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('📊 Fallback recommendations received:', fallbackData);
            console.log('📊 Fallback details:', {
              source: fallbackData.source,
              reason: fallbackData.reason,
              count: fallbackData.recommendations?.length || 0
            });
            setRecommendations(fallbackData.recommendations || []);
            setRecommendationSource('Laravel');
            setRecommendationType('Fallback');
          } else {
            throw new Error(`Fallback HTTP error! status: ${fallbackResponse.status}`);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching recommendations:', err);
        setRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    if (product) {
      fetchRecommendations();
    }
  }, [product]);

  React.useEffect(() => {
    const fetchAllRecommendations = async () => {
      if (!product) return;
      console.log('🔄 Fetching all recommendations for product:', product.product_id);
      const token = typeof window !== "undefined" && localStorage.getItem("token");
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      try {
        // Content-Based
        console.log('📊 Fetching content-based recommendations...');
        const contentRes = await fetch(`http://localhost:8000/api/recommendations/content-based?product_id=${product.product_id}`, { headers });
        const contentData = contentRes.ok ? await contentRes.json() : { recommendations: [] };
        console.log('✅ Content-based recommendations:', contentData.recommendations?.length || 0, 'products');
        setContentBasedRecs(contentData.recommendations || []);
        
        // Price-Based
        console.log('💰 Fetching price-based recommendations...');
        const priceRes = await fetch(`http://localhost:8000/api/recommendations/price-based?product_id=${product.product_id}`, { headers });
        const priceData = priceRes.ok ? await priceRes.json() : { recommendations: [] };
        console.log('✅ Price-based recommendations:', priceData.recommendations?.length || 0, 'products');
        setPriceBasedRecs(priceData.recommendations || []);
        
        // Hybrid
        console.log('🤖 Fetching hybrid recommendations...');
        const hybridRes = await fetch(`http://localhost:8000/api/recommendations/hybrid?product_id=${product.product_id}`, { headers });
        const hybridData = hybridRes.ok ? await hybridRes.json() : { recommendations: [] };
        console.log('✅ Hybrid recommendations:', hybridData.recommendations?.length || 0, 'products');
        setHybridRecs(hybridData.recommendations || []);
      } catch (err) {
        console.error('❌ Error fetching recommendations:', err);
        setContentBasedRecs([]);
        setPriceBasedRecs([]);
        setHybridRecs([]);
      }
    };
    if (product) fetchAllRecommendations();
  }, [product]);

  // Fetch Python API recommendations
  React.useEffect(() => {
    const fetchPythonRecommendations = async () => {
      if (!product) return;
      console.log('🔄 Fetching Python API recommendations for product:', product.product_id);
      try {
        // Content-Based Recommendations from Python API
        console.log('📊 Fetching content-based recommendations from Python API...');
        const contentRes = await fetch(`http://localhost:5001/api/recommend?type=content&product_id=${product.product_id}`);
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          console.log('✅ Python Content-based recommendations:', contentData.length || 0, 'products');
          console.log('📊 Content data sample:', contentData[0]);
          // Transform data to match expected format
          const transformedContent = Array.isArray(contentData) ? contentData.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name || item.name,
            category: item.category,
            price: item.price,
            image_url: item.image_url || item.image || 'https://archive.org/download/placeholder-image//placeholder-image.jpg'
          })) : [];
          setPythonContentRecs(transformedContent);
        } else {
          console.error('❌ Content-based API failed:', contentRes.status);
          setPythonContentRecs([]);
        }
        
        // Price-Based Recommendations from Python API
        console.log('💰 Fetching price-based recommendations from Python API...');
        const priceRes = await fetch(`http://localhost:5001/api/recommend?type=price&product_id=${product.product_id}`);
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          console.log('✅ Python Price-based recommendations:', priceData.length || 0, 'products');
          console.log('📊 Price data sample:', priceData[0]);
          // Transform data to match expected format
          const transformedPrice = Array.isArray(priceData) ? priceData.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name || item.name,
            category: item.category,
            price: item.price,
            image_url: item.image_url || item.image || 'https://archive.org/download/placeholder-image//placeholder-image.jpg'
          })) : [];
          setPythonPriceRecs(transformedPrice);
        } else {
          console.error('❌ Price-based API failed:', priceRes.status);
          setPythonPriceRecs([]);
        }
        
        // Hybrid Recommendations from Python API (using user_id if available)
        console.log('🤖 Fetching hybrid recommendations from Python API...');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser.id || 1; // Default to user 1 if not logged in
        const hybridRes = await fetch(`http://localhost:5001/api/recommend?type=hybrid&user_id=${userId}`);
        if (hybridRes.ok) {
          const hybridData = await hybridRes.json();
          console.log('✅ Python Hybrid recommendations:', hybridData.length || 0, 'products');
          console.log('📊 Hybrid data sample:', hybridData[0]);
          // Transform data to match expected format
          const transformedHybrid = Array.isArray(hybridData) ? hybridData.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name || item.name,
            category: item.category,
            price: item.price,
            image_url: item.image_url || item.image || 'https://archive.org/download/placeholder-image//placeholder-image.jpg'
          })) : [];
          setPythonHybridRecs(transformedHybrid);
        } else {
          console.error('❌ Hybrid API failed:', hybridRes.status);
          setPythonHybridRecs([]);
        }
      } catch (err) {
        console.error('❌ Error fetching Python API recommendations:', err);
        setPythonContentRecs([]);
        setPythonPriceRecs([]);
        setPythonHybridRecs([]);
      }
    };
    if (product) fetchPythonRecommendations();
  }, [product]);

  React.useEffect(() => {
    if (product && product.category ) {
      const categoryTitle = product.category;
      const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
      console.log("categoryTitle: ", categoryTitle, product.category, "token:", token);
      fetch('http://127.0.0.1:8000/api/products/by-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ category: categoryTitle })
      })
        .then(res => res.json())
        .then(data => {
          console.log("by-category data: ", data);
          console.log("Current product product_id:", product.product_id, typeof product.product_id);
          console.log("API returned product_ids:", (data || []).map(p => [p.product_id, typeof p.product_id]));
          const filtered = (data || []).filter(p => String(p.product_id) !== String(product.product_id)).slice(0, 10);
          setSameCategoryProducts(filtered);
          console.log('[API] Fetched same category products:', filtered);
        })
        .catch(err => {
          setSameCategoryProducts([]);
          console.error('[API] Error fetching same category products:', err);
        });
    } else if (product) {
      setSameCategoryProducts([]);
      console.log('[API] Current product does not have a valid category to search for similar products.');
    }
  }, [product]);

  React.useEffect(() => {
    typeof window !== "undefined" &&
    window.addEventListener("resize", () => {
      setWidth(window.innerWidth);
    });
  }, []);

  const addToCart = async () => {
    // Track the cart action (always)
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const trackResponse = await axios.post(`${config.baseURLApi}/track/cart`, {
        product_id: parseInt(Array.isArray(id) ? id[0] : id),
        quantity: quantity,
        action: "add"
      }, { headers });
      
      console.log('[Product Page] Cart tracking API call successful:', trackResponse.data);
    } catch (trackError) {
      console.error('[Product Page] Cart tracking API call failed:', trackError);
      // Don't show error to user, just log it
    }

    // For both authenticated and guest users, use localStorage for now
    const localProducts = JSON.parse(localStorage.getItem("products") || "[]");
    
    // Check if product already exists in cart
    const existingProductIndex = localProducts.findIndex(item => item.product === parseInt(Array.isArray(id) ? id[0] : id));
    
    if (existingProductIndex !== -1) {
      // Update quantity if product already exists
      localProducts[existingProductIndex].amount += quantity;
    } else {
      // Add new product to cart
      localProducts.push({
        product: parseInt(Array.isArray(id) ? id[0] : id),
        amount: quantity,
        order_date: new Date().toISOString(),
        status: "in cart",
      });
    }
    
    localStorage.setItem("products", JSON.stringify(localProducts));
    toast.success("Product successfully added to your cart");
    router.push('/cart');
  };

  const toggleWishlist = async () => {
    try {
      console.log('=== TOGGLE WISHLIST DEBUG ===');
      const wishlistItems = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const productId = parseInt(Array.isArray(id) ? id[0] : id);
      console.log('Current wishlist items:', wishlistItems);
      console.log('Product ID to toggle:', productId);
      console.log('Is currently in wishlist:', isInWishlist);
      
      if (isInWishlist) {
        // Remove from wishlist
        const updatedWishlist = wishlistItems.filter(item => item.product !== productId);
        console.log('Removing from wishlist. Updated wishlist:', updatedWishlist);
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
        
        // Track wishlist removal (always)
        try {
          const token = localStorage.getItem('token');
          const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          await axios.post(`${config.baseURLApi}/track/wishlist`, {
            product_id: productId,
            action: "remove"
          }, { headers });
        } catch (trackError) {
          console.error('[Product Page] Wishlist tracking failed:', trackError);
        }
      } else {
        // Add to wishlist
        const newWishlistItem = {
          product: productId,
          added_date: new Date().toISOString()
        };
        wishlistItems.push(newWishlistItem);
        console.log('Adding to wishlist. Updated wishlist:', wishlistItems);
        localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
        setIsInWishlist(true);
        toast.success("Added to wishlist");
        
        // Track wishlist addition (always)
        try {
          const token = localStorage.getItem('token');
          const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          await axios.post(`${config.baseURLApi}/track/wishlist`, {
            product_id: productId,
            action: "add"
          }, { headers });
        } catch (trackError) {
          console.error('[Product Page] Wishlist tracking failed:', trackError);
        }
      }
    } catch (error) {
      console.error('[Product Page] Wishlist operation failed:', error);
      toast.error("Failed to update wishlist");
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <h2>Loading product...</h2>
      </Container>
    )
  }

  if (!product) {
    return (
      <Container className="my-5 text-center">
        <h2>Product not found</h2>
        <p>Sorry, the product you are looking for doesn't exist.</p>
        <Link href="/shop">
          <Button color="primary">Back to Shop</Button>
        </Link>
      </Container>
    )
  }

  console.log("[Render Check] sameCategoryProducts:", sameCategoryProducts);
  console.log("[Render Check] Python recommendations:", {
    content: pythonContentRecs.length,
    price: pythonPriceRecs.length,
    hybrid: pythonHybridRecs.length
  });
  
  // Debug Python sections rendering
  if (pythonContentRecs.length > 0) console.log('🔍 Will render Python Content section with', pythonContentRecs.length, 'items');
  if (pythonPriceRecs.length > 0) console.log('🔍 Will render Python Price section with', pythonPriceRecs.length, 'items');
  if (pythonHybridRecs.length > 0) console.log('🔍 Will render Python Hybrid section with', pythonHybridRecs.length, 'items');

  return (
    
    <>
      <Head>
        <title>{product.product_name}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content={product.description} />
      </Head>
      <ToastContainer />
      <Container>
        <Row className={"mb-5"} style={{marginTop: 32}}>
          <Col xs={12} md={6}>
            <img 
              src={product.image_url || "https://t4.ftcdn.net/jpg/06/71/92/37/360_F_671923740_x0zOL3OIuUAnSF6sr7PuznCI5bQFKhI0.jpg"}
              alt={product.product_name}
              style={{width: '100%', borderRadius: '8px'}}
            />
          </Col>
          <Col xs={12} md={6}>
            <p className="text-muted mb-0">{product.category || 'N/A'}</p>
            <h2 className={"fw-bold"}>{product.product_name}</h2>
            <h3 className={"fw-bold my-3"}>${product.price}</h3>
            <p className="text-muted">Sku: {product.sku || 'N/A'}</p>
            
            <div className="d-flex align-items-center my-3">
              <span className="text-warning mr-2">⭐</span>
              <span>{product.average_rating} ({product.total_reviews} reviews)</span>
            </div>

            <ul className="list-unstyled my-4">
              <li><strong>Brand:</strong> {product.brand || 'N/A'}</li>
              <li><strong>Manufacturer:</strong> {product.manufacturer || 'N/A'}</li>
              <li><strong>Material:</strong> {product.material || 'N/A'}</li>
              <li><strong>Intended Use:</strong> {product.intended_use || 'N/A'}</li>
              <li><strong>Dimensions:</strong> {product.dimensions?.text || 'N/A'}</li>
              <li><strong>Sterility:</strong> {product.sterility || 'N/A'}</li>
              <li><strong>Reusable/Disposable:</strong> {product.reusable_disposable || 'N/A'}</li>
              <li><strong>In Stock:</strong> {product.stock_quantity}</li>
            </ul>

            <div className="d-flex align-items-center my-4">
                <Input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10)) || 1)} style={{width: '80px', textAlign: 'center'}}/>
            </div>
            
            <div className="d-flex gap-2">
                <Button
                    outline
                    color={"primary"}
                    className={"text-uppercase fw-bold flex-grow-1"}
                    onClick={() => {
                      toast.info("Product successfully added to your cart");
                      addToCart();
                    }}
                >
                  Add to Cart
                </Button>
                
                <Button
                    outline
                    color={isInWishlist ? "danger" : "secondary"}
                    onClick={toggleWishlist}
                    style={{minWidth: '50px'}}
                >
                  {isInWishlist ? "❤️" : "🤍"}
                </Button>
            </div>

            <p className="mt-4">{product.description}</p>
          </Col>
        </Row>
        <hr />
        
        {/* Products from same category Section */}
        {sameCategoryProducts.length > 0 && (
          <Row className={"mb-5"} style={{ position: "relative" }}>
            <Col xs={12}>
              <h2 className={"fw-bold"}>Similar Products: </h2>
              <CarouselProvider
                totalSlides={sameCategoryProducts.length}
                visibleSlides={width > 992 ? 4 : width > 576 ? 2 : 1}
                infinite
                dragEnabled
                naturalSlideHeight={400}
                naturalSlideWidth={300}
              >
                <ButtonBack style={{position: 'absolute', top: '35%', zIndex: 99, left: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronLeftIcon} alt="Previous"/>
                </ButtonBack>
                <Slider>
                  {sameCategoryProducts.map((rec, index) => (
                    <Slide index={index} key={rec.id || rec.product_id}>
                      <Col className={"px-2"}>
                        <Link href={`/products/${rec.id || rec.product_id}`}>
                          <a>
                            <img
                              src={rec.image_url || (rec.image && rec.image[0]?.publicUrl) || 'https://archive.org/download/placeholder-image//placeholder-image.jpg'}
                              onError={e => { e.target.onerror = null; e.target.src = 'https://archive.org/download/placeholder-image//placeholder-image.jpg'; }}
                              className={"img-fluid"}
                              style={{ width: "100%", borderRadius: '8px' }}
                              alt={rec.title || rec.product_name}
                            />
                          </a>
                        </Link>
                        <p className={"mt-3 text-muted mb-0"}>{rec.category || (rec.categories && rec.categories[0]?.title)}</p>
                        <Link href={`/products/${rec.id || rec.product_id}`}>
                          <a>
                            <h6
                              className={"fw-bold font-size-base mt-1"}
                              style={{ fontSize: 16 }}
                            >
                              {rec.title || rec.product_name}
                            </h6>
                          </a>
                        </Link>
                        <h6 style={{ fontSize: 16 }}>${rec.price}</h6>
                      </Col>
                    </Slide>
                  ))}
                </Slider>
                <ButtonNext style={{position: 'absolute', top: '35%', zIndex: 99, right: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronRightIcon} alt="Next"/>
                </ButtonNext>
              </CarouselProvider>
            </Col>
          </Row>
        )}
        
        {/* Recommendations Section - Content-Based */}
        {contentBasedRecs.length > 0 && (
          <Row className={"mb-5"} style={{ position: "relative" }}>
            <Col xs={12}>
              <h2 className={"fw-bold"}>Content-Based Recommendations</h2>
              <CarouselProvider
                totalSlides={contentBasedRecs.length}
                visibleSlides={width > 992 ? 4 : width > 576 ? 2 : 1}
                infinite
                dragEnabled
                naturalSlideHeight={400}
                naturalSlideWidth={300}
              >
                <ButtonBack style={{position: 'absolute', top: '35%', zIndex: 99, left: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronLeftIcon} alt="Previous"/>
                </ButtonBack>
                <Slider>
                  {contentBasedRecs.map((rec, index) => (
                    <Slide index={index} key={rec.product_id}>
                      <Col className={"px-2"}>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <img
                              src={rec.image_url}
                              className={"img-fluid"}
                              style={{ width: "100%", borderRadius: '8px' }}
                              alt={rec.product_name}
                            />
                          </a>
                        </Link>
                        <p className={"mt-3 text-muted mb-0"}>{rec.category}</p>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <h6
                              className={"fw-bold font-size-base mt-1"}
                              style={{ fontSize: 16 }}
                            >
                              {rec.product_name}
                            </h6>
                          </a>
                        </Link>
                        <h6 style={{ fontSize: 16 }}>${rec.price}</h6>
                      </Col>
                    </Slide>
                  ))}
                </Slider>
                <ButtonNext style={{position: 'absolute', top: '35%', zIndex: 99, right: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronRightIcon} alt="Next"/>
                </ButtonNext>
              </CarouselProvider>
            </Col>
          </Row>
        )}
        {/* Recommendations Section - Price-Based */}
        {priceBasedRecs.length > 0 && (
          <Row className={"mb-5"} style={{ position: "relative" }}>
            <Col xs={12}>
              <h2 className={"fw-bold"}>Price-Based Recommendations</h2>
              <CarouselProvider
                totalSlides={priceBasedRecs.length}
                visibleSlides={width > 992 ? 4 : width > 576 ? 2 : 1}
                infinite
                dragEnabled
                naturalSlideHeight={400}
                naturalSlideWidth={300}
              >
                <ButtonBack style={{position: 'absolute', top: '35%', zIndex: 99, left: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronLeftIcon} alt="Previous"/>
                </ButtonBack>
                <Slider>
                  {priceBasedRecs.map((rec, index) => (
                    <Slide index={index} key={rec.product_id}>
                      <Col className={"px-2"}>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <img
                              src={rec.image_url}
                              className={"img-fluid"}
                              style={{ width: "100%", borderRadius: '8px' }}
                              alt={rec.product_name}
                            />
                          </a>
                        </Link>
                        <p className={"mt-3 text-muted mb-0"}>{rec.category}</p>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <h6
                              className={"fw-bold font-size-base mt-1"}
                              style={{ fontSize: 16 }}
                            >
                              {rec.product_name}
                            </h6>
                          </a>
                        </Link>
                        <h6 style={{ fontSize: 16 }}>${rec.price}</h6>
                      </Col>
                    </Slide>
                  ))}
                </Slider>
                <ButtonNext style={{position: 'absolute', top: '35%', zIndex: 99, right: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronRightIcon} alt="Next"/>
                </ButtonNext>
              </CarouselProvider>
            </Col>
          </Row>
        )}
        {/* Recommendations Section - Hybrid */}
        {hybridRecs.length > 0 && (
          <Row className={"mb-5"} style={{ position: "relative" }}>
            <Col xs={12}>
              <h2 className={"fw-bold"}>Hybrid Recommendations</h2>
              <CarouselProvider
                totalSlides={hybridRecs.length}
                visibleSlides={width > 992 ? 4 : width > 576 ? 2 : 1}
                infinite
                dragEnabled
                naturalSlideHeight={400}
                naturalSlideWidth={300}
              >
                <ButtonBack style={{position: 'absolute', top: '35%', zIndex: 99, left: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronLeftIcon} alt="Previous"/>
                </ButtonBack>
                <Slider>
                  {hybridRecs.map((rec, index) => (
                    <Slide index={index} key={rec.product_id}>
                      <Col className={"px-2"}>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <img
                              src={rec.image_url}
                              className={"img-fluid"}
                              style={{ width: "100%", borderRadius: '8px' }}
                              alt={rec.product_name}
                            />
                          </a>
                        </Link>
                        <p className={"mt-3 text-muted mb-0"}>{rec.category}</p>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <h6
                              className={"fw-bold font-size-base mt-1"}
                              style={{ fontSize: 16 }}
                            >
                              {rec.product_name}
                            </h6>
                          </a>
                        </Link>
                        <h6 style={{ fontSize: 16 }}>${rec.price}</h6>
                      </Col>
                    </Slide>
                  ))}
                </Slider>
                <ButtonNext style={{position: 'absolute', top: '35%', zIndex: 99, right: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronRightIcon} alt="Next"/>
                </ButtonNext>
              </CarouselProvider>
            </Col>
          </Row>
        )}
        
        {/* Fallback Recommendations Section */}
        {recommendations.length > 0 && (
          <Row className={"mb-5"} style={{ position: "relative" }}>
            <Col xs={12}>
              <h2 className={"fw-bold"}>You may also like:</h2>
              <div className="d-flex align-items-center mb-2">
                <p className="mb-0 me-3">Based on your viewing and purchase history</p>
                {recommendationSource && (
                  <span className={`badge ${recommendationSource === 'Python AI' ? 'bg-success' : 'bg-info'} me-2`}>
                    🤖 {recommendationSource}
                  </span>
                )}
                {recommendationType && (
                  <span className="badge bg-secondary">
                    {recommendationType}
                  </span>
                )}
              </div>
              <br/>
              <CarouselProvider
                totalSlides={recommendations.length}
                visibleSlides={width > 992 ? 4 : width > 576 ? 2 : 1}
                infinite
                dragEnabled
                naturalSlideHeight={400}
                naturalSlideWidth={300}
              >
                <ButtonBack style={{position: 'absolute', top: '35%', zIndex: 99, left: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronLeftIcon} alt="Previous"/>
                </ButtonBack>
                <Slider>
                  {recommendations.map((rec, index) => (
                    <Slide index={index} key={rec.product_id}>
                      <Col className={"px-2"}>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <img
                              src={rec.image_url}
                              className={"img-fluid"}
                              style={{ width: "100%", borderRadius: '8px' }}
                              alt={rec.product_name}
                            />
                          </a>
                        </Link>
                        <p className={"mt-3 text-muted mb-0"}>{rec.category}</p>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <h6
                              className={"fw-bold font-size-base mt-1"}
                              style={{ fontSize: 16 }}
                            >
                              {rec.product_name}
                            </h6>
                          </a>
                        </Link>
                        <h6 style={{ fontSize: 16 }}>${rec.price}</h6>
                      </Col>
                    </Slide>
                  ))}
                </Slider>
                <ButtonNext style={{position: 'absolute', top: '35%', zIndex: 99, right: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronRightIcon} alt="Next"/>
                </ButtonNext>
              </CarouselProvider>
            </Col>
          </Row>
        )}
        
        {/* Loading message when no recommendations are available */}
        {recommendations.length === 0 && contentBasedRecs.length === 0 && priceBasedRecs.length === 0 && hybridRecs.length === 0 && !recommendationsLoading && (
          <Row className={"mb-5"}>
            <Col xs={12}>
              <h2 className={"fw-bold"}>You may also like:</h2>
              <p className="text-muted">No recommendations available at the moment.</p>
            </Col>
          </Row>
        )}
        
        {/* Python API Recommendations Section - Content-Based */}
        {pythonContentRecs.length > 0 && (
          <Row className={"mb-5"} style={{ position: "relative" }}>
            <Col xs={12}>
              <h2 className={"fw-bold"}>Content Based Recommendations</h2>
              <div className="d-flex align-items-center mb-2">
                <p className="mb-0 me-3">Powered by Python AI</p>
                <span className="badge bg-success me-2">🤖 Python API</span>
              </div>
              <CarouselProvider
                totalSlides={pythonContentRecs.length}
                visibleSlides={width > 992 ? 4 : width > 576 ? 2 : 1}
                infinite
                dragEnabled
                naturalSlideHeight={400}
                naturalSlideWidth={300}
              >
                <ButtonBack style={{position: 'absolute', top: '35%', zIndex: 99, left: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronLeftIcon} alt="Previous"/>
                </ButtonBack>
                <Slider>
                  {pythonContentRecs.map((rec, index) => (
                    <Slide index={index} key={rec.product_id}>
                      <Col className={"px-2"}>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <img
                              src={rec.image_url}
                              className={"img-fluid"}
                              style={{ width: "100%", borderRadius: '8px' }}
                              alt={rec.product_name}
                            />
                          </a>
                        </Link>
                        <p className={"mt-3 text-muted mb-0"}>{rec.category}</p>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <h6
                              className={"fw-bold font-size-base mt-1"}
                              style={{ fontSize: 16 }}
                            >
                              {rec.product_name}
                            </h6>
                          </a>
                        </Link>
                        <h6 style={{ fontSize: 16 }}>${rec.price}</h6>
                      </Col>
                    </Slide>
                  ))}
                </Slider>
                <ButtonNext style={{position: 'absolute', top: '35%', zIndex: 99, right: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronRightIcon} alt="Next"/>
                </ButtonNext>
              </CarouselProvider>
            </Col>
          </Row>
        )}

        {/* Python API Recommendations Section - Price-Based */}
        {pythonPriceRecs.length > 0 && (
          <Row className={"mb-5"} style={{ position: "relative" }}>
            <Col xs={12}>
              <h2 className={"fw-bold"}>Price Based Recommendations</h2>
              <div className="d-flex align-items-center mb-2">
                <p className="mb-0 me-3">Powered by Python AI</p>
                <span className="badge bg-success me-2">🤖 Python API</span>
              </div>
              <CarouselProvider
                totalSlides={pythonPriceRecs.length}
                visibleSlides={width > 992 ? 4 : width > 576 ? 2 : 1}
                infinite
                dragEnabled
                naturalSlideHeight={400}
                naturalSlideWidth={300}
              >
                <ButtonBack style={{position: 'absolute', top: '35%', zIndex: 99, left: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronLeftIcon} alt="Previous"/>
                </ButtonBack>
                <Slider>
                  {pythonPriceRecs.map((rec, index) => (
                    <Slide index={index} key={rec.product_id}>
                      <Col className={"px-2"}>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <img
                              src={rec.image_url}
                              className={"img-fluid"}
                              style={{ width: "100%", borderRadius: '8px' }}
                              alt={rec.product_name}
                            />
                          </a>
                        </Link>
                        <p className={"mt-3 text-muted mb-0"}>{rec.category}</p>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <h6
                              className={"fw-bold font-size-base mt-1"}
                              style={{ fontSize: 16 }}
                            >
                              {rec.product_name}
                            </h6>
                          </a>
                        </Link>
                        <h6 style={{ fontSize: 16 }}>${rec.price}</h6>
                      </Col>
                    </Slide>
                  ))}
                </Slider>
                <ButtonNext style={{position: 'absolute', top: '35%', zIndex: 99, right: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronRightIcon} alt="Next"/>
                </ButtonNext>
              </CarouselProvider>
            </Col>
          </Row>
        )}

        {/* Python API Recommendations Section - Hybrid */}
        {pythonHybridRecs.length > 0 && (
          <Row className={"mb-5"} style={{ position: "relative" }}>
            <Col xs={12}>
              <h2 className={"fw-bold"}>More on this</h2>
              <div className="d-flex align-items-center mb-2">
                <p className="mb-0 me-3">Powered by Python AI</p>
                <span className="badge bg-success me-2">🤖 Python API</span>
              </div>
              <CarouselProvider
                totalSlides={pythonHybridRecs.length}
                visibleSlides={width > 992 ? 4 : width > 576 ? 2 : 1}
                infinite
                dragEnabled
                naturalSlideHeight={400}
                naturalSlideWidth={300}
              >
                <ButtonBack style={{position: 'absolute', top: '35%', zIndex: 99, left: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronLeftIcon} alt="Previous"/>
                </ButtonBack>
                <Slider>
                  {pythonHybridRecs.map((rec, index) => (
                    <Slide index={index} key={rec.product_id}>
                      <Col className={"px-2"}>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <img
                              src={rec.image_url}
                              className={"img-fluid"}
                              style={{ width: "100%", borderRadius: '8px' }}
                              alt={rec.product_name}
                            />
                          </a>
                        </Link>
                        <p className={"mt-3 text-muted mb-0"}>{rec.category}</p>
                        <Link href={`/products/${rec.product_id}`}>
                          <a>
                            <h6
                              className={"fw-bold font-size-base mt-1"}
                              style={{ fontSize: 16 }}
                            >
                              {rec.product_name}
                            </h6>
                          </a>
                        </Link>
                        <h6 style={{ fontSize: 16 }}>${rec.price}</h6>
                      </Col>
                    </Slide>
                  ))}
                </Slider>
                <ButtonNext style={{position: 'absolute', top: '35%', zIndex: 99, right: -20}} className={"btn bg-transparent border-0 p-0"}>
                  <img src={chevronRightIcon} alt="Next"/>
                </ButtonNext>
              </CarouselProvider>
            </Col>
          </Row>
        )}
        
        <InfoBlock />
        <InstagramWidget />
      </Container>
    </>
  );
};

export default Id;
