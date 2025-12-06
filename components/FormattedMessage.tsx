'use client'

import React from 'react'

interface FormattedMessageProps {
  content: string
}

export default function FormattedMessage({ content }: FormattedMessageProps) {
  // Split content into paragraphs
  const paragraphs = content.split(/\n\n+/)

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, pIndex) => {
        // Check if this paragraph contains a list (lines starting with -)
        const lines = paragraph.split('\n')
        const isList = lines.some(line => line.trim().startsWith('- '))

        if (isList) {
          // Render as a list
          const listItems = lines.filter(line => line.trim().startsWith('- '))
          const nonListContent = lines.filter(line => !line.trim().startsWith('- ')).join(' ').trim()

          return (
            <div key={pIndex}>
              {nonListContent && (
                <p className="mb-2">{formatInlineMarkdown(nonListContent)}</p>
              )}
              <ul className="space-y-2 ml-1">
                {listItems.map((item, iIndex) => (
                  <li key={iIndex} className="flex gap-2">
                    <span className="text-[#C9A227] flex-shrink-0">•</span>
                    <span>{formatInlineMarkdown(item.replace(/^-\s*/, ''))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        }

        // Check if it's a "Recommendations:" section or similar header
        if (paragraph.includes('**Recommendations:**') || paragraph.includes('**Recommendations**')) {
          const parts = paragraph.split(/\*\*Recommendations:?\*\*/)
          return (
            <div key={pIndex}>
              {parts[0] && <p className="mb-2">{formatInlineMarkdown(parts[0].trim())}</p>}
              <p className="font-semibold text-[#C9A227] mb-2">Recommendations:</p>
              {parts[1] && <p>{formatInlineMarkdown(parts[1].trim())}</p>}
            </div>
          )
        }

        // Regular paragraph
        return (
          <p key={pIndex}>{formatInlineMarkdown(paragraph)}</p>
        )
      })}
    </div>
  )
}

// Format inline markdown (bold, italic)
function formatInlineMarkdown(text: string): React.ReactNode {
  // Split by bold markers **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    // Check if this part is bold
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2)
      // Check if it looks like a title (followed by description)
      if (boldText.includes(' - ') === false && parts[index + 1]?.startsWith(' - ')) {
        return (
          <span key={index} className="font-semibold text-[#2A2A2A]">
            {boldText}
          </span>
        )
      }
      return (
        <span key={index} className="font-semibold">
          {boldText}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}


