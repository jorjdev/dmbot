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
    await element.click();

    for (let i = 0; i < text.length; i++) {
      await page.keyboard.type(text[i]);

      await this.randomDelay(400, 550);
    }
  };

  mockUserList = [
    "@jorj022799",
    "@jorj022799",
    "@jorj022799",
    "@jorj022799",
    "@jorj022799",
    "@jorj022799",
    "@jorj022799",
  ];

  send = async (email, password, message, username) => {
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

      await page.waitForSelector(NEW_DM_BUTTON);
      await page.locator(ACCEPT_ALL_COOKIES).click();
      for (let user of this.mockUserList) {
        const elementLocator = page.locator(NEW_DM_BUTTON);
        elementLocator.click();

        await page.fill(SEARCH_USER_BUTTON, user);
        await page.waitForSelector(USER_ELEMENT_IN_LIST);
        const userList = await page.locator(USER_ELEMENT_IN_LIST);
        await userList.nth(0).hover();
        await page.waitForTimeout(500);
        await userList.nth(0).click();
        await page.locator(NEXT_BUTTON_TEXT).click();

        const messageInput = page.locator(SEND_DM_FIELD);
        await messageInput.click();
        await this.simulateHumanTyping(page, SEND_DM_FIELD, message);

        const submitButton = page.locator(SEND_DM_BUTTON);
        await submitButton.click();

        console.log("Message sent successfully!");
        this.randomDelay(1000, 2000);
      }
    } catch (err) {
      console.error(ERROR_OCCURED, err);
    }
  };
}

export default TwitterBot;
