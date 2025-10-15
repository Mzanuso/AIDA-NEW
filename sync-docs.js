#!/usr/bin/env node

/**
 * AIDA Documentation Sync
 * 
 * Reads from .flow/project-state.json (single source of truth)
 * and automatically updates all derived documentation files.
 * 
 * Run: node sync-docs.js
 * Or: npm run sync:docs
 */

const fs = require('fs');
const path = require('path');

// Load project state (single source of truth)
const projectState = JSON.parse(
  fs.readFileSync('.flow/project-state.json', 'utf8')
);

const { version, lastUpdate, architecture, capabilities, techStack, currentFocus, languages } = projectState;

// ============================================================================
// 1. Update FLOW-STATUS.md
// ============================================================================
function generateFlowStatus() {
  const agents = architecture.agents;
  
  let content = `# FLOW STATUS

**Version:** ${version}
**Updated:** ${new Date().toISOString().split('T')[0]}
**Architecture:** ${architecture.version}

---

## 🎯 Current Focus

${currentFocus.phase}

### Changes in Progress:
${currentFocus.changes.map(c => `- ${c}`).join('\n')}

### What's Preserved:
${currentFocus.preserves.map(p => `- ✅ ${p}`).join('\n')}

---

## 📊 Agents Status (${architecture.version})

`;

  // Generate agent status
  for (const [key, agent] of Object.entries(agents)) {
    const statusIcon = {
      complete: '✅',
      refactoring: '🔄',
      in_progress: '🟡',
      design: '📐',
      not_started: '⚪'
    }[agent.status] || '❓';
    
    const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
    
    content += `### ${statusIcon} ${name} - ${agent.completion}%\n`;
    content += `**Role:** ${agent.role}\n`;
    content += `**Status:** ${agent.status.replace(/_/g, ' ')}\n`;
    
    if (agent.port) content += `**Port:** ${agent.port}\n`;
    if (agent.database) content += `**Database:** ${agent.database}\n`;
    if (agent.tests) content += `**Tests:** ${agent.tests}/31 passing\n`;
    
    content += `\n**Responsibilities:**\n`;
    agent.responsibilities.forEach(r => {
      content += `- ${r}\n`;
    });
    
    if (agent.excludes && agent.excludes.length > 0) {
      content += `\n**Does NOT:**\n`;
      agent.excludes.forEach(e => {
        content += `- ❌ ${e}\n`;
      });
    }
    
    content += `\n`;
  }

  content += `---

## 📈 Overall Progress

| Component | Status | Completion |
|-----------|--------|------------|
`;

  for (const [key, agent] of Object.entries(agents)) {
    const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
    const statusIcon = {
      complete: '✅',
      refactoring: '🔄',
      in_progress: '🟡',
      design: '📐',
      not_started: '⚪'
    }[agent.status] || '❓';
    
    content += `| ${name} | ${statusIcon} ${agent.status.replace(/_/g, ' ')} | ${agent.completion}% |\n`;
  }

  content += `\n---

## 🌍 Supported Languages

${languages.map(l => l.toUpperCase()).join(', ')}

---

## 📦 Capabilities

**Total:** ${capabilities.total} creative capabilities

| Category | Count |
|----------|-------|
| Text & Writing | ${capabilities.categories.text} |
| Visual Generation | ${capabilities.categories.visualGeneration} |
| Image Editing | ${capabilities.categories.imageEditing} |
| Video Generation | ${capabilities.categories.videoGeneration} |
| Video Editing | ${capabilities.categories.videoEditing} |
| Audio & Music | ${capabilities.categories.audio} |
| Design & Branding | ${capabilities.categories.design} |
| Content Repurposing | ${capabilities.categories.repurposing} |
| Multimedia Projects | ${capabilities.categories.multimedia} |

---

**Last Auto-Generated:** ${new Date().toISOString()}
**Source:** .flow/project-state.json
`;

  return content;
}

