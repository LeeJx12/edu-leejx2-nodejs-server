import express from 'express';
import { AudioFileManager } from './service';
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

app.get("/list", (request, response) => {
    response.json(AudioFileManager.getInstance().getTrackList());
});

(function() {
    AudioFileManager.getInstance().initialize()
        .then(() => {
            app.listen(process.env.AUDIO_SERVER_PORT, () => {console.log(`Audio Server Listen on ${process.env.AUDIO_SERVER_PORT}`)});
        })
})();