import React from "react";
import {
  Navbar,
  Nav,
  NavItem,
  NavbarBrand,
  DropdownItem,
  Container,
  Button,
  UncontrolledDropdown,
} from "reactstrap";
import AnimateHeight from "react-animate-height";
import ActiveLink from "components/admin/ActiveLink/ActiveLink";
import Link from "next/link";
import s from "./Header.module.scss";
import menuImg from "public/images/e-commerce/header/menu.svg";
import { withRouter } from "next/router";
import { connect } from "react-redux";
import {
  changeActiveSidebarItem,
  closeSidebar,
  openSidebar,
} from "redux/actions/navigation";
import axios from "axios";

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.switchSidebar = this.switchSidebar.bind(this);

    this.state = {
      heightOne: 0,
      heightTwo: 0,
      heightThree: 0,
      heightFour: 0,
      innerWidth: typeof window !== "undefined" && window.innerWidth,
      count: 0,
      wishlistCount: 0,
    };
  }

  switchSidebar() {
    if (this.props.sidebarOpened) {
      this.props.dispatch(closeSidebar());
      this.props.dispatch(changeActiveSidebarItem(null));
    } else {
      const paths = this.props.router.pathname.split("/");
      paths.pop();
      this.props.dispatch(openSidebar());
      this.props.dispatch(changeActiveSidebarItem(paths.join("/")));
    }
  }

  componentDidMount() {
    typeof window !== "undefined" &&
      window.addEventListener("resize", () => {
        this.setState({ innerWidth: window.innerWidth });
      });
    
    // Get cart count from localStorage for both authenticated and guest users
    const localProducts = JSON.parse(localStorage.getItem("products") || "[]");
    this.setState({
      count: localProducts.length,
    });

    // Get wishlist count for both authenticated and guest users
    this.updateWishlistCount();

    // Listen for localStorage changes
    window.addEventListener('storage', this.handleStorageChange);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  handleStorageChange = (e) => {
    if (e.key === 'wishlist') {
      this.updateWishlistCount();
    }
  }

  updateWishlistCount = () => {
    const wishlistItems = JSON.parse(localStorage.getItem("wishlist") || "[]");
    this.setState({
      wishlistCount: wishlistItems.length,
    });
  }

  toggle = (e) => {
    this.setState({ [e.target.name]: true });
  };

  onMouseEnter = (e) => {
    this.setState({ [e.target.name]: true });
  };

  onMouseLeave = (e) => {
    this.setState({ [e.target.name]: false });
  };

  toggleHeightOne = () => {
    this.setState({
      heightOne: "auto",
      heightTwo: 0,
      heightThree: 0,
      heightFour: 0,
    });
  };

  toggleHeightTwo = () => {
    this.setState({
      heightOne: 0,
      heightTwo: "auto",
      heightThree: 0,
      heightFour: 0,
    });
  };

  toggleHeightThree = () => {
    this.setState({
      heightOne: 0,
      heightTwo: 0,
      heightThree: "auto",
      heightFour: 0,
    });
  };

  toggleHeightFour = () => {
    this.setState({
      heightOne: 0,
      heightTwo: 0,
      heightThree: 0,
      heightFour: "auto",
    });
  };

  render() {
    const { heightTwo, heightThree, heightFour } = this.state;
    return (
      <Navbar className={s.header}>
        <Container>

          {this.state.innerWidth <= 768 && (
                <Button
                    className={"bg-transparent border-0 p-0"}
                    onClick={() => this.switchSidebar()}
                >
                  <img src={menuImg} alt={'menu'} />
                </Button>
          )}

          <NavbarBrand>
            <Link href={"/"}><span className={s.logoStyle}>Macromed</span></Link>
          </NavbarBrand>

          {this.state.innerWidth >= 768 && (
            <nav className={s.nav}>
              <ul className={s.nav__menu}>
                <li className={s.nav__menuItem} style={{ width: 90 }}>
                  <ActiveLink
                    className={s.navLink}
                    onMouseOver={this.toggleHeightOne}
                    href={"/"}
                  >
                    <span className={s.dropdownItem}>Home</span>
                  </ActiveLink>
                </li>
                <li className={s.nav__menuItem}>
                  <ActiveLink
                    className={s.navLink}
                    href={"/shop"}
                  >
                    <span className={s.dropdownItem}>Shop</span>
                  </ActiveLink>
                </li>
                <li className={s.nav__menuItem}>
                  <ActiveLink
                    className={s.navLink}
                    href={"/insight"}
                  >
                    <span className={s.dropdownItem}>Insights</span>
                  </ActiveLink>
                </li>
                {/* Commented out for now
                <li className={s.nav__menuItem}>
                  <span
                    className={s.dropdownItem}
                    onMouseOver={this.toggleHeightTwo}
                  >
                    Pages <div className={s.dropdownItemImg} />
                  </span>
                  <AnimateHeight
                    duration={500}
                    className={`${s.nav__submenu}`}
                    height={heightTwo}
                  >
                    <UncontrolledDropdown>
                      <DropdownItem className={s.dropdownMenuItem}>
                        <ActiveLink href={"/about"}>
                          <a>About Us</a>
                        </ActiveLink>
                      </DropdownItem>
                      <DropdownItem className={s.dropdownMenuItem}>
                        <ActiveLink href={"/about-team"}>
                          <a>About Team</a>
                        </ActiveLink>
                      </DropdownItem>
                      <DropdownItem className={s.dropdownMenuItem}>
                        <ActiveLink href={"/contact"}>
                          <a>Contact Us</a>
                        </ActiveLink>
                      </DropdownItem>
                      <DropdownItem className={s.dropdownMenuItem}>
                        <ActiveLink href={"/faq"}>
                          <a>FAQ</a>
                        </ActiveLink>
                      </DropdownItem>
                      <DropdownItem className={s.dropdownMenuItem}>
                        <ActiveLink href={"/error"}>
                          <a>404</a>
                        </ActiveLink>
                      </DropdownItem>
                      <DropdownItem className={s.dropdownMenuItem}>
                        <ActiveLink href={"/wishlist"}>
                          <a>Wishlist</a>
                        </ActiveLink>
                      </DropdownItem>
                      <DropdownItem className={s.dropdownMenuItem}>
                        <ActiveLink href={"/login"}>
                          <a>Login</a>
                        </ActiveLink>
                      </DropdownItem>
                    </UncontrolledDropdown>
                  </AnimateHeight>
                </li>
                */}
              </ul>
            </nav>
          )}

          <Nav>
            <NavItem className={"d-flex align-items-center"}>
              {this.state.innerWidth >= 768 && (
                <>
                  <Link href={"/search"}>
                    <a>
                      <Button className={`${s.headerSvgIcon} bg-transparent border-0 p-3`}>
                        {this.props.router.pathname.includes("search") ? (
                            <div className={s.headerSearchIconActive} />
                        ) : (
                            <div className={s.headerSearchIcon} />
                        )}
                      </Button>
                    </a>
                  </Link>
                  <Link href={"/login"}>
                    <a>
                      <Button className={`${s.headerSvgIcon} bg-transparent border-0 p-3`}>
                        {this.props.router.pathname.includes("account") ? (
                            <div className={s.headerLoginIconActive} />
                        ) : (
                            <div className={s.headerLoginIcon} />
                        )}
                      </Button>
                    </a>
                  </Link>
                </>
              )}
              <Link href={"/wishlist"}>
                <a>
                  {this.state.wishlistCount ? (
                    <p
                      style={{ fontSize: 9, marginTop: 10, marginLeft: 30 }}
                      className={`mb-0 text-dark fw-bold`}
                    >
                      {this.state.wishlistCount}
                    </p>
                  ) : null}
                  <Button
                    className={`${s.headerSvgIcon} bg-transparent border-0 p-3`}
                    style={{ marginTop: this.state.wishlistCount ? -22 : 0 }}
                  >
                    {this.props.router.pathname.includes("wishlist") ? (
                      <div className={s.headerWishlistIconActive} />
                    ) : (
                      <div className={s.headerWishlistIcon} />
                    )}
                  </Button>
                </a>
              </Link>
              <Link href={"/cart"}>
                <a>
                  {this.state.count ? (
                    <p
                      style={{ fontSize: 9, marginTop: 10, marginLeft: 30 }}
                      className={`mb-0 text-dark fw-bold`}
                    >
                      {this.state.count}
                    </p>
                  ) : null}
                  <Button
                    className={`${s.headerSvgIcon} bg-transparent border-0 p-3`}
                    style={{ marginTop: this.state.count ? -22 : 0 }}
                  >
                    {this.props.router.pathname.includes("cart") ? (
                      <div className={s.headerCartIconActive} />
                    ) : (
                      <div className={s.headerCartIcon} />
                    )}
                  </Button>
                </a>
              </Link>
            </NavItem>
          </Nav>
        </Container>
      </Navbar>
    );
  }
}

Header.propTypes = {};

function mapStateToProps(store) {
  return {
    sidebarOpened: store.navigation.sidebarOpened,
    sidebarStatic: store.navigation.sidebarStatic,
    currentUser: store.auth.currentUser,
    navbarType: store.layout.navbarType,
    navbarColor: store.layout.navbarColor,
    products: store.products.list
  };
}

export default withRouter(connect(mapStateToProps)(Header));
