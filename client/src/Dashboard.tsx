import React, { useContext } from 'react';
import { UserContext, UserData } from './UserContext';
import { Layout } from './components';

export default function Dashboard(): JSX.Element {
  const [ userData, setUserData ] = useContext(UserContext) as [UserData, React.Dispatch<React.SetStateAction<UserData>>];
  console.log('Dashboard', userData);

  return (
    <>
      <Layout>
        <p>{userData.username}&apos;s Dashboard</p>
      </Layout>
    </>
  );
}