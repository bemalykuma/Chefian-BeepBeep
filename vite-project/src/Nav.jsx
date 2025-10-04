import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./Dashboard";
import Apply from "./Apply";
function Nav() {
  return (
    <>
      <nav className="navbar navbar-expand-sm ms-5 mt-5">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse ms-auto" id="navbarNav">
          <ul className="navbar-nav custom-nav py-lg-2 px-lg-1 py-md-2 px-md-2 py-2 px-2 rounded-md-30 bg-white">
            <li className="nav-item mx-2 my-0 hover-nav">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "fw-bold nav-link active-link" : "nav-link fj-set"
                }
              >
                Main
              </NavLink>
            </li>
            <li className="nav-item mx-2 my-0 hover-nav">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "fw-bold nav-link active-link" : "nav-link fj-set"
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item mx-2 my-0 hover-nav">
              <NavLink
                to="/insight"
                className={({ isActive }) =>
                  isActive ? "fw-bold nav-link active-link" : "nav-link fj-set"
                }
              >
                Insight
              </NavLink>
            </li>
            <li className="nav-item mx-2 my-0 hover-nav">
              <NavLink
                to="/Apply"
                className={({ isActive }) =>
                  isActive ? "fw-bold nav-link active-link" : "nav-link fj-set"
                }
              >
                Apply
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insight" element={<></>} />
        <Route path="/apply" element={<Apply />} />
      </Routes>
    </>
  );
}

export default Nav;