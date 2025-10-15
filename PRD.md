# AIDA Product Requirements Document (PRD)

**Version:** 2.0  
**Date:** 2025-10-11  
**Status:** COMPLETE

---

## 🎯 Product Vision

**One Line:** AIDA è una piattaforma AI conversazionale per la creazione di contenuti multimediali (video, libri illustrati, grafiche) attraverso un sistema di agenti specializzati orchestrati intelligentemente.


## 🎨 **94 CREATIVE CAPABILITIES** (Complete Coverage)

AIDA supporta 94 diverse capabilities creative, organizzate per categoria:

### **📖 TEXT & WRITING** (13)
WRITE_STORY, WRITE_SCRIPT, WRITE_BLOG_POST, WRITE_SOCIAL_COPY, WRITE_POETRY, WRITE_SONG_LYRICS, WRITE_BOOK, WRITE_EMAIL, WRITE_SPEECH, EDIT_TEXT, TRANSLATE, LOCALIZE, SUMMARIZE_TEXT

### **🎨 VISUAL GENERATION** (13)
GENERATE_IMAGE, GENERATE_ILLUSTRATION, GENERATE_LOGO, GENERATE_ICON_SET, GENERATE_PORTRAIT, GENERATE_PRODUCT_PHOTO, GENERATE_SCENE, GENERATE_PATTERN, GENERATE_MOCKUP, GENERATE_BRAND_KIT, STYLE_TRANSFER, GENERATE_STORYBOARD, GENERATE_THUMBNAIL

### **✏️ IMAGE EDITING** (11)
REMOVE_BACKGROUND, REMOVE_OBJECT, ADD_OBJECT, CHANGE_BACKGROUND, UPSCALE_IMAGE, RESTORE_PHOTO, COLORIZE_BW, FACE_SWAP, CHANGE_OUTFIT, PHOTO_360_VIEW, STYLE_TRANSFER

### **🎬 VIDEO GENERATION** (11)
VIDEO_FROM_TEXT, IMAGE_TO_VIDEO, VIDEO_FROM_MUSIC, LIPSYNC_VIDEO, ANIMATE_CHARACTER, MUSIC_VIDEO, PRODUCT_VIDEO, EXPLAINER_VIDEO, SHORT_FORM_VIDEO, LONG_FORM_VIDEO, TESTIMONIAL_VIDEO

### **🎞️ VIDEO EDITING** (12)
VIDEO_TO_VIDEO, AUTO_EDIT_VIDEO, CLIP_EXTRACTION, VIDEO_REPURPOSE, VIDEO_DUBBING, AUTO_CAPTION, REMOVE_SILENCE, COLOR_GRADING, ADD_BROLL, VIDEO_STABILIZATION, SPEED_RAMPING, BACKGROUND_BLUR

### **🎵 AUDIO & MUSIC** (11)
GENERATE_MUSIC, GENERATE_SOUND_FX, TEXT_TO_SPEECH, VOICE_CLONE, EXTEND_MUSIC, REMIX_MUSIC, PODCAST_EDIT, AUDIO_ENHANCEMENT, AUDIO_TRANSCRIPTION, MEETING_SUMMARY, TEXT_TO_PODCAST

### **🖼️ DESIGN & BRANDING** (11)
POSTER_DESIGN, FLYER_DESIGN, BANNER_DESIGN, BUSINESS_CARD, PRESENTATION_DECK, INFOGRAPHIC, SOCIAL_POST, BOOK_COVER, ALBUM_COVER, MENU_DESIGN, INVITATION

### **📚 CONTENT REPURPOSING** (6)
BLOG_TO_VIDEO, LONG_TO_SHORT, VIDEO_TO_BLOG, PODCAST_TO_SOCIAL, PRESENTATION_TO_VIDEO, EBOOK_TO_COURSE

### **📚 MULTIMEDIA PROJECTS** (6)
ILLUSTRATED_BOOK, COMIC_BOOK, PHOTO_BOOK, PORTFOLIO, CATALOG, MAGAZINE

**Total: 94 Capabilities** supportate tramite orchestrazione intelligente di 80+ modelli AI (FAL.AI + KIE.AI)

---


**Problem:** I creator devono usare 10+ tool diversi per creare contenuti multimediali, con competenze tecniche complesse e costi elevati.

**Solution:** Un'unica chat conversazionale che orchestra agenti AI specializzati per guidare l'utente dalla concezione alla realizzazione finale.

**Target User:** Content creators, marketer, educatori, artisti - chiunque voglia creare contenuti senza competenze tecniche.

---

## 📊 Core Features (MVP)

### 1. User Input
- ✅ Chat conversazionale stile WhatsApp
- ✅ Input multimodale: testo, audio, foto, video
- ✅ Riconoscimento cognitivo adattivo (età, cultura, expertise)
- ✅ Memoria cross-session e cross-device
- ✅ Tono ironico/critico tipo Zerocalcare

### 2. Content Generation Pipeline
```
USER INPUT (idea/brief/asset)
    ↓
ORCHESTRATOR (analisi intent + routing)
    ↓
STYLE SELECTOR (selezione stile visivo)
    ↓
WRITER (narrativa/script)
    ↓
DIRECTOR (storyboard/shot list)
    ↓
VISUAL CREATOR (immagini via FAL.AI)
    ↓
VIDEO COMPOSER (montaggio via Kling/Veo)
    ↓
FINAL OUTPUT (video/libro/grafica)
```

