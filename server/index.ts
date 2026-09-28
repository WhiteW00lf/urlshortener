import express, { type Request, type Response } from "express";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.json());

const filePath = path.join(__dirname, "../assets");

const MAX_URL_LENGTH = 2048;

type ValidationResult = { ok: true; url: string } | { ok: false; error: string };

function validateUrl(input: unknown): ValidationResult {
  if (typeof input !== "string") {
    return { ok: false, error: "Please provide a URL." };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { ok: false, error: "Please provide a URL." };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return { ok: false, error: "URL is too long. Provide a shorter one." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: "Enter a valid URL, including http:// or https://" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "Only http and https URLs are allowed." };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, error: "URLs containing credentials are not allowed." };
  }

  return { ok: true, url: parsed.href };
}

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(filePath, "index.html"));
});

app.post("/shortit", async (req: Request, res: Response) => {
  const result = validateUrl(req.body?.userUrl);

  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  return res.status(200).json({ shortUrl: result.url });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});