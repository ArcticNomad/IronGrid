import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Hero from './components/hero'
import WhyUs from './components/WhyUs'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <main className='bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 ' >

        <section className='Hero'>
      <Hero />
    </section>

    <section className='WhyUs shadow-2xl'>
      <WhyUs/>
    </section>
    

    </main>
    
    </>
  )
}

export default App
