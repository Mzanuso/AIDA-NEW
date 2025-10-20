import { ModuleInfo, ModuleType } from '@/types/moduleTypes';

/**
 * Mock data per i moduli
 */
export const mockModules: ModuleInfo[] = [
  {
    type: 'style',
    title: 'Style',
    description: 'Define the visual identity of your project',
    progress: 0,
    isActive: true,
    isDisabled: false,
    isCompleted: false
  },
  {
    type: 'storytelling',
    title: 'Storytelling',
    description: 'Create a compelling narrative for your content',
    progress: 0,
    isActive: false,
    isDisabled: false,
    isCompleted: false
  },
  {
    type: 'characters',
    title: 'Characters',
    description: 'Design and manage your characters',
    progress: 0,
    isActive: false,
    isDisabled: false,
    isCompleted: false
  },
  {
    type: 'media',
    title: 'Media',
    description: 'Manage media assets for your project',
    progress: 0,
    isActive: false,
    isDisabled: false,
    isCompleted: false
  },
  {
    type: 'storyboard',
    title: 'Storyboard',
    description: 'Visualize your content flow scene by scene',
    progress: 0,
    isActive: false,
    isDisabled: false,
    isCompleted: false
  },
  {
    type: 'video',
    title: 'Video',
    description: 'Generate and edit your final video',
    progress: 0,
    isActive: false,
    isDisabled: true,
    isCompleted: false
  }
];