import React,{useState} from "react";
import {useNavigate} from "react-router-dom"

const Login = (props) => {

  const [credentials, setCredentials] = useState({email:"",password:""})
  let navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email:credentials.email,password:credentials.password})
    });
    const json = await response.json();
    console.log(json)
    if (json.success){
      //redirect after saving authtoken

      localStorage.setItem('token',json.authToken);
      console.log(json.authToken)
      navigate("/")
      props.showAlert("Loged in successfully","success")
    }else{
      props.showAlert("Invalid Credential","danger")
    }
  };



  const onChange=(e)=>{
    setCredentials({...credentials,[e.target.name]:e.target.value})
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={credentials.email}
            aria-describedby="emailHelp"
            onChange={onChange}
          />
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={credentials.password}
            className="form-control"
            onChange={onChange}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;