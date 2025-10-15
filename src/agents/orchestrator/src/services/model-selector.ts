/**
 * Universal Model Selector
 *
 * Intelligently selects the best AI model for 94 creative capabilities
 * across video, image, audio, 3D, and text generation.
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export type CreativeCapability =
  // Video Generation (12)
  | 'VIDEO_FROM_TEXT' | 'SHORT_FORM_VIDEO' | 'LONG_FORM_VIDEO'
  | 'IMAGE_TO_VIDEO' | 'VIDEO_TO_VIDEO'
  | 'MUSIC_VIDEO' | 'EXPLAINER_VIDEO' | 'PRODUCT_VIDEO'
  | 'TESTIMONIAL_VIDEO' | 'ANIMATED_LOGO' | 'INTRO_OUTRO'
  | 'TIMELAPSE_VIDEO'

  // Image Generation (15)
  | 'GENERATE_IMAGE' | 'GENERATE_ILLUSTRATION' | 'GENERATE_PORTRAIT'
  | 'GENERATE_SCENE' | 'GENERATE_PRODUCT_PHOTO' | 'GENERATE_MOCKUP'
  | 'GENERATE_LOGO' | 'GENERATE_BRAND_KIT' | 'GENERATE_ICON_SET'
  | 'GENERATE_INFOGRAPHIC' | 'GENERATE_MEME' | 'GENERATE_POSTER'
  | 'GENERATE_BOOK_COVER' | 'GENERATE_PATTERN' | 'GENERATE_TEXTURE'

  // Image Editing (12)
  | 'REMOVE_BACKGROUND' | 'REMOVE_OBJECT' | 'ADD_OBJECT'
  | 'UPSCALE_IMAGE' | 'FACE_SWAP' | 'CHANGE_OUTFIT'
  | 'RESTORE_PHOTO' | 'COLORIZE_BW' | 'CHANGE_BACKGROUND'
  | 'STYLE_TRANSFER' | 'RELIGHT_IMAGE' | 'HEADSHOT_GENERATOR'

  // Audio & Music (10)
  | 'GENERATE_MUSIC' | 'WRITE_SONG_LYRICS' | 'TEXT_TO_SPEECH'
  | 'VOICE_CLONE' | 'GENERATE_SOUND_FX' | 'AUDIO_ENHANCEMENT'
  | 'MUSIC_SEPARATION' | 'PODCAST_EDIT' | 'AUDIO_TRANSCRIPTION'
  | 'VOICE_CHANGE'

  // Video Editing (12)
  | 'AUTO_EDIT_VIDEO' | 'CLIP_EXTRACTION' | 'VIDEO_REPURPOSE'
  | 'AUTO_CAPTION' | 'AUTO_B_ROLL' | 'MULTI_CAMERA_EDIT'
  | 'COLOR_GRADING' | 'NOISE_REDUCTION' | 'STABILIZATION'
  | 'SLOW_MOTION' | 'TIME_REMAPPING' | 'TRANSITION_GENERATION'

  // 3D Generation (8)
  | 'TEXT_TO_3D' | 'IMAGE_TO_3D' | '3D_RIGGING'
  | '3D_ANIMATION' | '3D_SCENE' | '3D_CHARACTER'
  | 'VIRTUAL_TRY_ON' | '3D_PRODUCT_RENDER'

  // Text & Content (15)
  | 'BLOG_TO_VIDEO' | 'ARTICLE_TO_VIDEO' | 'SCRIPT_WRITING'
  | 'SOCIAL_COPY' | 'EMAIL_COPY' | 'AD_COPY'
  | 'SEO_CONTENT' | 'PRODUCT_DESCRIPTION' | 'VIDEO_SCRIPT'
  | 'PRESENTATION_DECK' | 'STORYBOARD' | 'ILLUSTRATED_BOOK'
  | 'COMIC_STRIP' | 'VISUAL_NOVEL' | 'INTERACTIVE_STORY'

  // Advanced Features (10)
  | 'LIP_SYNC' | 'MOTION_TRACKING' | 'OBJECT_REMOVAL_VIDEO'
  | 'DEPTH_MAP' | 'SEGMENTATION' | 'POSE_ESTIMATION'
  | 'STYLE_TRANSFER_VIDEO' | 'SUPER_RESOLUTION' | 'FRAME_INTERPOLATION'
  | 'VIDEO_INPAINTING';

export interface UserIntent {
  capability: CreativeCapability;

  // Video specific
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
  hasDialogue?: boolean;
  needsLipSync?: boolean;
  isCinematic?: boolean;
  cameraMovesCount?: number;
  budgetSensitive?: boolean;

  // Image specific
  hasText?: boolean;
  isLogoOrBrand?: boolean;
  isArtistic?: boolean;
  needsFastIteration?: boolean;

  // Audio specific
  needsLyrics?: boolean;
  isMultiLanguage?: boolean;
  needsEmotionalControl?: boolean;

  // Editing specific
  editingComplexity?: 'simple' | 'moderate' | 'complex';

  // 3D specific
  isEnterprise?: boolean;

  // General
  qualityLevel?: 'budget' | 'standard' | 'premium';
}

export interface ModelSelection {
  primary: {
    name: string;
    api: string;
    estimatedCost: number;
    reason: string;
  };
  fallback: {
    name: string;
    api: string;
    estimatedCost: number;
    reason: string;
  };
}

// ============================================
// MAIN SELECTOR CLASS
// ============================================

export class UniversalModelSelector {

  selectModel(intent: UserIntent): ModelSelection {
    switch(intent.capability) {

      // VIDEO GENERATION
      case 'VIDEO_FROM_TEXT':
      case 'SHORT_FORM_VIDEO':
      case 'LONG_FORM_VIDEO':
      case 'MUSIC_VIDEO':
      case 'EXPLAINER_VIDEO':
      case 'PRODUCT_VIDEO':
      case 'TESTIMONIAL_VIDEO':
      case 'ANIMATED_LOGO':
      case 'INTRO_OUTRO':
      case 'TIMELAPSE_VIDEO':
        return this.selectVideoModel(intent);

      case 'IMAGE_TO_VIDEO':
        return this.selectImageToVideoModel(intent);

      case 'VIDEO_TO_VIDEO':
        return this.selectVideoToVideoModel(intent);

      // IMAGE GENERATION
      case 'GENERATE_IMAGE':
      case 'GENERATE_ILLUSTRATION':
      case 'GENERATE_PORTRAIT':
      case 'GENERATE_SCENE':
      case 'GENERATE_PRODUCT_PHOTO':
      case 'GENERATE_MOCKUP':
      case 'GENERATE_INFOGRAPHIC':
      case 'GENERATE_MEME':
      case 'GENERATE_POSTER':
      case 'GENERATE_BOOK_COVER':
      case 'GENERATE_PATTERN':
      case 'GENERATE_TEXTURE':
        return this.selectImageGenModel(intent);

      case 'GENERATE_LOGO':
      case 'GENERATE_BRAND_KIT':
      case 'GENERATE_ICON_SET':
        return this.selectBrandingModel(intent);

      // IMAGE EDITING
      case 'REMOVE_BACKGROUND':
        return this.selectRemoveBackgroundModel();

      case 'REMOVE_OBJECT':
      case 'ADD_OBJECT':
      case 'CHANGE_BACKGROUND':
      case 'STYLE_TRANSFER':
      case 'RELIGHT_IMAGE':
        return this.selectImageEditModel(intent);

      case 'UPSCALE_IMAGE':
      case 'SUPER_RESOLUTION':
        return this.selectUpscaleModel();

      case 'FACE_SWAP':
        return this.selectFaceSwapModel();

      case 'CHANGE_OUTFIT':
      case 'VIRTUAL_TRY_ON':
        return this.selectVirtualTryOnModel();

      case 'RESTORE_PHOTO':
      case 'COLORIZE_BW':
        return this.selectPhotoRestoreModel(intent);

      case 'HEADSHOT_GENERATOR':
        return this.selectHeadshotModel();

      // AUDIO & MUSIC
      case 'GENERATE_MUSIC':
        return this.selectMusicModel(intent);

      case 'WRITE_SONG_LYRICS':
        return this.selectLyricsModel();

      case 'TEXT_TO_SPEECH':
        return this.selectTTSModel(intent);

      case 'VOICE_CLONE':
        return this.selectVoiceCloneModel();

      case 'GENERATE_SOUND_FX':
        return this.selectSoundFXModel();

      case 'AUDIO_ENHANCEMENT':
      case 'MUSIC_SEPARATION':
      case 'PODCAST_EDIT':
        return this.selectAudioEditModel(intent);

      case 'AUDIO_TRANSCRIPTION':
        return this.selectTranscriptionModel();

      case 'VOICE_CHANGE':
        return this.selectVoiceChangeModel();

      // VIDEO EDITING
      case 'AUTO_EDIT_VIDEO':
      case 'CLIP_EXTRACTION':
      case 'VIDEO_REPURPOSE':
      case 'MULTI_CAMERA_EDIT':
        return this.selectVideoEditModel(intent);

      case 'AUTO_CAPTION':
        return this.selectCaptionModel();

      case 'AUTO_B_ROLL':
        return this.selectBRollModel();

      case 'COLOR_GRADING':
      case 'NOISE_REDUCTION':
      case 'STABILIZATION':
        return this.selectVideoEnhanceModel(intent);

      case 'SLOW_MOTION':
      case 'TIME_REMAPPING':
        return this.selectTimeRemapModel(intent);

      case 'TRANSITION_GENERATION':
        return this.selectTransitionModel();

      case 'LIP_SYNC':
        return this.selectLipSyncModel();

      // ADVANCED VIDEO FEATURES
      case 'MOTION_TRACKING':
      case 'OBJECT_REMOVAL_VIDEO':
      case 'VIDEO_INPAINTING':
        return this.selectAdvancedVideoModel(intent);

      case 'STYLE_TRANSFER_VIDEO':
        return this.selectStyleTransferVideoModel();

      case 'FRAME_INTERPOLATION':
        return this.selectFrameInterpolationModel();

      case 'DEPTH_MAP':
      case 'SEGMENTATION':
      case 'POSE_ESTIMATION':
        return this.selectComputerVisionModel(intent);

      // 3D GENERATION
      case 'TEXT_TO_3D':
      case 'IMAGE_TO_3D':
      case '3D_RIGGING':
      case '3D_ANIMATION':
      case '3D_SCENE':
      case '3D_CHARACTER':
      case '3D_PRODUCT_RENDER':
        return this.select3DModel(intent);

      // TEXT & CONTENT (Handled by Claude Sonnet)
      case 'BLOG_TO_VIDEO':
      case 'ARTICLE_TO_VIDEO':
      case 'SCRIPT_WRITING':
      case 'SOCIAL_COPY':
      case 'EMAIL_COPY':
      case 'AD_COPY':
      case 'SEO_CONTENT':
      case 'PRODUCT_DESCRIPTION':
      case 'VIDEO_SCRIPT':
      case 'STORYBOARD':
        return this.selectTextModel();

      case 'PRESENTATION_DECK':
        return this.selectPresentationModel();

      case 'ILLUSTRATED_BOOK':
      case 'COMIC_STRIP':
      case 'VISUAL_NOVEL':
      case 'INTERACTIVE_STORY':
        return this.selectMultimediaStoryModel(intent);

      default:
        // Fallback generico
        return {
          primary: {
            name: 'FLUX Pro',
            api: 'fal-ai/flux-pro',
            estimatedCost: 0.08,
            reason: 'Default fallback model'
          },
          fallback: {
            name: 'Stable Diffusion XL',
            api: 'fal-ai/stable-diffusion-xl',
            estimatedCost: 0.05,
            reason: 'Budget fallback'
          }
        };
    }
  }

  // ========================================
  // VIDEO MODEL SELECTION
  // ========================================

  private selectVideoModel(intent: UserIntent): ModelSelection {
    // PRIORITY 1: Dialogue/Audio Required
    if (intent.hasDialogue || intent.needsLipSync) {
      return {
        primary: {
          name: 'Sora 2 Pro',
          api: 'fal-ai/sora-2/pro',
          estimatedCost: 0.15,
          reason: 'Best for videos with dialogue and audio (1080p)'
        },
        fallback: {
          name: 'Sora 2 Standard',
          api: 'fal-ai/sora-2/standard',
          estimatedCost: 0.10,
          reason: 'Audio capabilities at lower cost (720p)'
        }
      };
    }

    // PRIORITY 2: Cinematic Quality
    if (intent.isCinematic || intent.qualityLevel === 'premium') {
      return {
        primary: {
          name: 'Kling 2.1 Master',
          api: 'fal-ai/kling-video/v2.1/master/text-to-video',
          estimatedCost: 0.16,
          reason: 'Cinematic quality with best motion (1080p)'
        },
        fallback: {
          name: 'Kling 2.5 Turbo Pro',
          api: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
          estimatedCost: 0.07,
          reason: 'High quality at lower cost (1080p)'
        }
      };
    }

    // PRIORITY 3: Camera Movements
    if (intent.cameraMovesCount && intent.cameraMovesCount >= 2) {
      return {
        primary: {
          name: 'MiniMax Hailuo-02 Pro',
          api: 'fal-ai/minimax/hailuo-02/pro/text-to-video',
          estimatedCost: 0.08,
          reason: 'Up to 3 camera movements (1080p)'
        },
        fallback: {
          name: 'Kling 2.5 Turbo Pro',
          api: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
          estimatedCost: 0.07,
          reason: 'Advanced camera control (1080p)'
        }
      };
    }

    // PRIORITY 4: Budget
    if (intent.budgetSensitive) {
      return {
        primary: {
          name: 'Kling 2.1 Standard',
          api: 'fal-ai/kling-video/v2.1/standard/text-to-video',
          estimatedCost: 0.03,
          reason: 'Most affordable 1080p option'
        },
        fallback: {
          name: 'Veo 3 Fast',
          api: 'fal-ai/veo3/fast',
          estimatedCost: 0.10,
          reason: 'Google quality (720p)'
        }
      };
    }

    // DEFAULT: Best overall
    return {
      primary: {
        name: 'Kling 2.5 Turbo Pro',
        api: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
        estimatedCost: 0.07,
        reason: 'Best overall quality and flexibility (1080p)'
      },
      fallback: {
        name: 'Kling 2.1 Pro',
        api: 'fal-ai/kling-video/v2.1/pro/text-to-video',
        estimatedCost: 0.05,
        reason: 'Quality fallback (1080p)'
      }
    };
  }

  private selectImageToVideoModel(intent: UserIntent): ModelSelection {
    if (intent.hasDialogue || intent.needsLipSync) {
      return {
        primary: {
          name: 'Sora 2 I2V Pro',
          api: 'fal-ai/sora-2/image-to-video/pro',
          estimatedCost: 0.10,
          reason: 'Audio + lip sync from image (1080p)'
        },
        fallback: {
          name: 'Sora 2 I2V Standard',
          api: 'fal-ai/sora-2/image-to-video',
          estimatedCost: 0.10,
          reason: 'Audio from image (720p)'
        }
      };
    }

    if (intent.qualityLevel === 'premium') {
      return {
        primary: {
          name: 'Kling 2.1 Master',
          api: 'fal-ai/kling-video/v2.1/master/image-to-video',
          estimatedCost: 0.16,
          reason: 'Premium image-to-video (1080p)'
        },
        fallback: {
          name: 'Kling 2.5 Turbo Pro',
          api: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
          estimatedCost: 0.07,
          reason: 'High quality alternative (1080p)'
        }
      };
    }

    return {
      primary: {
        name: 'Kling 2.5 Turbo Pro',
        api: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
        estimatedCost: 0.07,
        reason: 'Best motion from static images (1080p)'
      },
      fallback: {
        name: 'Kling 2.1 Pro',
        api: 'fal-ai/kling-video/v2.1/pro/image-to-video',
        estimatedCost: 0.05,
        reason: 'Budget-friendly quality (1080p)'
      }
    };
  }

  private selectVideoToVideoModel(intent: UserIntent): ModelSelection {
    return {
      primary: {
        name: 'Pika v2.2',
        api: 'fal-ai/pika/v2.2/video-to-video',
        estimatedCost: 0.09,
        reason: 'Best video-to-video transformations'
      },
      fallback: {
        name: 'Sora 2 Video Remix',
        api: 'fal-ai/sora-2/video-to-video/remix',
        estimatedCost: 0.10,
        reason: 'Works only with Sora videos'
      }
    };
  }

  // ========================================
  // IMAGE MODEL SELECTION
  // ========================================

  private selectImageGenModel(intent: UserIntent): ModelSelection {
    if (intent.isArtistic) {
      return {
        primary: {
          name: 'Midjourney v7',
          api: 'kie.ai/mj/generate',
          estimatedCost: 0.08,
          reason: 'Best for artistic styles'
        },
        fallback: {
          name: 'FLUX Pro',
          api: 'fal-ai/flux-pro',
          estimatedCost: 0.08,
          reason: 'High quality alternative'
        }
      };
    }

    if (intent.needsFastIteration) {
      return {
        primary: {
          name: 'FLUX Schnell',
          api: 'fal-ai/flux/schnell',
          estimatedCost: 0.04,
          reason: 'Fastest generation for iteration'
        },
        fallback: {
          name: 'FLUX Dev',
          api: 'fal-ai/flux/dev',
          estimatedCost: 0.05,
          reason: 'Balance speed/quality'
        }
      };
    }

    if (intent.hasText) {
      return {
        primary: {
          name: 'Ideogram v2.5',
          api: 'fal-ai/ideogram/v2.5',
          estimatedCost: 0.08,
          reason: 'Best for text rendering'
        },
        fallback: {
          name: 'FLUX Pro',
          api: 'fal-ai/flux-pro',
          estimatedCost: 0.08,
          reason: 'Good text quality'
        }
      };
    }

    return {
      primary: {
        name: 'FLUX Pro',
        api: 'fal-ai/flux-pro',
        estimatedCost: 0.08,
        reason: 'Best overall image quality'
      },
      fallback: {
        name: 'Stable Diffusion XL',
        api: 'fal-ai/stable-diffusion-xl',
        estimatedCost: 0.05,
        reason: 'Reliable alternative'
      }
    };
  }

  private selectBrandingModel(intent: UserIntent): ModelSelection {
    return {
      primary: {
        name: 'Midjourney v7',
        api: 'kie.ai/mj/generate',
        estimatedCost: 0.08,
        reason: 'Best for logos and branding'
      },
      fallback: {
        name: 'FLUX Pro',
        api: 'fal-ai/flux-pro',
        estimatedCost: 0.08,
        reason: 'Professional alternative'
      }
    };
  }

  // ========================================
  // IMAGE EDITING
  // ========================================

  private selectRemoveBackgroundModel(): ModelSelection {
    return {
      primary: {
        name: 'BRIA RMBG 2.0',
        api: 'fal-ai/bria/rmbg-2.0',
        estimatedCost: 0.02,
        reason: 'Best background removal'
      },
      fallback: {
        name: 'Remove Background v1',
        api: 'fal-ai/remove-background',
        estimatedCost: 0.02,
        reason: 'Reliable alternative'
      }
    };
  }

  private selectImageEditModel(intent: UserIntent): ModelSelection {
    return {
      primary: {
        name: 'FLUX Fill Pro',
        api: 'fal-ai/flux/fill-pro',
        estimatedCost: 0.08,
        reason: 'Best for image editing tasks'
      },
      fallback: {
        name: 'Stable Diffusion Inpainting',
        api: 'fal-ai/stable-diffusion/inpainting',
        estimatedCost: 0.05,
        reason: 'Budget editing option'
      }
    };
  }

  private selectUpscaleModel(): ModelSelection {
    return {
      primary: {
        name: 'Creative Upscaler',
        api: 'fal-ai/creative-upscaler',
        estimatedCost: 0.08,
        reason: 'Best quality upscaling'
      },
      fallback: {
        name: 'Clarity Upscaler',
        api: 'fal-ai/clarity-upscaler',
        estimatedCost: 0.08,
        reason: 'Alternative upscaler'
      }
    };
  }

  private selectFaceSwapModel(): ModelSelection {
    return {
      primary: {
        name: 'Face Swap',
        api: 'fal-ai/face-swap',
        estimatedCost: 0.05,
        reason: 'Dedicated face swap model'
      },
      fallback: {
        name: 'FLUX Fill Pro',
        api: 'fal-ai/flux/fill-pro',
        estimatedCost: 0.08,
        reason: 'Manual face editing'
      }
    };
  }

  private selectVirtualTryOnModel(): ModelSelection {
    return {
      primary: {
        name: 'Kling Virtual Try-On',
        api: 'fal-ai/kling-video/virtual-try-on',
        estimatedCost: 0.07,
        reason: 'Realistic outfit changes'
      },
      fallback: {
        name: 'FLUX Fill Pro',
        api: 'fal-ai/flux/fill-pro',
        estimatedCost: 0.08,
        reason: 'Manual outfit editing'
      }
    };
  }

  private selectPhotoRestoreModel(intent: UserIntent): ModelSelection {
    if (intent.capability === 'COLORIZE_BW') {
      return {
        primary: {
          name: 'Colorization',
          api: 'fal-ai/colorization',
          estimatedCost: 0.05,
          reason: 'Dedicated colorization'
        },
        fallback: {
          name: 'FLUX Fill Pro',
          api: 'fal-ai/flux/fill-pro',
          estimatedCost: 0.08,
          reason: 'Alternative colorization'
        }
      };
    }

    return {
      primary: {
        name: 'Photo Restoration',
        api: 'fal-ai/photo-restoration',
        estimatedCost: 0.05,
        reason: 'Dedicated restoration'
      },
      fallback: {
        name: 'Creative Upscaler',
        api: 'fal-ai/creative-upscaler',
        estimatedCost: 0.08,
        reason: 'Upscale + enhance'
      }
    };
  }

  private selectHeadshotModel(): ModelSelection {
    return {
      primary: {
        name: 'Professional Headshots',
        api: 'fal-ai/professional-headshots',
        estimatedCost: 0.10,
        reason: 'AI professional headshots'
      },
      fallback: {
        name: 'FLUX Pro Portrait',
        api: 'fal-ai/flux-pro',
        estimatedCost: 0.08,
        reason: 'Custom portrait generation'
      }
    };
  }

  // ========================================
  // AUDIO & MUSIC
  // ========================================

  private selectMusicModel(intent: UserIntent): ModelSelection {
    if (intent.needsLyrics) {
      return {
        primary: {
          name: 'Suno v5',
          api: 'fal-ai/suno/v5',
          estimatedCost: 0.10,
          reason: 'Best for music with lyrics'
        },
        fallback: {
          name: 'Udio v1.5',
          api: 'fal-ai/udio/v1.5',
          estimatedCost: 0.10,
          reason: 'Alternative with vocals'
        }
      };
    }

    return {
      primary: {
        name: 'Stable Audio',
        api: 'fal-ai/stable-audio',
        estimatedCost: 0.08,
        reason: 'Best for instrumental music'
      },
      fallback: {
        name: 'Suno v5 Instrumental',
        api: 'fal-ai/suno/v5',
        estimatedCost: 0.10,
        reason: 'Alternative instrumental'
      }
    };
  }

  private selectLyricsModel(): ModelSelection {
    return {
      primary: {
        name: 'Claude Sonnet 4.5',
        api: 'anthropic/claude-sonnet-4',
        estimatedCost: 0.01,
        reason: 'Best for creative writing'
      },
      fallback: {
        name: 'Suno Lyrics',
        api: 'fal-ai/suno/lyrics',
        estimatedCost: 0.05,
        reason: 'Music-specific lyrics'
      }
    };
  }

  private selectTTSModel(intent: UserIntent): ModelSelection {
    if (intent.isMultiLanguage) {
      return {
        primary: {
          name: 'ElevenLabs Multilingual v2',
          api: 'fal-ai/elevenlabs/multilingual-v2',
          estimatedCost: 0.15,
          reason: 'Best multilingual support'
        },
        fallback: {
          name: 'Play.ht',
          api: 'fal-ai/playht',
          estimatedCost: 0.10,
          reason: 'Alternative multilingual'
        }
      };
    }

    return {
      primary: {
        name: 'ElevenLabs Turbo v2.5',
        api: 'fal-ai/elevenlabs/turbo-v2.5',
        estimatedCost: 0.10,
        reason: 'Best quality and speed'
      },
      fallback: {
        name: 'Play.ht',
        api: 'fal-ai/playht',
        estimatedCost: 0.10,
        reason: 'Reliable alternative'
      }
    };
  }

  private selectVoiceCloneModel(): ModelSelection {
    return {
      primary: {
        name: 'ElevenLabs Voice Clone',
        api: 'fal-ai/elevenlabs/voice-clone',
        estimatedCost: 0.20,
        reason: 'Best voice cloning'
      },
      fallback: {
        name: 'Play.ht Clone',
        api: 'fal-ai/playht/clone',
        estimatedCost: 0.15,
        reason: 'Alternative cloning'
      }
    };
  }

  private selectSoundFXModel(): ModelSelection {
    return {
      primary: {
        name: 'Stable Audio FX',
        api: 'fal-ai/stable-audio/fx',
        estimatedCost: 0.05,
        reason: 'Best for sound effects'
      },
      fallback: {
        name: 'AudioGen',
        api: 'fal-ai/audiogen',
        estimatedCost: 0.05,
        reason: 'Alternative SFX'
      }
    };
  }

  private selectAudioEditModel(intent: UserIntent): ModelSelection {
    return {
      primary: {
        name: 'Audio Enhancement',
        api: 'fal-ai/audio-enhancement',
        estimatedCost: 0.05,
        reason: 'Professional audio processing'
      },
      fallback: {
        name: 'Spleeter',
        api: 'fal-ai/spleeter',
        estimatedCost: 0.05,
        reason: 'Audio separation'
      }
    };
  }

  // ========================================
  // VIDEO EDITING
  // ========================================

  private selectVideoEditModel(intent: UserIntent): ModelSelection {
    return {
      primary: {
        name: 'Auto Video Editor',
        api: 'fal-ai/auto-video-editor',
        estimatedCost: 0.15,
        reason: 'AI-powered video editing'
      },
      fallback: {
        name: 'Clip Extraction',
        api: 'fal-ai/clip-extraction',
        estimatedCost: 0.10,
        reason: 'Smart clip detection'
      }
    };
  }

  private selectCaptionModel(): ModelSelection {
    return {
      primary: {
        name: 'Auto Caption Pro',
        api: 'fal-ai/auto-caption/pro',
        estimatedCost: 0.08,
        reason: 'Best caption accuracy'
      },
      fallback: {
        name: 'Whisper Large v3',
        api: 'fal-ai/whisper/large-v3',
        estimatedCost: 0.05,
        reason: 'Reliable transcription'
      }
    };
  }

  private selectLipSyncModel(): ModelSelection {
    return {
      primary: {
        name: 'Wav2Lip',
        api: 'fal-ai/wav2lip',
        estimatedCost: 0.10,
        reason: 'Best lip sync quality'
      },
      fallback: {
        name: 'Sora 2 Lip Sync',
        api: 'fal-ai/sora-2/lip-sync',
        estimatedCost: 0.10,
        reason: 'Integrated lip sync'
      }
    };
  }

  // ========================================
  // 3D GENERATION
  // ========================================

  private select3DModel(intent: UserIntent): ModelSelection {
    if (intent.isEnterprise) {
      return {
        primary: {
          name: 'TripoSR Enterprise',
          api: 'fal-ai/triposr/enterprise',
          estimatedCost: 0.30,
          reason: 'Enterprise-grade 3D generation'
        },
        fallback: {
          name: 'Stable 3D',
          api: 'fal-ai/stable-3d',
          estimatedCost: 0.20,
          reason: 'Professional 3D alternative'
        }
      };
    }

    return {
      primary: {
        name: 'TripoSR',
        api: 'fal-ai/triposr',
        estimatedCost: 0.15,
        reason: 'Best text/image to 3D'
      },
      fallback: {
        name: 'Shap-E',
        api: 'fal-ai/shap-e',
        estimatedCost: 0.10,
        reason: 'Fast 3D generation'
      }
    };
  }

  // ========================================
  // TEXT & CONTENT (Claude)
  // ========================================

  private selectTextModel(): ModelSelection {
    return {
      primary: {
        name: 'Claude Sonnet 4.5',
        api: 'anthropic/claude-sonnet-4',
        estimatedCost: 0.01,
        reason: 'Best for content creation'
      },
      fallback: {
        name: 'Claude Haiku',
        api: 'anthropic/claude-haiku',
        estimatedCost: 0.005,
        reason: 'Fast content generation'
      }
    };
  }

  // ========================================
  // NEW CAPABILITIES (Phase 7)
  // ========================================

  private selectTranscriptionModel(): ModelSelection {
    return {
      primary: {
        name: 'Whisper Large V3',
        api: 'fal-ai/whisper',
        estimatedCost: 0.02,
        reason: 'Best transcription accuracy'
      },
      fallback: {
        name: 'Whisper Medium',
        api: 'openai/whisper-medium',
        estimatedCost: 0.01,
        reason: 'Fast transcription'
      }
    };
  }

  private selectVoiceChangeModel(): ModelSelection {
    return {
      primary: {
        name: 'ElevenLabs Voice Conversion',
        api: 'elevenlabs/voice-conversion',
        estimatedCost: 0.05,
        reason: 'High-quality voice modification'
      },
      fallback: {
        name: 'Resemble AI Voice Changer',
        api: 'resemble-ai/voice-changer',
        estimatedCost: 0.03,
        reason: 'Budget voice modification'
      }
    };
  }

  private selectBRollModel(): ModelSelection {
    return {
      primary: {
        name: 'Runway B-Roll Generator',
        api: 'runwayml/b-roll-generator',
        estimatedCost: 0.10,
        reason: 'AI-powered B-roll suggestions'
      },
      fallback: {
        name: 'Kling Video Generation',
        api: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
        estimatedCost: 0.07,
        reason: 'Generate custom B-roll'
      }
    };
  }

  private selectVideoEnhanceModel(intent: UserIntent): ModelSelection {
    if (intent.capability === 'COLOR_GRADING') {
      return {
        primary: {
          name: 'DaVinci Resolve AI',
          api: 'blackmagic/davinci-resolve-ai',
          estimatedCost: 0.08,
          reason: 'Professional color grading'
        },
        fallback: {
          name: 'Topaz Video AI',
          api: 'topaz/video-ai/color',
          estimatedCost: 0.05,
          reason: 'AI color enhancement'
        }
      };
    }

    return {
      primary: {
        name: 'Topaz Video AI',
        api: 'topaz/video-ai/enhance',
        estimatedCost: 0.06,
        reason: 'Professional video enhancement'
      },
      fallback: {
        name: 'Adobe Sensei Video',
        api: 'adobe/sensei/video-enhance',
        estimatedCost: 0.04,
        reason: 'AI video enhancement'
      }
    };
  }

  private selectTimeRemapModel(intent: UserIntent): ModelSelection {
    return {
      primary: {
        name: 'Topaz Video AI Slow-Mo',
        api: 'topaz/video-ai/slow-motion',
        estimatedCost: 0.08,
        reason: 'Best slow-motion quality'
      },
      fallback: {
        name: 'DAIN Frame Interpolation',
        api: 'dain/frame-interpolation',
        estimatedCost: 0.05,
        reason: 'Good slow-motion at lower cost'
      }
    };
  }

  private selectTransitionModel(): ModelSelection {
    return {
      primary: {
        name: 'Runway Transition Generator',
        api: 'runwayml/transition-generator',
        estimatedCost: 0.04,
        reason: 'AI-powered transitions'
      },
      fallback: {
        name: 'Adobe Sensei Transitions',
        api: 'adobe/sensei/transitions',
        estimatedCost: 0.03,
        reason: 'Standard AI transitions'
      }
    };
  }

  private selectAdvancedVideoModel(intent: UserIntent): ModelSelection {
    return {
      primary: {
        name: 'Runway Advanced Video',
        api: 'runwayml/advanced-video-tools',
        estimatedCost: 0.12,
        reason: 'Professional video manipulation'
      },
      fallback: {
        name: 'Stability AI Video',
        api: 'stability-ai/video-tools',
        estimatedCost: 0.08,
        reason: 'Advanced video editing'
      }
    };
  }

  private selectStyleTransferVideoModel(): ModelSelection {
    return {
      primary: {
        name: 'Runway Style Transfer Video',
        api: 'runwayml/style-transfer-video',
        estimatedCost: 0.10,
        reason: 'High-quality video style transfer'
      },
      fallback: {
        name: 'Fast Neural Style Video',
        api: 'neural-style/video-transfer',
        estimatedCost: 0.06,
        reason: 'Fast style transfer'
      }
    };
  }

  private selectFrameInterpolationModel(): ModelSelection {
    return {
      primary: {
        name: 'RIFE Frame Interpolation',
        api: 'rife/frame-interpolation',
        estimatedCost: 0.06,
        reason: 'Best frame interpolation'
      },
      fallback: {
        name: 'DAIN Interpolation',
        api: 'dain/interpolation',
        estimatedCost: 0.04,
        reason: 'Fast frame interpolation'
      }
    };
  }

  private selectComputerVisionModel(intent: UserIntent): ModelSelection {
    if (intent.capability === 'DEPTH_MAP') {
      return {
        primary: {
          name: 'Depth Anything V2',
          api: 'fal-ai/depth-anything-v2',
          estimatedCost: 0.03,
          reason: 'Best depth estimation'
        },
        fallback: {
          name: 'MiDaS Depth',
          api: 'midas/depth-estimation',
          estimatedCost: 0.02,
          reason: 'Fast depth maps'
        }
      };
    }

    return {
      primary: {
        name: 'Segment Anything Model (SAM)',
        api: 'meta/segment-anything',
        estimatedCost: 0.04,
        reason: 'Best segmentation model'
      },
      fallback: {
        name: 'MediaPipe Computer Vision',
        api: 'google/mediapipe',
        estimatedCost: 0.02,
        reason: 'Fast computer vision'
      }
    };
  }

  private selectPresentationModel(): ModelSelection {
    return {
      primary: {
        name: 'Claude Sonnet 4.5 + Canva AI',
        api: 'anthropic/claude-sonnet-4',
        estimatedCost: 0.05,
        reason: 'AI-powered presentation creation'
      },
      fallback: {
        name: 'Gamma AI Presentation',
        api: 'gamma/ai-presentation',
        estimatedCost: 0.03,
        reason: 'Fast presentation generation'
      }
    };
  }

  private selectMultimediaStoryModel(intent: UserIntent): ModelSelection {
    if (intent.capability === 'ILLUSTRATED_BOOK' || intent.capability === 'COMIC_STRIP') {
      return {
        primary: {
          name: 'Claude Sonnet + Flux Pro',
          api: 'multi-agent/story-illustration',
          estimatedCost: 0.20,
          reason: 'Complete story with illustrations'
        },
        fallback: {
          name: 'Claude Sonnet + SDXL',
          api: 'multi-agent/story-illustration-budget',
          estimatedCost: 0.12,
          reason: 'Budget illustrated story'
        }
      };
    }

    return {
      primary: {
        name: 'Claude Sonnet + Interactive Tools',
        api: 'multi-agent/interactive-story',
        estimatedCost: 0.15,
        reason: 'Interactive multimedia story'
      },
      fallback: {
        name: 'Claude Haiku + Interactive Tools',
        api: 'multi-agent/interactive-story-budget',
        estimatedCost: 0.08,
        reason: 'Budget interactive story'
      }
    };
  }
}
