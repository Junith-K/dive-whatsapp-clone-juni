import React, { useState } from 'react'
import { auth, database } from '../firebase';
import firebase from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, update, onDisconnect } from 'firebase/database';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailEmpty, setEmailEmpty] = useState(true);
  const [passwordEmpty, setPasswordEmpty] = useState(true);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    if (e.target.id === 'email') {
      setEmailEmpty(false);
    }

    if (e.target.id === 'password') {
      setPasswordEmpty(false);
    }

    if (e.target.id === 'email') {
      setEmail(e.target.value);
    }

    if (e.target.id === 'password') {
      setPassword(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    let val = false;
    if (!email) {
      setEmailEmpty(true);
      val = true;
    }

    if (!password) {
      setPasswordEmpty(true);
      val = true;
    }

    if(val){
      return;
    }

    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userRef = ref(database,`users/${user.uid}`);
  
        update(userRef,{ online: true });
  
        onDisconnect(userRef).update({ online: false, lastOnline: { '.sv': 'timestamp' } });
        localStorage.setItem('token', user.accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        navigate("/");
      })
      .catch((error) => {
        console.error('Login Error:', error.message);
      });
      
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className='h-screen flex bg-gray-300'>
            <div className='w-full max-w-md m-auto bg-white rounded-lg border border-primaryBorder shadow-default py-10 px-16'>
      <h1 className='text-2xl font-medium text-primary mt-4 mb-12 text-center'>
        Log in to your account 🔐
      </h1>

      <form>
        <div>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            className={`w-full p-2 text-primary border ${
              emailEmpty ? 'border-red-500' : 'border-black'
            } rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4`}
            id='email'
            placeholder='Your Email'
            value={email}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            className={`w-full p-2 text-primary border ${
              passwordEmpty ? 'border-red-500' : 'border-black'
            } rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4`}
            id='password'
            placeholder='Your Password'
            value={password}
            onChange={handleInputChange}
          />
        </div>

        <div className='flex justify-center items-center mt-6'>
          <button
            onClick={handleSubmit}
            className={`bg-green py-2 px-4 text-sm text-white rounded border border-black bg-green-400 focus:outline-none focus:border-green-dark`}
          >
            Login
          </button>
        </div>
        <div className='flex justify-center items-center mt-6'>
          <div>Need to Register? </div>
          <Link className='text-blue-700 ml-4' to='/signup'>
            Create Account
          </Link>
        </div>
      </form>
    </div>
        </div>
    // <div className='flex flex-col justify-center items-center h-[100vh]'>
    //   <h1 className=''>Login Page</h1>
    //   <form onSubmit={handleSubmit} className='login-form'>
    //     <input
    //       type="email"
    //       placeholder="Your Email"
    //       required
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //     />
    //     <input
    //       type="password"
    //       placeholder="Your Password"
    //       required
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //     />
    //     <button type="submit" className='login-button'>Login</button>
    //   </form>
    //   <p>Need to Signup? <Link to="/signup">Create Account</Link></p>
    // </div>
  )
}

export default Login