### 3. Output Types
- **Video:** Social-ready (9:16, 16:9, 1:1), fino a 4K
- **Libro Illustrato:** PDF interattivo con immagini e testo
- **Grafica:** Locandine, poster, social media graphics
- **Audio:** Podcast, audiolibri (futuro)

### 4. Output Delivery
- ✅ Preview in-app con generazione progressiva
- ✅ Download diretto
- ✅ Share sui social
- ✅ Save nel cloud utente

---

## 💰 Pricing & Costs

### API Costs (per contenuto medio)
- FAL.AI image generation (FLUX): ~$0.05 per immagine
- FAL.AI video (Kling 2.5): ~$0.40 per 5 secondi
- Claude API (Sonnet 4.5): ~$0.02 per conversazione
- **Total cost per video 30s:** ~$2.50

### User Pricing
- **Free tier:** 3 contenuti/mese (watermark)
- **Pro:** €19/mese per 20 contenuti
- **Business:** €99/mese illimitati
- **Enterprise:** Custom

---

## 🔧 Technical Requirements

### Must Have (MVP)
1. **Orchestrator conversazionale** con memoria e personality
2. **6 Agenti base** (Orchestrator, Style, Writer, Director, Visual, Video)
3. **Chat interface** mobile-first
4. **Sistema account** con sync cross-device
5. **Integrazione FAL.AI** per tutti i modelli media

### Nice to Have (Post-MVP)
1. Voice agent per narrazione
2. Music composer per soundtrack
3. Collaborative editing multi-user
4. API pubblica per integrazioni
5. Plugin per creative tools

### Out of Scope (v1)
1. Desktop app nativa
2. Offline mode completo
3. Real-time collaboration
4. Custom model training
5. NFT/blockchain features

---

## 📈 Success Metrics

- ✅ Generazione contenuto in < 3 minuti
- ✅ Cost per contenuto < $3
- ✅ User retention > 40% monthly
- ✅ NPS score > 50
- ✅ System uptime > 99.9%

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API rate limits FAL.AI | High | Queue system + multiple API keys |
| Costi elevati per video lunghi | High | Limiti durata + tier pricing |
| Output non originale/banale | High | Prompt engineering avanzato per agente |
| Privacy contenuti utente | High | Encryption + no training on user data |
| Latenza generazione | Medium | Streaming progressivo + cache |

---

## 🚀 Launch Plan

### Phase 1: Alpha (Internal) - NOW
- **Date:** Ottobre 2025
- **Users:** 10 beta tester interni
- **Goal:** Test orchestrator + basic flow

### Phase 2: Beta (Closed) - Q4 2025
- **Date:** Novembre-Dicembre 2025
- **Users:** 100 early adopters
- **Goal:** Validate product-market fit

### Phase 3: Public Launch - Q1 2026
- **Date:** Gennaio 2026
- **Marketing:** Product Hunt + social campaign
- **Support:** In-app chat + Discord community

---

## ✅ Answered Questions

1. **Generation time:** 1-3 minuti per video standard
2. **Max video duration:** 60 secondi (estendibile a pagamento)
3. **Storage:** Firebase Cloud Storage + 30 giorni retention
4. **Watermark:** Solo su free tier, removibile con upgrade
5. **Music:** Libreria royalty-free integrata
6. **Languages:** Italiano + Inglese al lancio
7. **Content moderation:** NSFW filter automatico
8. **Concurrent generation:** 3 per utente Pro
9. **Video format:** MP4 H.264 (universale)
10. **Resolution:** 1080p default, 4K su richiesta

---

## 📝 Top User Stories

1. **As a** marketer, **I want to** create product videos quickly, **so that** I can test multiple creative angles
2. **As a** teacher, **I want to** create educational content, **so that** my lessons are more engaging  
3. **As an** artist, **I want to** bring my stories to life, **so that** I can share my vision
4. **As a** small business, **I want to** create ads affordably, **so that** I can compete with bigger brands
5. **As a** content creator, **I want to** produce daily content, **so that** I maintain audience engagement

---

## 🔄 Current State Assessment

### What Works Now
- ✅ Authentication system (JWT)
- ✅ Landing page (Luma-inspired)
- ✅ Database schema (PostgreSQL + Drizzle)
- ✅ Basic microservices structure
- ✅ Style Selector UI (60%)

### What's Partially Done
- 🟡 Orchestrator (80% - needs tests + personality)
- 🟡 Writer Agent (40% - needs conversation mode)
- 🟡 Director Agent (40% - needs tool integration)
- 🟡 Chat interface (exists but needs integration)

### What's Missing
- ❌ Visual Creator Agent
- ❌ Video Composer Agent  
- ❌ FAL.AI integration complete
- ❌ Payment system
- ❌ Mobile app (React Native)

---

## 🎯 Next Steps Priority

1. **IMMEDIATE:** Complete Orchestrator testing + personality system
2. **THIS WEEK:** Integrate FAL.AI + build Visual Creator agent
3. **THIS MONTH:** Full pipeline test (input → video output)

---

## 🛠 Architecture Decisions

### Agent Communication
- **Pattern:** Message Bus (async, queued)
- **Protocol:** JSON messages with typed schemas
- **Persistence:** PostgreSQL for conversation state

### Model Selection (FAL.AI)
- **Images:** FLUX for quality, SDXL for speed
- **Video:** Kling 2.5 for quality, Veo 3 for cost
- **Upscaling:** Real-ESRGAN for enhancement

### Personality System
- **Core:** Critico ma propositivo
- **Tone:** Ironico senza essere sarcastico
- **Adaptation:** Silenzioso basato su cognitive profile

---

**END OF PRD - Ready for implementation**
