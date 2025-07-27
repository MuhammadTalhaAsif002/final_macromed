import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Container,
    Row,
    Col,
    Spinner
} from "reactstrap";
import axios from 'axios';
import Link from 'next/link';

import InstagramWidget from 'components/e-commerce/Instagram';
import s from './SearchResults.module.scss';

const SearchResults = ({ initialSearchValue }) => {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState(initialSearchValue);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Update searchValue from router query in case of client-side navigation
        if (router.query.searchValue !== searchValue) {
            setSearchValue(router.query.searchValue);
        }
    }, [router.query.searchValue]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchValue) {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(
                        `http://localhost:8000/api/products/search?query=${searchValue}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json',
                            }
                        }
                    );
                    setProducts(response.data || []);
                } catch (error) {
                    console.error('Error fetching search results:', error);
                    setProducts([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setProducts([]);
            }
        };

        fetchSearchResults();
    }, [searchValue]);

    return (
        <>
            <Head>
                <title>Search Results for: {searchValue}</title>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />

                <meta name="description" content={`Search results for ${searchValue} on Macromed.`} />
                <meta name="keywords" content={`macromed, react templates, search, ${searchValue}`} />
                <meta name="author" content="Macromed LLC." />
                <meta charSet="utf-8" />

                <meta property="og:title" content={`Search Results for: ${searchValue} - Macromed`} />
                <meta property="og:type" content="website"/>
                <meta property="og:url" content="https://flatlogic-ecommerce.herokuapp.com/"/>
                <meta property="og:image" content="https://flatlogic-ecommerce-backend.herokuapp.com/images/blogs/content_image_six.jpg"/>
                <meta property="og:description" content={`Search results for ${searchValue} on Macromed.`}/>
                <meta name="twitter:card" content="summary_large_image" />

                <meta property="fb:app_id" content="712557339116053" />

                <meta property="og:site_name" content="Macromed"/>
                <meta name="twitter:site" content="@macromed" />
            </Head>
            <Container className={s.rootContainer}>
                <Row className="justify-content-center">
                    <Col lg={9} md={10} sm={12}>
                        <h1 className={s.title}>Search results for: <span>"{searchValue}"</span></h1>

                        {loading ? (
                            <div className="text-center my-5">
                                <Spinner color="primary" />
                            </div>
                        ) : products.length > 0 ? (
                            products.map(product => (
                                <div key={product.product_id} className={s.resultItem}>
                                    <Row>
                                        <Col md={3} className="mb-3 mb-md-0">
                                            <Link href={`/products/${product.product_id}`}>
                                                <a>
                                                    <img 
                                                        src={product.image_url && product.image_url !== 'Missing_URL' ? product.image_url : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGh5WFH8TOIfRKxUrIgJZoDCs1yvQ4hIcppw&s'} 
                                                        className={`img-fluid ${s.productImage}`}
                                                        alt={product.product_name} 
                                                    />
                                                </a>
                                            </Link>
                                        </Col>
                                        <Col md={9}>
                                            <span className={s.categoryTitle}>{product.category}</span>
                                            <Link href={`/products/${product.product_id}`}>
                                                <a>
                                                    <h3 className={s.resultTitle}>{product.product_name}</h3>
                                                </a>
                                            </Link>
                                            <p className={s.resultDescription}>
                                                {product.description ? product.description.split('\\n')[0] : 'No description available.'}
                                            </p>
                                            <h4 className="fw-bold">${product.price}</h4>
                                        </Col>
                                    </Row>
                                </div>
                            ))
                        ) : (
                            <p className="text-center my-5">No results found for "{searchValue}".</p>
                        )}
                    </Col>
                </Row>
            </Container>
            <InstagramWidget/>
        </>
    )
}

export async function getServerSideProps({ query }) {
    const { searchValue } = query;
  
    return {
      props: { 
          initialSearchValue: searchValue || "",
      },
    };
}

export default SearchResults;