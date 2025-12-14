import "./../styles/login.css";
import { FiMail, FiLock } from "react-icons/fi";
import registerImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-left">
          <img src={registerImg} alt="Register Illustration" className="login-illustration" />
        </div>

        <div className="login-right">
          <h2>Create an Account</h2>
          <p className="subtitle">Welcome to the community</p>

          <Input label="FULL NAME" placeholder="Enter Your Full Name" />
          <Input label="EMAIL" placeholder="Enter Your Email" icon={<FiMail />} type="email" />
          <Input label="LEVEL" placeholder="Enter Your Level" />
          <Input label="PASSWORD" placeholder="Enter Your Password" icon={<FiLock />} type="password" />

          <Button text="CREATE ACCOUNT" className="btn-create"  onClick={() => navigate("/login")}/>

          <p className="redirect">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
            
