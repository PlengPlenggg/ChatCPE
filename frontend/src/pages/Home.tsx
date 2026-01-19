import React, { useState } from 'react';
import HomeAi from '../components/HomeAi';
import LoggedInPage from '../components/LoggedInPage';

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  if (loggedIn) {
    return <LoggedInPage onLogout={() => setLoggedIn(false)} />;
  }
  return <HomeAi onSignedIn={() => setLoggedIn(true)} />;
}
