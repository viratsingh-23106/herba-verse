import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import { VideoTexture, SRGBColorSpace, BackSide } from 'three';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoHotspot {
  id: string;
  timestamp_seconds: number;
  title_en: string;
  title_hi?: string;
  content_en?: string;
  content_hi?: string;
  position_x: number;
  position_y: number;
  position_z: number;
  hotspot_type: 'info' | 'plant' | 'quiz' | 'navigation';
  target_plant_id?: string;
}

interface VR360VideoPlayerProps {
  videoUrl: string;
  title: string;
  description?: string;
  hotspots?: VideoHotspot[];
  onHotspotClick?: (hotspot: VideoHotspot) => void;
  autoPlay?: boolean;
}

export const VR360VideoPlayer: React.FC<VR360VideoPlayerProps> = ({
  videoUrl,
  title,
  description,
  hotspots = [],
  onHotspotClick,
  autoPlay = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTexture, setVideoTexture] = useState<VideoTexture | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const { camera } = useThree();

  // Active hotspots based on current video time
  const activeHotspots = hotspots.filter(
    hotspot => Math.abs(hotspot.timestamp_seconds - currentTime) < 2
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      if (autoPlay) {
        video.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    };

    // Handle YouTube and other video URLs
    const processVideoUrl = (url: string) => {
      // Convert YouTube URLs to embed format
      if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
        const videoId = url.includes('youtu.be/') 
          ? url.split('youtu.be/')[1].split('?')[0]
          : url.split('v=')[1]?.split('&')[0];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&loop=1&playlist=${videoId}`;
        }
      }
      return url;
    };

    // Set the processed video URL
    video.src = processVideoUrl(videoUrl);

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      const texture = new VideoTexture(video);
      texture.colorSpace = SRGBColorSpace;
      setVideoTexture(texture);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleError = () => {
      setError('Failed to load video. Please try again.');
      setIsLoading(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [autoPlay]);

  useFrame(() => {
    if (videoTexture && videoRef.current) {
      videoTexture.needsUpdate = true;
    }
  });

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
  };

  const resetView = () => {
    camera.rotation.set(0, 0, 0);
    camera.position.set(0, 0, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <group>
        <Html center>
          <div className="bg-destructive/90 text-destructive-foreground p-4 rounded-lg backdrop-blur-sm">
            <p className="text-center mb-2">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="bg-background/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group>
      {/* Hidden video element */}
      <Html>
        <video
          ref={videoRef}
          src={videoUrl}
          crossOrigin="anonymous"
          playsInline
          style={{ display: 'none' }}
          preload="metadata"
        />
      </Html>

      {/* 360° Video Sphere */}
      {videoTexture && (
        <Sphere args={[50, 64, 32]} rotation={[0, Math.PI, 0]}>
          <meshBasicMaterial 
            map={videoTexture} 
            side={BackSide}
            toneMapped={false}
          />
        </Sphere>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Html center>
          <div className="bg-primary/90 text-primary-foreground p-6 rounded-lg backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-foreground mx-auto mb-4"></div>
            <p className="text-center">Loading 360° Video...</p>
          </div>
        </Html>
      )}

      {/* Video Controls */}
      {!isLoading && (
        <Html
          position={[0, -8, -15]}
          transform
          occlude
          style={{ 
            width: '600px', 
            height: '200px',
            pointerEvents: 'auto'
          }}
        >
          <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg border">
            {/* Title and Description */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div 
                className="w-full bg-muted h-2 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const progress = (e.clientX - rect.left) / rect.width;
                  seekTo(progress * duration);
                }}
              >
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-150"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className="flex items-center gap-2"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset View
              </Button>
            </div>
          </div>
        </Html>
      )}

      {/* Interactive Hotspots */}
      {activeHotspots.map((hotspot) => (
        <group key={hotspot.id} position={[hotspot.position_x, hotspot.position_y, hotspot.position_z]}>
          <Html>
            <div 
              className="relative cursor-pointer"
              onClick={() => onHotspotClick?.(hotspot)}
            >
              <div className="w-8 h-8 bg-primary rounded-full animate-pulse border-2 border-primary-foreground shadow-lg">
                <div className="w-full h-full rounded-full bg-primary animate-ping"></div>
              </div>
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg min-w-48">
                <h4 className="font-semibold text-sm mb-1">
                  {language === 'hi' ? hotspot.title_hi : hotspot.title_en}
                </h4>
                {hotspot.content_en && (
                  <p className="text-xs text-muted-foreground">
                    {language === 'hi' ? hotspot.content_hi : hotspot.content_en}
                  </p>
                )}
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};