// ============================================================================
// 2. Update architecture/0-INDEX.md
// ============================================================================
function generateArchitectureIndex() {
  const agents = architecture.agents;
  
  let content = `# AIDA Architecture ${architecture.version}

**Version:** ${version}
**Updated:** ${new Date().toISOString().split('T')[0]}
**Description:** ${architecture.description}

---

## 🏗️ System Architecture

\`\`\`
${architecture.flow}
\`\`\`

---

## 🤖 Agent Roles & Responsibilities

`;

  for (const [key, agent] of Object.entries(agents)) {
    const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
    
    content += `### ${name} (${agent.role})\n\n`;
    content += `**Status:** ${agent.status} (${agent.completion}%)\n\n`;
    
    if (agent.port) content += `**Port:** ${agent.port}\n`;
    if (agent.database) content += `**Database:** ${agent.database}\n`;
    if (agent.implementation) content += `**Implementation:** ${agent.implementation}\n`;
    
    content += `\n**Responsibilities:**\n`;
    agent.responsibilities.forEach(r => {
      content += `- ✅ ${r}\n`;
    });
    
    if (agent.excludes && agent.excludes.length > 0) {
      content += `\n**Explicitly Excluded:**\n`;
      agent.excludes.forEach(e => {
        content += `- ❌ ${e}\n`;
      });
    }
    
    content += `\n---\n\n`;
  }

  content += `## 🔗 Integration Points

### Orchestrator → Technical Planner
\`\`\`
POST /api/plans/create
Body: ProjectBrief
Response: ExecutionPlan
\`\`\`

### Orchestrator → Style Selector
\`\`\`
GET /api/styles/gallery?category=X&limit=9
Response: StyleGallery
\`\`\`

### Technical Planner → Execution Agents
\`\`\`
Internal coordination via ExecutionPlan
\`\`\`

---

## 🛠️ Tech Stack

### Frontend
${Object.entries(techStack.frontend).map(([k, v]) => `- **${k}:** ${v}`).join('\n')}

### Backend
${Object.entries(techStack.backend).map(([k, v]) => `- **${k}:** ${v}`).join('\n')}

### AI Services
${Object.entries(techStack.ai).map(([k, v]) => `- **${k}:** ${v}`).join('\n')}

---

**Last Auto-Generated:** ${new Date().toISOString()}
**Source:** .flow/project-state.json
`;

  return content;
}

// ============================================================================
// 3. Update PRD.md (Architecture Section Only)
// ============================================================================
function updatePRDArchitecture() {
  const prdPath = 'PRD.md';
  let prd = fs.readFileSync(prdPath, 'utf8');
  
  // Find the architecture section
  const startMarker = '## 📊 Core Features (MVP)';
  const endMarker = '## 💰 Pricing & Costs';
  
  const startIdx = prd.indexOf(startMarker);
  const endIdx = prd.indexOf(endMarker);
  
  if (startIdx === -1 || endIdx === -1) {
    console.warn('⚠️  Could not find architecture markers in PRD.md');
    return prd;
  }
  
  // New architecture section
  const newArchSection = `

### 2. Architecture ${architecture.version}

${architecture.description}

**Flow:**
\`\`\`
${architecture.flow}
\`\`\`

**Agent Roles:**

`;

  let agentsSummary = '';
  for (const [key, agent] of Object.entries(architecture.agents)) {
    const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
    agentsSummary += `**${name} (${agent.role}):**\n`;
    agentsSummary += `- ${agent.responsibilities.slice(0, 3).join('\n- ')}\n`;
    if (agent.excludes && agent.excludes.length > 0) {
      agentsSummary += `- ❌ Does NOT: ${agent.excludes.join(', ')}\n`;
    }
    agentsSummary += `\n`;
  }
  
  // Find old "Content Generation Pipeline" section and replace
  const pipelineStart = prd.indexOf('### 2. Content Generation Pipeline');
  const pipelineEnd = prd.indexOf('### 3.', pipelineStart);
  
  if (pipelineStart !== -1 && pipelineEnd !== -1) {
    prd = prd.substring(0, pipelineStart) + 
          `### 2. Architecture ${architecture.version}\n\n` +
          `${architecture.description}\n\n` +
          `**Flow:**\n\`\`\`\n${architecture.flow}\n\`\`\`\n\n` +
          `**Agent Roles:**\n\n${agentsSummary}` +
          prd.substring(pipelineEnd);
  }
  
  return prd;
}

// ============================================================================
// Execute Updates
// ============================================================================

console.log('🔄 Syncing documentation from project-state.json...\n');

try {
  // 1. Update FLOW-STATUS.md
  console.log('📝 Updating FLOW-STATUS.md...');
  fs.writeFileSync('FLOW-STATUS.md', generateFlowStatus());
  console.log('✅ FLOW-STATUS.md updated\n');
  
  // 2. Update architecture/0-INDEX.md
  console.log('📝 Updating architecture/0-INDEX.md...');
  fs.writeFileSync('architecture/0-INDEX.md', generateArchitectureIndex());
  console.log('✅ architecture/0-INDEX.md updated\n');
  
  // 3. Update PRD.md architecture section
  console.log('📝 Updating PRD.md (architecture section)...');
  const updatedPRD = updatePRDArchitecture();
  fs.writeFileSync('PRD.md', updatedPRD);
  console.log('✅ PRD.md updated\n');
  
  console.log('✨ All documentation synced successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Version: ${version}`);
  console.log(`   Architecture: ${architecture.version}`);
  console.log(`   Capabilities: ${capabilities.total}`);
  console.log(`   Languages: ${languages.length}`);
  console.log('\n💡 To update docs, edit .flow/project-state.json and run: npm run sync:docs');
  
} catch (error) {
  console.error('❌ Error syncing documentation:', error.message);
  process.exit(1);
}
