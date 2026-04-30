import { chromium } from "playwright"

const url = process.argv[2] ?? "http://localhost:3000/dashboard"

const browser = await chromium.launch({ channel: "msedge" })
const page = await browser.newPage()
const consoleMessages = []
const pageErrors = []

page.on("console", (message) => {
  consoleMessages.push({
    type: message.type(),
    text: message.text(),
  })
})

page.on("pageerror", (error) => {
  pageErrors.push(error.message)
})

await page.goto(url, { waitUntil: "networkidle" })
await page.waitForTimeout(500)

const dexieInitialized = consoleMessages.some(
  (message) =>
    message.type === "info" && message.text.includes("Dexie initialized")
)

await browser.close()

if (pageErrors.length > 0) {
  console.error(pageErrors.join("\n"))
  process.exit(1)
}

const consoleErrors = consoleMessages.filter(
  (message) => message.type === "error"
)

if (consoleErrors.length > 0) {
  console.error(consoleErrors.map((message) => message.text).join("\n"))
  process.exit(1)
}

if (!dexieInitialized) {
  console.error("Expected Dexie initialized console message was not found.")
  process.exit(1)
}

console.log("Dexie initialized without browser console errors.")
