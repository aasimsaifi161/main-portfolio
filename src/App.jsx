import React from 'react'
import Navbar from './components/navbar'
import Hero from './components/Hero'
import DateTime from './components/DateTime'

const App = () => {
  return (
    <div className='inconsolata-main text-color-and-background h-screen w-full overflow-hidden flex flex-col'>
      <Navbar />
      <Hero />
      <DateTime />
    </div>
  )
}

export default App