import express, { type Request, type Response } from 'express';
import path from 'path';

const app = express();

const PORT = 3000;

// app.use(express.static(path.join(__dirname, 'assets')));
const filePath = path.join(__dirname, '../assets');

app.get("/", (req: Request, res: Response) => {

    res.sendFile(path.join(filePath, 'index.html'));


});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);


});