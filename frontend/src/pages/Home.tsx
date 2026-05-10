import React, { useEffect, useState } from 'react';
import HomeAi from '../components/HomeAi';
import LoggedInPage from '../components/LoggedInPage';

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('access_token')));

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setLoggedIn(true);
    }
  }, []);
  if (loggedIn) {
    return <LoggedInPage onLogout={() => setLoggedIn(false)} />;
  }
  return <HomeAi onSignedIn={() => setLoggedIn(true)} />;
}
