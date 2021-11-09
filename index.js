const app = require("express")();

const Stream = require("node-rtsp-stream");

const streams = {};

const stream_configs = [{
    key: 'Portaria',
    port: 9000,
    url: 'rtsp://admin:Tri123456@192.168.17.12/ISAPI/Streaming/Channels/101.mov'
}];

const startStream = (name, streamUrl, wsPort) =>{

    const stream = new Stream({
        name,
        streamUrl,
        wsPort,
        ffmpegOptions: {
            "-stats": "",
            "-r": 30,
        },
    });

    streams[wsPort] = stream;
}

app.get('start-Stream', (req, res) => {
    // URL = RTSP LINNK
    // PORT = WSPORT
    const {url, port, key = "stream"} = req.query;
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

app.listen(8080, () => {
    console.log('Server running 8080');
    
    stream_configs.forEach((config)=>{
        startStream(config.key, config.url, config.port);
    })
});