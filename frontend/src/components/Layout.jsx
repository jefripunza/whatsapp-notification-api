import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useApplication from "./../hooks/useApplication";
import axios from "../utils/axios";
import routes from "../routes";
import { toast } from "react-toastify";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated, isReady, user, logout } = useApplication();

  useEffect(() => {
    if (!isAuthenticated && !isReady) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isReady]);

  useEffect(() => {
    const sideMenu = document.querySelector("aside");
    // Show Sidebar
    const menuBtn = document.querySelector("#menu-btn");
    menuBtn.addEventListener("click", () => {
      sideMenu.style.display = "block";
    });
    // Close Sidebar
    const closeBtn = document.querySelector("#close-btn");
    closeBtn.addEventListener("click", () => {
      sideMenu.style.display = "none";
    });
  }, []);

  function addMenu(route, name, icon, number = null) {
    return (
      <a
        key={route}
        href="#"
        className={location.pathname == route ? "active" : ""}
        onClick={() => navigate(route)}
      >
        <span className="material-icons-sharp">{icon}</span>
        <h3>{name}</h3>
        {number ? <span className="message-count">{number}</span> : null}
      </a>
    );
  }

  return (
    <div className="container">
      <aside>
        <div className="top">
          <div className="logo">
            <img src="images/logo.png" alt="" />
            <h2>
              WhatsApp Notification <span className="danger">API</span>
            </h2>
          </div>

          <div className="close" id="close-btn">
            <span className="material-icons-sharp">close</span>
          </div>
        </div>
        <div className="sidebar">
          {isReady
            ? routes.routes
                .filter((v) => v.name)
                .map((route) => {
                  return addMenu(route.path, route.name, route.icon);
                })
            : null}

          <a
            href="#"
            onClick={async () => {
              try {
                await axios
                  .delete("/api/whatsapp/auth/logout")
                  .then((res) => res.data);
                logout();
                toast.success("success logout!");
                navigate("/", { replace: true });
              } catch (e) {
                console.log({ e });
              }
            }}
          >
            <span className="material-icons-sharp">logout</span>
            <h3>Logout</h3>
          </a>
        </div>
      </aside>

      {isReady ? <main>{children}</main> : <>Please wait...</>}

      <div className="right">
        <div className="top">
          <button id="menu-btn">
            <span className="material-icons-sharp">menu</span>
          </button>
          <div className="profile">
            <div className="info">
              <p>
                {isReady ? (
                  <>
                    Hey <b>{user.name}</b>
                  </>
                ) : (
                  <b>Welcome...</b>
                )}
              </p>
              {isReady ? (
                <small className="text-muted">+{user.number}</small>
              ) : null}
            </div>
            <div className="profile-photo">
              <img
                src={isReady ? user.picture : "images/blank-profile.webp"}
                alt=""
              />
            </div>
          </div>
        </div>

        <div className="notifications">
          <h2>Notifications</h2>
          <div className="updates">
            {isReady ? (
              <>
                <div className="update">
                  <div className="profile-photo">
                    <img src="images/profile-2.jpg" alt="" />
                  </div>
                  <div className="message">
                    <p>
                      <b>Mike Tyson</b> received his order of Night lion tech
                      GPS drone
                    </p>
                    <small>2 Minutes Ago</small>
                  </div>
                </div>

                <div className="update">
                  <div className="profile-photo">
                    <img src="images/profile-3.jpg" alt="" />
                  </div>
                  <div className="message">
                    <p>
                      <b>Diana Ayi</b> received her order of 2 DJI Air drone
                    </p>
                    <small>5 Minutes Ago</small>
                  </div>
                </div>

                <div className="update">
                  <div className="profile-photo">
                    <img src="images/profile-4.jpg" alt="" />
                  </div>
                  <div className="message">
                    <p>
                      <b>Mandy Roy</b> received his order of LARVENDER KF102
                      drone
                    </p>
                    <small>6 Minutes Ago</small>
                  </div>
                </div>
              </>
            ) : (
              <div className="update">
                <div className="profile-photo">
                  <img src="images/profile-2.jpg" alt="" />
                </div>
                <div className="message">
                  <p>if you not scan</p>
                  <small>2 Minutes Ago</small>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* <div className="sales-analytics">
          <h2>Sales Analytics</h2>
          <div className="item online">
            <div className="icon">
              <span className="material-icons-sharp">shopping_cart</span>
            </div>
            <div className="right">
              <div className="info">
                <h3>ONLINE ORDERS</h3>
                <small className="textmuted">Last 24 Hours</small>
              </div>
              <h5 className="success">+39%</h5>
              <h3>3849</h3>
            </div>
          </div>

          <div className="item offline">
            <div className="icon">
              <span className="material-icons-sharp">local_mall</span>
            </div>
            <div className="right">
              <div className="info">
                <h3>OFFLINE ORDERS</h3>
                <small className="textmuted">Last 24 Hours</small>
              </div>
              <h5 className="danger">-17%</h5>
              <h3>1100</h3>
            </div>
          </div>

          <div className="item customers">
            <div className="icon">
              <span className="material-icons-sharp">person</span>
            </div>
            <div className="right">
              <div className="info">
                <h3>NEW CUSTOMERS</h3>
                <small className="textmuted">Last 24 Hours</small>
              </div>
              <h5 className="success">+25%</h5>
              <h3>849</h3>
            </div>
          </div>

          <div className="item add-product">
            <div>
              <span className="material-icons-sharp">add</span>
              <h3>Add Product</h3>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Layout;
