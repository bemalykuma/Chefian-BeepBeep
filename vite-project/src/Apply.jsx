import axios from "axios";
import { useState } from "react";

function Apply() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    license: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,

    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submit");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/register",
        form
      );
      console.log(response.data);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div className="container mx-auto">
        <div className="card w-25 mx-auto">
          <div className="card-header">
            <p className="text-center fs-2 fw-bold">Register</p>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <input
                className="form-control place-hd-fs"
                placeholder="username"
                maxLength="16"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
              <input
                className="form-control place-hd-fs mt-3"
                placeholder="npc222@gmail.com"
                maxLength="16"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
              <input
                className="form-control place-hd-fs mt-3"
                placeholder="phone"
                maxLength="16"
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              <input
                className="form-control place-hd-fs mt-3"
                placeholder="car license"
                maxLength="45"
                type="text"
                name="license"
                value={form.license}
                onChange={handleChange}
              />
              <button type="submit" className="btn btn-dark mt-2">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Apply;
