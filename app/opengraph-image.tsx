import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Weave - A cultural journal for everything that moves you'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF8F5',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Bobbin ears icon */}
        <svg
          viewBox="0 0 80 80"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          width={160}
          height={160}
          style={{ marginBottom: 24 }}
        >
          {/* Hole shadow/rim */}
          <ellipse cx="40" cy="58" rx="28" ry="10" fill="#E8E5E0" />
          {/* Hole opening */}
          <ellipse cx="40" cy="56" rx="22" ry="7" fill="#1E3A5F" />
          {/* Left ear */}
          <ellipse cx="32" cy="42" rx="6" ry="16" fill="#1E3A5F" />
          <ellipse cx="32" cy="42" rx="3" ry="10" fill="#E8E5E0" />
          {/* Right ear */}
          <ellipse cx="48" cy="42" rx="6" ry="16" fill="#1E3A5F" />
          <ellipse cx="48" cy="42" rx="3" ry="10" fill="#E8E5E0" />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 500,
            color: '#2A2A2A',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          weave
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: '#4A4A4A',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          A cultural journal for everything that moves you
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 80,
            height: 4,
            backgroundColor: '#C9A227',
            marginTop: 32,
            borderRadius: 2,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}

