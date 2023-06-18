import TwitterBot from "./twitterbot";
import fetchAccounts from "./db/mongo";

interface AccountDTO {
  email: string;
  password: string;
  username: string;
}

let listOfAccount = [];

function openInstance(account: AccountDTO, index: number) {
  setTimeout(() => {
    const bot = new TwitterBot();
    bot
      .send(account.email, account.password, "test", account.username)
      .catch((err) => {
        console.error("Error sending message:", err);
      });
  }, 1000 * index); //
}

fetchAccounts()
  .then((res) => (listOfAccount = res))
  .then(() =>
    listOfAccount.map((obj) => {
      const { _id, ...account } = obj;
    })
  )
  .then(() => {
    const startIndex = 29;
    const endIndex = startIndex + 1; // Open 10 instances

    for (let i = startIndex; i < endIndex && i < listOfAccount.length; i++) {
      openInstance(listOfAccount[i], i - startIndex);
    }
  });
