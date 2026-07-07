import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import DateTime from './components/DateTime'
import Social from './components/Social'

const App = () => {
  return (
    <div className='inconsolata-main text-color-and-background h-auto lg:h-screen w-full overflow-y-auto lg:overflow-hidden flex flex-col'>
      <Navbar />
      <Hero />
      <div className='flex flex-col md:flex-row md:items-center md:justify-around px-8 py-3 gap-2 md:gap-8'>
        <div className='flex-1 flex justify-center'>
          <DateTime />
        </div>
        <div className='flex-1 flex justify-center'>
          <Social />
        </div>
      </div>
    </div>
  )
}

export default App