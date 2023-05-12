const { webkit } = require("playwright");

class TwitterBot {
  
  
sendDM = (async () => {
  const browser = await webkit.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to Twitter login page
  await page.goto("https://twitter.com/i/flow/login");

  // Fill in username and password fields and submit the form

  await page.fill('input[type="text"]', "fulicapranaru");

  await page.locator("text=Next").click();

  await page.fill('input[type="password"]', "Galati2022");

  await page.locator("text=Log in").click();

  await page.locator("text=Messages").click();
  await page.goto(
    "https://twitter.com/messages/1653806267775823889-1655207348049174530"
  );

  const messageInput = page.locator('aside[aria-label="Start a new message"]');

  await messageInput.click();

  await messageInput.type("Testare");

  const submitButton = page.locator('div[aria-label="Send"]');

  await submitButton.click();
  // You can now interact with the logged in Twitter page or perform any other actions you need to automate
})();
}