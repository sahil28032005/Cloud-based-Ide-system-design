import { useState } from 'react'
// import './App.css'
import TerminalComponent from './components/TerminalComponent'
import FileLister from './components/FileLister'
function App() {


  return (
    <>
      <FileLister />
      <TerminalComponent />
    </>
  )
}

export default App
