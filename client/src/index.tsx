import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { UserContext, UserData } from './UserContext';

function withUserDataRefContext({ children } : { children: React.ReactNode }): JSX.Element {
  const [ userData, setUserData ] = useState<UserData>({});
  const navigate = useNavigate();
  
  async function fetchUserData():Promise<UserData> {
    console.log('Fetching user data from server...');
    const res = await fetch('https://localhost:5000/users', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const userJSON = await res.json();
    console.log('userJSON = ', userJSON);
    return userJSON;
  }

  // on initial render, check for the session id cookie, then
  // fetch user data from server to check if they are authenticated.
  // If authenticated, the index element of the main router will be
  // set to the user's Dashboard.
  useEffect(() => {
    if (document.cookie.match(/^connect.sid=(.*)/) !== null) {
      fetchUserData().then(result => {
        setUserData({ ...result });  
        console.log('Initial fetch:', userData);
        if (!result?.authenticated)
          navigate('/login');
      });
    } else {
      navigate('login');
    }
  }, []);

  return (
    <UserContext.Provider value={[userData, setUserData]}>
      { children }
    </UserContext.Provider>
  );
}

const UserDataRefContext = withUserDataRefContext;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserDataRefContext>
        <App />
      </UserDataRefContext>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
