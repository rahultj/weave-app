import React from 'react';

const getTypeStyle = (type) => ({
  book: { color: '#4A5568', icon: '◎' },
  film: { color: '#C85A5A', icon: '▷' },
  album: { color: '#C9A227', icon: '♫' },
}[type] || { color: '#888', icon: '✦' });

const artifact = {
  title: "The Crying of Lot 49",
  creator: "Thomas Pynchon",
  type: "book",
  year: 1966,
  insight: "Housewife investigates underground postal conspiracy, exploring the search for meaning in overwhelming modern America.",
  conversationDate: "Dec 6"
};

// Final: Compact card for artifacts without images
const CompactArtifactCard = ({ artifact }) => {
  const typeStyle = getTypeStyle(artifact.type);
  
  return (
    <div className="bg-[#F7F5F1] rounded-xl border border-[#E8E5E0] p-4 hover:shadow-sm transition-all cursor-pointer">
      <div className="flex gap-3">
        {/* Type badge */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
          style={{ backgroundColor: typeStyle.color }}
        >
          {typeStyle.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-medium mb-0.5" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            {artifact.title}
          </h3>
          <p className="text-[13px] text-[#666] mb-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
            {artifact.creator} · {artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)} · {artifact.year}
          </p>
          <p 
            className="text-sm text-[#555] leading-relaxed line-clamp-2"
            style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
          >
            {artifact.insight}
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#E8E5E0]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span 
          className="text-xs text-[#888]"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
        >
          From conversation on {artifact.conversationDate}
        </span>
      </div>
    </div>
  );
};

export default function FinalCard() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#FAF8F5' }}>
      <h1 className="text-xl font-medium mb-6 text-[#2A2A2A]" style={{ fontFamily: 'Georgia, serif' }}>
        Final: Compact Card (No Image)
      </h1>
      
      <div className="max-w-md">
        <CompactArtifactCard artifact={artifact} />
      </div>
      
      <div className="mt-8 p-4 bg-white/50 rounded-lg border border-[#E8E5E0] max-w-md text-xs text-[#666] space-y-2">
        <p><strong className="text-[#444]">Usage:</strong> Render this variant when <code className="bg-[#E8E5E0] px-1 rounded">!artifact.image_url</code></p>
        <p><strong className="text-[#444]">Height:</strong> ~140px vs ~320px for image cards</p>
      </div>
    </div>
  );
}
