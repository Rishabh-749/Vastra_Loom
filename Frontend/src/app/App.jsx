import React from 'react';
import './App.css';
import { RouterProvider } from 'react-router';
import { routes } from './app.routes';
import { ThemeProvider } from '../context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={routes} />
    </ThemeProvider>
  );
};

export default App;