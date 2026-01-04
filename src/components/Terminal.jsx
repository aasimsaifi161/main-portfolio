import React, { useState, useEffect, useRef } from 'react'
import { about } from '../data/about'
import { skills } from '../data/skills'
import { projects } from '../data/projects'
import { experience } from '../data/experience'
import { contact } from '../data/contact'
import { services } from '../data/services'

const Terminal = () => {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const terminalRef = useRef(null)
  const inputRef = useRef(null)

  const PROMPT = 'visitor@aasim.dev:~$'
  const TYPING_SPEED = 10 // milliseconds per character

  useEffect(() => {
    if (showWelcome) {
      const welcomeMessage = `
Welcome to My Interactive Terminal Portfolio

Hello! I'm <name>Mohd Aasim</name>, a passionate Web Developer.
Type <help> to see available commands.

`
      setHistory([{ type: 'welcome', content: welcomeMessage }])
      setShowWelcome(false)
    }
  }, [showWelcome])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus()
    }
  }, [isTyping])

  const commands = {
    help: () => {
      return `
Available Commands:
  <cmd>about</cmd>          - Learn more about me
  <cmd>skills</cmd>         - View my technical skills
  <cmd>services</cmd>       - Services I offer
  <cmd>projects</cmd>       - See my recent projects
  <cmd>experience</cmd>     - Check my work experience
  <cmd>contact</cmd>        - Get in touch with me
  <cmd>clear</cmd>          - Clear the terminal
  <cmd>help</cmd>           - Show this help message
`
    },

    about: () => {
      return `
  About Me 
  Name:        ${about.name}
  Title:       ${about.title}
  Location:    ${about.location}
  Email:       ${about.email}
                                                                 
${about.description}

${about.bio}

`
    },

    skills: () => {
      const formatCategory = (title, items) => {
        return `  ${title}:\n    ${items.join(', ')}`
      }

      return `
📚 Technical Skills

${formatCategory('Frontend', skills.frontend)}

${formatCategory('Backend', skills.backend)}

${formatCategory('Tools', skills.tools)}

${formatCategory('Other', skills.other)}
`
    },

    projects: () => {
      const projectList = projects.map(p => 
        `  ► ${p.name} (${p.year})
    ${p.description}
    Tech: ${p.tech.join(', ')}`
      ).join('\n\n')

      return `
🚀 Projects

${projectList}
`
    },

    services: () => {
      const serviceList = services.map(s =>
        `  ► ${s.title}
    ${s.description}
    Tech: ${s.technologies.join(', ')}`
      ).join('\n\n')

      return `
💼 Services

${serviceList}
`
    },

    experience: () => {
      const expList = experience.map(exp =>
        `  ► ${exp.position} @ ${exp.company}
    ${exp.duration}
    ${exp.description}
    • ${exp.achievements.join('\n    • ')}`
      ).join('\n\n')

      return `
💼 Work Experience

${expList}
`
    },

    contact: () => {
      return `
📧 Contact Information

  Email:       ${contact.email}
  Phone:       ${contact.phone}
  Location:    ${contact.location}

  GitHub:      ${contact.github}
  LinkedIn:    ${contact.linkedin}
  Twitter:     ${contact.twitter}
  Portfolio:   ${contact.portfolio}

  ${contact.message}
`
    },

    clear: () => {
      const welcomeMessage = `
Welcome to My Interactive Terminal Portfolio

Hello! I'm <name>Mohd Aasim</name>, a passionate Web Developer.
Type <help> to see available commands.

`
      setHistory([{ type: 'welcome', content: welcomeMessage }])
      return null
    }
  }

  const typeText = (text, historyUpdateFn) => {
    setIsTyping(true)
    let currentText = ''
    let charIndex = 0

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        currentText += text[charIndex]
        historyUpdateFn(currentText)
        charIndex++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
      }
    }, TYPING_SPEED)
  }

  const handleCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    
    // Add command to history
    setHistory(prev => [...prev, { type: 'command', content: cmd }])

    if (trimmedCmd === '') {
      return
    }

    if (commands[trimmedCmd]) {
      const output = commands[trimmedCmd]()
      if (output !== null) {
        // Initialize with empty content
        setHistory(prev => [...prev, { type: 'text', content: '' }])
        
        // Type the text
        typeText(output, (currentText) => {
          setHistory(prev => {
            const newHistory = [...prev]
            newHistory[newHistory.length - 1].content = currentText
            return newHistory
          })
        })
      }
    } else if (trimmedCmd === 'exit' || trimmedCmd === 'quit') {
      setHistory(prev => [...prev, { type: 'text', content: '' }])
      typeText('👋 Thanks for visiting! See you soon.\n', (currentText) => {
        setHistory(prev => {
          const newHistory = [...prev]
          newHistory[newHistory.length - 1].content = currentText
          return newHistory
        })
      })
    } else {
      const errorMsg = `Command '${trimmedCmd}' not found. Type 'help' for available commands.\n`
      setHistory(prev => [...prev, { type: 'text', content: '' }])
      typeText(errorMsg, (currentText) => {
        setHistory(prev => {
          const newHistory = [...prev]
          newHistory[newHistory.length - 1].content = currentText
          return newHistory
        })
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCommand(input)
      setInput('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  return (
    <div className='w-full h-full flex flex-col bg-black text-[#ee6e4d] font-mono overflow-hidden'>
      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className='flex-1 overflow-y-auto p-4 text-sm leading-relaxed terminal-scrollbar'
      >
        {history.map((item, idx) => (
          <div key={idx} className='mb-2'>
            {item.type === 'command' ? (
              <div>
                <span className='text-[#4a9eff]'>{PROMPT}</span> 
                <span className='ml-2'>{item.content}</span>
              </div>
            ) : item.type === 'welcome' ? (
              <div className='text-white text-sm font-semibold tracking-widest whitespace-pre-wrap'>
                {item.content.split(/(<name>.*?<\/name>|<help>)/g).map((part, idx) =>
                  part === '<help>' ? (
                    <span key={idx} className='text-[#ee6e4d]'>'help'</span>
                  ) : part.startsWith('<name>') && part.endsWith('</name>') ? (
                    <span key={idx} className='text-[#ee6e4d]'>{part.replace(/<\/?name>/g, '')}</span>
                  ) : (
                    <span key={idx}>{part}</span>
                  )
                )}
              </div>
            ) : (
              <div className='whitespace-pre-wrap text-sm overflow-x-auto font-mono'>
                {item.content.split(/(<cmd>[^<]+<\/cmd>)/g).map((part, idx) =>
                  part.startsWith('<cmd>') && part.endsWith('</cmd>') ? (
                    <span key={idx} className='text-white font-bold'>{part.replace(/<\/?cmd>/g, '')}</span>
                  ) : (
                    <span key={idx}>{part}</span>
                  )
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Current Input Line - sticky when scrollbar appears */}
        <div className='sticky bottom-0 flex items-center gap-2 px-1 py-0.5 bg-black rounded border border-white focus-within:border-[#ee6e4d] focus-within:shadow-md focus-within:shadow-[#ee6e4d]/30 transition-all'>
          <span className='text-[#4a9eff] whitespace-nowrap'>{PROMPT}</span>
          <input
            ref={inputRef}
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            className='flex-1 bg-black text-white font-bold outline-none border-none text-sm disabled:opacity-50 caret-[#ee6e4d]'
            placeholder=''
            autoFocus
          />
        </div>
      </div>
    </div>
  )
}

export default Terminal