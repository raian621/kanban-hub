import React, { FormEvent, useContext, useRef } from 'react';
import { UserContext, UserData } from '../UserContext';

const LoginForm = () => {
  const setUserData = (useContext(UserContext) as [UserData, React.Dispatch<React.SetStateAction<UserData>>])[1];

  const username = useRef('');
  const password = useRef('');

  const handleSubmit = async(e:FormEvent) => {
    e.preventDefault();

    const data = {
      username: username.current,
      password: password.current,
    };

    try {
      const result = await fetch('https://localhost:5000/users/login', {
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (result.ok) {
        const userJSON = await result.json();
        console.log(userJSON);
        setUserData({ ...userJSON });
      }
    } catch (e) {
      console.error((e as Error).message);
    }
  };

  return (
    <form onSubmit={ handleSubmit } className='login-form'>
      <fieldset>
        <label htmlFor='username'>Username / Email</label>
        <input 
          name='username'
          type='text' 
          placeholder='Enter username or email'
          onChange={e => username.current = e.target.value}
        />
      </fieldset>
      <fieldset>
        <label htmlFor='password'>Password</label>
        <input
          name='password'
          type='password'
          placeholder='Enter password'
          onChange={e => password.current = e.target.value}
        /> 
      </fieldset>
      <input type='submit' value='Log in'/>
    </form>
  );
};

export default LoginForm;