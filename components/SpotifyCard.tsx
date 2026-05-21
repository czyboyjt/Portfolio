import React, { useEffect, useState } from 'react';
import { Music, ExternalLink } from 'lucide-react';

interface SpotifyData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumImageUrl?: string;
  songUrl?: string;
  error?: string;
}

const SpotifyCard: React.FC = () => {
  // Static data for "Ojos Tristes" by The Marías
  const data = {
    isPlaying: true,
    title: "Ojos Tristes",
    artist: "The Marías",
    albumImageUrl: "/images/Marias.png",
    songUrl: "https://open.spotify.com/track/1DFmBjoeQN9DpOVTEewyx0?si=cdaf99e5151a4f19" 
  };

  return (
    <div className="flex items-center gap-4 h-full px-5">
      <div className="relative shrink-0 group/art">
        <div className="w-20 h-20 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
          <img 
            src={data.albumImageUrl} 
            alt="Album Art" 
            className="w-full h-full object-cover group-hover/art:scale-110 transition-transform duration-700" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 items-end h-2.5">
            <div className="w-0.5 bg-[#1DB954] animate-[music-bar_0.8s_ease-in-out_infinite]"></div>
            <div className="w-0.5 bg-[#1DB954] animate-[music-bar_1.2s_ease-in-out_infinite_0.2s]"></div>
            <div className="w-0.5 bg-[#1DB954] animate-[music-bar_1s_ease-in-out_infinite_0.4s]"></div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[8px] font-black tracking-[0.3em] uppercase text-[#1DB954]">
            Now Playing
          </span>
          <span className="flex h-1 w-1 rounded-full bg-[#1DB954] animate-pulse"></span>
        </div>
        
        <h3 className="text-base md:text-lg font-display font-bold text-white truncate mb-0 group-hover:text-[#1DB954] transition-colors">
          {data.title}
        </h3>
        <p className="text-[10px] text-white/80 font-light truncate mb-2">
          {data.artist}
        </p>
        
        <a 
          href={data.songUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors group/link"
        >
          Open Spotify
          <ExternalLink className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default SpotifyCard;
