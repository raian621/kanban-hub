import React from 'react';
import { Link } from 'react-router-dom';

export default function SideBar(): JSX.Element {
  return (
    <section className='sidebar'>
      <Link to='/dashboard'>Dashboard</Link>
      <Link to='/groups'>Groups</Link>
      <Link to='/workspaces'>Workspaces</Link>
      <Link to='/projects'>Projects</Link>
      <Link to='/boards'>Boards</Link>
    </section>
  );
}