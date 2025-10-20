import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const Home: React.FC = () => {
  const [_, navigate] = useLocation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-4xl text-white">movie</span>
            </div>
            
            <h1 className="text-3xl font-bold text-center font-display mb-2">AIDA</h1>
            <p className="text-lg text-center text-neutral-600 mb-6">AI Digital Assistant</p>
            
            <p className="text-center text-neutral-500 mb-8">
              Create professional videos through an intuitive interface powered by AI technology.
            </p>
            
            <div className="flex flex-col gap-3 w-full">
              <Button 
                onClick={() => navigate('/style')}
                className="w-full py-6 text-lg"
              >
                <span className="material-icons mr-2">add</span>
                Create New Video
              </Button>
              
              <Button 
                variant="outline"
                className="w-full py-6 text-lg"
              >
                <span className="material-icons mr-2">folder</span>
                Open Project
              </Button>
              
              <Button 
                variant="ghost"
                className="w-full py-6 text-lg mt-4"
                onClick={() => navigate('/ai-image-test')}
              >
                <span className="material-icons mr-2">image</span>
                AI Image Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
