const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..")
const bin = (name) => path.join(root, "node_modules", ".bin", name)

// `output: export` cannot include Route Handlers (app/api, app/auth/callback)
// or middleware. The native app talks to these over HTTPS on Vercel instead,
// so we move them out of the tree for the static build and restore afterwards.
const SERVER_ONLY = ["app/api", "app/auth/callback", "middleware.ts"]
const stash = path.join(root, ".mobile-build-stash")

function moveAside() {
  fs.mkdirSync(stash, { recursive: true })
  for (const rel of SERVER_ONLY) {
    const src = path.join(root, rel)
    if (!fs.existsSync(src)) continue
    const dest = path.join(stash, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.renameSync(src, dest)
    console.log(`  moved aside: ${rel}`)
  }
}

function restore() {
  for (const rel of SERVER_ONLY) {
    const src = path.join(stash, rel)
    if (!fs.existsSync(src)) continue
    const dest = path.join(root, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.renameSync(src, dest)
    console.log(`  restored: ${rel}`)
  }
  fs.rmSync(stash, { recursive: true, force: true })
}

console.log("Building Castd mobile bundle (static export)...")

try {
  console.log("Excluding server-only files from static export...")
  moveAside()

  console.log("Building Next.js static export...")
  execSync(`"${bin("next")}" build`, {
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "mobile" },
  })
} finally {
  console.log("Restoring server-only files...")
  restore()
}

console.log("Syncing with Capacitor...")
execSync(`"${bin("cap")}" sync`, { stdio: "inherit" })

console.log("Mobile bundle ready. Open iOS with: npx cap open ios")
