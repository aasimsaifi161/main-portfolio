import React from 'react'
import { FiInstagram, FiLinkedin } from 'react-icons/fi'
import { FaTelegramPlane } from 'react-icons/fa'

const Social = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/aasiimg/',
      icon: FiInstagram,
      color: '#E4405F'
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/m-aasim',
      icon: FiLinkedin,
      color: '#0077B5'
    },
    {
      name: 'Telegram',
      url: 'https://t.me/Mohdaasim161',
      icon: FaTelegramPlane,
      color: '#0088cc'
    }
  ]

  return (
    <div className='flex items-center justify-center gap-6'>
      {socialLinks.map((social) => {
        const Icon = social.icon
        return (
          <a
            key={social.name}
            href={social.url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-[#ee6e4d] hover:text-white transition-colors duration-300 hover:scale-110 transform'
            title={social.name}
            aria-label={social.name}
          >
            <Icon size={20} />
          </a>
        )
      })}
    </div>
  )
}

export default Social
