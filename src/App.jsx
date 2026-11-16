import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";

const SHEET_URL = import.meta.env.VITE_SHEET_URL;
const MAX = 500;

const pop = { type: "spring", stiffness: 260, damping: 22 };

function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
    </div>
  );
}

/* ---------- Page 1: enter a name, get a QR ---------- */
function Create() {
  const [value, setValue] = useState("");
  const [name, setName] = useState(null);
  const [copied, setCopied] = useState(false);
  const box = useRef(null);

  const link = name
    ? `${location.origin}${location.pathname}?to=${encodeURIComponent(name)}`
    : "";

  const submit = (e) => {
    e.preventDefault();
    if (value.trim()) setName(value.trim());
  };

  const download = () => {
    const canvas = box.current.querySelector("canvas");
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${name}.png`;
    a.click();
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <AnimatePresence mode="wait">
      {!name ? (
        <motion.form
          key="form"
          className="panel"
          onSubmit={submit}
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotate: 3 }}
          transition={pop}
        >
          <h1 className="title">
            {"Who is this note for?".split(" ").map((w, i) => (
              <motion.span
                key={i}
                className="word"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ ...pop, delay: 0.15 + i * 0.07 }}
              >
                {w}&nbsp;
              </motion.span>
            ))}
          </h1>
          <p className="sub">Type a name. You get a QR code anyone can scan to leave that person a message.</p>
          <label className="field">
            <span>Name</span>
            <input
              autoFocus
              value={value}
              maxLength={40}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. Rina"
            />
          </label>
          <motion.button
            className="btn"
            type="submit"
            disabled={!value.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            Create QR code
          </motion.button>
        </motion.form>
      ) : (
        <motion.section
          key="qr"
          className="panel center"
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={pop}
        >
          <p className="sub">Scan to write a message for</p>
          <h2 className="name">{name}</h2>
          <div className="qr" ref={box}>
            <QRCodeCanvas value={link} size={220} level="M" marginSize={1} fgColor="#0E0D2B" />
            <span className="scan" aria-hidden="true" />
          </div>
          <div className="row">
            <motion.button className="btn" onClick={download} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
              Download PNG
            </motion.button>
            <motion.button className="btn ghost" onClick={copy} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
              {copied ? "Copied" : "Copy link"}
            </motion.button>
          </div>
          <button className="link" onClick={() => { setName(null); setValue(""); }}>
            Make another QR code
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/* ---------- Page 2: opened from the QR, write a message ---------- */
function Compose({ name }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error

  const send = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!SHEET_URL) return setStatus("error");
    setStatus("sending");
    try {
      // no-cors: Apps Script doesn't send CORS headers; the row is still written.
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ name, message: message.trim() }),
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {status !== "done" ? (
        <motion.form
          key="compose"
          className="panel"
          onSubmit={send}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60, rotate: -4, scale: 0.9 }}
          transition={pop}
        >
          <p className="sub">Message for</p>
          <h1 className="name">{name}</h1>
          <label className="field">
            <span>Your message</span>
            <textarea
              rows={5}
              maxLength={MAX}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write something kind…"
            />
            <em className="count">{message.length}/{MAX}</em>
          </label>
          {status === "error" && (
            <motion.p className="error" initial={{ x: -8 }} animate={{ x: [0, -8, 8, -4, 0] }}>
              {SHEET_URL
                ? "Couldn't send. Check your connection and try again."
                : "Sheet isn't connected. Set VITE_SHEET_URL in .env."}
            </motion.p>
          )}
          <motion.button
            className="btn"
            type="submit"
            disabled={!message.trim() || status === "sending"}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </motion.button>
        </motion.form>
      ) : (
        <motion.section
          key="done"
          className="panel center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={pop}
        >
          <svg className="check" viewBox="0 0 52 52" aria-hidden="true">
            <motion.circle cx="26" cy="26" r="23" fill="none" strokeWidth="4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
            <motion.path d="M15 27l8 8 14-17" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
          </svg>
          <h2 className="name">Sent to {name}</h2>
          <p className="sub">Your message is saved. Thank you.</p>
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.i
                key={i}
                style={{ background: ["#FFE45C", "#7CF2C4", "#2D2BEA", "#FF7AA8"][i % 4] }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i / 24) * Math.PI * 2) * (120 + (i % 5) * 20),
                  y: Math.sin((i / 24) * Math.PI * 2) * (120 + (i % 5) * 20),
                  opacity: 0, rotate: 360, scale: 0.4,
                }}
                transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
              />
            ))}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const to = new URLSearchParams(location.search).get("to");
  return (
    <main className="stage">
      <Backdrop />
      {to ? <Compose name={to} /> : <Create />}
    </main>
  );
}
