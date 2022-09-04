import express from 'express';
import { AudioFileManager, getFormat } from './service';
import dotenv from 'dotenv';
import cors from 'cors';

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

app.get("/audio/pic/:trackId", (request, response) => {
    let data = AudioFileManager.getInstance().getPicture(request.params.trackId);
    const img = Buffer.from(data.data, 'base64');

    response.writeHead(200, {
        'Content-Type': data.format,
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