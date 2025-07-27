import React from "react";
import { Container, Row, Col, Input, Button, Modal } from "reactstrap";
import Checkbox from "react-custom-checkbox";
import InputRange from "react-input-range";
import Link from "next/link";
import {useDispatch, useSelector} from "react-redux";
import s from "./Shop.module.scss";

import InfoBlock from 'components/e-commerce/InfoBlock';
import filter from "public/images/e-commerce/filter.svg";
import relevant from "public/images/e-commerce/relevant.svg";
import placeholderImage from "public/images/e-commerce/logo.svg"; // Placeholder image
import axios from "axios";
import config from "constants/config";
import { products as allProductsData } from '../../data/products';
import { ToastContainer, toast } from "react-toastify";
import Head from "next/head";
import InstagramWidget from 'components/e-commerce/Instagram';
import arrowRight from "../../public/images/e-commerce/home/arrow-right.svg";
import rating from "../../public/images/e-commerce/details/stars.svg";
import productsListActions from "../../redux/actions/products/productsListActions";

let categoriesList = [],
  brandsList = [];

const Index = () => {
  const [quantity, setQuantity] = React.useState(1);
  const dispatchStore = useDispatch()
  const [rangeValue, setRangeValue] = React.useState({
    min: 0,
    max: 1000,
  });
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
  const [width, setWidth] = React.useState(1440);
  const [products, setProducts] = React.useState([]);
  const [showFilter, setShowFilter] = React.useState(false);
  const [allProducts, setAllProducts] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [productsPerPage, setProductsPerPage] = React.useState(15);
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
  React.useEffect(() => {
    window.addEventListener("resize", () => {
      setWidth(window.innerWidth);
    });
    
    // Fetch products from API
    const fetchProducts = async () => {
      try {
        console.log('🛍️ Fetching products from API...');
        const token = typeof window !== 'undefined' && localStorage.getItem("token");
        
        if (!token) {
          console.warn('⚠️ No authentication token found, using fallback data');
          setAllProducts(allProductsData);
          setProducts(allProductsData);
          return;
        }

        const response = await axios.get(`${config.baseURLApi}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Products fetched successfully:', response.data);
        console.log(`📦 Total products received: ${response.data.length}`);
        
        setAllProducts(response.data);
        setProducts(response.data);
        
        toast.success(`Loaded ${response.data.length} products successfully!`);
        
      } catch (error) {
        console.error('❌ Error fetching products:', error.response?.data || error.message);
        console.log('Full error object:', error);
        
        // Fallback to static data if API fails
        console.warn('🔄 Falling back to static product data');
        setAllProducts(allProductsData);
        setProducts(allProductsData);
        
        toast.error('Failed to load products from server. Using cached data.');
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (id) => {
    if (currentUser) {
      axios.post(`/orders/`, {
        data: {
          amount: 1,
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
      amount: 1,
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

  const getCategories = () => {
    let newCategories = [];
    if (allProducts && allProducts.length > 0) {
      // Extract unique categories from products
      const categories = [...new Set(allProducts.map(product => product.category).filter(Boolean))];
      return categories;
    }
    return [];
  };

  const handleProductsPerPageChange = (e) => {
    setProductsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 when changing items per page
  };

  // Get unique categories for filtering
  const uniqueCategories = getCategories();

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

  // Reset to first page when filtering
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Update filterByCategory to reset pagination
  const filterByCategory = (category, brands) => {
    let count = 0,
      brandsCount = 0,
      brandsString = "",
      categoriesString = "";
    if (brands) {
      brandsList.push(category);
      brandsList.forEach((item) => {
        if (item === category) brandsCount += 1;
      });
      brandsList = brandsList.filter((item) => {
        if (brandsList.length === 1) {
          return true;
        }
        if (brandsCount === 1 && item === category) return true;
        return item !== category;
      });
      brandsString = brandsList.join("|");
    } else {
      categoriesList.push(category);
      categoriesList.forEach((item) => {
        if (item === category) count += 1;
      });
      categoriesList = categoriesList.filter((item) => {
        if (categoriesList.length === 1) {
          return true;
        }
        if (count === 1 && item === category) return true;
        return item !== category;
      });
      categoriesString = categoriesList.join("|");
    }
    
    // Filter products based on new API structure
    const filteredProducts = allProducts.filter(p => {
      // Handle both old and new data structures
      const productCategory = p.category || p.categories?.[0]?.title;
      const productBrand = p.brand;
      
      if (categoriesString) {
        return categoriesString.split('|').some(cat => productCategory === cat);
      }
      if (brandsString) {
        return brandsString.split('|').some(brand => productBrand === brand);
      }
      return true;
    });
    
    setProducts(filteredProducts);
    resetPagination(); // Reset to first page when filtering
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
        <title>Shop</title>
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
      <Container className={"mb-5"} style={{ marginTop: 32 }}>
        <Row>
          <ToastContainer />
          <Col sm={3} className={`${s.filterColumn} ${showFilter ? s.showFilter : ''}`}>
            <div className={s.filterTitle}><h5 className={"fw-bold mb-5 text-uppercase"}>Categories</h5><span onClick={() => setShowFilter(false)}>✕</span></div>
            {uniqueCategories.map(cat => (
              <div key={cat} className={"d-flex align-items-center mt-2"}>
                <Checkbox
                    borderColor={"#232323"}
                    borderWidth={1}
                    borderRadius={2}
                    icon={
                      <div
                          style={{
                            backgroundColor: "#2a9bdf",
                            borderRadius: 2,
                            padding: 4,
                          }}
                      />
                    }
                    size={16}
                    label={
                      <p className={"d-inline-block ml-1 mb-0"}>{cat}</p>
                    }
                    onChange={() =>
                        filterByCategory(cat)
                    }
                    style={{marginTop: -1}}
                />
              </div>
            ))}
            <h5 className={"fw-bold mb-5 mt-5 text-uppercase"}>Price</h5>
            <p>Price Range: $0 - $1500</p>
            <InputRange
              maxValue={1500}
              minValue={0}
              formatLabel={(rangeValue) => `${rangeValue} $`}
              value={rangeValue}
              onChange={(value) => setRangeValue(value)}
            />

            <h5 className={"fw-bold mb-5 mt-5 text-uppercase"}>Brands</h5>
            <div className={"d-flex align-items-center"}>
              <Checkbox
                  borderColor={"#232323"}
                  borderWidth={1}
                  borderRadius={2}
                  icon={
                    <div
                        style={{
                          backgroundColor: "#2a9bdf",
                          borderRadius: 2,
                          padding: 4,
                        }}
                    />
                  }
                  size={16}
                  label={
                    <p className={"d-inline-block ml-1 mb-0"}>Poliform</p>
                  }
                  onChange={() =>
                      filterByCategory("Poliform", true)
                  }
                  style={{marginTop: -1}}
              />
            </div>
            <div className={"d-flex align-items-center mt-2"}>
              <Checkbox
                  borderColor={"#232323"}
                  borderWidth={1}
                  borderRadius={2}
                  icon={
                    <div
                        style={{
                          backgroundColor: "#2a9bdf",
                          borderRadius: 2,
                          padding: 4,
                        }}
                    />
                  }
                  size={16}
                  label={
                    <p className={"d-inline-block ml-1 mb-0"}>Roche Bobois</p>
                  }
                  onChange={() =>
                      filterByCategory("Roche Bobois", true)
                  }
                  style={{marginTop: -1}}
              />
            </div>
            <div className={"d-flex align-items-center mt-2"}>
              <Checkbox
                  borderColor={"#232323"}
                  borderWidth={1}
                  borderRadius={2}
                  icon={
                    <div
                        style={{
                          backgroundColor: "#2a9bdf",
                          borderRadius: 2,
                          padding: 4,
                        }}
                    />
                  }
                  size={16}
                  label={
                    <p className={"d-inline-block ml-1 mb-0"}>Edra</p>
                  }
                  onChange={() =>
                      filterByCategory("Edra", true)
                  }
                  style={{marginTop: -1}}
              />
            </div>
            <div className={"d-flex align-items-center mt-2"}>
              <Checkbox
                  borderColor={"#232323"}
                  borderWidth={1}
                  borderRadius={2}
                  icon={
                    <div
                        style={{
                          backgroundColor: "#2a9bdf",
                          borderRadius: 2,
                          padding: 4,
                        }}
                    />
                  }
                  size={16}
                  label={
                    <p className={"d-inline-block ml-1 mb-0"}>Kartell</p>
                  }
                  onChange={() =>
                      filterByCategory("Kartell", true)
                  }
                  style={{marginTop: -1}}
              />
            </div>
            <h5 className={"fw-bold mb-5 mt-5 text-uppercase"}>
              Availability
            </h5>
            <div className={"d-flex align-items-center"}>
              <Checkbox
                  borderColor={"#232323"}
                  borderWidth={1}
                  borderRadius={2}
                  icon={
                    <div
                        style={{
                          backgroundColor: "#2a9bdf",
                          borderRadius: 2,
                          padding: 4,
                        }}
                    />
                  }
                  size={16}
                  label={
                    <p className={"d-inline-block ml-1 mb-0"}>On Stock</p>
                  }
                  onChange={() =>
                      filterByCategory("On Stock", true)
                  }
                  style={{marginTop: -1}}
              />
            </div>
            <div className={"d-flex align-items-center mt-2"}>
              <Checkbox
                  borderColor={"#232323"}
                  borderWidth={1}
                  borderRadius={2}
                  icon={
                    <div
                        style={{
                          backgroundColor: "#2a9bdf",
                          borderRadius: 2,
                          padding: 4,
                        }}
                    />
                  }
                  size={16}
                  label={
                    <p className={"d-inline-block ml-1 mb-0"}>Out of Stock</p>
                  }
                  onChange={() =>
                      filterByCategory("Out of Stock", true)
                  }
                  style={{marginTop: -1}}
              />
            </div>
          </Col>
          <Col sm={width <= 768 ? 12 : 9}>
            {!(width <= 768) ? (
              <div
                className={"d-flex justify-content-between align-items-center"}
                style={{ marginBottom: 50 }}
              >
                <h6>
                  Showing{" "}
                  <span className={"fw-bold text-primary"}>
                    {numCurrentProds}
                  </span>{" "}
                  of <span className={"fw-bold text-primary"}>{numTotalProds}</span> Products
                </h6>
                <div className={"d-flex align-items-center"}>
                  <h6 className={"text-nowrap mr-3 mb-0"}>Sort by:</h6>
                  <Input type={"select"} style={{ height: 50, width: 180 }}>
                    <option>Most Popular</option>
                    <option>Newest</option>
                    <option>Price: low to high</option>
                    <option>Price: high to low</option>
                  </Input>
                </div>
              </div>
            ) : (
              <>
                <div className={"d-flex justify-content-between"}>
                  <Button
                    className={"text-dark bg-transparent border-0"}
                    style={{ padding: "14px 0 22px 0" }}
                    onClick={() => setShowFilter(true)}
                  >
                    <img src={filter} /> Filters
                  </Button>
                  <Button
                    className={"text-dark bg-transparent border-0"}
                    style={{ padding: "14px 0 22px 0" }}
                  >
                    <img src={relevant} /> Relevant
                  </Button>
                </div>
                <hr style={{ marginTop: 0, marginBottom: "2rem" }} />
              </>
            )}
            <Row>
              {currentProducts.map((item, index) => (
                <Col md={6} lg={4} xs={12} className={`mb-4 ${s.product}`} key={index}>
                  <Modal
                    isOpen={openState[`open${index}`]}
                    toggle={() => dispatch({ type: `open${index}` })}
                  >
                    <div className={s.modalWidndow}>
                      <div className={s.image}>
                        <img
                          src={item.image_url || item.image?.[0]?.publicUrl}
                          width={"100%"}
                          height={"100%"}
                          alt={item.product_name || item.title}
                          onError={(e) => {
                            e.target.src = "https://t4.ftcdn.net/jpg/06/71/92/37/360_F_671923740_x0zOL3OIuUAnSF6sr7PuznCI5bQFKhI0.jpg";
                            e.target.onerror = null; // Prevent infinite loop
                          }}
                        />
                      </div>
                      <div
                        className={
                          `${s.content} p-4 d-flex flex-column justify-content-between`
                        }
                      
                      >
                        <Link href={`/products/${item.product_id || item.id}`}>
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
                          {item.category || (item.categories?.[0]?.title?.[0]?.toUpperCase() + item.categories?.[0]?.title?.slice(1))}
                        </h6>
                        <h4 className={"fw-bold"}>{item.product_name || item.title}</h4>
                        <div className={"d-flex align-items-center"}>
                          <img src={rating} />
                          <p className={"text-primary ml-3 mb-0"}>
                            <span style={{ fontSize: '0.75rem' }}>({item.total_reviews || 12})</span> reviews
                          </p>
                        </div>
                        <p>
                          {item.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut ullamcorper leo, eget euismod orci. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum ultricies aliquam."}
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
                                  setQuantity((prevState) => prevState + 1);
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <div
                            className={
                              "d-flex flex-column justify-content-between"
                            }
                          >
                            <h6 className={"fw-bold text-muted text-uppercase"}>
                              Total
                            </h6>
                            <h4 className={"fw-bold"}>
                              ${item.price * quantity}
                            </h4>
                          </div>
                        </div>
                        <div className={"d-flex"}>
                          <Button
                            outline
                            color={"primary"}
                            className={"flex-fill mr-4 text-uppercase fw-bold"}
                            style={{width: "50%"}}
                            onClick={() => {
                              toast.info("products successfully added to your cart");
                              addToCart(item.product_id || item.id);
                            }}
                          >
                            Add to Cart
                          </Button>
                          <Link href={"/billing"} className={"d-inline-block flex-fill"}>
                            <Button
                              color={"primary"}
                              className={"text-uppercase fw-bold"}
                              style={{width: "50%"}}
                            >
                              Buy now
                            </Button>
                          </Link>
                        </div>
                        <div className={"d-flex mt-3"}>
                          <Button
                            className={"fw-bold text-uppercase"}
                            style={{
                              backgroundColor: "transparent",
                              borderColor: "#2a9bdf",
                              color: "#2a9bdf",
                              padding: "14px 32px",
                              width: "100%"
                            }}
                            onClick={() => {
                              toast.info("products successfully added to your wishlist");
                              addToWishlist(item.product_id || item.id);
                            }}
                          >
                            Add to wishlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Modal>
                  <div style={{ position: "relative" }}>
                    <div className={s.image}>
                      <Link href={`/products/${item.product_id || item.id}`}>
                        <a onClick={() => console.log(`[Shop Page] Clicking on product. ID: ${item.product_id || item.id}, Name: ${item.product_name || item.title}`)}>
                          <img
                            src={item.image_url || item.image?.[0]?.publicUrl}
                            width={"100%"}
                            height={"100%"}
                            alt={item.product_name || item.title}
                            onError={(e) => {
                              e.target.src = "https://t4.ftcdn.net/jpg/06/71/92/37/360_F_671923740_x0zOL3OIuUAnSF6sr7PuznCI5bQFKhI0.jpg";
                              e.target.onerror = null; // Prevent infinite loop
                            }}
                          />
                        </a>
                      </Link>
                    </div>
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
                        style={{
                          backgroundColor: "white",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          marginBottom: "1rem"
                        }}
                        onClick={() => {
                          toast.info("products successfully added to your wishlist");
                          addToWishlist(item.product_id || item.id);
                        }}
                      >
                        <div className={`${s.product__actions__heart}`} />
                      </Button>
                      <Button
                        className={"p-0 bg-transparent border-0"}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          marginBottom: "1rem"
                        }}
                        onClick={() => {
                          dispatch({ type: `open${index}` });
                        }}
                      >
                        <div className={`${s.product__actions__max}`} />
                      </Button>
                      <Button
                        className={"p-0 bg-transparent border-0"}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "50%",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          marginBottom: "1rem"
                        }}
                        onClick={() => {
                          toast.info("products successfully added to your cart");
                          addToCart(item.product_id || item.id);
                        }}
                      >
                        <div className={`${s.product__actions__cart}`} />
                      </Button>
                    </div>
                  </div>
                  <div className={s.content}>
                    <h6 className={`text-muted`}>
                      {item.category || (item.categories?.[0]?.title?.[0]?.toUpperCase() + item.categories?.[0]?.title?.slice(1))}
                    </h6>
                    <h4 className={"fw-bold"}>{item.product_name || item.title}</h4>
                    <div className={"d-flex align-items-center"}>
                      <img src={rating} />
                      <p className={"text-primary ml-3 mb-0"}>
                        <span style={{ fontSize: '0.75rem' }}>({item.total_reviews || 12})</span> reviews
                      </p>
                    </div>
                    <h4 className={"fw-bold"}>${item.price}</h4>
                  </div>
                </Col>
              ))}
            </Row>
            <div className={"d-flex justify-content-center"}>
              <ul className="pagination">
                {renderPageNumbers()}
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;