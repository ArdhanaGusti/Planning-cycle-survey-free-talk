# QR Notes

Enter a name → get a QR code → whoever scans it lands on a message form → the message is appended to a Google Sheet.

## 1. Connect the Google Sheet
1. Create a Google Sheet. Open **Extensions > Apps Script**.
2. Paste the contents of `apps-script/Code.gs` and save.
3. **Deploy > New deployment > Web app**. Execute as: *Me*. Who has access: *Anyone*. Deploy and authorize.
4. Copy the Web App URL.
5. `cp .env.example .env` and paste the URL into `VITE_SHEET_URL`.

Rows are written to a sheet tab named `Messages` (Timestamp, Name, Message).

## 2. Run
```
npm install
npm run dev
```

## 3. Make the QR scannable from phones
The QR encodes the URL the page is running on. `localhost` won't open on a phone, so either:
- open the app via your computer's LAN address (shown by `npm run dev`, e.g. `http://192.168.x.x:5173`) and generate the QR from there, or
- deploy it (`npm run build`, then Netlify / Vercel / GitHub Pages; set `VITE_SHEET_URL` as an environment variable) and generate QR codes from the live URL.

The message form lives at `/?to=<name>`.
