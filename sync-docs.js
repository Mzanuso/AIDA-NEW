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

// Generate and update FLOW-STATUS.md
function generateFlowStatus() {
  const agents = architecture.agents;
  
  let content = `# FLOW STATUS\n\n**Version:** ${version}\n**Updated:** ${new Date().toISOString().split('T')[0]}\n**Architecture:** ${architecture.version}\n\n---\n\n## 🎯 Current Focus\n\n${currentFocus.phase}\n\n### Changes in Progress:\n${currentFocus.changes.map(c => `- ${c}`).join('\n')}\n\n### What's Preserved:\n${currentFocus.preserves.map(p => `- ✅ ${p}`).join('\n')}\n\n---\n\n## 📊 Agents Status (${architecture.version})\n\n`;

  // Generate agent status sections
  for (const [key, agent] of Object.entries(agents)) {
    const statusIcon = {
      complete: '✅',
      refactoring: '🔄',
      in_progress: '🟡',
      design: '📐',
      not_started: '⚪'
    }[agent.status] || '❓';
    
    const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
    content += `### ${statusIcon} ${name} - ${agent.completion}%\n**Role:** ${agent.role}\n**Status:** ${agent.status.replace(/_/g, ' ')}\n\n**Responsibilities:**\n${agent.responsibilities.map(r => `- ${r}`).join('\n')}\n\n`;
    
    if (agent.excludes && agent.excludes.length > 0) {
      content += `**Does NOT:**\n${agent.excludes.map(e => `- ❌ ${e}`).join('\n')}\n\n`;
    }
  }

  content += `---\n\n**Last Auto-Generated:** ${new Date().toISOString().split('T')[0]}\n**Source:** .flow/project-state.json\n`;
  return content;
}

console.log('🔄 Syncing documentation from project-state.json...\n');

try {
  console.log('📝 Updating FLOW-STATUS.md...');
  fs.writeFileSync('FLOW-STATUS.md', generateFlowStatus());
  console.log('✅ FLOW-STATUS.md updated\n');
  
  console.log('✨ Documentation synced successfully!');
  console.log(`\n📊 Summary: Version ${version}, Architecture ${architecture.version}`);
  
} catch (error) {
  console.error('❌ Error syncing documentation:', error.message);
  process.exit(1);
}
