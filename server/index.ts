import express, { type Request, type Response } from 'express';
import path from 'path';

const app = express();

const PORT = 3000;

// app.use(express.static(path.join(__dirname, 'assets')));
const filePath = path.join(__dirname, '../assets');

app.get("/", (req: Request, res: Response) => {

    res.sendFile(path.join(filePath, 'index.html'));


});

app.post("/shortit", (req: Request, res: Response) => {
    res.status(200).json("Received Post request");

});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);


});