import { chromium } from "playwright"

const baseUrl = process.argv[2] ?? "http://localhost:3000"

async function resetIndexedDb(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" })
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase("dietapp")
      request.onsuccess = () => resolve(undefined)
      request.onerror = () => reject(request.error)
      request.onblocked = () => resolve(undefined)
    })
  })
}

async function runFlow(viewport) {
  const browser = await chromium.launch({ channel: "msedge" })
  const page = await browser.newPage({ viewport })
  const consoleErrors = []
  const pageErrors = []

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text())
    }
  })
  page.on("pageerror", (error) => pageErrors.push(error.message))

  await resetIndexedDb(page)
  await page.goto(`${baseUrl}/recipes/new`, { waitUntil: "networkidle" })
  await page.locator('[name="name"]').fill("家常豆腐")
  await page.locator('textarea[name="description"]').fill("快手豆腐菜")
  await page.locator('[name="serves"]').fill("3")
  await page.locator('[name="prepMinutes"]').fill("8")
  await page.locator('[name="cookMinutes"]').fill("12")
  await page.locator('[name="source"]').fill("妈妈配方")
  await page.locator('[name="tagsText"]').fill("快手, 家常菜")
  await page.locator('[name="ingredients.0.name"]').fill("豆腐")
  await page.locator('[name="ingredients.0.quantity"]').fill("1")
  await page.locator('[name="ingredients.0.unit"]').fill("块")
  await page.locator('[name="steps.0.instruction"]').fill("豆腐切块后红烧。")
  await page.getByRole("button", { name: "Add Chengyuan" }).click()
  await page.locator('[name="memberNotes.0.notes"]').fill("少放辣")
  await page.getByRole("button", { name: "Save recipe" }).click()
  await page.waitForURL(/\/recipes\/[^/]+$/)
  await page.getByRole("heading", { name: "家常豆腐" }).waitFor()

  const recipeUrl = page.url()
  await page.getByRole("link", { name: "Edit" }).click()
  await page.waitForURL(/\/edit$/)
  await page.locator('[name="name"]').fill("家常豆腐更新")
  await page.getByRole("button", { name: "Save changes" }).click()
  await page.waitForURL(/\/recipes\/[^/]+$/)
  await page.getByRole("heading", { name: "家常豆腐更新" }).waitFor()

  await page.goto(`${baseUrl}/recipes`, { waitUntil: "networkidle" })
  await page.getByPlaceholder("Search recipes, ingredients, tags, notes").fill("豆腐")
  await page.getByRole("heading", { name: "家常豆腐更新" }).waitFor()

  await page.goto(recipeUrl, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Delete" }).click()
  await page.waitForURL(/\/recipes\?deleted=/)
  await page.getByText("was deleted").waitFor()
  await page.getByRole("button", { name: "Undo", exact: true }).click()
  await page.getByRole("heading", { name: "家常豆腐更新" }).waitFor()

  await page.reload({ waitUntil: "networkidle" })
  await page.getByRole("heading", { name: "家常豆腐更新" }).waitFor()

  await browser.close()

  if (pageErrors.length > 0 || consoleErrors.length > 0) {
    throw new Error([...pageErrors, ...consoleErrors].join("\n"))
  }
}

await runFlow({ width: 1280, height: 900 })
await runFlow({ width: 390, height: 844 })

console.log("Recipe browser flow passed on desktop and mobile viewports.")
