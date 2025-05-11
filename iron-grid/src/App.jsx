import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Hero from './components/hero'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <section className='Hero'>
      <Hero />
    </section>
    
    </>
  )
}

export default App
