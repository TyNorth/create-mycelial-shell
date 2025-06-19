import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const registerHostPlugin = ({ port, hostName }) => ({
  name: 'register-host-plugin',
  configureServer: (server) => {
    server.httpServer.on('listening', async () => {
      const hostData = { hostName, manifestUrl: `http://localhost:${port}/manifest.json` };
      console.log(`\n[HOST-PLUGIN] Announcing presence for ${hostData.hostName}...`);
      try {
        await fetch('http://localhost:4000/register-host', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hostData),
        });
        console.log(`[HOST-PLUGIN] ✅ Successfully announced.`);
      } catch (error) {
        console.error(`[HOST-PLUGIN] ❌ Failed to announce. Is Rendezvous Server running?`);
      }
    });
  }
});

export default defineConfig({
  plugins: [
    vue(), 
    registerHostPlugin({
      port: {{PORT}},
      hostName: '{{HOST_NAME}}'
    })
  ],
  server: {
    port: {{PORT}},
    strictPort: true,
  }
})