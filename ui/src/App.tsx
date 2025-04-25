import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { getApiResult } from "./api/api";

async function fetchData() {
  return await getApiResult();
}

function App() {
  useEffect(() => {
    const res = fetchData();
    // console.log(res);
  });
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Testing Changes</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
