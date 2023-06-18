import Scrapper from "./scrapper";

async function runScrapper() {
  const scrapper = new Scrapper();

  const email = "gyyolot17zfln6a6g3@gmx.com";
  const password = "QZW6kWlspqNh6aK";
  const username = "BryanAsia3109";
  const targetUser = "Elektra_Cox"

  scrapper.scrapeTwitterFollowers(email, password, username,targetUser);
}

runScrapper();
