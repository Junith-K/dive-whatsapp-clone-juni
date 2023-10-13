import React, { useState } from 'react'
import { auth, database } from '../firebase';
import firebase from "../firebase"
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {ref,set,push} from "firebase/database"
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setNam] = useState('');
  const [emailEmpty, setEmailEmpty] = useState(true);
  const [passwordEmpty, setPasswordEmpty] = useState(true);
  const [nameEmpty, setNameEmpty] = useState(true);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    if (e.target.id === 'email') {
      setEmailEmpty(false);
    }

    if (e.target.id === 'password') {
      setPasswordEmpty(false);
    }

    if (e.target.id === 'name') {
      setNameEmpty(false);
    }

    if (e.target.id === 'email') {
      setEmail(e.target.value);
    }

    if (e.target.id === 'password') {
      setPassword(e.target.value);
    }

    if (e.target.id === 'name') {
      setNam(e.target.value);
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

    if (!displayName) {
      setNameEmpty(true);
      val = true;
    }

    if(val){
      return;
    }

    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      set(ref(database,'users/'+user.uid),{
        username: displayName,
        email: email,
        online: true,
        uid: user.uid
      })

      console.log('Registration successful:', user);
      localStorage.setItem('token', user.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      navigate("/"); // Assuming navigate is a function for navigation
    } catch (error) {
      console.error('Registration Error:', error);
    }
  };

  return (
    <div className='h-screen flex bg-gray-300'>
            <div className='w-full max-w-md m-auto bg-white rounded-lg border border-primaryBorder shadow-default py-10 px-16'>
      <h1 className='text-2xl font-medium text-primary mt-4 mb-12 text-center'>
        Create your Account 🔐
      </h1>
      <form>
        <div>
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            className={`w-full p-2 text-primary border ${
              nameEmpty ? 'border-red-500' : 'border-black'
            } rounded-md outline-none text-sm transition duration-150 ease-in-out mb-4`}
            id='name'
            placeholder='Your Name'
            value={displayName}
            onChange={handleInputChange}
          />
        </div>
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
            Register
          </button>
        </div>
        <div className='flex justify-center items-center mt-6'>
          <div>Need to Sign In? </div>
          <Link className='text-blue-700 ml-4' to='/login'>
            Login
          </Link>
        </div>
      </form>
    </div>
        </div>
    // <div>
    //   <h1>Signup Page</h1>
    //   <form onSubmit={handleSubmit} className='signup-form'>
        // <input
        //   type="text"
        //   placeholder="Your Name"
        //   required
        //   value={displayName}
        //   onChange={(e) => setNam(e.target.value)}
        // />
        // <input
        //   type="email"
        //   placeholder="Your Email"
        //   required
        //   value={email}
        //   onChange={(e) => setEmail(e.target.value)}
        // />
        // <input
        //   type="password"
        //   placeholder="Your Password"
        //   required
        //   value={password}
        //   onChange={(e) => setPassword(e.target.value)}
        // />
    //     <button type="submit" className='signup-button'>Signup</button>
    //   </form>
    //   <p>Need to Login? <Link to="/login">Login</Link></p>
    // </div>
  )
}

export default Signup