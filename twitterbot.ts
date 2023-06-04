import { webkit } from "playwright";
import VerificationMailChecker from "./mail_confirmation";

class TwitterBot {
  randomDelay = async (min, max) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  };

  elementHasRendered = async (page, elementLocator) => {
    try {
      await page.waitForSelector(elementLocator, { timeout: 4400 });
      return true;
    } catch (error) {
      return false;
    }
  };

  simulateHumanTyping = async (page, selector, text) => {
    const element = await page.$(selector);
    await element.fill(text);
  };
  

  send = async (email, password, message, username) => {
    try {
      const browser = await webkit.launch({ headless: false });
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto("https://twitter.com/i/flow/login");

      await page.fill('input[type="text"]', email);
      await page.locator("text=Next").click();

      if (
        await this.elementHasRendered(
          page,
          'span:has-text("Enter your phone number or username")'
        )
      ) {
        console.log("FOUND FIRST ONE");
        await page.fill('[data-testid="ocfEnterTextTextInput"]', username);
        await page.locator("text=Next").click();
      } else {
        console.log("Element is not on the page. Continuing...");
      }

      if (
        await this.elementHasRendered(page, 'span:has-text("Check your email")')
      ) {
        console.log("FOUND SECOND ONE");

        const verifier = new VerificationMailChecker(email, password);
        await verifier.connect();

        await this.randomDelay(1000, 2000);

        const result = verifier.result;
        await page.fill('[data-testid="ocfEnterTextTextInput"]', String(result));
        await page.locator("text=Next").click();
      } else {
        console.log("Element is not on the page. Continuing...");
      }

      await page.fill('input[type="password"]', password);
      await page.locator("text=Log in").click();

      if (
        await this.elementHasRendered(page, 'span:has-text("Check your email")')
      ) {
        console.log("FOUND SECOND ONE");

        const verifier = new VerificationMailChecker(email, password);
        await verifier.connect();

        await this.randomDelay(6000, 7000);

        const result = verifier.result;
        await page.fill('[data-testid="ocfEnterTextTextInput"]', String(result));
        await page.locator("text=Next").click();
      } else {
        console.log("Element is not on the page. Continuing...");
      }

      await page.locator("text=Messages").click();
      await page.locator("text=Accept all cookies").click();
      const elementLocator = page.locator(
        '.css-4rbku5[data-testid="NewDM_Button"]'
      );
      await elementLocator.click();

      await this.randomDelay(1000, 2000);

      await page.fill('input[aria-label="Search query"]', "@jorj022799");
      await page.waitForSelector('div[data-testid="TypeaheadUser"]');
      const userList = await page.locator('div[data-testid="TypeaheadUser"]');
      await userList.nth(0).hover();
      await page.waitForTimeout(500);
      await userList.nth(0).click();
      await page.locator('text="Next"').click();

      const messageInput = page.locator(
        'aside[aria-label="Start a new message"]'
      );
      await messageInput.click();
      await this.simulateHumanTyping(
        page,
        'aside[aria-label="Start a new message"]',
        message
      );

      const submitButton = page.locator('div[aria-label="Send"]');
      await submitButton.click();

      console.log("Message sent successfully!");

      await browser.close();
    } catch (err) {
      console.error("An error occurred:", err);
    }
  };
}

export default TwitterBot;
