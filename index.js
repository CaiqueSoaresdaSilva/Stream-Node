const app = require("express")();
const cors = require('cors');
const Stream = require("node-rtsp-stream");

app.use(cors());
const streams = {};

const stream_configs = [];

const stopStream = (port) => {
    if (streams[port]){
        streams[port].stop();
        streams[port] = null;
    }
};

const startStream = (name, streamUrl, wsPort) =>{

    const stream = new Stream({
        name,
        streamUrl,
        wsPort,
        ffmpegOptions: {
            "-stats": "",
            "-r": 30,
            "-s": "720x480",
            "-bf": 0
        },
    });

    streams[wsPort] = stream;
};

const startRecordStream = (name, streamUrl, wsPort) =>{

    const stream = new Stream({
        name,
        streamUrl,
        wsPort,
        ffmpegOptions: {
            "-stats": "",
            "-r": 20,
        },
    });

    streams[wsPort] = stream;
};

app.get("/start-stream", (req, res) => {
    // URL = RTSP LINNK
    // PORT = WSPORT
    const {url, port, key = "stream"} = req.query;

    console.log(req.query);

    if(!url && !port){
        return res.json({
            message: "Bad Input"
        })
    }
    if(streams[port]){
        return res.json({
            message: "the Port "+ port +" is in use"
        });
    }

    startStream(key, url, port);

    res.json({
        message: "Started Stream"
    });

});

app.get("/stop-stream", (req, res) => {

    const { port } = req.query;
    if(!streams[port]){
        return res.json({
            message: "Port is not in use",
        });
        console.log(message);
    }
    stopStream(port);

    return res.json({
        message: "Stopped"
    });
    console.log(message);
});


app.get("/recordsHikVision", (req, res) => {
    // URL = RTSP LINNK
    // PORT = WSPORT
    const {url, startTime, startHour, endTime, endHour, port, key = "stream"} = req.query;

    console.log(req.query);

    if(!url && !port){
        return res.json({
            message: "Bad Input"
        })
    }
    
    if(streams[port]){
        return res.json({
            message: "the Port "+ port +" is in use"
        });
    }

    if(!startTime && !endTime){
        return res.json({
            message: "Enter startTime and endtime to get the recording"
        })
    }

    
    if(!startHour && !endHour){
        return res.json({
            message: "Enter startHour and endHour to get the recording"
        })
    }

    const rec = url +'?starttime=' + startTime + 'T' + startHour + 'Z&endtime=' + endTime + 'T' + endHour + 'Z';
    console.log(rec);
    console.log('rtsp://admin:Tri123456@192.168.17.9/Streaming/tracks/101/?starttime=20211205T130000Z&endtime=20211205T130100Z');

    startRecordStream(key, rec, port);

    res.json({
        message: "Started Stream"
    });

});

app.listen(8080, () => {
    console.log('Server running 8080');
    stream_configs.forEach((config)=>{
        startStream(config.key, config.url, config.port);
    })
});