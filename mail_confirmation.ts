import Imap = require("imap");

interface EmailResult {
  sequenceNumber: number;
  result: string;
}

interface Mailbox {
  spamMailbox: Imap.MailBox;
  inboxMailbox: Imap.MailBox;
}

export default class VerificationMailChecker {
  private config: Imap.Config;
  private imap: Imap;
  public result: string | null;

  constructor(email: string, password: string) {
    this.config = {
      user: email,
      password: password,
      host: "imap.gmx.com",
      port: 993,
      tls: true,
    };

    this.imap = new Imap(this.config);
    this.result = null; // Initialize result as null
  }

  private openMailbox(mailboxName: string): Promise<Imap.MailBox> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(mailboxName, true, (error, mailbox) => {
        if (error) {
          console.error(`Error opening ${mailboxName} folder:`, error);
          reject(error);
          return;
        }

        resolve(mailbox);
      });
    });
  }

  private fetchEmails(mailbox: Imap.MailBox, fetchOptions: Imap.FetchOptions): Promise<EmailResult[]> {
    return new Promise((resolve, reject) => {
      const fetch = this.imap.seq.fetch("1:*", fetchOptions);
      const matchingEmails: EmailResult[] = [];

      const processEmail = (message: Imap.ImapMessage, sequenceNumber: number) => {
        message.on("body", (stream, info) => {
          let buffer = "";

          stream.on("data", (chunk) => {
            buffer += chunk.toString("utf8");
          });

          stream.on("end", () => {
            const subject = buffer.match(/Subject: (.*)/)?.[1] || "";

            if (subject.toLowerCase().includes("is")) {
              const words = subject.split(" ");
              const halfLength = Math.floor(words.length / 2);
              const firstHalf = words.slice(0, halfLength);
              const secondHalf = words.slice(halfLength);

              let result = "";
              if (firstHalf.join(" ").toLowerCase().includes("is")) {
                result = firstHalf[0];
              } else if (secondHalf.join(" ").toLowerCase().includes("is")) {
                result = secondHalf[secondHalf.length - 1];
              }

              matchingEmails.push({ sequenceNumber, result });
            }
          });
        });
      };

      fetch.on("message", (message: Imap.ImapMessage, sequenceNumber: number) => {
        processEmail(message, sequenceNumber);
      });

      fetch.on("error", (error: Error) => {
        console.error("Error fetching emails:", error);
        reject(error);
      });

      fetch.on("end", () => {
        resolve(matchingEmails);
      });
    });
  }

  public processEmails(mailboxName: string): Promise<void> {
    return this.openMailbox(mailboxName)
      .then((mailbox) => {
        const fetchOptions: Imap.FetchOptions = {
          bodies: ["HEADER.FIELDS (SUBJECT)"],
          markSeen: false,
          struct: true,
          source: mailboxName,
        };

        return this.fetchEmails(mailbox, fetchOptions)
          .then((matchingEmails) => {
            if (matchingEmails.length > 0) {
              matchingEmails.sort((a, b) => b.sequenceNumber - a.sequenceNumber);

              const latestEmail = matchingEmails[0];
              this.result = latestEmail.result; // Store the result in the instance variable

              console.log("Latest Email Result:", this.result);
            } else {
              console.log("No emails found with the specified subject");
            }

            this.imap.end();
          });
      })
      .catch((error) => {
        console.error("Error processing emails:", error);
      });
  }

  public connect(mailbox: "INBOX" | "Spam"): void {
    this.imap.connect();

    this.imap.on("ready", () => {
      console.log("Connected to GMX mailbox");
      setTimeout(() => {
        this.processEmails(mailbox);
      }, 5000); // Delay of 5 seconds before starting email processing
    });

    this.imap.on("error", (error) => {
      console.error("Error connecting to GMX mailbox:", error);
    });
  }
}
