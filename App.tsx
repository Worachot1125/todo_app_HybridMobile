import React from 'react';
import RootNavigation from './src/navigation';
import { AuthProvider } from './src/context/authContext';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}