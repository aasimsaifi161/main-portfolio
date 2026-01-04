import React from 'react'
import { FiInstagram, FiLinkedin, FiTwitter } from 'react-icons/fi'

const Social = () => {
  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      icon: FiInstagram,
      color: '#E4405F'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: FiLinkedin,
      color: '#0077B5'
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com',
      icon: FiTwitter,
      color: '#1DA1F2'
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
