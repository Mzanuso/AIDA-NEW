import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';

const SrefManager: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [srefCode, setSrefCode] = useState<string>('');
  const [jsonContent, setJsonContent] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [srefCodes, setSrefCodes] = useState<string[]>([]);
  const [selectedSref, setSelectedSref] = useState<string | null>(null);
  const [srefDetails, setSrefDetails] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Fetch all available SREF codes on mount
    fetchSrefCodes();
  }, []);
  
  const fetchSrefCodes = async () => {
    try {
      const response = await fetch('/api/sref');
      if (response.ok) {
        const data = await response.json();
        setSrefCodes(data.srefCodes || []);
      }
    } catch (error) {
      console.error('Failed to fetch SREF codes', error);
    }
  };
  
  const fetchSrefDetails = async (code: string) => {
    try {
      const response = await fetch(`/api/sref/${code}`);
      if (response.ok) {
        const data = await response.json();
        setSrefDetails(data);
      } else {
        toast({
          title: 'Error',
          description: `Failed to fetch details for SREF ${code}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error(`Failed to fetch SREF ${code} details`, error);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result?.toString() || '';
        // Try to parse JSON to check if it's valid
        JSON.parse(content);
        setJsonContent(content);
        setJsonError(null);
      } catch (error) {
        setJsonError('Invalid JSON file. Please check the file format.');
        setJsonContent('');
      }
    };
    reader.readAsText(file);
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (!srefCode) {
      toast({
        title: 'Error',
        description: 'Please enter a SREF code before uploading images',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Create a FormData object to upload multiple files
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      
      // Upload images to the server
      const response = await fetch(`/api/sref/${srefCode}/images`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: `Uploaded ${files.length} images for SREF ${srefCode}`
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload images');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: 'destructive'
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!srefCode) {
      toast({
        title: 'Error',
        description: 'Please enter a SREF code',
        variant: 'destructive'
      });
      return;
    }
    
    if (!jsonContent) {
      toast({
        title: 'Error',
        description: 'Please upload a JSON analysis file',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setUploadStatus('uploading');
      
      // Parse JSON to make sure it's valid
      const parsedJson = JSON.parse(jsonContent);
      
      // Upload the JSON analysis
      const response = await fetch(`/api/sref/${srefCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedJson)
      });
      
      if (response.ok) {
        setUploadStatus('success');
        toast({
          title: 'Success',
          description: `SREF ${srefCode} data uploaded successfully`
        });
        
        // Clear form fields
        setSrefCode('');
        setJsonContent('');
        
        // Refresh the SREF codes list
        fetchSrefCodes();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload SREF data');
      }
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload SREF data',
        variant: 'destructive'
      });
    }
  };
  
  const handleSrefSelect = (code: string) => {
    setSelectedSref(code);
    fetchSrefDetails(code);
  };
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 font-display">SREF Manager</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload SREF</TabsTrigger>
            <TabsTrigger value="browse">Browse SREF</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload SREF Data</CardTitle>
                <CardDescription>
                  Add new Style References to the system by uploading analysis JSON files and images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="sref-code">SREF Code</Label>
                    <Input 
                      id="sref-code" 
                      placeholder="e.g., 96616859" 
                      value={srefCode}
                      onChange={(e) => setSrefCode(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      The unique identifier for this style reference
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="json-file">Analysis JSON File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="json-file"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse
                      </Button>
                    </div>
                    {jsonError && (
                      <p className="text-sm text-destructive">{jsonError}</p>
                    )}
                    {jsonContent && (
                      <div className="mt-2">
                        <Label>JSON Preview</Label>
                        <Textarea
                          value={jsonContent}
                          onChange={(e) => setJsonContent(e.target.value)}
                          className="font-mono text-xs h-40"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image-files">Style Images (Optional)</Label>
                    <Input
                      id="image-files"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload reference images for this style. Name format should be sref_CODE_XXX.png
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={uploadStatus === 'uploading'}
                  >
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload SREF Data'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="browse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>SREF Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  {srefCodes.length > 0 ? (
                    <div className="space-y-2">
                      {srefCodes.map((code) => (
                        <Button
                          key={code}
                          variant={selectedSref === code ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => handleSrefSelect(code)}
                        >
                          {code}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No SREF codes found</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>SREF Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {srefDetails ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Analysis Data</h3>
                        <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-60">
                          {JSON.stringify(srefDetails.analysis, null, 2)}
                        </pre>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Images</h3>
                        {srefDetails.images && srefDetails.images.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {srefDetails.images.map((url: string, index: number) => (
                              <div key={index} className="aspect-square rounded-md overflow-hidden">
                                <img 
                                  src={url} 
                                  alt={`SREF ${srefDetails.code} image ${index}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No images found</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40">
                      <p className="text-muted-foreground">
                        {selectedSref 
                          ? `Loading details for SREF ${selectedSref}...` 
                          : 'Select a SREF code to view details'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SrefManager;