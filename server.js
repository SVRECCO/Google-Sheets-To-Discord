import express from "express";
import multer from "multer";
import { promises as fs } from "node:fs";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";
import { pdf } from "pdf-to-img";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("pdf"), async (req, res) => {
 try {
  if (!req.file) {
   return res.status(400).json({ error: "No PDF file provided" });
  }

  const webhookUrl = req.body.webhookUrl;
  const document = await pdf(req.file.path, { scale: 3 });
  const imageBuffer = await document.getPage(1);

  const form = new FormData();
  form.append(
   "payload_json",
   JSON.stringify({
    content: "📊 **Top 10 Model Plays** 🕒",
    embeds: [
     {
      image: {
       url: "attachment://sheet.png",
      },
     },
    ],
   })
  );

  form.append("file", imageBuffer, {
   filename: "sheet.png",
   contentType: "image/png",
  });

  const discordResponse = await fetch(webhookUrl, {
   method: "POST",
   body: form,
  });

  if (!discordResponse.ok) {
   throw new Error(`Discord webhook error: ${await discordResponse.text()}`);
  }

  await fs.unlink(req.file.path).catch(console.error);

  res.json({ success: true, message: "Image sent to Discord successfully" });
 } catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: error.message });
 }
});

app.get("/status", (req, res) => {
 res.json({ status: "Server is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
 console.log(`Test server status at: http://localhost:${PORT}/status`);
});
