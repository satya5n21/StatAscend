import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
// @ts-ignore
import bgVideo from '../assets/stat_ascend_bg.webm';

export const VideoBackground = () => {
  const [videoError, setVideoError] = useState(false);
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.75; // Slow down the video to 0.75x speed
    }
  }, [videoError]); // Re-run if we switch back from iframe to video (unlikely but safe)

  const isWishPage = location.pathname === '/wish';

  return (
    <div
      className={`transition-opacity duration-1000 ${isWishPage ? 'opacity-0' : 'opacity-100'} overflow-hidden`}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, backgroundColor: 'black' }}
    >
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
      {!videoError ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          style={{ objectFit: 'cover', width: '100vw', height: '100vh' }}
          className="pointer-events-none"
          onError={() => setVideoError(true)}
        >
          <source src={bgVideo} type="video/webm" />
        </video>
      ) : (
        <iframe
          src="https://www.youtube.com/embed/Gs0rCANUMJk?autoplay=1&mute=1&loop=1&playlist=Gs0rCANUMJk&controls=0&showinfo=0&rel=0&iv_load_policy=3&start=0&end=83"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80"
        >
        </iframe>
      )}
    </div>
  );
};
