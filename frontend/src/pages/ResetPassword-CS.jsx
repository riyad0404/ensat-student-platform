import "./../styles/login.css";
import { FiMail, FiLock } from "react-icons/fi";
import registerImg from "../assets/login-illustration.png";
import Input from "../components/input.jsx";
import Button from "../components/button.jsx";

export default function Register() {
  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-left">
          <img src={registerImg} alt="Register Illustration" className="login-illustration" />
        </div>

        <div className="login-right">
          <h2>Reset Password</h2>
          <p className="subtitle">Enter your code secret to reset your password</p>

          <Input label="CODE SECRET" placeholder="Enter Your Code Secret" />
          <Input label="NEW PASSWORD" placeholder="Enter Your New Password" icon={<FiLock />} type="password" />
          <Input label="CONFIRM PASSWORD" placeholder="Confirm Your Password" icon={<FiLock />} type="password" />

          <Button text="RESET PASSWORD" className="btn-create" />
          <p className="redirect">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}