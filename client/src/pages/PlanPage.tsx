import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Check, Zap, Star, Crown, Lightbulb, ChevronRight, ArrowLeft, Coins } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NewAidaLogoAnimation from '@/components/ui/NewAidaLogoAnimation';

// Variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100
    }
  }
};

const planBackgrounds = {
  free: "bg-gray-900/50",
  basic: "bg-gradient-to-b from-blue-900/30 to-sky-800/20",
  pro: "bg-gradient-to-b from-aida-magenta/20 to-purple-800/20",
  enterprise: "bg-gradient-to-b from-amber-900/30 to-yellow-800/20"
};

const planHeaders = {
  free: "bg-gray-800/50",
  basic: "bg-blue-800/40",
  pro: "bg-aida-magenta/40",
  enterprise: "bg-amber-800/40"
};

const planBorders = {
  free: "border-gray-700/50",
  basic: "border-blue-700/50",
  pro: "border-aida-magenta/50",
  enterprise: "border-amber-700/50"
};

interface PlanFeature {
  title: string;
  plans: {
    free: boolean | string;
    basic: boolean | string;
    pro: boolean | string;
    enterprise: boolean | string;
  }
}

const features: PlanFeature[] = [
  {
    title: "Video Generation",
    plans: {
      free: "2 per month",
      basic: "15 per month",
      pro: "50 per month",
      enterprise: "Unlimited"
    }
  },
  {
    title: "Video Resolution",
    plans: {
      free: "720p",
      basic: "1080p",
      pro: "1080p",
      enterprise: "4K"
    }
  },
  {
    title: "Max Video Duration",
    plans: {
      free: "30 sec",
      basic: "2 min",
      pro: "5 min",
      enterprise: "15 min"
    }
  },
  {
    title: "Style Module",
    plans: {
      free: true,
      basic: true,
      pro: true,
      enterprise: true
    }
  },
  {
    title: "Script Module",
    plans: {
      free: true,
      basic: true,
      pro: true,
      enterprise: true
    }
  },
  {
    title: "Cast Module",
    plans: {
      free: false,
      basic: true,
      pro: true,
      enterprise: true
    }
  },
  {
    title: "Storyboard Module",
    plans: {
      free: false,
      basic: false,
      pro: true,
      enterprise: true
    }
  },
  {
    title: "Custom Brand Assets",
    plans: {
      free: false,
      basic: false,
      pro: true,
      enterprise: true
    }
  },
  {
    title: "AI Characters Templates",
    plans: {
      free: "2",
      basic: "10",
      pro: "50+",
      enterprise: "Unlimited"
    }
  },
  {
    title: "Priority Rendering",
    plans: {
      free: false,
      basic: false,
      pro: true,
      enterprise: true
    }
  },
  {
    title: "API Access",
    plans: {
      free: false,
      basic: false,
      pro: false,
      enterprise: true
    }
  },
  {
    title: "Team Members",
    plans: {
      free: "1",
      basic: "2",
      pro: "5",
      enterprise: "Unlimited"
    }
  },
  {
    title: "Dedicated Support",
    plans: {
      free: false,
      basic: false,
      pro: true,
      enterprise: true
    }
  }
];

const PlanPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header with back button and logo */}
      <header className="flex justify-between items-center h-14 px-4 border-b border-gray-800 relative">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <ArrowLeft size={18} className="text-gray-400" />
            </Button>
          </Link>
          <Link href="/" className="flex items-center">
            <NewAidaLogoAnimation size={32} className="p-0.5" />
          </Link>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <h1 className="text-xl font-light">Subscription Plans</h1>
        </div>
        
        <div className="flex items-center">
          <Badge className="bg-gradient-to-r from-red-500 to-aida-magenta border-0 text-white rounded-full px-3 font-light flex items-center gap-1">
            <Coins size={12} className="mr-0.5" />
            262
          </Badge>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Hero section */}
        <motion.div 
          className="text-center mb-12 mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-light mb-4">Choose Your Creative Path</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Unlock the full potential of AIDA with a plan that fits your creative needs
          </p>
        </motion.div>

        {/* Plan cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Free Plan */}
          <motion.div 
            className={`relative rounded-lg overflow-hidden border ${planBorders.free} ${selectedPlan === 'free' ? 'ring-2 ring-white/30' : ''}`}
            variants={itemVariants}
          >
            <div className={`p-5 ${planHeaders.free}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Free</h3>
                <Lightbulb className="text-gray-400" size={20} />
              </div>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-light">$0</span>
                <span className="text-gray-400 ml-1">/month</span>
              </div>
              <p className="text-sm text-gray-300">Start creating with essential features</p>
            </div>
            <div className={`p-5 ${planBackgrounds.free}`}>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>2 video generations per month</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Up to 30 second videos</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Basic style & script tools</span>
                </li>
              </ul>
              <Button 
                onClick={() => setSelectedPlan('free')}
                className={`w-full bg-gray-700 hover:bg-gray-600 ${selectedPlan === 'free' ? 'bg-white/20' : ''}`}
              >
                {selectedPlan === 'free' ? 'Current Plan' : 'Select Plan'}
              </Button>
            </div>
          </motion.div>

          {/* Basic Plan */}
          <motion.div 
            className={`relative rounded-lg overflow-hidden border ${planBorders.basic} ${selectedPlan === 'basic' ? 'ring-2 ring-blue-400/50' : ''}`}
            variants={itemVariants}
          >
            <div className={`p-5 ${planHeaders.basic}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Basic</h3>
                <Zap className="text-blue-400" size={20} />
              </div>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-light">$12</span>
                <span className="text-gray-400 ml-1">/month</span>
              </div>
              <p className="text-sm text-gray-300">Perfect for individual creators</p>
            </div>
            <div className={`p-5 ${planBackgrounds.basic}`}>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>15 video generations per month</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Up to 2 minute videos</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Cast & character customization</span>
                </li>
              </ul>
              <Button 
                onClick={() => setSelectedPlan('basic')}
                className={`w-full bg-blue-700 hover:bg-blue-600 ${selectedPlan === 'basic' ? 'bg-blue-500/50' : ''}`}
              >
                {selectedPlan === 'basic' ? 'Current Plan' : 'Select Plan'}
              </Button>
            </div>
          </motion.div>

          {/* Pro Plan - Highlighted */}
          <motion.div 
            className={`relative rounded-lg overflow-hidden border ${planBorders.pro} ${selectedPlan === 'pro' ? 'ring-2 ring-aida-magenta/70' : ''} transform md:scale-105 z-10 shadow-lg shadow-aida-magenta/10`}
            variants={itemVariants}
          >
            <div className="absolute top-0 right-0 bg-aida-magenta px-3 py-1 rounded-bl-lg text-xs font-medium z-10">
              POPULAR
            </div>
            <div className={`p-5 ${planHeaders.pro} pt-8`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Pro</h3>
                <Star className="text-aida-magenta" size={20} />
              </div>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-light">$49</span>
                <span className="text-gray-400 ml-1">/month</span>
              </div>
              <p className="text-sm text-gray-300">Ideal for serious content creators</p>
            </div>
            <div className={`p-5 ${planBackgrounds.pro}`}>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>50 video generations per month</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Up to 5 minute videos</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>All modules & priority rendering</span>
                </li>
              </ul>
              <Button 
                onClick={() => setSelectedPlan('pro')}
                className={`w-full bg-aida-magenta hover:bg-aida-magenta/80 ${selectedPlan === 'pro' ? 'bg-white/30' : ''}`}
              >
                {selectedPlan === 'pro' ? 'Current Plan' : 'Select Plan'}
              </Button>
            </div>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div 
            className={`relative rounded-lg overflow-hidden border ${planBorders.enterprise} ${selectedPlan === 'enterprise' ? 'ring-2 ring-amber-400/50' : ''}`}
            variants={itemVariants}
          >
            <div className={`p-5 ${planHeaders.enterprise}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Enterprise</h3>
                <Crown className="text-amber-400" size={20} />
              </div>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-light">$199</span>
                <span className="text-gray-400 ml-1">/month</span>
              </div>
              <p className="text-sm text-gray-300">For teams and businesses</p>
            </div>
            <div className={`p-5 ${planBackgrounds.enterprise}`}>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Unlimited video generations</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Up to 15 minute 4K videos</span>
                </li>
                <li className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>API access & dedicated support</span>
                </li>
              </ul>
              <Button 
                onClick={() => setSelectedPlan('enterprise')}
                className={`w-full bg-amber-700 hover:bg-amber-600 ${selectedPlan === 'enterprise' ? 'bg-amber-500/50' : ''}`}
              >
                {selectedPlan === 'enterprise' ? 'Current Plan' : 'Select Plan'}
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Feature comparison table */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-light mb-6 text-center">Feature Comparison</h3>
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-800/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/70">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Feature</th>
                    <th className="px-4 py-4 text-center text-sm font-medium text-gray-300">Free</th>
                    <th className="px-4 py-4 text-center text-sm font-medium text-gray-300">Basic</th>
                    <th className="px-4 py-4 text-center text-sm font-medium text-gray-300">Pro</th>
                    <th className="px-4 py-4 text-center text-sm font-medium text-gray-300">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-black/20" : ""}>
                      <td className="px-6 py-3 text-sm text-gray-300">{feature.title}</td>
                      <td className="px-4 py-3 text-center">
                        {typeof feature.plans.free === 'boolean' ? (
                          feature.plans.free ? 
                            <Check className="h-4 w-4 text-green-500 mx-auto" /> : 
                            <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-xs text-gray-400">{feature.plans.free}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {typeof feature.plans.basic === 'boolean' ? (
                          feature.plans.basic ? 
                            <Check className="h-4 w-4 text-green-500 mx-auto" /> : 
                            <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-xs text-gray-400">{feature.plans.basic}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center bg-aida-magenta/5">
                        {typeof feature.plans.pro === 'boolean' ? (
                          feature.plans.pro ? 
                            <Check className="h-4 w-4 text-green-500 mx-auto" /> : 
                            <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-xs text-gray-300">{feature.plans.pro}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {typeof feature.plans.enterprise === 'boolean' ? (
                          feature.plans.enterprise ? 
                            <Check className="h-4 w-4 text-green-500 mx-auto" /> : 
                            <span className="text-gray-600">—</span>
                        ) : (
                          <span className="text-xs text-gray-400">{feature.plans.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div 
          className="text-center max-w-3xl mx-auto p-8 rounded-xl bg-gradient-to-r from-aida-blue/20 to-aida-magenta/20 backdrop-blur-md border border-gray-800/40"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <h3 className="text-2xl font-light mb-3">Ready to unlock your creative potential?</h3>
          <p className="text-gray-300 mb-6">
            Start with our free tier or choose a plan that fits your needs. Upgrade, downgrade or cancel anytime.
          </p>
          <Button 
            className="bg-gradient-to-r from-aida-blue to-aida-magenta hover:from-aida-blue/90 hover:to-aida-magenta/90 text-white px-6 py-5 rounded-md text-lg group transition-all duration-300"
            size="lg"
          >
            <span>Get Started Today</span>
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-800/50 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto">
          <p>© 2025 AIDA by Dataists. All rights reserved.</p>
        </div>
      </footer>

      {/* Background effect */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vh] -translate-x-1/2 -translate-y-1/2 opacity-30">
          <div className="absolute inset-0 rounded-full bg-[#0092E3] blur-[180px]"></div>
          <div className="absolute inset-0 rounded-full bg-[#DD39B0] blur-[220px] mix-blend-screen opacity-70"></div>
        </div>
      </div>
    </div>
  );
};

export default PlanPage;