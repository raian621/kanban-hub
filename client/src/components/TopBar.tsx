import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext, UserData } from '../UserContext';

export default function TopBar(): JSX.Element {
  const setUserData = (useContext(UserContext) as [UserData, React.Dispatch<React.SetStateAction<UserData>>])[1];
  const navigate = useNavigate();

  const handleClick = async() => {
    const result = await fetch('https://localhost:5000/users/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (result.ok) {
      setUserData({});
      navigate('/');
    }
  };

  return (
    <section onClick={() => {handleClick();}} className='topbar'>
      <button>Log out</button>
    </section>
  );
}