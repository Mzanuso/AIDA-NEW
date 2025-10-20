import React, { useState } from 'react';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';
import ModuleNavigation from '@/components/ui/ModuleNavigation';
import ModuleContent from '@/components/ui/ModuleContent';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Settings, 
  Download, 
  Share, 
  Layers, 
  Eye, 
  EyeOff, 
  Music, 
  Volume2,
  PlusCircle,
  Clapperboard,
  FilmIcon,
  Subtitles,
  Text,
  Save
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimelineClip {
  id: string;
  type: 'video' | 'image' | 'text' | 'audio';
  name: string;
  start: number;
  duration: number;
  trackIndex: number;
  color?: string;
}

const VideoPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(120); // 2 minutes in seconds
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [resolution, setResolution] = useState<string>('1080p');
  const [fps, setFps] = useState<string>('30');
  const [exportFormat, setExportFormat] = useState<string>('mp4');
  const [layersVisible, setLayersVisible] = useState<boolean>(true);
  const [renderingVideo, setRenderingVideo] = useState<boolean>(false);
  
  // Timeline clips
  const [clips, setClips] = useState<TimelineClip[]>([
    {
      id: '1',
      type: 'video',
      name: 'Intro Sequence',
      start: 0,
      duration: 15,
      trackIndex: 0,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      type: 'video',
      name: 'Main Segment',
      start: 15,
      duration: 45,
      trackIndex: 0,
      color: 'bg-green-500'
    },
    {
      id: '3',
      type: 'video',
      name: 'Closing Sequence',
      start: 60,
      duration: 30,
      trackIndex: 0,
      color: 'bg-amber-500'
    },
    {
      id: '4',
      type: 'audio',
      name: 'Background Music',
      start: 0,
      duration: 90,
      trackIndex: 1,
      color: 'bg-purple-500'
    },
    {
      id: '5',
      type: 'text',
      name: 'Title Overlay',
      start: 5,
      duration: 10,
      trackIndex: 2,
      color: 'bg-red-500'
    }
  ]);
  
  // Formattare il tempo in MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Controllare il player
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleRewind = () => {
    setCurrentTime(Math.max(0, currentTime - 10));
  };
  
  const handleForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 10));
  };
  
  // Renderizzare il video
  const handleRenderVideo = () => {
    setRenderingVideo(true);
    // Simuliamo il rendering
    setTimeout(() => {
      setRenderingVideo(false);
      alert('Video has been rendered successfully!');
    }, 3000);
  };
  
  // Calcolare la posizione dei clip sulla timeline
  const getClipPosition = (clip: TimelineClip): string => {
    const startPercentage = (clip.start / duration) * 100;
    const widthPercentage = (clip.duration / duration) * 100;
    return `left-[${startPercentage}%] w-[${widthPercentage}%]`;
  };

  return (
    <BackgroundAnimation color="teal">
      <ModuleNavigation currentModule="video" />
      <ModuleContent color="teal">
        <div className="flex items-center gap-3 mb-6">
          <Video size={24} className="text-teal-400" />
          <h1 className="text-2xl font-light">Video Editor</h1>
        </div>
        
        <div className="space-y-6">
          {/* Preview del video */}
          <div className="aspect-video bg-black/60 rounded-lg overflow-hidden relative">
            {/* Placeholder per il video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <FilmIcon className="h-24 w-24 text-teal-800/40" />
            </div>
            
            {/* Controlli overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress bar */}
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  className="cursor-pointer"
                  onValueChange={(value) => setCurrentTime(value[0])}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Controlli Player */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                    <SkipBack className="h-5 w-5" onClick={handleRewind} />
                  </Button>
                  
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 h-10 w-10 rounded-full flex items-center justify-center"
                    size="icon"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </Button>
                  
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                    <SkipForward className="h-5 w-5" onClick={handleForward} />
                  </Button>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Volume2 className="h-4 w-4 text-gray-400" />
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      className="w-24 cursor-pointer"
                      onValueChange={(value) => setVolume(value[0])}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-300 hover:text-white"
                    onClick={() => setLayersVisible(!layersVisible)}
                  >
                    {layersVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </Button>
                  
                  <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline e tracce */}
          <div className="bg-black/40 rounded-lg border border-gray-800 overflow-hidden">
            <div className="flex justify-between items-center p-3 bg-gray-900">
              <h3 className="text-sm font-medium">Timeline</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add Track
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add Media
                </Button>
              </div>
            </div>
            
            {/* Timeline ruler */}
            <div className="h-6 border-b border-gray-800 relative px-3">
              {/* Time markers */}
              {Array.from({ length: Math.ceil(duration / 15) + 1 }).map((_, index) => (
                <div 
                  key={index} 
                  className="absolute top-0 bottom-0 flex items-center justify-center"
                  style={{ left: `${(index * 15 / duration) * 100}%` }}
                >
                  <div className="h-2 w-px bg-gray-600"></div>
                  <span className="text-[10px] text-gray-500 absolute -bottom-1">
                    {formatTime(index * 15)}
                  </span>
                </div>
              ))}
              
              {/* Playhead */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-teal-500 z-10"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              >
                <div className="h-2 w-2 rounded-full bg-teal-500 absolute -top-1 -ml-1"></div>
              </div>
            </div>
            
            {/* Tracks */}
            <div className="relative">
              {/* Video track */}
              <div className="h-14 border-b border-gray-800 flex">
                <div className="w-32 p-2 border-r border-gray-800 bg-gray-900/50 flex items-center gap-2">
                  <Clapperboard className="h-4 w-4 text-teal-400" />
                  <span className="text-xs">Video</span>
                </div>
                
                <div className="flex-1 relative p-2">
                  {clips.filter(clip => clip.trackIndex === 0).map(clip => (
                    <div 
                      key={clip.id}
                      className={`absolute h-10 ${clip.color || 'bg-blue-600'} rounded px-2 flex items-center text-xs font-medium cursor-move`}
                      style={{ 
                        left: `${(clip.start / duration) * 100}%`, 
                        width: `${(clip.duration / duration) * 100}%` 
                      }}
                    >
                      {clip.name}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Audio track */}
              <div className="h-14 border-b border-gray-800 flex">
                <div className="w-32 p-2 border-r border-gray-800 bg-gray-900/50 flex items-center gap-2">
                  <Music className="h-4 w-4 text-purple-400" />
                  <span className="text-xs">Audio</span>
                </div>
                
                <div className="flex-1 relative p-2">
                  {clips.filter(clip => clip.trackIndex === 1).map(clip => (
                    <div 
                      key={clip.id}
                      className={`absolute h-10 ${clip.color || 'bg-purple-600'} rounded px-2 flex items-center text-xs font-medium cursor-move`}
                      style={{ 
                        left: `${(clip.start / duration) * 100}%`, 
                        width: `${(clip.duration / duration) * 100}%` 
                      }}
                    >
                      {clip.name}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Text/Overlay track */}
              <div className="h-14 border-b border-gray-800 flex">
                <div className="w-32 p-2 border-r border-gray-800 bg-gray-900/50 flex items-center gap-2">
                  <Text className="h-4 w-4 text-red-400" />
                  <span className="text-xs">Text</span>
                </div>
                
                <div className="flex-1 relative p-2">
                  {clips.filter(clip => clip.trackIndex === 2).map(clip => (
                    <div 
                      key={clip.id}
                      className={`absolute h-10 ${clip.color || 'bg-red-600'} rounded px-2 flex items-center text-xs font-medium cursor-move`}
                      style={{ 
                        left: `${(clip.start / duration) * 100}%`, 
                        width: `${(clip.duration / duration) * 100}%` 
                      }}
                    >
                      {clip.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Impostazioni e export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/30 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Export Settings</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resolution">Resolution</Label>
                      <Select value={resolution} onValueChange={setResolution}>
                        <SelectTrigger className="bg-black/20 border-gray-700">
                          <SelectValue placeholder="Select resolution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">720p (HD)</SelectItem>
                          <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                          <SelectItem value="2160p">2160p (4K)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fps">Frame Rate</Label>
                      <Select value={fps} onValueChange={setFps}>
                        <SelectTrigger className="bg-black/20 border-gray-700">
                          <SelectValue placeholder="Select frame rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 fps (Film)</SelectItem>
                          <SelectItem value="30">30 fps (Standard)</SelectItem>
                          <SelectItem value="60">60 fps (Smooth)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger className="bg-black/20 border-gray-700">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                        <SelectItem value="mov">MOV (ProRes)</SelectItem>
                        <SelectItem value="webm">WebM (VP9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black/30 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Advanced Options</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Subtitles className="h-4 w-4 text-teal-400" />
                      <Label htmlFor="subtitles">Include Subtitles</Label>
                    </div>
                    <Switch id="subtitles" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-teal-400" />
                      <Label htmlFor="chapters">Include Chapters</Label>
                    </div>
                    <Switch id="chapters" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-teal-400" />
                      <Label htmlFor="quality">High Quality</Label>
                    </div>
                    <Switch id="quality" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Pulsanti di azione */}
          <div className="flex justify-between">
            <Button variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Save Project
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Share className="h-4 w-4" />
                Share
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              
              <Button 
                className="bg-teal-600 hover:bg-teal-700 gap-2"
                disabled={renderingVideo}
                onClick={handleRenderVideo}
              >
                {renderingVideo ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Rendering...
                  </>
                ) : (
                  <>
                    <FilmIcon className="h-4 w-4" />
                    Render Video
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </ModuleContent>
    </BackgroundAnimation>
  );
};

export default VideoPage;