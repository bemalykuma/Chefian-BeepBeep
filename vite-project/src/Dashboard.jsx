import React, { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState([]);
  const BACKEND_URL = "http://localhost:5000/api/sightParking";

  const fetchData = async () => {
    try {
      const response = await axios.get(BACKEND_URL);
      setData(response.data.sightParking);
      console.log("Fetched data:", response.data.sightParking);
    } catch (error) {
      console.error(response.data.value);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <>
      <div className="container-fluid p-4">
        <div className="row g-4 mb-4">
          <div className="col-lg-3 col-md-6 col-12">
            <div className="card p-3 shadow-sm border-1">
              <div className="d-flex align-items-start">
                <span className="fs-2 me-2">🚘</span>
                <p className="fw-semibold fs-3">Car Parking</p>
              </div>
              <h2 className="fw-bold">
                {data.length}

                <span className="fs-6 fw-normal"> car</span>
              </h2>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 col-12 ab">
            <div className="card p-3 shadow-sm border-1 ">
              <div className="d-flex align-items-end">
                <span className="fs-2 me-2">🅿</span>
                <p className="fw-semibold fs-3">Car Parking</p>
              </div>

              <h2 className="fw-bold">
                {Object.entries(data).length > 0 ? (

                  Object.entries(data).map(([idx, slot]) => (
                    <div key={idx}>
                    {slot.map((car) => (
                      <p key={car.id_car} className="fw-normal fs-5 mt-2">
                        {car.datetimeLocal} {car.username} {car.license}
                      </p>
                    ))}
                  </div>
                  )
                )) :  (
                  <p className="fw-normal fs-5 mt-2">Empty</p>
                )}
                <span className="fs-6 fw-normal"></span>
              </h2>
            </div>
          </div>
          {/* 

          <div className="col-lg-3 col-md-6 col-12">
            <div className="card p-3 shadow-sm border-1">
              <div className="d-flex align-items-center">
                <span className="fs-2 me-2">💕</span>
                <p className="fw-semibold">Average Heart Rate</p>
              </div>

              <h2 className="fw-bold">
                85 <span className="fs-6 fw-normal">bpm</span>
              </h2>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 col-12">
            <div className="card p-3 shadow-sm border-1">
              <div className="d-flex align-items-center">
                <span className="fs-2 me-2">❣</span>
                <p className="fw-semibold">Minimum Heart Rate</p>
              </div>
              <h2 className="fw-bold">
                65 <span className="fs-6 fw-normal">ms</span>
              </h2>
            </div>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-lg-3 col-md-6 col-12">
            <div className="card p-3 shadow-sm border-1 h-100">
              <p>Heart Rate</p>
              <p>Your heart rate is...</p>
            </div>
          </div>

          <div className="col-lg-3 col-md-12 col-12">
            <div className="card p-3 shadow-sm border-1 mb-4 h-100">
              <p>Heart Rate Zones</p>
            </div>
          </div>

          <div className="col-lg-6 col-md-12 col-12">
            <div className="card p-3 shadow-sm border-1 h-100">
              <p>Arrhythmia Analysis</p>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
