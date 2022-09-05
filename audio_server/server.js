import express from 'express';
import { AudioFileManager } from './service';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';

dotenv.config();

const app = express();

let corsOptions = {
    origin: 'http://localhost:3001',
    credentials: true
}

app.use(cors());

app.get("/", (request, response) => {
    response.send('<h1>Audio Server</h1>');
});

app.get("/audio", (request, response) => {
    response.json(AudioFileManager.getInstance().getTrackList());
});

app.get("/audio/:trackId", (request, response) => {
    const track = AudioFileManager.getInstance().getTrack(request.params.trackId);

    if (!track) {
        response.sendStatus(404);
        return;
    }

    const range = request.headers.range || "0";
    const filePath = track.filePath;
    const fileSize = fs.statSync(filePath).size;
    const chunkSize = 1 * 1e6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, fileSize - 1);
    const contentLength = end - start + 1;

    response.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "audio/mp3"
    });

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(response);
    stream.on('end', stream.close)
});

app.get("/audio/pic/:trackId", (request, response) => {
    let data = AudioFileManager.getInstance().getPicture(request.params.trackId);
    const img = Buffer.from(data.data, 'base64');

    response.writeHead(200, {
        'Content-Type': `image/${data.format}`,
        'Content-Length': img.length
    })
    response.end(img);
});

(function() {
    AudioFileManager.getInstance().initialize()
        .then(() => {
            app.listen(process.env.AUDIO_SERVER_PORT, () => {console.log(`Audio Server Listen on ${process.env.AUDIO_SERVER_PORT}`)});
        })
})();