import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";

const PHONE_NUMBER = "94707435575";

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "debug" }),
    
  });

  sock.ev.on("creds.update", saveCreds);

  
    
    
  

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
  if (qr) {
    qrcode.generate(qr, { small: true });
  }

  if (connection === "open") {
    console.log("✅ PANTHER MD CONNECTED!");
  }

  if (connection === "close") {
  console.log("❌ Connection closed:", lastDisconnect?.error);
    const shouldReconnect =
      lastDisconnect?.error?.output?.statusCode !==
      DisconnectReason.loggedOut;

    if (shouldReconnect) {
      startBot();
    }
  }
});

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg?.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (text.toLowerCase() === ".ping") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🏓 PONG!\n\n🐾 Panther MD is online!"
      });
    }

    if (text.toLowerCase() === ".alive") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🟢 Panther MD\n\nBot is alive! 🐾"
      });
    }
  });
}

startBot();
