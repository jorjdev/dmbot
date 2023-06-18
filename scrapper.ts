import { webkit } from "playwright";
import VerificationMailChecker from "./mail_confirmation";
import {
  TWITTER_LOGIN_URL,
  LOGIN_EMAIL_INPUT,
  PASSWORD_INPUT,
  NEXT_BUTTON_TEXT,
  ERROR_ELEMENT_NOT_ON_PAGE,
  VERIFY_USERNAME_SPAN,
  CHECK_EMAIL_SPAN,
  EMAIL_OTP_FIELD,
  LOGIN_BUTTON_TEXT,
  MESSAGES_BUTTON,
  NEW_DM_BUTTON,
  SEARCH_USER_BUTTON,
  USER_ELEMENT_IN_LIST,
  SEND_DM_FIELD,
  SEND_DM_BUTTON,
  ERROR_OCCURED,
  ACCEPT_ALL_COOKIES,
} from "./constants";

class Scrapper {
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

  scrollPageToBottom = async (page) => {
    page;
    this.randomDelay(2000, 2500);
  };

  scrapeTwitterFollowers = async (email, password, username, targetUser) => {
    const verifier = new VerificationMailChecker(email, password);
    try {
      const browser = await webkit.launch({ headless: false });
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(TWITTER_LOGIN_URL);

      if (await this.elementHasRendered(page, LOGIN_EMAIL_INPUT)) {
        await this.simulateHumanTyping(page, LOGIN_EMAIL_INPUT, email);
        await page.locator(NEXT_BUTTON_TEXT).click();
      } else {
        console.log(ERROR_ELEMENT_NOT_ON_PAGE);
      }

      if (await this.elementHasRendered(page, VERIFY_USERNAME_SPAN)) {
        await this.randomDelay(2300, 3000);
        await this.simulateHumanTyping(page, EMAIL_OTP_FIELD, username);
        await page.locator(NEXT_BUTTON_TEXT).click();
      } else {
        console.log(ERROR_ELEMENT_NOT_ON_PAGE);
      }

      if (await this.elementHasRendered(page, CHECK_EMAIL_SPAN)) {
        await verifier.connect("INBOX");

        await this.randomDelay(4000, 6000);

        let firstResult = verifier.result;
        if (firstResult == null) {
          verifier.connect("Spam");
          firstResult = verifier.result;
        }
        await this.simulateHumanTyping(
          page,
          EMAIL_OTP_FIELD,
          String(firstResult)
        );
        await page.locator(NEXT_BUTTON_TEXT).click();
      } else {
        console.log(ERROR_ELEMENT_NOT_ON_PAGE);
      }

      await this.simulateHumanTyping(page, PASSWORD_INPUT, password);
      await page.locator(LOGIN_BUTTON_TEXT).click();

      if (await this.elementHasRendered(page, CHECK_EMAIL_SPAN)) {
        await verifier.connect("INBOX");

        await this.randomDelay(6000, 7000);

        let firstResult = verifier.result;
        if (firstResult == null) {
          await verifier.connect("Spam");
          firstResult = verifier.result;
        }
        await page.fill(EMAIL_OTP_FIELD, "");
        await this.simulateHumanTyping(
          page,
          EMAIL_OTP_FIELD,
          String(firstResult)
        );
        await page.locator(NEXT_BUTTON_TEXT).click();
      } else {
        console.log(ERROR_ELEMENT_NOT_ON_PAGE);
      }
      await verifier.connect("Spam"); // Switch to the Spam folder

      await page
        .waitForSelector(MESSAGES_BUTTON, { timeout: 7000 })
        .then(async () => await page.locator(MESSAGES_BUTTON).click())
        .catch(async () => {
          let finalResult = verifier.result;
          await page.fill(EMAIL_OTP_FIELD, "");
          await this.simulateHumanTyping(
            page,
            EMAIL_OTP_FIELD,
            String(finalResult)
          );
          await page.locator(NEXT_BUTTON_TEXT).click();
          await page.locator(MESSAGES_BUTTON).click();
        });
      await page.goto(`https://twitter.com/${targetUser}/followers`);

      await page.waitForSelector(`text=@${targetUser}`);
      await page.locator(ACCEPT_ALL_COOKIES).click();
      await page.waitForLoadState("networkidle");
      for (let i = 0; i < 1100; i++) {
        await page.keyboard.press("Tab");
        const focusedElement = await page.$(":focus");
        const itemText = await focusedElement.textContent();
        const atIndex = itemText.indexOf("@");
        const followIndex = itemText.indexOf("Follow", atIndex);

        if (atIndex !== -1 && followIndex !== -1) {
          const extractedText = itemText
            .substring(atIndex + 1, followIndex)
            .trim();
          console.log(extractedText);
        }

        await this.randomDelay(100, 250);
      }

    } catch (err) {
      console.error("An error occurred:", err);
    }
  };
}

export default Scrapper;
