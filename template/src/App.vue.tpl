&lt;script setup&gt;
import { reactive, onMounted, ref, computed, onUnmounted } from &#39;vue&#39;
import * as Y from &#39;yjs&#39;
import { WebrtcProvider } from &#39;y-webrtc&#39;
import { WebsocketProvider } from &#39;y-websocket&#39;
import { assert, ValidationError, verifyContract } from &#39;./mycoassert&#39;
import { trails as localTrails } from &#39;./naver.js&#39;

// --- Y.js and CTX setup ---
const ydoc = new Y.Doc()
const webrtcProvider = new WebrtcProvider('mycelial-shell-room', ydoc)
const websocketProvider = new WebsocketProvider('ws://localhost:1234', 'mycelial-shell-room', ydoc)
// Example shared state - can be customized
const sharedData = ydoc.getMap('sharedData');
if (\!sharedData.get('welcomeMessage')) {
sharedData.set('welcomeMessage', 'Welcome to your new Mycelial Shell\!');
}

const handleDispatch = (action) =\> {
console.log(`SHELL [{{HOST_NAME}}]: Received dispatch for action: ${action.type}`);
// Add your custom action handling here
};

const shellCTX = reactive({
dispatch: handleDispatch,
state: sharedData,
utils: { assert, ValidationError },
});

// --- Naver Service ---
const activeTrail = ref(null);
const loadedSporeScripts = new Set();
const sporeViewStatus = ref('Initializing Naver...');
const foreignTrails = ref({});
const allAvailableTrails = computed(() =\> ({ ...localTrails, ...foreignTrails.value }));

const navigateTo = async (path, fromPopState = false) =\> {
const trailConfig = allAvailableTrails.value[path];
if (\!trailConfig) {
console.error(`NAVER: No trail found for path: ${path}`);
return;
}
const view = document.getElementById('spore-view');
if(view) view.innerHTML = '';
sporeViewStatus.value = `Loading trail: ${path}...`;
try {
if (\!loadedSporeScripts.has(trailConfig.name)) {
await new Promise((resolve, reject) =\> {
const script = document.createElement('script');
script.src = trailConfig.url;
script.onload = resolve;
script.onerror = () =\> reject(new Error(`Failed to load script`));
document.head.appendChild(script);
});
loadedSporeScripts.add(trailConfig.name);
}
const sporeModule = window[trailConfig.globalVar];
if (\!sporeModule || \!sporeModule.contract) throw new Error('Contract not found.');
verifyContract(shellCTX, sporeModule.contract);
if (typeof sporeModule.mount === 'function') {
sporeModule.mount(view, shellCTX);
activeTrail.value = trailConfig;
if (\!fromPopState) window.history.pushState({ path }, '', path);
sporeViewStatus.value = '';
} else {
throw new Error('Spore has no mount function.');
}
} catch (error) {
sporeViewStatus.value = `Error: ${error.message}`;
}
};

let discoveryInterval = null;
const discoverForeignHosts = async () =\> {
const response = await fetch('http://localhost:4000/hosts');
const hosts = await response.json();
const otherHosts = hosts.filter(h =\> h.hostName \!== '{{HOST\_NAME}}');
for(const host of otherHosts) {
const prefix = `/foreign/${host.hostName}/`;
if (Object.keys(foreignTrails.value).some(k =\> k.startsWith(prefix))) continue;
const manifest = await (await fetch(host.manifestUrl)).json();
for(const spore of manifest.spores) {
foreignTrails.value[`${prefix}${spore.name}`] = { ...spore, displayName: `${spore.name} (from ${host.hostName})`};
}
}
}
const handlePopState = (e) =\> navigateTo(e.state?.path || '/', true);

onMounted(async () =\> {
window.addEventListener('popstate', handlePopState);
await discoverForeignHosts();
discoveryInterval = setInterval(discoverForeignHosts, 5000);
navigateTo(window.location.pathname in allAvailableTrails.value ? window.location.pathname : '/');
});
onUnmounted(() =\> {
window.removeEventListener('popstate', handlePopState);
if (discoveryInterval) clearInterval(discoveryInterval);
});
&lt;/script&gt;

&lt;template&gt;
  &lt;div class=&quot;shell-container&quot;&gt;
    &lt;nav class=&quot;sidebar&quot;&gt;
        &lt;h1 class=&quot;shell-title&quot;&gt;{{PROJECT_NAME}}&lt;/h1&gt;
        &lt;ul class=&quot;main-nav&quot;&gt;
          &lt;li v-for=&quot;(trail, path) in allAvailableTrails&quot; :key=&quot;path&quot;&gt;
            &lt;a href=&quot;#&quot; @click.prevent=&quot;navigateTo(path)&quot; :class=&quot;{ active: activeTrail &amp;&amp; activeTrail.name === trail.name }&quot;&gt;
              {{ trail.displayName || trail.name }}
            &lt;/a&gt;
          &lt;/li&gt;
        &lt;/ul&gt;
    &lt;/nav&gt;
    &lt;main class=&quot;main-view&quot;&gt;
      &lt;div id=&quot;spore-view&quot; class=&quot;spore-view-host&quot;&gt;
        &lt;p v-if=&quot;sporeViewStatus&quot; class=&quot;spore-description&quot;&gt;{{ sporeViewStatus }}&lt;/p&gt;
         &lt;div v-if=&quot;!activeTrail &amp;&amp; !sporeViewStatus&quot; class=&quot;welcome-message&quot;&gt;
            &lt;h2&gt;Welcome to your new Mycelial Shell!&lt;/h2&gt;
            &lt;p&gt;Add local spores to &lt;code&gt;src/naver.js&lt;/code&gt; or run other Shells to discover them.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/main&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;style scoped&gt;
/* Basic styles for a clean layout */
.shell-container { display: flex; height: 100vh; font-family: Inter, sans-serif; background-color: #111827; color: #f9fafb; }
.sidebar { width: 260px; background-color: #1f2937; border-right: 1px solid #374151; padding: 1.5rem; display: flex; flex-direction: column; }
.shell-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem; }
.main-nav { list-style: none; padding: 0; margin: 0; }
.main-nav a { display: block; padding: 0.75rem 1rem; color: #9ca3af; text-decoration: none; border-radius: 0.5rem; }
.main-nav a:hover { background-color: #374151; color: #fff; }
.main-nav a.active { background-color: #8b5cf6; color: #fff; }
.main-view { flex-grow: 1; padding: 2rem; overflow-y: auto; }
.spore-view-host { height: 100%; }
.welcome-message, .spore-description { text-align: center; margin-top: 4rem; color: #6b7280; }
&lt;/style&gt;