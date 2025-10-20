import MidjourneyTester from '../components/aiImage/MidjourneyTester';

export default function AiImageTest() {
  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Test API Integrazione Midjourney</h1>
        <p className="text-muted-foreground mb-8">
          Questo modulo permette di testare l'integrazione con Midjourney tramite GoAPI.ai e verifica che la configurazione sia corretta.
        </p>
        
        <MidjourneyTester />
      </div>
    </div>
  );
}