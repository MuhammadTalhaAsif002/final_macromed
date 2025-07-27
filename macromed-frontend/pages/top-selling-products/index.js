import React from "react";
import { Container, Row, Col, Button, Modal } from "reactstrap";
import s from "pages/index.module.scss";
import Link from "next/link";
import axios from "axios";
import Head from "next/head";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";

import arrowRight from "public/images/e-commerce/home/arrow-right.svg";
import rating from "../../public/images/e-commerce/details/stars.svg";
import productsListActions from "../../redux/actions/products/productsListActions";
import { products as productsData } from '../../data/products';

const TopSellingProducts = () => {
  const [quantity, setQuantity] = React.useState(1);
  const dispatchStore = useDispatch();
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [productsPerPage, setProductsPerPage] = React.useState(15);

  const openReducer = (state, action) => {
    switch (action.type) {
      case "open0":
        return { ...state, open0: !state.open0 };
      case "open1":
        return { ...state, open1: !state.open1 };
      case "open2":
        return { ...state, open2: !state.open2 };
      case "open3":
        return { ...state, open3: !state.open3 };
      case "open4":
        return { ...state, open4: !state.open4 };
      case "open5":
        return { ...state, open5: !state.open5 };
      case "open6":
        return { ...state, open6: !state.open6 };
      case "open7":
        return { ...state, open7: !state.open7 };
      case "open8":
        return { ...state, open8: !state.open8 };
      case "open9":
        return { ...state, open9: !state.open9 };
      case "open10":
        return { ...state, open10: !state.open10 };
      case "open11":
        return { ...state, open11: !state.open11 };
      default:
        return state;
    }
  };

  const [openState, dispatch] = React.useReducer(openReducer, {
    open0: false, open1: false, open2: false, open3: false, open4: false, open5: false,
    open6: false, open7: false, open8: false, open9: false, open10: false, open11: false
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

  React.useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/insights/top-selling-products');
        if (response.data && response.data.top_selling_products) {
          const productsArray = response.data.top_selling_products;
          setProducts(productsArray);
        }
      } catch (error) {
        console.error('Error fetching top selling products:', error);
        setProducts(productsData); // fallback to static data
      } finally {
        setLoading(false);
      }
    };
    fetchTopSellingProducts();
  }, []);

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const numCurrentProds = currentProducts.length;
  const numTotalProds = products.length;

  // Change page
  const paginate = (pageNumber) => {
    console.log(`📄 Changing to page ${pageNumber} of ${totalPages}`);
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // Previous button
    pageNumbers.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => paginate(currentPage - 1)}>&lt;</button>
      </li>
    );

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(
          <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
            <button className="page-link" onClick={() => paginate(i)}>{i}</button>
          </li>
        );
      }
    } else {
      // First page
      if (currentPage > 1) {
        pageNumbers.push(
          <li key={1} className={`page-item`}>
            <button className="page-link" onClick={() => paginate(1)}>1</button>
          </li>
        );
      }

      // Ellipsis logic
      if (currentPage > 3) {
        pageNumbers.push(<li key="start-ellipsis" className="page-item disabled"><span className="page-link">...</span></li>);
      }

      if (currentPage > 2) {
        pageNumbers.push(
          <li key={currentPage-1} className={`page-item`}>
            <button className="page-link" onClick={() => paginate(currentPage-1)}>{currentPage - 1}</button>
          </li>
        );
      }
      
      pageNumbers.push(
        <li key={currentPage} className={`page-item active`}>
          <button className="page-link" onClick={() => paginate(currentPage)}>{currentPage}</button>
        </li>
      );

      if (currentPage < totalPages - 1) {
         pageNumbers.push(
          <li key={currentPage+1} className={`page-item`}>
            <button className="page-link" onClick={() => paginate(currentPage+1)}>{currentPage + 1}</button>
          </li>
        );
      }
      
      if (currentPage < totalPages - 2) {
        pageNumbers.push(<li key="end-ellipsis" className="page-item disabled"><span className="page-link">...</span></li>);
      }

      // Last Page
      if (currentPage < totalPages) {
        pageNumbers.push(
          <li key={totalPages} className={`page-item`}>
            <button className="page-link" onClick={() => paginate(totalPages)}>{totalPages}</button>
          </li>
        );
      }
    }

    // Next button
    pageNumbers.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => paginate(currentPage + 1)}>&gt;</button>
      </li>
    );
    
    // Using a Set to remove duplicate page numbers that my simple logic might create
    const uniqueKeys = new Set();
    return pageNumbers.filter(page => {
      if (uniqueKeys.has(page.key)) {
        return false;
      }
      uniqueKeys.add(page.key);
      return true;
    });
  };

  return (
    <>
      <Head>
        <title>Top Selling Products - Macromed</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Discover our top selling surgical equipment and medical tools" />
        <meta name="keywords" content="top selling products, surgical equipment, medical tools" />
        <meta name="author" content="Macromed LLC." />
        <meta charSet="utf-8" />
      </Head>
      <ToastContainer />
      
      <Container style={{ marginTop: 80, marginBottom: 80 }}>
        <Row className="mb-4">
          <Col>
            <Link href="/">
              <a>
                <Button outline color="primary" className="mb-3">
                  ← Back to Home
                </Button>
              </a>
            </Link>
          </Col>
        </Row>
        
        <h1 className="text-center fw-bold mb-4">Top Selling Products</h1>
        <Row className="justify-content-center mb-4">
          <Col sm={8}>
            <p className="text-center text-muted">
              Our essential surgical instruments form the core of every medical facility. From precision scalpels to advanced monitoring equipment, these tools are fundamental to delivering exceptional patient care.
            </p>
          </Col>
        </Row>

        {loading ? (
          <Row className="justify-content-center">
            <Col className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Col>
          </Row>
        ) : (
          <>
            <Row>
              {currentProducts.map((item, index) => (
                <Col
                  sm={6}
                  md={4}
                  lg={3}
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
                            background: `url(${item.image_url === 'Missing_URL' ? "" : item.image_url}) no-repeat center`,
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
            {totalPages > 1 && (
              <div className={"d-flex justify-content-center"}>
                <ul className="pagination">
                  {renderPageNumbers()}
                </ul>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default TopSellingProducts; 