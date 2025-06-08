const { spawn } = require("child_process");

// Démarrer le serveur principal
const mainServer = spawn("node", ["server.js"]);
mainServer.stdout.on("data", (data) => console.log(`Main server: ${data}`));
mainServer.stderr.on("data", (data) =>
  console.error(`Main server error: ${data}`)
);

// Démarrer le serveur proxy
const proxyServer = spawn("node", ["proxyServer.js"]);
proxyServer.stdout.on("data", (data) => console.log(`Proxy server: ${data}`));
proxyServer.stderr.on("data", (data) =>
  console.error(`Proxy server error: ${data}`)
);
