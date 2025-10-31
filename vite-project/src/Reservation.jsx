import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";

function Reservation() {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [slotOp, setSlotOp] = useState([]);
  const [selectedOp, setSelectedOp] = useState(null);

  const socketRef = useRef(null); // 
  const BACKEND_URL = "http://localhost:5000/api/reserve";

  // โหลดข้อมูลรถและช่องจอด
  const fetchData = async () => {
    try {
      const response = await axios.get(BACKEND_URL);
      setOptions(response.data.results);

      const respones2 = await axios.get("http://localhost:5000/api/carSlot");
      setSlotOp(respones2.data.slot);

      console.log("Fetched data:", response.data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();


    const socket = new WebSocket("ws://localhost:5000");
    socketRef.current = socket;

    socket.onopen = () => console.log(" Reservation WebSocket connected");
    socket.onclose = () => console.log(" Reservation WebSocket disconnected");
    socket.onerror = (err) => console.error(" WebSocket error:", err);


    const heartbeat = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ ping: true }));
      }
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      socket.close();
    };
  }, []);

  const handleSubmit = async (event) => {
  event.preventDefault();
  if (!selected || !selectedOp) return;

  try {
    const res = await axios.post(BACKEND_URL, {
      id_car: selected.id_car,
      slot: selectedOp,
    });

    console.log("Reservation response:", res.data);


    const id = parseInt(selectedOp.replace("slot", ""), 10);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ id, state: 1, distance: 0, from: "reservation" })
      );
      console.log("📡 Sent WebSocket broadcast:", { id, state: 1 });
    }

    setSelected({ ...selected, status: "reserved" });
    setSelectedOp(selectedOp); // แค่เก็บชื่อช่องไว้เฉย ๆ

    setTimeout(() => {
      setSelected(null);
      setSelectedOp(null);
    }, 3000);
  } catch (err) {
    console.error(err);
  }
};


  return (
    <>
      <div className="container mt-5 mx-auto">
        <div className="d-flex gap-3 justify-content-center align-items-center">
          <FontAwesomeIcon className="text-center mb-3" icon={faInfo} size="2x" />
          <p className="fst-italic">
            Reservation can reserve within 1 hour and must be already registered.
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
                        <Dropdown.Item key={key} onClick={() => setSelectedOp(key)}>
                          {key}
                        </Dropdown.Item>
                      ))
                  )}
                </Dropdown.Menu>
              </Dropdown>

              <div className="mt-3">
                <p className="fs-5 fw-semibold">
                  {selected
                    ? `Selected: ${selected.username} ${selected.license}`
                    : "None Selected"}
                </p>
                <p className="fs-5 fw-semibold">
                  Slot: {selectedOp || "None Selected"}
                </p>
              </div>

              <button type="submit" className="btn btn-dark mt-3">
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
