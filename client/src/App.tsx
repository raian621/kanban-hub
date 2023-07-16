import React, { useContext, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Login } from './Login';
import { UserContext, UserData } from './UserContext';
import Dashboard from './Dashboard';

function App(): JSX.Element {
  const [ userData, setUserData ] = useContext(UserContext) as [UserData, React.Dispatch<React.SetStateAction<UserData>>];

  return (
    <Routes>
      <Route path='/'>
        <Route index element={<Login/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Route>
    </Routes>
  );
}

export default App;
