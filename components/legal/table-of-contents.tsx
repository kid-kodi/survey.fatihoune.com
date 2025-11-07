'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Section {
  id: string
  title: string
}

interface LegalTableOfContentsProps {
  sections: Section[]
}

export function LegalTableOfContents({ sections }: LegalTableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0px -70% 0px',
      }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [sections])

  const handleClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile: Collapsible TOC */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-muted rounded-lg text-sm font-medium"
        >
          <span>Table of Contents</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {isOpen && (
          <nav className="mt-2 bg-muted rounded-lg p-4">
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => handleClick(section.id)}
                    className={cn(
                      'text-sm text-left w-full px-3 py-2 rounded transition-colors',
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background'
                    )}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop: Sticky Sidebar TOC */}
      <nav className="hidden lg:block sticky top-24 h-fit">
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">Table of Contents</h3>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleClick(section.id)}
                  className={cn(
                    'text-sm text-left w-full px-3 py-2 rounded transition-colors',
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  )}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}
