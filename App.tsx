import React from "react";
import { StatusBar } from "expo-status-bar";
import "./global.css"; 
import RemoteScreen from "./src/app/remote/RemoteScreen"; 

export default function App() {
  return (
    <>
      <RemoteScreen />
      <StatusBar style="light" />
    </>
  );
}
