import React from "react";
import { Container, Row, Col, Button, Modal } from "reactstrap";
import s from "pages/index.module.scss";
import Link from "next/link";
import axios from "axios";
import Carousel from "react-bootstrap/Carousel";
import Head from "next/head";

import arrowRight from "public/images/e-commerce/home/arrow-right.svg";

import InfoBlock from 'components/e-commerce/InfoBlock';
import InstagramWidget from 'components/e-commerce/Instagram';
import article1 from "public/images/slides/stock1.jpg";
import article2 from "public/images/slides/stock3.png";
import article3 from "public/images/slides/stock4.png";


import { toast, ToastContainer } from "react-toastify";
import {useDispatch, useSelector} from "react-redux";

import Countdown from "./home/Countdown";
import rating from "../public/images/e-commerce/details/stars.svg";
import productsListActions from "../redux/actions/products/productsListActions";
import { products as productsData } from '../data/products';

const Index = () => {
  const [quantity, setQuantity] = React.useState(1);
  const dispatchStore = useDispatch();
  const openReducer = (state, action) => {
    switch (action.type) {
      case "open0":
        return {
          ...state,

          open0: !state.open0,
        };
      case "open1":
        return {
          ...state,
          open1: !state.open1,
        };
      case "open2":
        return {
          ...state,

          open2: !state.open2,
        };
      case "open3":
        return {
          ...state,

          open3: !state.open3,
        };
      case "open4":
        return {
          ...state,

          open4: !state.open4,
        };
      case "open5":
        return {
          ...state,

          open5: !state.open5,
        };
      case "open6":
        return {
          ...state,

          open6: !state.open6,
        };
      case "open7":
        return {
          ...state,

          open7: !state.open6,
        };
      case "open8":
        return {
          ...state,

          open8: !state.open8,
        };
    }
  };
  const [secs, setSecs] = React.useState(23);
  const [products, setProducts] = React.useState([]);
  const [topCategories, setTopCategories] = React.useState([]);
  const [topSellingProducts, setTopSellingProducts] = React.useState([]);
  const [newArrivals, setNewArrivals] = React.useState([]);

  const [openState, dispatch] = React.useReducer(openReducer, {
    open0: false,
    open1: false,
    open2: false,
    open3: false,
    open4: false,
    open5: false,
    open6: false,
    open7: false,
    open8: false,
  });
  const currentUser = useSelector((store) => store.auth.currentUser);

  const addToCart = (id, quantity = 1) => {
    if (currentUser) {
      axios.post(`/orders/`, {
        data: {
          amount: quantity,
          order_date: new Date(),
          product: id,
          status: "in cart",
          user: currentUser.id,
        },
      });
      return;
    }
    const localProducts =
      (typeof window !== "undefined" &&
        JSON.parse(localStorage.getItem("products"))) ||
      [];
    localProducts.push({
      amount: quantity,
      order_date: new Date(),
      product: id,
      status: "in cart",
    });
    typeof window !== "undefined" &&
      localStorage.setItem("products", JSON.stringify(localProducts));
    dispatchStore(productsListActions.doAdd(localProducts))
  };

  const addToWishlist = (id) => {
    if (currentUser) {
      axios.put(`/users/${currentUser.id}`, {
        id: currentUser.id,
        data: {
          ...currentUser,
          wishlist: [id],
        },
      });
    }
    const localWishlist =
      (typeof window !== "undefined" &&
        JSON.parse(localStorage.getItem("wishlist"))) ||
      [];
    localWishlist.push({ amount: 1, product: id });
    typeof window !== "undefined" &&
      localStorage.setItem("wishlist", JSON.stringify(localWishlist));
  };

  const secsInterval = () => {
    let secsInt = setInterval(() => {
      if (secs === 0) {
        clearInterval(secsInt);
      }
      setSecs((prev) => --prev);
    }, 1000);
  };

  React.useEffect(() => {
    // secsInterval();
  }, []);

  React.useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/insights/trending');
        if (response.data && response.data.products) {
          const productsArray = Object.values(response.data.products);
          setProducts(productsArray);
        }
      } catch (error) {
        console.error('Error fetching trending products:', error);
        setProducts(productsData); // fallback to static data
      }
    };
    fetchTrendingProducts();
  }, []);

  React.useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
    fetch('http://127.0.0.1:8000/api/insights/top-selling-categories', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
      .then(res => res.json())
      .then(data => {
        setTopCategories((data.top_selling_categories || []).slice(0, 4));
      })
      .catch(err => {
        setTopCategories([]);
        console.error('[API] Error fetching top selling categories:', err);
      });
  }, []);

  React.useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/insights/top-selling-products');
        if (response.data && response.data.top_selling_products) {
          const productsArray = response.data.top_selling_products;
          setTopSellingProducts(productsArray);
        }
      } catch (error) {
        console.error('Error fetching top selling products:', error);
        setTopSellingProducts([]); // fallback to empty array
      }
    };
    fetchTopSellingProducts();
  }, []);

  React.useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
        const response = await axios.get('http://localhost:8000/api/insights/new-arrivals', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (response.data && response.data.new_arrivals) {
          const productsArray = response.data.new_arrivals;
          setNewArrivals(productsArray);
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
        setNewArrivals([]); // fallback to empty array
      }
    };
    fetchNewArrivals();
  }, []);

  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta name="keywords" content="macromed, react templates" />
        <meta name="author" content="Macromed LLC." />
        <meta charSet="utf-8" />


        <meta property="og:title" content="Macromed - React, Vue, Angular and Bootstrap Templates and Admin Dashboard Themes"/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://flatlogic-ecommerce.herokuapp.com/"/>
        <meta property="og:image" content="https://flatlogic-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"/>
        <meta property="og:description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development"/>
        <meta name="twitter:card" content="summary_large_image" />

        <meta property="fb:app_id" content="712557339116053" />

        <meta property="og:site_name" content="Macromed"/>
        <meta name="twitter:site" content="@macromed" />
      </Head>
      <ToastContainer />
      <Carousel prevLabel="prev" nextLabel="next">
        <Carousel.Item interval={1000}>
          <section className={`${s.carousel} ${s.firstImg}`}>
            <Container className={"h-100"}>
              <Row className={"h-100"}>
                <Col
                  sm={12}
                  className={
                    "h-100 d-flex flex-column justify-content-center align-items-center align-items-md-start"
                  }
                >
                  <p className={"text-uppercase text-primary fw-bold mb-2"}>
                    surgical
                  </p>
                  <h2 className={"mb-2"}>find all</h2>
                  <h1 className={"text-uppercase fw-bold mt-1"}>
                    medical tools
                  </h1>
                  <Link href={"/shop"}>
                    {typeof window !== "undefined" &&
                    window.innerWidth <= 768 ? (
                      <Button
                        color="primary"
                        className={"text-uppercase mt-4 fw-bold"}
                      >
                        view more
                      </Button>
                    ) : (
                      <Button
                        outline
                        color="primary"
                        className={`text-uppercase mt-4 mr-auto fw-bold d-flex align-items-center ${s.viewMoreBtn}`}
                      >
                        <p className={"mb-0"}>view more</p>{" "}
                        <div className={`ml-2 ${s.arrowRight}`} />
                      </Button>
                    )}
                  </Link>
                </Col>
              </Row>
            </Container>
          </section>
        </Carousel.Item>
        <Carousel.Item interval={3000}>
          <section className={`${s.carousel} ${s.secondImg}`}>
            <Container className={"h-100"}>
              <Row className={"h-100"}>
                <Col
                  sm={12}
                  className={
                    "h-100 d-flex flex-column justify-content-center align-items-center align-items-md-start"
                  }
                >
                  <p className={"text-uppercase text-primary fw-bold mb-2"}>
                    medical
                  </p>
                  <h2 className={"mb-2"}>discover</h2>
                  <h1 className={"text-uppercase fw-bold mt-1"}>
                    quality care
                  </h1>
                  <Link href={"/shop"}>
                    {typeof window !== "undefined" &&
                    window.innerWidth <= 768 ? (
                      <Button
                        color="primary"
                        className={"text-uppercase mt-4 fw-bold"}
                      >
                        view more
                      </Button>
                    ) : (
                      <Button
                        outline
                        color="primary"
                        className={`text-uppercase mt-4 mr-auto fw-bold d-flex align-items-center ${s.viewMoreBtn}`}
                      >
                        <p className={"mb-0"}>view more</p>{" "}
                        <div className={`ml-2 ${s.arrowRight}`} />
                      </Button>
                    )}
                  </Link>
                </Col>
              </Row>
            </Container>
          </section>
        </Carousel.Item>
        <Carousel.Item interval={5000}>
          <section className={`${s.carousel} ${s.thirdImg}`}>
            <Container className={"h-100"}>
              <Row className={"h-100"}>
                <Col
                  sm={12}
                  className={
                    "h-100 d-flex flex-column justify-content-center align-items-center align-items-md-start"
                  }
                >
                  <p className={"text-uppercase text-primary fw-bold mb-2"}>
                    precision
                  </p>
                  <h2 className={"mb-2"}>trust in</h2>
                  <h1 className={"text-uppercase fw-bold mt-1"}>
                    excellence
                  </h1>
                  <Link href={"/shop"}>
                    {typeof window !== "undefined" &&
                    window.innerWidth <= 768 ? (
                      <Button
                        color="primary"
                        className={"text-uppercase mt-4 fw-bold"}
                      >
                        view more
                      </Button>
                    ) : (
                      <Button
                        outline
                        color="primary"
                        className={`text-uppercase mt-4 mr-auto fw-bold d-flex align-items-center ${s.viewMoreBtn}`}
                      >
                        <p className={"mb-0"}>view more</p>{" "}
                        <div className={`ml-2 ${s.arrowRight}`} />
                      </Button>
                    )}
                  </Link>
                </Col>
              </Row>
            </Container>
          </section>
        </Carousel.Item>
      </Carousel>
      <Container style={{ marginTop: 80, marginBottom: 80 }}>
        <h3 className={`text-center fw-bold mb-4`}>New Arrivals</h3>
        <Row className={"justify-content-center mb-2"}>
          <Col sm={8}>
            <p className={"text-center text-muted mb-4"}>
            Discover the latest additions to our surgical equipment collection! Fresh arrivals featuring cutting-edge technology and innovative medical tools designed for modern healthcare professionals.
            </p>
          </Col>
        </Row>
        <Row>
          {newArrivals.slice(0, 4).map((item, index) => (
            <Col
              sm={6}
              md={3}
              xs={12}
              className={`mb-4 ${s.product}`}
              key={index}
            >
              <Modal
                isOpen={openState[`open${index + 8}`]}
                toggle={() => dispatch({ type: `open${index + 8}` })}
              >
                <div className={s.modalWidndow}>
                  <div className={s.image}>
                    <img
                      src={item.image_url === 'Missing_URL' ? "" : item.image_url}
                      width={"100%"}
                      height={"100%"}
                      alt="img"
                    />
                  </div>
                  <div
                    className={`${s.content} p-4 d-flex flex-column justify-content-between`}
                  >
                    <Link href={`/products/${item.product_id}`}>
                      <a className={"fw-semi-bold"}>
                        More about product
                        <img
                          src={arrowRight}
                          alt={"arrow"}
                          className={"ml-2"}
                        />
                      </a>
                    </Link>
                    <h6 className={`text-muted`}>
                      {item.category}
                    </h6>
                    <h4 className={"fw-bold"}>{item.product_name}</h4>
                    <div className={"d-flex align-items-center"}>
                      <img src={rating} alt={'rating'} />
                      <p className={"text-primary ml-3 mb-0"}>12 reviews</p>
                    </div>
                    <p>
                      {item.description}
                    </p>
                    <div className={"d-flex"}>
                      <div
                        className={
                          "d-flex flex-column mr-5 justify-content-between"
                        }
                      >
                        <h6 className={"fw-bold text-muted text-uppercase"}>
                          Quantity
                        </h6>
                        <div className={"d-flex align-items-center"}>
                          <Button
                            className={`bg-transparent border-0 p-1 fw-bold mr-3 ${s.quantityBtn}`}
                            onClick={() => {
                              if (quantity === 1) return;
                              setQuantity((prevState) => prevState - 1);
                            }}
                          >
                            -
                          </Button>
                          <p className={"fw-bold mb-0"}>{quantity}</p>
                          <Button
                            className={`bg-transparent border-0 p-1 fw-bold ml-3 ${s.quantityBtn}`}
                            onClick={() => {
                              if (quantity < 1) return;
                              setQuantity((prevState) => prevState + 1);
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div
                        className={"d-flex flex-column justify-content-between"}
                      >
                        <h6 className={"fw-bold text-muted text-uppercase"}>
                          Price
                        </h6>
                        <h6 className={"fw-bold"}>{item.price}$</h6>
                      </div>
                    </div>
                    <div className={"d-flex mt-5"}>
                      <Button
                        outline
                        color={"primary"}
                        className={"flex-fill mr-4 text-uppercase fw-bold"}
                        style={{ width: "50%" }}
                        onClick={() => {
                          toast.info(
                            "products successfully added to your cart"
                          );
                          addToCart(item.product_id);
                        }}
                      >
                        Add to Cart
                      </Button>
                      <Link href={"/billing"}>
                        <a className={"d-inline-block flex-fill"}>
                          <Button
                            color={"primary"}
                            className={"text-uppercase fw-bold"}
                            style={{ width: "50%" }}
                          >
                            Buy now
                          </Button>
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </Modal>
              <div style={{ position: "relative" }}>
                <Link href={`/products/${item.product_id}`}>
                  <a>
                    <div
                      style={{
                        background: `url(${item.image_url && item.image_url !== 'Missing_URL' ? item.image_url : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGh5WFH8TOIfRKxUrIgJZoDCs1yvQ4hIcppw&s'}) no-repeat center`,
                        backgroundSize: "contain",
                        transition: "all .65s ease",
                      }}
                      className={s.productImage}
                    />
                  </a>
                </Link>
                <div
                  className={`d-flex flex-column justify-content-center ${s.product__actions}`}
                  style={{
                    position: "absolute",
                    height: "100%",
                    top: 0,
                    right: 15,
                  }}
                >
                  <Button
                    className={"p-0 bg-transparent border-0"}
                    onClick={() => {
                      addToWishlist(item.product_id);
                      toast.info(
                        "products successfully added to your wishlist"
                      );
                    }}
                  >
                    <div className={`mb-4 ${s.product__actions__heart}`} />
                  </Button>
                  <Button
                    className={"p-0 bg-transparent border-0"}
                    onClick={() => {
                      dispatch({ type: `open${index + 8}` });
                    }}
                  >
                    <div className={`mb-4 ${s.product__actions__max}`} />
                  </Button>
                  <Button
                    className={"p-0 bg-transparent border-0"}
                    onClick={() => {
                      addToCart(item.product_id);
                      toast.info("products successfully added to your cart");
                    }}
                  >
                    <div className={`mb-4 ${s.product__actions__cart}`} />
                  </Button>
                </div>
              </div>
              <div className={s.productInfo}>
                <div>
                  <a className={"mt-3 text-muted mb-0 d-inline-block"} >
                    {item.category}
                  </a>
                  <Link href={`/products/${item.product_id}`}>
                    <a>
                      <h6
                        className={"fw-bold font-size-base mt-1"}
                        style={{ fontSize: 16 }}
                      >
                        {item.product_name}
                      </h6>
                    </a>
                  </Link>
                  <h6 style={{ fontSize: 16 }}>${item.price}</h6>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        <Row className={"d-flex justify-content-center"}>
          <Link href={"/new-arrivals"}>
            <Button
              outline
              color="primary"
              className={"text-uppercase mx-auto mt-5 fw-bold"}
            >
              view more
            </Button>
          </Link>
        </Row>
      </Container>
      <Container style={{ marginTop: 80, marginBottom: 80 }}>
        <h3 className={`text-center fw-bold mb-4`}>Trending Products</h3>
        <Row className={"justify-content-center mb-2"}>
          <Col sm={8}>
            <p className={"text-center text-muted mb-4"}>
            Discover our premium surgical equipment collection! Precision instruments, advanced medical tools, and cutting-edge technology. Our comprehensive range ensures optimal performance for healthcare professionals.
            </p>
          </Col>
        </Row>
        <Row>
          {products.slice(0, 4).map((item, index) => (
            <Col
              sm={6}
              md={3}
              xs={12}
              className={`mb-4 ${s.product}`}
              key={index}
            >
              <Modal
                isOpen={openState[`open${index}`]}
                toggle={() => dispatch({ type: `open${index}` })}
              >
                <div className={s.modalWidndow}>
                  <div className={s.image}>
                    <img
                      src={item.image_url === 'Missing_URL' ? "" : item.image_url}
                      width={"100%"}
                      height={"100%"}
                      alt="img"
                    />
                  </div>
                  <div
                    className={`${s.content} p-4 d-flex flex-column justify-content-between`}
                  >
                    <Link href={`/products/${item.product_id}`}>
                      <a className={"fw-semi-bold"}>
                        More about product
                        <img
                          src={arrowRight}
                          alt={"arrow"}
                          className={"ml-2"}
                        />
                      </a>
                    </Link>
                    <h6 className={`text-muted`}>
                      {item.category}
                    </h6>
                    <h4 className={"fw-bold"}>{item.product_name}</h4>
                    <div className={"d-flex align-items-center"}>
                      <img src={rating} alt={'rating'} />
                      <p className={"text-primary ml-3 mb-0"}>12 reviews</p>
                    </div>
                    <p>
                      {item.description}
                    </p>
                    <div className={"d-flex"}>
                      <div
                        className={
                          "d-flex flex-column mr-5 justify-content-between"
                        }
                      >
                        <h6 className={"fw-bold text-muted text-uppercase"}>
                          Quantity
                        </h6>
                        <div className={"d-flex align-items-center"}>
                          <Button
                            className={`bg-transparent border-0 p-1 fw-bold mr-3 ${s.quantityBtn}`}
                            onClick={() => {
                              if (quantity === 1) return;
                              setQuantity((prevState) => prevState - 1);
                            }}
                          >
                            -
                          </Button>
                          <p className={"fw-bold mb-0"}>{quantity}</p>
                          <Button
                            className={`bg-transparent border-0 p-1 fw-bold ml-3 ${s.quantityBtn}`}
                            onClick={() => {
                              if (quantity < 1) return;
                              setQuantity((prevState) => prevState + 1);
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div
                        className={"d-flex flex-column justify-content-between"}
                      >
                        <h6 className={"fw-bold text-muted text-uppercase"}>
                          Price
                        </h6>
                        <h6 className={"fw-bold"}>{item.price}$</h6>
                      </div>
                    </div>
                    <div className={"d-flex mt-5"}>
                      <Button
                        outline
                        color={"primary"}
                        className={"flex-fill mr-4 text-uppercase fw-bold"}
                        style={{ width: "50%" }}
                        onClick={() => {
                          toast.info(
                            "products successfully added to your cart"
                          );
                          addToCart(item.product_id);
                        }}
                      >
                        Add to Cart
                      </Button>
                      <Link
                        href={"/billing"}
                        className={"d-inline-block flex-fill"}
                      >
                        <Button
                          color={"primary"}
                          className={"text-uppercase fw-bold"}
                          style={{ width: "50%" }}
                        >
                          Buy now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Modal>
              <div style={{ position: "relative" }}>
                <Link href={`/products/${item.product_id}`}>
                  <a>
                    <div
                      style={{
                        background: `url(${item.image_url && item.image_url !== 'Missing_URL' ? item.image_url : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGh5WFH8TOIfRKxUrIgJZoDCs1yvQ4hIcppw&s'}) no-repeat center`,
                        backgroundSize: "contain",
                        transition: "all .65s ease",
                      }}
                      className={s.productImage}
                    />
                  </a>
                </Link>
                <div
                  className={`d-flex flex-column justify-content-center ${s.product__actions}`}
                  style={{
                    position: "absolute",
                    height: "100%",
                    top: 0,
                    right: 15,
                  }}
                >
                  <Button
                    className={"p-0 bg-transparent border-0"}
                    onClick={() => {
                      addToWishlist(item.product_id);
                      toast.info(
                        "products successfully added to your wishlist"
                      );
                    }}
                  >
                    <div className={`mb-4 ${s.product__actions__heart}`} />
                  </Button>
                  <Button
                    className={"p-0 bg-transparent border-0"}
                    onClick={() => {
                      dispatch({ type: `open${index}` });
                    }}
                  >
                    <div className={`mb-4 ${s.product__actions__max}`} />
                  </Button>
                  <Button
                    className={"p-0 bg-transparent border-0"}
                    onClick={() => {
                      addToCart(item.product_id);
                      toast.info("products successfully added to your cart");
                    }}
                  >
                    <div className={`mb-4 ${s.product__actions__cart}`} />
                  </Button>
                </div>
              </div>
              <div className={s.productInfo}>
                <div>
                  <a className={"mt-3 text-muted mb-0 d-inline-block"} >
                    {item.category}
                  </a>
                  <Link href={`/products/${item.product_id}`}>
                    <a>
                      <h6
                        className={"fw-bold font-size-base mt-1"}
                        style={{ fontSize: 16 }}
                      >
                        {item.product_name}
                      </h6>
                    </a>
                  </Link>
                  <h6 style={{ fontSize: 16 }}>${item.price}</h6>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        <Row className={"d-flex justify-content-center"}>
          <Link href={"/trending-products"}>
            <Button
              outline
              color="primary"
              className={"text-uppercase mx-auto mt-5 fw-bold"}
            >
              view more
            </Button>
          </Link>
        </Row>
      </Container>
      <section className={s.promo}>
        <Container className={"h-100"}>
          <Row className={"h-100"}>
            <Col
              md={6}
              xs={12}
              className={
                "h-100 d-flex flex-column justify-content-center align-items-center align-items-md-start"
              }
            >
              <h5 className={"text-uppercase fw-bold mb-3"}>
                news and inspiration
              </h5>
              <h1
                className={`text-uppercase fw-bold mb-0 ${s.newArrivals}`}
                style={{ fontSize: 50 }}
              >
                new equipment
              </h1>
              <div
                className={`${s.stroke} mt-4`}
                style={{ marginBottom: 30 }}
              />
              <Countdown />
              <section className={"d-flex mt-5 align-itens-center"}>
                <h2
                  className={"text-muted mr-3 mb-0 d-flex align-items-center"}
                >
                  <del>$ 140,56</del>
                </h2>
                <h1 className={"text-primary fw-bold mb-0"}>$ 70</h1>
              </section>
            </Col>
          </Row>
        </Container>
      </section>
      <Container style={{ marginTop: 80, marginBottom: 80 }}>
        <h3 className={"text-center fw-bold mb-4"}>Top Selling Products</h3>
        <Row className={"justify-content-center mb-2"}>
          <Col sm={8}>
            <p className={"text-center text-muted mb-4"}>
            Our essential surgical instruments form the core of every medical facility. From precision scalpels to advanced monitoring equipment, these tools are fundamental to delivering exceptional patient care.
            </p>
          </Col>
        </Row>
        <Row>
          {topSellingProducts.slice(0, 4).map((item, index) => (
            <Col
              sm={6}
              md={3}
              xs={12}
              className={`mb-4 ${s.product}`}
              key={index}
            >
              <Modal
                isOpen={openState[`open${index + 4}`]}
                toggle={() => dispatch({ type: `open${index + 4}` })}
              >
                <div className={s.modalWidndow}>
                  <div className={s.image}>
                    <img
                      src={item.image_url === 'Missing_URL' ? "" : item.image_url}
                      width={"100%"}
                      height={"100%"}
                      alt="img"
                    />
                  </div>
                  <div
                    className={`${s.content} p-4 d-flex flex-column justify-content-between`}
                  >
                    <Link href={`/products/${item.product_id}`}>
                      <a className={"fw-semi-bold"}>
                        More about product
                        <img
                          src={arrowRight}
                          alt={"arrow"}
                          className={"ml-2"}
                        />
                      </a>
                    </Link>
                    <h6 className={`text-muted`}>
                      {item.category}
                    </h6>
                    <h4 className={"fw-bold"}>{item.product_name}</h4>
                    <div className={"d-flex align-items-center"}>
                      <img src={rating} alt={'rating'} />
                      <p className={"text-primary ml-3 mb-0"}>12 reviews</p>
                    </div>
                    <p>
                      {item.description}
                    </p>
                    <div className={"d-flex"}>
                      <div
                        className={
                          "d-flex flex-column mr-5 justify-content-between"
                        }
                      >
                        <h6 className={"fw-bold text-muted text-uppercase"}>
                          Quantity
                        </h6>
                        <div className={"d-flex align-items-center"}>
                          <Button
                            className={`bg-transparent border-0 p-1 fw-bold mr-3 ${s.quantityBtn}`}
                            onClick={() => {
                              if (quantity === 1) return;
                              setQuantity((prevState) => prevState - 1);
                            }}
                          >
                            -
                          </Button>
                          <p className={"fw-bold mb-0"}>{quantity}</p>
                          <Button
                            className={`bg-transparent border-0 p-1 fw-bold ml-3 ${s.quantityBtn}`}
                            onClick={() => {
                              if (quantity < 1) return;
                              setQuantity((prevState) => prevState + 1);
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div
                        className={"d-flex flex-column justify-content-between"}
                      >
                        <h6 className={"fw-bold text-muted text-uppercase"}>
                          Price
                        </h6>
                        <h6 className={"fw-bold"}>{item.price}$</h6>
                      </div>
                    </div>
                    <div className={"d-flex mt-5"}>
                      <Button
                        outline
                        color={"primary"}
                        className={"flex-fill mr-4 text-uppercase fw-bold"}
                        style={{ width: "50%" }}
                        onClick={() => {
                          toast.info(
                            "products successfully added to your cart"
                          );
                          addToCart(item.product_id);
                        }}
                      >
                        Add to Cart
                      </Button>
                      <Link href={"/billing"}>
                        <a className={"d-inline-block flex-fill"}>
                          <Button
                            color={"primary"}
                            className={"text-uppercase fw-bold"}
                            style={{ width: "50%" }}
                          >
                            Buy now
                          </Button>
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </Modal>
              <div style={{ position: "relative" }}>
                <Link href={`/products/${item.product_id}`}>
                  <a>
                    <div
                      style={{
                        background: `url(${item.image_url && item.image_url !== 'Missing_URL' ? item.image_url : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGh5WFH8TOIfRKxUrIgJZoDCs1yvQ4hIcppw&s'}) no-repeat center`,
                        backgroundSize: "contain",
                        transition: "all .65s ease",
                      }}
                      className={s.productImage}
                    />
                  </a>
                </Link>
                <div
                  className={`d-flex flex-column justify-content-center ${s.product__actions}`}
                  style={{
                    position: "absolute",
                    height: "100%",
                    top: 0,
                    right: 15,
                  }}
                >
                  <Button
                    className={"p-0 bg-transparent border-0"}
                    onClick={() => {
                      addToWishlist(item.product_id);
                      toast.info(
                        "products successfully added to your wishlist"
                      );
                    }}
                  >
                    <div className={`mb-4 ${s.product__actions__heart}`} />
                  </Button>
                  <Button
                    className={"p-0 bg-transparent border-0"}
                    onClick={() => {
                      dispatch({ type: `open${index + 4}` });
                    }}
                  >
                    <div className={`mb-4 ${s.product__actions__max}`} />
                  </Button>
                  <Button
                    className={"p-0 bg-transparent border-0"}
                    onClick={() => {
                      addToCart(item.product_id);
                      toast.info("products successfully added to your cart");
                    }}
                  >
                    <div className={`mb-4 ${s.product__actions__cart}`} />
                  </Button>
                </div>
              </div>
              <div className={s.productInfo}>
                <div>
                  <a className={"mt-3 text-muted mb-0 d-inline-block"} >
                    {item.category}
                  </a>
                  <Link href={`/products/${item.product_id}`}>
                    <a>
                      <h6
                        className={"fw-bold font-size-base mt-1"}
                        style={{ fontSize: 16 }}
                      >
                        {item.product_name}
                      </h6>
                    </a>
                  </Link>
                  <h6 style={{ fontSize: 16 }}>${item.price}</h6>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        <Row className={"d-flex justify-content-center"}>
          <Link href={"/top-selling-products"}>
            <Button
              outline
              color="primary"
              className={"text-uppercase mx-auto mt-5 fw-bold"}
            >
              view more
            </Button>
          </Link>
        </Row>
      </Container>
      <InfoBlock />
      <Container style={{ marginTop: 80, marginBottom: 80 }}>
        <h3 className={"text-center fw-bold mb-4"}>From Our Blogs</h3>
        <Row className={"justify-content-center mb-2"}>
          <Col sm={8}>
            <p className={"text-center text-muted mb-4"}>
            Stay informed with the latest surgical innovations and medical technology updates! Here are the newest developments, best practices, and expert insights to enhance your medical practice.
            </p>
          </Col>
        </Row>
        <Row>
          <Col
            xs={12}
            md={4}
            className={"mb-4 d-flex flex-column align-items-center"}
          >
            <div className={s.imgAnimation}>
              <Link href="/blog/article/07aeff53-31e5-4276-8307-f855b22b6436"><img src={article1} className={"img-fluid"} /></Link>
            </div>
            <p className={"mt-3 text-muted mb-0"}>March 12, 2024</p>
            <h6
              className={"fw-bold font-size-base mt-1"}
              style={{ fontSize: 16 }}
            >
              Advanced Surgical Techniques in Modern Medicine
            </h6>
            <h6 style={{ fontSize: 16 }} className={"fw-bold text-primary"}>
            <Link href="/blog/article/07aeff53-31e5-4276-8307-f855b22b6436">Read More</Link>
            </h6>
          </Col>
          <Col
            xs={12}
            md={4}
            className={"mb-4 d-flex flex-column align-items-center"}
          >
            <div className={s.imgAnimation}>
            <Link href="/blog/article/c4245ff9-6a53-4b13-8539-0b69b442cfd1"><img src={article2} className={"img-fluid"} /></Link>
            </div>
            <p className={"mt-3 text-muted mb-0"}>March 10, 2024</p>
            <h6
              className={"fw-bold font-size-base mt-1"}
              style={{ fontSize: 16 }}
            >
              Precision Instruments: The Future of Surgery
            </h6>
            <h6 style={{ fontSize: 16 }} className={"fw-bold text-primary"}>
            <Link href="/blog/article/c4245ff9-6a53-4b13-8539-0b69b442cfd1">Read More</Link>
            </h6>
          </Col>
          <Col
            xs={12}
            md={4}
            className={"mb-4 d-flex flex-column align-items-center"}
          >
            <div className={s.imgAnimation}>
            <Link href="/blog/article/57fbad3f-528a-43b2-83e8-32ba30708194"><img src={article3} className={"img-fluid"} /></Link>
            </div>
            <p className={"mt-3 text-muted mb-0"}>March 8, 2024</p>
            <h6
              className={"fw-bold font-size-base mt-1"}
              style={{ fontSize: 16 }}
            >
              Essential Medical Equipment for Every OR
            </h6>
            <h6 style={{ fontSize: 16 }} className={"fw-bold text-primary"}>
            <Link href="/blog/article/57fbad3f-528a-43b2-83e8-32ba30708194">Read More</Link>
            </h6>
          </Col>
        </Row>
        <Row className={"d-flex justify-content-center"}>
          <Link href={"/blog"}>
            <Button
              outline
              color="primary"
              className={"text-uppercase mx-auto mt-5 fw-bold"}
            >
              view more
            </Button>
          </Link>
        </Row>
      </Container>
      <InstagramWidget />
    </>
  );
};

export default Index;
