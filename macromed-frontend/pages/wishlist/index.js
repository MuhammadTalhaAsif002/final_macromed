import React from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import close from "public/images/e-commerce/close.svg";

import InstagramWidget from 'components/e-commerce/Instagram';
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import s1 from "./Wishlist.module.scss";
import Head from "next/head";
import {toast, ToastContainer} from "react-toastify";
import productsListActions from "../../redux/actions/products/productsListActions";
import InfoBlock from "components/e-commerce/InfoBlock";
import config from "constants/config";
import { useRouter } from "next/router";

const Wishlist = () => {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const currentUser = useSelector((store) => store.auth.currentUser);
  const dispatchStore = useDispatch();
  const router = useRouter();

  React.useEffect(() => {
    const fetchWishlistItems = async () => {
      setLoading(true);
      try {
        // For both authenticated and guest users, use localStorage for now
        const wishlistItems = JSON.parse(localStorage.getItem("wishlist") || "[]");
        console.log('=== WISHLIST LOAD DEBUG ===');
        console.log('localStorage wishlist items:', wishlistItems);
        
        const productsWithDetails = await Promise.all(
          wishlistItems.map(async (item) => {
            try {
              console.log('Fetching product details for ID:', item.product);
              const productResponse = await axios.get(`${config.baseURLApi}/products/${item.product}`);
              console.log('Product response:', productResponse.data);
              return {
                ...productResponse.data,
                wishlistProductId: item.product, // Store the original product ID from localStorage
                displayId: productResponse.data.id || productResponse.data.product_id || item.product // Use the correct ID field
              };
            } catch (error) {
              console.error('Failed to fetch product details:', error);
              return null;
            }
          })
        );
        
        console.log('Final products with details:', productsWithDetails.filter(Boolean));
        setProducts(productsWithDetails.filter(Boolean));
      } catch (error) {
        console.error('Failed to fetch wishlist items:', error);
        toast.error("Failed to load wishlist items");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, [currentUser]);

  const removeFromWishlist = (productId, wishlistProductId) => {
    try {
      console.log('=== REMOVE FROM WISHLIST DEBUG ===');
      console.log('productId (API ID):', productId);
      console.log('wishlistProductId (localStorage ID):', wishlistProductId);
      
      // Remove from localStorage using the original product ID
      const wishlistItems = JSON.parse(localStorage.getItem("wishlist") || "[]");
      console.log('Current localStorage wishlist:', wishlistItems);
      
      const updatedWishlist = wishlistItems.filter(item => item.product !== wishlistProductId);
      console.log('Updated localStorage wishlist:', updatedWishlist);
      
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

      // Update local state using the displayId (which should be the correct product ID)
      console.log('Current products state:', products);
      console.log('Looking for product with displayId:', productId);
      const updatedProducts = products.filter(item => item.displayId !== productId);
      console.log('Updated products state:', updatedProducts);
      
      setProducts(updatedProducts);
      
      toast.success("Product removed from wishlist");
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error("Failed to remove product");
    }
  };

  const addToCart = (productId, wishlistProductId) => {
    try {
      // Add to cart (localStorage) using the original product ID
      const localProducts = JSON.parse(localStorage.getItem("products") || "[]");
      
      // Check if product already exists in cart
      const existingProductIndex = localProducts.findIndex(item => item.product === wishlistProductId);
      
      if (existingProductIndex !== -1) {
        // Update quantity if product already exists
        localProducts[existingProductIndex].amount += 1;
      } else {
        // Add new product to cart
        localProducts.push({
          product: wishlistProductId,
          amount: 1,
          order_date: new Date().toISOString(),
          status: "in cart",
        });
      }
      
      localStorage.setItem("products", JSON.stringify(localProducts));
      toast.success("Product added to cart");
      
      // Remove from wishlist using displayId for state filtering
      removeFromWishlist(productId, wishlistProductId);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error("Failed to add product to cart");
    }
  };

  return (
    <>
      <Head>
        <title>Wishlist</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Your wishlist" />
      </Head>
      <Container>
        <ToastContainer />
        <Row className={"mb-5"} style={{ marginTop: 32 }}>
          <Col xs={12} style={{ overflow: 'auto' }}>
            <h2 className={"fw-bold mt-4 mb-4"}>Wishlist</h2>
            {loading ? (
              <div className="text-center py-5">
                <h5>Loading wishlist...</h5>
              </div>
            ) : (
              <Table className={s1.wishListTable} borderless>
                <thead>
                  <tr style={{ borderBottom: "1px solid #D9D9D9" }}>
                    <th className={"bg-transparent text-dark px-0"}>Product</th>
                    <th className={"bg-transparent text-dark px-0"}>Price</th>
                    <th className={"bg-transparent text-dark px-0"}>
                      Stock status
                    </th>
                    <th className={"bg-transparent text-dark px-0"} />
                    <th className={"bg-transparent text-dark px-0"} />
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <h5 className={"fw-bold"}>No items in wishlist</h5>
                        <Button 
                          color="primary" 
                          className="mt-3"
                          onClick={() => router.push('/shop')}
                        >
                          Continue Shopping
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {products.map((item, index) => (
                        <tr key={item.displayId} className={"mt-2"}>
                          <td className={"px-0 pt-4"}>
                            <div className={"d-flex align-items-center"}>
                              <img
                                src={item.image_url || "https://t4.ftcdn.net/jpg/06/71/92/37/360_F_671923740_x0zOL3OIuUAnSF6sr7PuznCI5bQFKhI0.jpg"}
                                width={100}
                                className={"mr-4"}
                                style={{borderRadius: '8px'}}
                                onError={(e) => {
                                  e.target.src = "https://t4.ftcdn.net/jpg/06/71/92/37/360_F_671923740_x0zOL3OIuUAnSF6sr7PuznCI5bQFKhI0.jpg";
                                }}
                              />
                              <div>
                                <h6 className={"text-muted"}>
                                  {item.brand || 'Product'}
                                </h6>
                                <h5 className={"fw-bold"}>{item.product_name}</h5>
                              </div>
                            </div>
                          </td>
                          <td className={"px-0 pt-4"}>
                            <h6 className={"fw-bold mb-0"}>${item.price}</h6>
                          </td>
                          <td className={"px-0 pt-4"}>
                            <h6
                              className={`fw-bold mb-0 text-uppercase ${
                                item.stock_quantity <= 0 ? "text-muted" : "text-success"
                              }`}
                            >
                              {item.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                            </h6>
                          </td>
                          <td className={"px-0 pt-4"}>
                            {item.stock_quantity > 0 ? (
                              <Button
                                color={"primary"}
                                outline
                                className={`text-uppercase d-flex align-items-center ${s1.addToCartBtn}`}
                                size={"sm"}
                                onClick={() => addToCart(item.displayId, item.wishlistProductId)}
                              >
                                <div className={`mr-2 ${s1.addToCart}`} />
                                add to cart
                              </Button>
                            ) : (
                              <span className="text-muted">Out of Stock</span>
                            )}
                          </td>
                          <td className={"px-0 pt-4"}>
                            <Button
                              className={"bg-transparent border-0 p-0"}
                              onClick={() => removeFromWishlist(item.displayId, item.wishlistProductId)}
                            >
                              <img src={close} alt={"close"} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </Container>
      <InfoBlock />
      <InstagramWidget />
    </>
  );
};

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {  }, // will be passed to the page component as props
  };
}

export default Wishlist;
