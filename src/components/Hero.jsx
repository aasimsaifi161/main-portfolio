import React from 'react'
import LiquidEther from './LiquidEther'
import Lanyard from './Lanyard'
import Terminal from './Terminal'

const Hero = () => {
  return (
    <div className="h-[84vh] w-full border-b  flex">
      
      <div className="relative lg:block hidden w-[40%] border-r bg-zinc-900 overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-full">
          <LiquidEther />
        </div>

        <div className="relative z-10">
          <Lanyard position={[0, 0, 20]} gravity={[0, -60, 0]} />
        </div>
      </div>

      <div className="lg:w-[60%] w-full">
        {/* Terminal here */}
        <Terminal />
      </div>
    </div>
  )
}

export default Hero
