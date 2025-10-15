// Load environment variables BEFORE anything else
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

// Now start the server
require('tsx/cli').main(['watch', '--tsconfig', 'tsconfig.json', 'server.ts']);
