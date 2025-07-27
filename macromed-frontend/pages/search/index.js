import React, { useState } from "react";
import { useRouter } from 'next/router';
import { Container, Row, Col, Input, FormGroup, Button } from "reactstrap";
import axios from 'axios';

import Header from "components/e-commerce/Header";
import Head from "next/head";

const Index = () => {
  const router = useRouter()
  const [value, setValue] = useState('');

  const handleSearch = () => {
    const searchTerm = value.trim();
    if (searchTerm && searchTerm.length >= 3) {
      
      // Track the search query
      const token = localStorage.getItem('token');
      if (token) {
        axios.post(
          'http://127.0.0.1:8000/api/track/search',
          {
            search_query: searchTerm,
            device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop',
            source_page: 'search'
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        ).catch(error => {
          console.error('Search tracking failed:', error);
        });
      }

      router.push({
        pathname: '/search-results',
        query: { searchValue: searchTerm },
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }
  
  return (
    <div className={"h-100"}>
      <Head>
        <title>Search</title>
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
      <Container style={{ height: "100vh" }}>
        <Row
          className={
            "d-flex justify-content-center align-items-center flex-column"
          }
          style={{ height: "100vh" }}
        >
          <FormGroup style={{ width: 880, display: 'flex' }}>
            <Input
              onKeyDown={handleKeyDown}
              type="text"
              value={value}
              onChange={event => setValue(event.target.value)}
              name="text"
              id="exampleEmail"
              className="search w-100"
              placeholder={"Search for products..."}
              style={{ padding: '1.5rem 1rem' }}
            />
            <Button color="primary" onClick={handleSearch} style={{ marginLeft: '10px', padding: '0 2rem' }}>Search</Button>
          </FormGroup>
        </Row>
        <p className={"text-muted"} style={{ marginTop: -50 }}>
          © 2020-21 powered by Macromed
        </p>
      </Container>
    </div>
  );
};

export async function getServerSideProps(context) {
    // const res = await axios.get("/products");
    // const products = res.data.rows;

    return {
        props: {  }, // will be passed to the page component as props
    };
}

export default Index;
