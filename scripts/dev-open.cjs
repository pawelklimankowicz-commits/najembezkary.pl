/**
 * Uruchamia `next dev` i po starcie serwera otwiera podgląd w przeglądarce.
 * Użycie: npm run dev:go
 */
const { spawn, exec } = require("child_process");
const http = require("http");
const path = require("path");

const root = path.join(__dirname, "..");
const port = process.env.PORT || "3000";
const url = `http://127.0.0.1:${port}`;

const child = spawn("npx", ["next", "dev", "-p", port], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, FORCE_COLOR: "1" },
});

function openBrowser() {
  const cmd =
    process.platform === "darwin"
      ? `open "${url}"`
      : process.platform === "win32"
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) {
      console.error(`\nOtwórz ręcznie: ${url}\n`);
    } else {
      console.log(`\nPodgląd: ${url}\n`);
    }
  });
}

let attempts = 0;
const maxAttempts = 120;

function waitForServer() {
  attempts += 1;
  const req = http.get(url, (res) => {
    if (res.statusCode && res.statusCode < 500) {
      openBrowser();
      return;
    }
    retry();
  });
  req.on("error", retry);
  req.setTimeout(2500, () => {
    req.destroy();
    retry();
  });
}

function retry() {
  if (attempts >= maxAttempts) {
    console.error(`\nBrak odpowiedzi pod ${url} — zobacz błędy powyżej.\n`);
    return;
  }
  setTimeout(waitForServer, 400);
}

setTimeout(waitForServer, 600);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
