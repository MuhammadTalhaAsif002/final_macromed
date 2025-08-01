import React from "react";
import {
  Container,
  Row,
  Col,
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import axios from "axios";
import product1 from "public/images/e-commerce/home/product1.png";
import product2 from "public/images/e-commerce/home/product2.png";
import product3 from "public/images/e-commerce/home/product3.png";
import product4 from "public/images/e-commerce/home/product4.png";
import mainBanner from "public/images/e-commerce/main_banner.jpg"
import s from "./Categories.module.scss";

import InfoBlock from 'components/e-commerce/InfoBlock';
import InstagramWidget from 'components/e-commerce/Instagram';
import chevronRightIcon from "public/images/e-commerce/details/chevron-right.svg";
import chevronLeftIcon from "public/images/e-commerce/details/chevron-left.svg";
import Head from "next/head";
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from 'pure-react-carousel';

const products = [
  {
    id: 0,
    img: product1,
  },
  {
    id: 1,
    img: product2,
  },
  {
    id: 2,
    img: product3,
  },
  {
    id: 3,
    img: product4,
  },
  {
    id: 4,
    img: product1,
  },
  {
    id: 5,
    img: product2,
  },
  {
    id: 6,
    img: product3,
  },
  {
    id: 7,
    img: product4,
  },
];

const Categories = () => {
  const [width, setWidth] = React.useState(1440);
  const [trendingProducts, setTrendingProducts] = React.useState([]);
  const [trendingReason, setTrendingReason] = React.useState("");

  React.useEffect(() => {
    typeof window !== "undefined" &&
    window.addEventListener("resize", () => {
      setWidth(window.innerWidth);
    });
  }, []);

  React.useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/insights/trending', {
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if needed
          }
        });
        console.log("Trending Items: ", response.data);
        if (response.data && response.data.products) {
          // Convert products object to array
          const productsArray = Object.values(response.data.products);
          setTrendingProducts(productsArray);
          setTrendingReason(response.data.period || "Trending products");
        }
      } catch (error) {
        console.error('Error fetching trending products:', error);
        setTrendingProducts([]);
        setTrendingReason("Unable to load recommendations");
      }
    };

    fetchTrendingProducts();
  }, []);

  return (
    <>
      <Head>
        <title>Categories</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        <meta name="description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development" />
        <meta name="keywords" content="macromed, react templates" />
        <meta name="author" content="Macromed LLC." />
        <meta charSet="utf-8" />


        <meta property="og:title" content="Macromed - React, Vue, Angular and Bootstrap Templates and Admin Dashboard Themes"/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://macromed-ecommerce.herokuapp.com/"/>
        <meta property="og:image" content="https://macromed-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"/>
        <meta property="og:description" content="Beautifully designed web application template built with React and Bootstrap to create modern apps and speed up development"/>
        <meta name="twitter:card" content="summary_large_image" />

        <meta property="fb:app_id" content="712557339116053" />

        <meta property="og:site_name" content="Macromed"/>
        <meta name="twitter:site" content="@macromed" />
      </Head>
      <ToastContainer />
      <Container className={s.bannersContainer}>
        <Row>
          <Col md={12}>
            <Link href="/shop">
              <div className={s.mainBanner}>
                <img src={mainBanner} alt="banner" />
                <h2>NEW ARRIVALS</h2>
              </div>
            </Link>
          </Col>
          <Col md={6} xs={12}>
            <Link href="/category/1fcb7ece-6373-405d-92ef-3f3c4e7dc711">
              <div className={`${s.categoryBlock}`}>
                <div className={s.rightDiscount}>SPRING SALE</div>
              </div>
            </Link>
          </Col>
          <Col md={6} xs={12}>
            <Link href="/category/1fcb7ece-6373-405d-92ef-3f3c4e7dc712">
              <div className={`${s.livingRoomBanner}`}>
                <div className={s.textContent}>
                  <div>
                    <span>Accessories</span>
                    <strong>For Living Room</strong>
                    <b>View Collection</b>
                  </div>
                </div>
              </div>
            </Link>
          </Col>
          <Col md={3} xs={12}>
            <Link href="/category/1fcb7ece-6373-405d-92ef-3f3c4e7dc713">
              <div className={s.pillows}>
                <div>
                  <span>up to 60%</span>
                  <strong>Pillows</strong>
                </div>
              </div>
            </Link>
          </Col>
          <Col md={6} xs={12}>
          <Link href="/category/1fcb7ece-6373-405d-92ef-3f3c4e7dc714">
              <div className={`${s.kitchenBanner}`}>
                <div className={s.textContent}>
                  <div>
                    <span>Accessories</span>
                    <strong>For Living Room</strong>
                    <b>View Collection</b>
                  </div>
                </div>
              </div>
            </Link>
          </Col>
          <Col md={3} xs={12}>
            <Link href="/category/1fcb7ece-6373-405d-92ef-3f3c4e7dc715">
              <div className={s.bedLinen}>
                <strong>Bed Linen</strong>
              </div>
            </Link>
          </Col>
        </Row>
      </Container>
      <Container>
        <Row className={"mb-5"} style={{ position: "relative" }}>
            <div className="d-flex flex-column align-items-center">
              <h2 className={s.relatedTitle}>Trending Products</h2>
              {trendingReason && (
                <p className="text-muted mb-4">{trendingReason}</p>
              )}
            </div>
          
            {trendingProducts.length > 0 ? (
            <CarouselProvider
              totalSlides={trendingProducts.length}
              visibleSlides={width > 992 ? 4 : width > 576 ? 2 : 1}
              infinite
              dragEnabled
              naturalSlideHeight={400}
              naturalSlideWidth={300}
            >
            <ButtonBack style={{position: 'absolute', top: '35%', zIndex: 99, left: -20}} className={"btn bg-transparent border-0 p-0"}>
              <img src={chevronLeftIcon}/>
            </ButtonBack>
            <Slider>
              {trendingProducts.map((product, index) => (
                  <Slide index={index} key={product.product_id}>
                    <Col className={`${s.product}`}>
                      <Link href={`/products/${product.product_id}`}>
                        <a>
                          <img
                              src={product.image_url === 'Missing_URL' ? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGh5WFH8TOIfRKxUrIgJZoDCs1yvQ4hIcppw&s' : product.image_url}
                              className={"img-fluid"}
                              style={{ width: "100%" }}
                              alt={product.product_name}
                          />
                        </a>
                      </Link>
                      <p className={"mt-3 text-muted mb-0"}>{product.category}</p>
                      <Link href={`/products/${product.product_id}`}>
                        <a>
                          <h6
                              className={"fw-bold font-size-base mt-1"}
                              style={{ fontSize: 16 }}
                          >
                            {product.product_name}
                          </h6>
                        </a>
                      </Link>
                      <h6 style={{ fontSize: 16 }}>${product.price}</h6>
                    </Col>
                  </Slide>
              ))}
            </Slider>
            <ButtonNext style={{position: 'absolute', top: '35%', zIndex: 99, right: -20}} className={"btn bg-transparent border-0 p-0"}>
              <img src={chevronRightIcon}/>
            </ButtonNext>
          </CarouselProvider>
          ) : (
            <div className="text-center text-muted">No trending products found</div>
          )}
        </Row>
      </Container>
      <InfoBlock />
      <InstagramWidget />
    </>
  );
};


export default Categories;
