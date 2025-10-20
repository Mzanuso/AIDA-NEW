// Test MCP VSCode Tool
// Creato da Claude

function saluta(nome) {
    console.log(`Ciao ${nome}!`);
    return `Benvenuto, ${nome}`;
}

// Chiamata di test
saluta("Sviluppatore");
saluta("Claude");

console.log("✅ Test MCP completato!");

module.exports = { saluta };
