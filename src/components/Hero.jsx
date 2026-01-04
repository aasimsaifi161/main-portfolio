import React from 'react'
import LiquidEther from './LiquidEther'
import Lanyard from './Lanyard'
import Terminal from './Terminal'

const Hero = () => {
  return (
    <div className="h-[84vh] w-full border-b  flex">
      
      <div className="relative lg:block hidden w-[40%] border-r bg-zinc-900 overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-full">
          {/* background of 3d card */}
          <LiquidEther />
        </div>

        <div className="relative z-10">
          {/* 3d card */}
          <Lanyard position={[0, 0, 20]} gravity={[0, -30, 0]} />
        </div>

        {/* Interactive 3D Card Label */}
        <div className="absolute bottom-4 right-4 z-20">
          <p className="text-white text-sm font-semibold tracking-wide">
            Interactive 3D Card
          </p>
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
