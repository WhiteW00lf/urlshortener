import express, { type Request, type Response } from "express";
import path from "path";
import { prisma } from "../server/lib/prisma";
import { nanoid } from "nanoid";


function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
let BASE_URL = requireEnv("BASE_URL").replace(/\/+$/, "");
if (!BASE_URL) throw new Error("BASE_URL is not set");


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


    try {
        const link = await prisma.url.create(
            {
                data: {
                    userUrl: result.url,
                    shortCode: nanoid(7)
                },
            }
        );

        const fullurl = BASE_URL + '/' + `${link.shortCode}`;


        return res.status(201).json({ shortUrl: fullurl });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Something went wrong" });

    }









});

app.get("/:shortCode", async (req: Request, res: Response) => {

    const { shortCode } = req.params;

    if (typeof shortCode !== "string" || !/^[A-Za-z0-9_-]{7}$/.test(shortCode)) {
        return res.status(404).send("Short link not found");
    }


    try {

        const link = await prisma.url.findUnique({ where: { shortCode } });

        if (!link) {
            return res.status(404).send("Short link not found");
        }

        return res.redirect(302, link.userUrl);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Something went wrong");
    }


});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});