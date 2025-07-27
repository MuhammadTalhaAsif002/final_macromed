import React from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import Link from "next/link";
import s from "./Cart.module.scss";
import close from "public/images/e-commerce/close.svg";
import { useSelector } from "react-redux";
import axios from "axios";
import Head from "next/head";
import { toast, ToastContainer } from "react-toastify";
import config from "constants/config";

const Index = () => {
  const currentUser = useSelector((store) => store.auth.currentUser);
  const [products, setProducts] = React.useState([]);
  const [totalPrice, setTotalPrice] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      try {
        // For both authenticated and guest users, use localStorage for now
        const localProducts = JSON.parse(localStorage.getItem("products") || "[]");
        
        const productsWithDetails = await Promise.all(
          localProducts.map(async (item) => {
            try {
              const productResponse = await axios.get(`${config.baseURLApi}/products/${item.product}`);
              return {
                ...productResponse.data,
                amount: item.amount,
                cartProductId: item.product, // Store the original product ID from localStorage
                displayId: productResponse.data.id || productResponse.data.product_id || item.product // Use the correct ID field
              };
            } catch (error) {
              console.error('Failed to fetch product details:', error);
              return null;
            }
          })
        );
        
        setProducts(productsWithDetails.filter(Boolean));
      } catch (error) {
        console.error('Failed to fetch cart items:', error);
        toast.error("Failed to load cart items");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [currentUser]);

  React.useEffect(() => {
    let total = 0;
    products.map((item) => {
      total += item.amount * item.price;
    });
    setTotalPrice((prevState) => total);
  }, [products]);

  const reduceQuantity = async (index) => {
    const product = products[index];
    if (product.amount <= 1) return;

    try {
      // Update localStorage using the original product ID
      const localProducts = JSON.parse(localStorage.getItem("products") || "[]");
      const productIndex = localProducts.findIndex(item => item.product === product.cartProductId);
      if (productIndex !== -1) {
        localProducts[productIndex].amount = product.amount - 1;
        localStorage.setItem("products", JSON.stringify(localProducts));
      }

      // Update local state
      const updatedProducts = [...products];
      updatedProducts[index] = { ...product, amount: product.amount - 1 };
      setProducts(updatedProducts);
      
      toast.success("Quantity updated");
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error("Failed to update quantity");
    }
  };

  const increaseQuantity = async (index) => {
    const product = products[index];

    try {
      // Update localStorage using the original product ID
      const localProducts = JSON.parse(localStorage.getItem("products") || "[]");
      const productIndex = localProducts.findIndex(item => item.product === product.cartProductId);
      if (productIndex !== -1) {
        localProducts[productIndex].amount = product.amount + 1;
        localStorage.setItem("products", JSON.stringify(localProducts));
      }

      // Update local state
      const updatedProducts = [...products];
      updatedProducts[index] = { ...product, amount: product.amount + 1 };
      setProducts(updatedProducts);
      
      toast.success("Quantity updated");
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error("Failed to update quantity");
    }
  };

  const removeFromProducts = async (productId, cartProductId) => {
    try {
      // Remove from localStorage using the original product ID
      const localProducts = JSON.parse(localStorage.getItem("products") || "[]");
      const updatedLocalProducts = localProducts.filter(item => item.product !== cartProductId);
      localStorage.setItem("products", JSON.stringify(updatedLocalProducts));

      // Update local state using the displayId (which should be the correct product ID)
      const updatedProducts = products.filter(item => item.displayId !== productId);
      setProducts(updatedProducts);
      
      toast.success("Product removed from cart");
    } catch (error) {
      console.error('Failed to remove product:', error);
      toast.error("Failed to remove product");
    }
  };

  return (
    <Container>
      <Head>
        <title>Cart</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Your shopping cart" />
      </Head>
      <Row className={"mb-5"} style={{ marginTop: 32 }}>
        <ToastContainer />
        <Col xs={12} lg={8}>
          <h2 className={"fw-bold mt-4 mb-5"}>Shopping Cart</h2>
          {loading ? (
            <div className="text-center py-5">
              <h5>Loading cart...</h5>
            </div>
          ) : (
            <Table borderless>
              <thead>
                <tr style={{ borderBottom: "1px solid #D9D9D9" }}>
                  <th className={"bg-transparent text-dark px-0"}>Product</th>
                  <th className={"bg-transparent text-dark px-0"}>Quantity</th>
                  <th className={"bg-transparent text-dark px-0"}>Price</th>
                  <th className={"bg-transparent text-dark px-0"}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <h5 className={"fw-bold"}>No items in cart</h5>
                      <Link href="/shop">
                        <Button color="primary" className="mt-3">
                          Continue Shopping
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  <>
                    {products.map((item, index) => (
                      <tr key={item.cartProductId} className={"mt-2"}>
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
                          <div className={"d-flex align-items-center"}>
                            <Button
                              className={`${s.quantityBtn} bg-transparent border-0 p-1 fw-bold mr-3`}
                              onClick={() => reduceQuantity(index)}
                              disabled={item.amount <= 1}
                            >
                              -
                            </Button>
                            <p className={"fw-bold mb-0"}>{item.amount}</p>
                            <Button
                              className={`${s.quantityBtn} bg-transparent border-0 p-1 fw-bold ml-3`}
                              onClick={() => increaseQuantity(index)}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className={"px-0 pt-4"}>
                          <h6 className={"fw-bold mb-0"}>${(item.price * item.amount).toFixed(2)}</h6>
                          <small className="text-muted">${item.price} each</small>
                        </td>
                        <td className={"px-0 pt-4"}>
                          <Button
                            className={"bg-transparent border-0 p-0"}
                            onClick={() => removeFromProducts(item.displayId, item.cartProductId)}
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
        <Col xs={12} lg={4}>
          <section className={s.cartTotal}>
            <h2 className={"fw-bold mb-5"}>Cart Total</h2>
            <div className={"d-flex"}>
              <h6 className={"fw-bold mr-5 mb-0"}>Subtotal:</h6>
              <h6 className={"fw-bold mb-0"}>{totalPrice}$</h6>
            </div>
            <hr className={"my-4"} />
            <div className={"d-flex"}>
              <h6 className={"fw-bold mr-5 mb-0"}>Shipping:</h6>
              <div>
                <h6 className={"fw-bold mb-3"}>Free Shipping</h6>
                <p className={"mb-0"}>
                  Shipping options will be updated during checkout.
                </p>
              </div>
            </div>
            <hr className={"my-4"} />
            <div className={"d-flex"}>
              <h5 className={"fw-bold"} style={{ marginRight: 63 }}>
                Total:
              </h5>
              <h5 className={"fw-bold"}>{totalPrice}$</h5>
            </div>
            <Link href={"/billing"}>
              <Button
                color={"primary"}
                className={`${s.checkOutBtn} text-uppercase mt-auto fw-bold`}
              >
                Check out
              </Button>
            </Link>
          </section>
        </Col>
      </Row>
    </Container>
  );
};

export async function getServerSideProps(context) {
  // const res = await axios.get("/products");
  // const products = res.data.rows;

  return {
    props: {}, // will be passed to the page component as props
  };
}

export default Index;
