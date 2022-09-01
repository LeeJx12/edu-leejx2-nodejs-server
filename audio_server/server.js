import express from 'express';
import { AudioFileManager } from './service';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

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