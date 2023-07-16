import React, { useContext, useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { UserContext, UserData } from './UserContext';

export function Login() {
  const [ loginSelected, setLoginSelected ] = useState(true);
  const [ formTitle, setFormTitle ] = useState('Log In to KanbanHub');
  const navigate = useNavigate();
  const userData = (useContext(UserContext) as [UserData, React.Dispatch<React.SetStateAction<UserData>>])[0];

  useEffect(() => {
    if (userData?.authenticated)
      navigate('/dashboard');
  }, [userData]);

  return (
    <div className={'login'}>
      <section className='login-and-registration'>
        <header>
          <h1>{ formTitle }</h1>
        </header>
        <button
          className={`top-form-button ${ loginSelected ? 'active' : 'inactive' }`}
          onClick={() => { 
            setLoginSelected(true);
            setFormTitle('Log in to KanbanHub');
          }}
        >Log In</button>
        <button 
          className={`top-form-button ${ loginSelected ? 'inactive' : 'active' }`}
          onClick={() => { 
            setLoginSelected(false);
            setFormTitle('Register for KanbanHub');
          }}
        >Register</button>
        { loginSelected ? <LoginForm/> : <RegistrationForm/> }
      </section>
    </div>
  );
}