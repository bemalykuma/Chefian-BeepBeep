import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";

import Dropdown from "react-bootstrap/Dropdown";

import axios from "axios";

function Reservation() {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);

  const [slotOp, setSlotOp] = useState([]);
  const [selectedOp, setSelectedOp] = useState(null);

  const BACKEND_URL = "http://localhost:5000/api/reserve";

  const fetchData = async () => {
    try {
      const response = await axios.get(BACKEND_URL);
      setOptions(response.data.results);

      const respones2 = await axios.get("http://localhost:5000/api/carSlot");
      setSlotOp(respones2.data.slot);

      console.log("Fetched data:", response.data.results);
    } catch (error) {
      console.error(response.data.value);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => clearInterval(intervalId);
  }, [selected, selectedOp]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selected || !selectedOp) {
      return;
    }

    try {
      const res = await axios.post(BACKEND_URL, {
        id_car: selected.id_car,
        slot: selectedOp,
      });

      if (res.data.error) {
        setSelected({ ...selected, error: res.data.error });
      } else {
        setSelected({ ...selected, status: "reserved" });
        setSelectedOp({ ...selectedOp, status: "reserved" });
      }

      setTimeout(() => {
        setSelected(null);
        setSelectedOp(null);
      }, 5000);

      console.log(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="container mt-5 mx-auto">
        <div className="d-flex gap-3 justify-content-center align-items-center">
          <FontAwesomeIcon
            className="text-center mb-3"
            icon={faInfo}
            size="2x"
          />
          <p className="fst-italic">
            Reservation can reserve within 1 hours and must be already register,
            if idle will skip.
          </p>
        </div>

        <div className="card w-25 mx-auto">
          <div className="card-header">
            <p className="text-center fs-2 fw-bold">Reservation</p>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <Dropdown>
                <Dropdown.Toggle variant="dark" id="dropdown-basic">
                  Select Username and Car
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {options.length > 0 ? (
                    options.map((spt) => (
                      <Dropdown.Item
                        key={spt.id_car}
                        onClick={() => setSelected(spt)}
                      >
                        {spt.username} {spt.license}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item>Empty</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown className="mt-3">
                <Dropdown.Toggle variant="dark" id="dropdown-basic">
                  Select Slot Parking
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {slotOp.flatMap((slotObj) =>
                    Object.entries(slotObj)
                      .filter(([_, value]) => value === 0)
                      .map(([key]) => (
                        <Dropdown.Item
                          key={key}
                          onClick={() => setSelectedOp(key)}
                        >
                          {key}
                        </Dropdown.Item>
                      ))
                  )}
                </Dropdown.Menu>
              </Dropdown>

              {selected ? (
                <div className="mt-3">
                  {selected.status === "reserved" ? (
                    <p className="fs-5 fw-semibold">Reserved ✔</p>
                  ) : (
                    <div className="d-flex align-items-end gap-3">
                      <p className="fs-5 fw-semibold">Selected :</p>
                      <p>
                        {selected.username} {selected.license}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <p className="fs-5 fw-semibold">None Selected</p>
                </div>
              )}
              {selectedOp ? (
                <div className="">
                  {selectedOp.status === "reserved" ? (
                    <p className="fs-5 fw-semibold"></p>
                  ) : (
                    <div className="d-flex align-items-end gap-3">
                      <p className="fs-5 fw-semibold">Slot :</p>
                      <p>{selectedOp}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <p className="fs-5 fw-semibold">Slot : None Selected</p>
                </div>
              )}

              <button type="submit" className="btn btn-dark">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
export default Reservation;
