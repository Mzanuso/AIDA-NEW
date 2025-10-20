import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Music,
  Video,
  Download,
  Share2,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { StyleItem } from './StylePhase';

interface VideoPhaseProps {
  scenes: any[];
  storyContent: any;
  selectedStyle: StyleItem;
  onExport: (videoData: any) => void;
}

const VideoPhase: React.FC<VideoPhaseProps> = ({
  scenes,
  storyContent,
  selectedStyle,
  onExport
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState(storyContent.title || 'Untitled Project');
  const [selectedMusic, setSelectedMusic] = useState('');
  const [currentView, setCurrentView] = useState<'preview' | 'export'>('preview');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [finalVideo, setFinalVideo] = useState('');

  // Simulazione della riproduzione video
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Musica di esempio
  const musicTracks = [
    { id: 'track1', name: 'Cyberpunk Nights', genre: 'Electronic', duration: '2:45' },
    { id: 'track2', name: 'Ambient Dreams', genre: 'Ambient', duration: '3:12' },
    { id: 'track3', name: 'Digital Horizon', genre: 'Synthwave', duration: '2:58' },
    { id: 'track4', name: 'Neon Pulse', genre: 'Electronic', duration: '3:22' },
    { id: 'track5', name: 'Urban Echoes', genre: 'Lofi', duration: '2:36' }
  ];

  // Simulazione della generazione del video finale
  const generateFinalVideo = () => {
    setGeneratingVideo(true);
    
    // Simula il tempo di generazione
    setTimeout(() => {
      setGeneratingVideo(false);
      setVideoReady(true);
      setFinalVideo('https://picsum.photos/800/450'); // URL segnaposto per il video
    }, 3000);
  };

  const exportVideo = () => {
    onExport({
      title,
      scenes,
      style: selectedStyle,
      musicTrack: selectedMusic,
      videoUrl: finalVideo
    });
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="min-h-screen bg-aida-dark overflow-y-auto">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-aida-light-gray">{selectedStyle.name} style • {scenes.length} scenes</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-aida-gray text-aida-light-gray hover:bg-aida-gray/50"
                onClick={() => setCurrentView('preview')}
              >
                Preview
              </Button>
              <Button 
                className="bg-aida-blue text-white"
                onClick={() => setCurrentView('export')}
              >
                Export
              </Button>
            </div>
          </div>
        </div>
        
        {currentView === 'preview' ? (
          <div>
            {/* Video player */}
            <div className="aspect-video bg-aida-gray/30 rounded-lg overflow-hidden relative mb-4">
              {/* Video preview - in una versione reale qui ci sarebbe un vero player video */}
              <div className="absolute inset-0 flex items-center justify-center">
                {scenes[Math.floor((progress / 100) * scenes.length)]?.imageUrl && (
                  <img 
                    src={scenes[Math.floor((progress / 100) * scenes.length)]?.imageUrl} 
                    alt="Current scene"
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Overlay di controllo */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="w-full p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={togglePlay} className="text-white">
                        {isPlaying ? <Pause /> : <Play />}
                      </button>
                      <div className="flex-grow">
                        <Slider 
                          value={[progress]} 
                          max={100} 
                          step={1}
                          onValueChange={(val) => setProgress(val[0])}
                          className="cursor-pointer"
                        />
                      </div>
                      <button onClick={toggleMute} className="text-white">
                        {isMuted ? <VolumeX /> : <Volume2 />}
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-aida-light-gray">
                      <div>
                        {Math.floor(progress / 100 * 60)}:{String(Math.floor((progress / 100 * 60) % 60)).padStart(2, '0')}
                      </div>
                      <div>1:00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scene timeline */}
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-2">Timeline</h3>
              <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className={`flex-shrink-0 w-32 h-18 rounded overflow-hidden border-2 ${
                      index === Math.floor((progress / 100) * scenes.length) 
                        ? 'border-aida-blue' 
                        : 'border-transparent'
                    }`}
                    onClick={() => setProgress(Math.floor((index / scenes.length) * 100))}
                  >
                    <img 
                      src={scene.imageUrl} 
                      alt={scene.description}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Audio tracks */}
            <div>
              <h3 className="text-sm font-medium mb-3">Background Music</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {musicTracks.map(track => (
                  <div 
                    key={track.id}
                    className={`p-3 rounded-lg border ${
                      selectedMusic === track.id
                        ? 'border-aida-blue bg-aida-blue/10'
                        : 'border-aida-gray/30 bg-aida-gray/20 hover:bg-aida-gray/30'
                    } cursor-pointer flex items-center gap-3`}
                    onClick={() => setSelectedMusic(track.id)}
                  >
                    <div className="w-8 h-8 bg-aida-gray/50 rounded flex items-center justify-center">
                      <Music size={14} />
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-medium">{track.name}</div>
                      <div className="text-xs text-aida-light-gray">{track.genre} • {track.duration}</div>
                    </div>
                    {selectedMusic === track.id && (
                      <div className="w-4 h-4 bg-aida-blue rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Video export view */}
            <div className="bg-aida-gray/30 rounded-lg p-6 mb-6">
              <div className="mb-6">
                <label className="text-sm text-aida-light-gray mb-1 block">Project Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-aida-gray/50 border-aida-gray text-aida-white"
                />
              </div>
              
              <Tabs defaultValue="video">
                <TabsList className="bg-aida-gray/50 border-aida-gray/30">
                  <TabsTrigger value="video">Video</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                  <TabsTrigger value="downloads">Downloads</TabsTrigger>
                </TabsList>
                
                <TabsContent value="video" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Resolution</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="border border-aida-blue rounded-lg p-2 text-center bg-aida-blue/10">
                            <span className="text-xs">1080p HD</span>
                          </div>
                          <div className="border border-aida-gray/30 rounded-lg p-2 text-center">
                            <span className="text-xs">4K UHD</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Aspect Ratio</h3>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="border border-aida-blue rounded-lg p-2 text-center bg-aida-blue/10">
                            <span className="text-xs">16:9</span>
                          </div>
                          <div className="border border-aida-gray/30 rounded-lg p-2 text-center">
                            <span className="text-xs">9:16</span>
                          </div>
                          <div className="border border-aida-gray/30 rounded-lg p-2 text-center">
                            <span className="text-xs">1:1</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-1">Format</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="border border-aida-blue rounded-lg p-2 text-center bg-aida-blue/10">
                            <span className="text-xs">MP4</span>
                          </div>
                          <div className="border border-aida-gray/30 rounded-lg p-2 text-center">
                            <span className="text-xs">MOV</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-aida-gray/20 rounded-lg p-4 flex flex-col items-center justify-center">
                      {!videoReady ? (
                        <>
                          {generatingVideo ? (
                            <div className="text-center">
                              <div className="w-16 h-16 border-4 border-aida-blue/30 border-t-aida-blue rounded-full animate-spin mb-4 mx-auto"></div>
                              <p className="text-aida-light-gray mb-2">Rendering your video...</p>
                              <div className="w-full bg-aida-gray/40 rounded-full h-2 mb-1">
                                <motion.div 
                                  className="bg-aida-blue h-2 rounded-full"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 3 }}
                                ></motion.div>
                              </div>
                              <p className="text-xs text-aida-light-gray">This may take a few minutes</p>
                            </div>
                          ) : (
                            <>
                              <Video size={48} className="text-aida-gray/50 mb-4" />
                              <p className="text-aida-light-gray mb-4">Ready to generate your final video</p>
                              <Button 
                                onClick={generateFinalVideo}
                                className="bg-aida-magenta text-white"
                              >
                                Generate Video
                              </Button>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="relative w-full aspect-video rounded overflow-hidden mb-4">
                            <img 
                              src={finalVideo} 
                              alt="Final video"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play size={48} className="text-white" />
                            </div>
                          </div>
                          <p className="text-aida-light-gray mb-4">Your video is ready!</p>
                          <div className="flex gap-2">
                            <Button variant="outline" className="border-aida-gray text-aida-light-gray">
                              <Download size={16} className="mr-2" />
                              Download
                            </Button>
                            <Button className="bg-aida-blue text-white">
                              <Share2 size={16} className="mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="social" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-aida-gray/30 rounded-lg p-4 hover:border-aida-gray">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-aida-gray/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="text-lg">YT</i>
                        </div>
                        <h3 className="font-medium mb-1">YouTube</h3>
                        <p className="text-xs text-aida-light-gray mb-3">Share directly to your channel</p>
                        <Button variant="outline" size="sm" className="w-full border-aida-gray/30 text-aida-light-gray">
                          Connect
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border border-aida-gray/30 rounded-lg p-4 hover:border-aida-gray">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-aida-gray/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="text-lg">IG</i>
                        </div>
                        <h3 className="font-medium mb-1">Instagram</h3>
                        <p className="text-xs text-aida-light-gray mb-3">Post or add to your story</p>
                        <Button variant="outline" size="sm" className="w-full border-aida-gray/30 text-aida-light-gray">
                          Connect
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border border-aida-gray/30 rounded-lg p-4 hover:border-aida-gray">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-aida-gray/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="text-lg">TT</i>
                        </div>
                        <h3 className="font-medium mb-1">TikTok</h3>
                        <p className="text-xs text-aida-light-gray mb-3">Share to your TikTok account</p>
                        <Button variant="outline" size="sm" className="w-full border-aida-gray/30 text-aida-light-gray">
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="downloads" className="mt-4">
                  <div className="space-y-3">
                    <div className="border border-aida-gray/30 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-aida-gray/20 rounded flex items-center justify-center">
                          <Video size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Final Video</div>
                          <div className="text-xs text-aida-light-gray">MP4 • 1080p • 16:9</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-aida-gray/30">
                        <Download size={14} className="mr-1" /> Download
                      </Button>
                    </div>
                    
                    <div className="border border-aida-gray/30 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-aida-gray/20 rounded flex items-center justify-center">
                          <Music size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Audio Track</div>
                          <div className="text-xs text-aida-light-gray">MP3 • Stereo • 320kbps</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-aida-gray/30">
                        <Download size={14} className="mr-1" /> Download
                      </Button>
                    </div>
                    
                    <div className="border border-aida-gray/30 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-aida-gray/20 rounded flex items-center justify-center">
                          <Save size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Project File</div>
                          <div className="text-xs text-aida-light-gray">AIDA format • Editable</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-aida-gray/30">
                        <Download size={14} className="mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={exportVideo}
                disabled={!videoReady}
                className="bg-aida-magenta text-white px-8"
              >
                Finish & Export
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPhase;