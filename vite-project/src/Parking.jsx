import { React, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
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
  const boxes = Array.from({ length: 9 }, () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  });

  const [data, setData] = useState([]);
  const BACKEND_URL = "http://localhost:5000/api/carSlot";

  const fetchData = async () => {
    try {
      const response = await axios.get(BACKEND_URL);
      setData(response.data.amount_car);
      console.log("Fetched data:", response.data.amount_car);
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
      <div className="container bg-blue p-5 h-100 w-md-50">
        <div className="row g-5">
          {/* ซีกซ้าย */}
          <div className="col-6 col-md-6">
            {boxes.slice(0, 1).map((img, i) => (
              <div
                key={i}
                className="w-50 px-3 border-start border-top border-3 border-white d-flex"
              >
                <span className="my-5"></span>
                <img
                  src={img}
                  className="img-size-fix"
                  alt={`img-${i}`}
                  draggable={false}
                />
              </div>
            ))}

            <div className="px-3 w-50 border-start border-top border-3 border-white d-flex">
              <span className="my-5"></span>
              {/* <img src={randomImage} className="img-size-fix" /> */}
            </div>
            <div className="px-3 w-50 border-start border-top border-bottom border-3 border-white d-flex">
              <span className="my-5"></span>
              {/* <img src={randomImage} className="img-size-fix" /> */}
            </div>
          </div>

          {/* ซีกขวา */}
          <div className="col-6 col-md-6">
            <div className="px-3 py-4 border-park border-3">ซีกขวา - แถว 1</div>
            <div className="px-3 py-4 border-park border-3">ซีกขวา - แถว 2</div>
            <div className="px-3 py-4 border-park-top border-3">
              ซีกขวา - แถว 3
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
