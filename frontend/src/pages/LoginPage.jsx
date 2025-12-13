import { useState } from "react";
import "./../styles/login.css";
import { FiMail, FiLock } from "react-icons/fi";
import loginImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LEFT */}
        <div className="login-left">
          <img src={loginImg} alt="Login Illustration" className="login-illustration" />
        </div>

        {/* RIGHT */}
        <div className="login-right">

          <h2>Welcome Back!</h2>
          <p className="subtitle">Sign in to continue</p>

          <Input
            label="EMAIL"
            placeholder="Enter Your Email"
            icon={<FiMail />}
            type="email"
          />

          <Input
            label="PASSWORD"
            placeholder="Enter Your Password"
            icon={<FiLock />}
            type="password"
          />

          {/* FORGOT PASSWORD */}
          <div className="forgot-wrapper">
            <span className="forgot" onClick={() => setOpen(!open)}>
              Forgot Password?
            </span>

            {open && (
              <div className="forgot-dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/resetBycode")}
                >
                  🔑 Code secret
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => navigate("/resetByemail")}
                >
                  📧 Email
                </button>
              </div>
            )}
          </div>

          <Button text="LOGIN" className="btn-login" />
          <Button
            text="CREATE AN ACCOUNT"
            className="btn-create"
            onClick={() => window.location.href = "/register"}
          />

        </div>
      </div>
    </div>
  );
}
