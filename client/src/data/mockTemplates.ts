import { TemplateData } from '@/types/templateTypes';

/**
 * Mock data per i template
 */
export const mockTemplates: TemplateData[] = [
  // Commercial Templates
  {
    id: 'commercial-product-1',
    title: 'Product Launch',
    description: 'Perfect for introducing new products with a dynamic presentation',
    category: 'commercial',
    categories: ['commercial', 'product', 'promotional'],
    tags: ['product', 'launch', 'presentation', 'ad', 'introduction', 'new'],
    aspectRatio: '16:9',
    duration: 30,
    thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    platforms: ['facebook', 'youtube', 'linkedin'],
    style: 'Cinematic',
    targetAudience: 'Business',
    isNew: true,
    isPopular: true
  },
  {
    id: 'commercial-brand-1',
    title: 'Brand Story',
    description: 'Tell your brand\'s story with an emotional narrative',
    category: 'commercial',
    categories: ['commercial', 'documentary', 'corporate'],
    tags: ['brand', 'story', 'emotional', 'narrative', 'company', 'identity'],
    aspectRatio: '16:9',
    duration: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93',
    platforms: ['youtube', 'linkedin', 'website'],
    style: 'Emotional',
    targetAudience: 'Corporate',
    isRecommended: true
  },
  {
    id: 'commercial-explainer-1',
    title: 'Product Explainer',
    description: 'Detailed walkthrough of product features and benefits',
    category: 'commercial',
    categories: ['commercial', 'explainer', 'tutorial'],
    tags: ['explainer', 'product', 'features', 'benefits', 'tutorial', 'demonstration'],
    aspectRatio: '16:9',
    duration: 120,
    thumbnailUrl: 'https://images.unsplash.com/photo-1629904853893-c2c8981a1dc5',
    platforms: ['website', 'youtube', 'linkedin'],
    style: 'Educational',
    targetAudience: 'Customers'
  },
  {
    id: 'commercial-testimonial-1',
    title: 'Customer Testimonial',
    description: 'Showcase real customer experiences with your product or service',
    category: 'commercial',
    tags: ['testimonial', 'customer', 'review', 'social proof'],
    aspectRatio: '16:9',
    duration: 45,
    thumbnailUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7'
  },
  {
    id: 'commercial-promo-1',
    title: 'Limited Time Offer',
    description: 'Create urgency with time-limited promotions and special offers',
    category: 'commercial',
    tags: ['promo', 'offer', 'discount', 'sale'],
    aspectRatio: '16:9',
    duration: 20,
    thumbnailUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db',
    isNew: true
  },
  {
    id: 'commercial-demo-1',
    title: 'Product Demo',
    description: 'Demonstrate your product in action with detailed interactions',
    category: 'commercial',
    tags: ['demo', 'product', 'how-to', 'features'],
    aspectRatio: '16:9',
    duration: 120,
    thumbnailUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f'
  },
  {
    id: 'commercial-unboxing-1',
    title: 'Unboxing Experience',
    description: 'Showcase the packaging and first impressions of your product',
    category: 'commercial',
    tags: ['unboxing', 'packaging', 'product', 'experience'],
    aspectRatio: '16:9',
    duration: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1531565637446-32307b194362'
  },
  {
    id: 'commercial-comparison-1',
    title: 'Product Comparison',
    description: 'Compare features and benefits against competitors or previous versions',
    category: 'commercial',
    tags: ['comparison', 'competitive', 'features', 'benefits'],
    aspectRatio: '16:9',
    duration: 75,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8'
  },
  
  // Social Media Templates
  {
    id: 'social-short-1',
    title: 'Social Media Ad',
    description: 'Short, eye-catching ads optimized for social platforms',
    category: 'social',
    categories: ['social', 'promotional', 'commercial'],
    tags: ['social', 'short', 'ad', 'tiktok', 'instagram', 'vertical'],
    aspectRatio: '9:16',
    duration: 15,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0',
    platforms: ['instagram', 'tiktok', 'facebook'],
    style: 'Dynamic',
    targetAudience: 'Gen Z',
    isPopular: true
  },
  {
    id: 'social-carousel-1',
    title: 'Carousel Post',
    description: 'Series of images optimized for multi-slide social posts',
    category: 'social',
    categories: ['social', 'promotional'],
    tags: ['carousel', 'slides', 'social', 'sequence', 'gallery', 'slideshow'],
    aspectRatio: '1:1',
    duration: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
    platforms: ['instagram', 'linkedin', 'facebook'],
    style: 'Clean',
    targetAudience: 'All',
    isNew: true
  },
  {
    id: 'social-reel-1',
    title: 'Instagram Reel',
    description: 'Vertical short-form video optimized for Instagram Reels',
    category: 'social',
    categories: ['social', 'entertainment'],
    tags: ['reel', 'instagram', 'vertical', 'short', 'trending', 'hook'],
    aspectRatio: '9:16',
    duration: 30,
    thumbnailUrl: 'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a',
    platforms: ['instagram'],
    style: 'Vibrant',
    targetAudience: 'Gen Z'
  },
  {
    id: 'social-tiktok-1',
    title: 'TikTok Video',
    description: 'Trendy, fast-paced content optimized for TikTok engagement',
    category: 'social',
    categories: ['social', 'entertainment', 'promotional'],
    tags: ['tiktok', 'trend', 'viral', 'challenge', 'vertical', 'engaging'],
    aspectRatio: '9:16',
    duration: 20,
    thumbnailUrl: 'https://images.unsplash.com/photo-1594126524773-e04608263499',
    platforms: ['tiktok'],
    style: 'Modern',
    targetAudience: 'Gen Z',
    isPopular: true
  },
  {
    id: 'social-story-1',
    title: 'Story Template',
    description: 'Quick, engaging content for ephemeral story formats',
    category: 'social',
    tags: ['story', 'instagram', 'snapchat', 'ephemeral'],
    aspectRatio: '9:16',
    duration: 15,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868'
  },
  {
    id: 'social-announcement-1',
    title: 'Social Announcement',
    description: 'Perfect for revealing news, updates, or special information',
    category: 'social',
    tags: ['announcement', 'news', 'update', 'reveal'],
    aspectRatio: '1:1',
    duration: 20,
    thumbnailUrl: 'https://images.unsplash.com/photo-1493612276216-ee3925520721'
  },
  {
    id: 'social-youtube-1',
    title: 'YouTube Short',
    description: 'Vertical short-form video optimized for YouTube Shorts',
    category: 'social',
    tags: ['youtube', 'short', 'vertical', 'engaging'],
    aspectRatio: '9:16',
    duration: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb',
    isNew: true
  },
  {
    id: 'social-meme-1',
    title: 'Trending Meme',
    description: 'Humorous, shareable content based on trending formats',
    category: 'social',
    tags: ['meme', 'humor', 'trend', 'viral'],
    aspectRatio: '1:1',
    duration: 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1527112862739-c3b9466d902e'
  },
  
  // Educational Templates
  {
    id: 'educational-tutorial-1',
    title: 'Tutorial Video',
    description: 'Clear step-by-step instructions for educational content',
    category: 'educational',
    tags: ['tutorial', 'education', 'howto', 'explainer'],
    aspectRatio: '16:9',
    duration: 120,
    thumbnailUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e'
  },
  {
    id: 'educational-lecture-1',
    title: 'Course Lecture',
    description: 'Comprehensive educational content with in-depth information',
    category: 'educational',
    tags: ['lecture', 'course', 'education', 'academic'],
    aspectRatio: '16:9',
    duration: 300,
    thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655'
  },
  {
    id: 'educational-infographic-1',
    title: 'Animated Infographic',
    description: 'Visualized data and statistics with animated elements',
    category: 'educational',
    tags: ['infographic', 'data', 'statistics', 'animation'],
    aspectRatio: '16:9',
    duration: 45,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
  },
  {
    id: 'educational-explainer-1',
    title: 'Concept Explainer',
    description: 'Break down complex concepts into simple, understandable parts',
    category: 'educational',
    tags: ['explainer', 'concept', 'learning', 'simple'],
    aspectRatio: '16:9',
    duration: 90,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    isRecommended: true
  },
  {
    id: 'educational-howto-1',
    title: 'How-To Guide',
    description: 'Practical demonstration of processes or techniques',
    category: 'educational',
    tags: ['howto', 'guide', 'demonstration', 'practical'],
    aspectRatio: '16:9',
    duration: 180,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db'
  },
  {
    id: 'educational-tips-1',
    title: 'Quick Tips',
    description: 'Fast, actionable advice presented in a concise format',
    category: 'educational',
    tags: ['tips', 'advice', 'quick', 'actionable'],
    aspectRatio: '16:9',
    duration: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1543286386-2e659306cd6c'
  },
  {
    id: 'educational-interactive-1',
    title: 'Interactive Lesson',
    description: 'Engaging content designed for high viewer participation',
    category: 'educational',
    tags: ['interactive', 'participation', 'engagement', 'lesson'],
    aspectRatio: '16:9',
    duration: 150,
    thumbnailUrl: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b'
  },
  {
    id: 'educational-research-1',
    title: 'Research Presentation',
    description: 'Academic format for presenting research findings and methods',
    category: 'educational',
    tags: ['research', 'academic', 'presentation', 'findings'],
    aspectRatio: '16:9',
    duration: 240,
    thumbnailUrl: 'https://images.unsplash.com/photo-1576669801775-ff43c5ab079d'
  },
  
  // Corporate Templates
  {
    id: 'corporate-presentation-1',
    title: 'Corporate Presentation',
    description: 'Professional format for business and enterprise communication',
    category: 'corporate',
    tags: ['business', 'presentation', 'professional', 'corporate'],
    aspectRatio: '16:9',
    duration: 180,
    thumbnailUrl: 'https://images.unsplash.com/photo-1552581234-26160f608093',
    isRecommended: true
  },
  {
    id: 'corporate-training-1',
    title: 'Staff Training',
    description: 'Instructional content designed for employee development',
    category: 'corporate',
    tags: ['training', 'employee', 'development', 'instruction'],
    aspectRatio: '16:9',
    duration: 240,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0'
  },
  {
    id: 'corporate-annual-1',
    title: 'Annual Report',
    description: 'Summarize yearly performance, achievements, and future plans',
    category: 'corporate',
    tags: ['annual', 'report', 'performance', 'summary'],
    aspectRatio: '16:9',
    duration: 300,
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f'
  },
  {
    id: 'corporate-recruitment-1',
    title: 'Recruitment Video',
    description: 'Attract talent by showcasing culture and opportunities',
    category: 'corporate',
    tags: ['recruitment', 'hiring', 'careers', 'culture'],
    aspectRatio: '16:9',
    duration: 120,
    thumbnailUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf'
  },
  {
    id: 'corporate-onboarding-1',
    title: 'Employee Onboarding',
    description: 'Welcome and orient new team members to your organization',
    category: 'corporate',
    tags: ['onboarding', 'welcome', 'orientation', 'employee'],
    aspectRatio: '16:9',
    duration: 180,
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c'
  },
  {
    id: 'corporate-milestone-1',
    title: 'Company Milestone',
    description: 'Celebrate achievements, anniversaries, and significant moments',
    category: 'corporate',
    tags: ['milestone', 'anniversary', 'celebration', 'achievement'],
    aspectRatio: '16:9',
    duration: 90,
    thumbnailUrl: 'https://images.unsplash.com/photo-1533749047139-189de3cf06d3'
  },
  {
    id: 'corporate-investor-1',
    title: 'Investor Relations',
    description: 'Financial updates and information for shareholders',
    category: 'corporate',
    tags: ['investor', 'financial', 'shareholder', 'stock'],
    aspectRatio: '16:9',
    duration: 150,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3'
  },
  {
    id: 'corporate-event-1',
    title: 'Corporate Event',
    description: 'Promote and document business gatherings and conferences',
    category: 'corporate',
    tags: ['event', 'conference', 'meeting', 'gathering'],
    aspectRatio: '16:9',
    duration: 120,
    thumbnailUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678',
    isNew: true
  },
  
  // Documentary Templates
  {
    id: 'documentary-short-1',
    title: 'Mini Documentary',
    description: 'Storytelling format for in-depth exploration of subjects',
    category: 'documentary',
    tags: ['documentary', 'storytelling', 'interview', 'journalism'],
    aspectRatio: '16:9',
    duration: 300,
    thumbnailUrl: 'https://images.unsplash.com/photo-1569063386798-322ae698d374'
  },
  {
    id: 'documentary-interview-1',
    title: 'Interview Series',
    description: 'Conversation-based exploration of perspectives and experiences',
    category: 'documentary',
    tags: ['interview', 'conversation', 'perspective', 'series'],
    aspectRatio: '16:9',
    duration: 240,
    thumbnailUrl: 'https://images.unsplash.com/photo-1521424159246-e4a66f267e4b',
    isRecommended: true
  },
  {
    id: 'documentary-nature-1',
    title: 'Nature Exploration',
    description: 'Immersive journey into natural environments and wildlife',
    category: 'documentary',
    tags: ['nature', 'wildlife', 'environment', 'exploration'],
    aspectRatio: '16:9',
    duration: 360,
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05'
  },
  {
    id: 'documentary-travel-1',
    title: 'Travel Documentary',
    description: 'Explore cultures, destinations, and travel experiences',
    category: 'documentary',
    tags: ['travel', 'culture', 'destination', 'adventure'],
    aspectRatio: '16:9',
    duration: 480,
    thumbnailUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    isPopular: true
  },
  {
    id: 'documentary-historical-1',
    title: 'Historical Narrative',
    description: 'Visual storytelling of historical events and their impact',
    category: 'documentary',
    tags: ['historical', 'history', 'narrative', 'past'],
    aspectRatio: '16:9',
    duration: 420,
    thumbnailUrl: 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9'
  },
  {
    id: 'documentary-social-1',
    title: 'Social Issue Spotlight',
    description: 'Exploration of important social topics and challenges',
    category: 'documentary',
    tags: ['social', 'issue', 'society', 'awareness'],
    aspectRatio: '16:9',
    duration: 300,
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998'
  },
  {
    id: 'documentary-profile-1',
    title: 'Character Profile',
    description: 'In-depth portrait of notable individuals and their stories',
    category: 'documentary',
    tags: ['profile', 'biography', 'individual', 'story'],
    aspectRatio: '16:9',
    duration: 240,
    thumbnailUrl: 'https://images.unsplash.com/photo-1484186139897-d5fc6b908812'
  },
  {
    id: 'documentary-science-1',
    title: 'Science Documentary',
    description: 'Exploration of scientific topics, discoveries and phenomena',
    category: 'documentary',
    tags: ['science', 'discovery', 'research', 'explanation'],
    aspectRatio: '16:9',
    duration: 360,
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d'
  },
  
  // Mixed Category Templates
  {
    id: 'mixed-social-documentary-1',
    title: 'Social Mini-Doc',
    description: 'Documentary-style content optimized for social sharing',
    category: 'social',
    tags: ['documentary', 'social', 'short', 'shareable'],
    aspectRatio: '1:1',
    duration: 90,
    thumbnailUrl: 'https://images.unsplash.com/photo-1533022280289-26221d91ba7e'
  },
  {
    id: 'mixed-corporate-social-1',
    title: 'Corporate Social Update',
    description: 'Professional business content formatted for social platforms',
    category: 'corporate',
    tags: ['social', 'corporate', 'update', 'professional'],
    aspectRatio: '1:1',
    duration: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'
  },
  {
    id: 'mixed-educational-entertainment-1',
    title: 'Edutainment Show',
    description: 'Educational content presented in an entertaining format',
    category: 'educational',
    tags: ['entertainment', 'education', 'engaging', 'fun'],
    aspectRatio: '16:9',
    duration: 180,
    thumbnailUrl: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc'
  },
  {
    id: 'mixed-commercial-documentary-1',
    title: 'Brand Documentary',
    description: 'Documentary approach to brand storytelling and history',
    category: 'commercial',
    tags: ['documentary', 'brand', 'story', 'authentic'],
    aspectRatio: '16:9',
    duration: 240,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee',
    isNew: true
  },
  {
    id: 'mixed-social-educational-1',
    title: 'Social Learning Bite',
    description: 'Quick educational content optimized for social media',
    category: 'social',
    tags: ['educational', 'quick', 'learning', 'social'],
    aspectRatio: '9:16',
    duration: 45,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4'
  },
  {
    id: 'mixed-corporate-educational-1',
    title: 'Business Training',
    description: 'Educational content focused on business skills and knowledge',
    category: 'corporate',
    tags: ['educational', 'business', 'training', 'skills'],
    aspectRatio: '16:9',
    duration: 210,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550305080-4e029753abcf'
  }
];