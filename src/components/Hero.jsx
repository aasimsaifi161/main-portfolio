import React from 'react'
import LiquidEther from './LiquidEther'
import SnakeGame from './SnakeGame'
import Terminal from './Terminal'

const Hero = () => {
  return (
    <div className="h-auto lg:h-[84vh] w-full border-b flex flex-col lg:flex-row">
      
      <div className="relative w-full lg:w-[40%] h-[65vh] lg:h-full border-b lg:border-b-0 lg:border-r bg-zinc-900 overflow-hidden flex flex-col justify-center items-center">

        <div className="absolute top-0 left-0 w-full h-full">
          {/* background of arcade */}
          <LiquidEther />
        </div>

        <div className="relative z-10 w-full">
          <SnakeGame />
        </div>

        {/* Interactive Arcade Label */}
        <div className="absolute bottom-4 right-4 z-20 hidden lg:block">
          <p className="text-white text-xs font-semibold tracking-widest opacity-60">
            RETRO ARCADE v1.0
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[60%] h-[55vh] lg:h-full">
        {/* Terminal here */}
        <Terminal />
      </div>
    </div>
  )
}

export default Hero
