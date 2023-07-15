import React from 'react';
import { SideBar, TopBar } from '.';
import './Layout.css';

export default function Layout({ children } : { children: React.ReactNode }):JSX.Element {
  return (
    <div className='layout-wrapper'>
      <TopBar/>
      <div className='horizontal-wrapper'>
        <SideBar/>
        {children}
      </div>
    </div>
  );
}