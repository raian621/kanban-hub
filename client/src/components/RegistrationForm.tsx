import React, { FormEvent, useRef, useState } from 'react';

const RegistrationForm = () => {
  const firstName = useRef('');
  const lastName = useRef('');
  const email = useRef('');
  const username = useRef('');
  const password = useRef('');
  const repeatPassword = useRef('');

  const handleSubmit = async(e:FormEvent) => {
    e.preventDefault();

    if (password.current !== repeatPassword.current)
      return;

    const data = {
      firstName: firstName.current,
      lastName: lastName.current,
      email: email.current,
      username: username.current,
      password: password.current,
    };

    console.log(data);

    await fetch('https://localhost:5000/users', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  return (
    <form onSubmit={ handleSubmit } className='login-form'>
      <fieldset>
        <label htmlFor='firstName'>First name</label>
        <input 
          name='firstName' 
          type='text' 
          placeholder='Enter first name'
          onChange={e => firstName.current = e.target.value}
        />
      </fieldset>
      <fieldset>
        <label htmlFor='lastName'>Last name</label>
        <input 
          name='email' 
          type='text' 
          placeholder='Enter last name'
          onChange={e => lastName.current = e.target.value}
        />
      </fieldset>
      <fieldset>
        <label htmlFor='email'>Email</label>
        <input 
          name='email' 
          type='text' 
          placeholder='Enter email'
          onChange={e => email.current = e.target.value}
        />
      </fieldset>
      <fieldset>
        <label htmlFor='username'>Username</label>
        <input 
          name='username' 
          type='text' 
          placeholder='Enter username'
          onChange={e => username.current = (e.target.value)}
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
      <fieldset>
        <label htmlFor='repeat-password'>Password</label>
        <input
          name='repeat-password'
          type='password'
          placeholder='Repeat password'
          onChange={e => repeatPassword.current = e.target.value}
        /> 
      </fieldset>
      <input type='submit' value='Register'/>
    </form>
  );
};

export default RegistrationForm;