import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { parseFile, selectCover } from 'music-metadata';

dotenv.config();

const audioPath = process.env.AUDIO_FILE_PATH;

export class AudioFileManager {
    static instance;
    
    constructor() {
        if(this.instance) return this.instance;

        this._trackList = [];
        this._trackImgMap = {};
        this.instance = this;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new AudioFileManager();
        }

        return this.instance;
    }

    initialize() {
        return new Promise((resolve, reject) => {
            fs.readdir(audioPath, (error, fileList) => {
                if (error) {
                    reject(error);
                } else {
                    const promiseList = [];
                    fileList.forEach(file => {
                        promiseList.push(parseFile(`${audioPath}/${file}`))
                    })

                    Promise.all(promiseList)
                        .then(result => {
                            result.forEach((item, idx) => {
                                const trackId = uuidv4();
                                item.trackId = trackId;
                                item.filePath = `${audioPath}/${fileList[idx]}`;
        
                                this._trackList.push(item);
                                this._trackImgMap[trackId] = selectCover(item.common.picture);
                            })

                            return result.length;
                        })
                        .then(cnt => {
                            console.log('Audio Initialized >> ' + cnt)
                        })
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    getTrackList() {
        return this._trackList.map(item => {
            return {
                _trackId: item.trackId,
                _album: item.common.album.toString('utf8'),
                _genre: item.common.genre,
                _title: item.common.title.toString('utf8'),
                _artist: item.common.artist.toString('utf8'),
                _artists: item.common.artists,
                _year: item.common.year,
                _duration: item.format.duration
            }
        })
    }

    getTrack(trackId) {
        return this._trackList.find(track => track.trackId === trackId);
    }

    getPicture(trackId) {
        return this._trackImgMap[trackId];
    }
}

export function getFormat(src) {
    if (src && src !== '') {
        return src.split(';base64,')[0].replace('data:', '');
    }

    return undefined;
}