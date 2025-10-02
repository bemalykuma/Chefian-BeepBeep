import { React, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

import car1 from "./assets/car1.svg";
import car2 from "./assets/car2.svg";
import car3 from "./assets/car3.svg";
import car4 from "./assets/car4.svg";
import car5 from "./assets/car5.svg";
import car6 from "./assets/car6.svg";
import car7 from "./assets/car7.svg";
import car8 from "./assets/car8.svg";
import car9 from "./assets/car9.svg";

function Parking() {
  const images = [car1, car2, car3, car4, car5, car6, car7, car8, car9];

  // สุ่มรูปแต่ละกล่อง
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  const [slotData, setSlotData] = useState([]);

  const BACKEND_URL = "http://localhost:5000/api/carSlot";

  const fetchData = async () => {
    try {
      const response = await axios.get(BACKEND_URL);
      setSlotData(response.data.slot[0]);
      console.log("Fetched slot data:", response.data.slot[0]);
    } catch (error) {
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
      <div className="container bg-blue p-5 h-100 w-md-50">
        <div className="">
          <h2 className="text-light">Slot Available</h2>
          {Object.entries(slotData).map(([key, val]) => {
            return (
              val === 0 && (
                <h4 className="text-light fw-normal" key={key}>{key.replace(/slot(\d+)/, 'slot $1')}</h4>
              )
            );
          })}
        </div>

        <div className="row g-5">
          {/* ซีกซ้าย */}
          <div className="col-6 col-md-6 d-flex flex-column align-items-end">
            <div className="w-50 px-3 border-start border-top border-3 border-white d-flex">
              <span className="my-5"></span>
              {slotData.slot1 === 1 && (
                <img
                  src={getRandomImage()}
                  className="img-size-fix"
                  alt="slot1-image"
                  draggable={false}
                />
              )}
            </div>
            <div className="w-50 px-3 border-start border-top border-3 border-white d-flex">
              <span className="my-5"></span>
              {slotData.slot2 === 1 && (
                <img
                  src={getRandomImage()}
                  className="img-size-fix"
                  alt="slot1-image"
                  draggable={false}
                />
              )}
            </div>
            <div className="w-50 px-3 border-start border-top border-bottom border-3 border-white d-flex">
              <span className="my-5"></span>
              {slotData.slot3 === 1 && (
                <img
                  src={getRandomImage()}
                  className="img-size-fix"
                  alt="slot1-image"
                  draggable={false}
                />
              )}
            </div>
          </div>

          {/* ซีกขวา */}
          <div className="col-6 col-md-6">
            <div className="w-50 px-3 border-end border-top border-3 border-white d-flex justify-content-end">
              <span className="my-5"></span>
              {slotData.slot4 === 1 && (
                <img
                  src={getRandomImage()}
                  className="img-size-fix svg_right"
                  alt="slot1-image"
                  draggable={false}
                />
              )}
            </div>
            <div className="w-50 px-3 border-end border-top border-3 border-white d-flex justify-content-end">
              <span className="my-5"></span>
              {slotData.slot5=== 1 && (
                <img
                  src={getRandomImage()}
                  className="img-size-fix svg_right"
                  alt="slot1-image"
                  draggable={false}
                />
              )}
            </div>
            <div className="w-50 px-3 border-end border-top border-bottom border-3 border-white d-flex justify-content-end">
              <span className="my-5"></span>
              {slotData.slot6 === 1 && (
                <img
                  src={getRandomImage()}
                  className="img-size-fix svg_right"
                  alt="slot1-image"
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container d-flex flex-column justify-content-center align-items-center">
        <div className="bg-blue w-50 p-5 d-flex flex-column justify-content-center align-items-center">
          <FontAwesomeIcon
            className="text-center mb-3"
            icon={faArrowUp}
            size="3x"
            bounce
          />
          <h3 className="text-center">Entrance</h3>
        </div>
      </div>
    </>
  );
}
export default Parking;
