const TWITTER_LOGIN_URL = "https://twitter.com/i/flow/login";
const LOGIN_EMAIL_INPUT = 'input[type="text"]';
const PASSWORD_INPUT = 'input[type="password"]';
const NEXT_BUTTON_TEXT = 'text="Next"';
const ERROR_ELEMENT_NOT_ON_PAGE = "Element is not on the page. Continuing...";
const VERIFY_USERNAME_SPAN =
  'span:has-text("Enter your phone number or username")';
const CHECK_EMAIL_SPAN = 'span:has-text("Check your email")';
const EMAIL_OTP_FIELD = '[data-testid="ocfEnterTextTextInput"]';
const LOGIN_BUTTON_TEXT = "text=Log in";
const MESSAGES_BUTTON = "text=Messages";
const SEARCH_USER_BUTTON = 'input[aria-label="Search query"]';
const NEW_DM_BUTTON = '.css-4rbku5[data-testid="NewDM_Button"]';
const USER_ELEMENT_IN_LIST = 'div[data-testid="TypeaheadUser"]';
const SEND_DM_FIELD = 'aside[aria-label="Start a new message"]';
const SEND_DM_BUTTON = 'div[aria-label="Send"]';
const ACCEPT_ALL_COOKIES = "text=Accept all cookies";
const ERROR_OCCURED = "An error occurred:";

export {
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
  SEARCH_USER_BUTTON,
  USER_ELEMENT_IN_LIST,
  SEND_DM_BUTTON,
  SEND_DM_FIELD,
  ERROR_OCCURED,
  NEW_DM_BUTTON,
  ACCEPT_ALL_COOKIES,
};
