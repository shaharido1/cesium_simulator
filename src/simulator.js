const {launch, getStream} = require("puppeteer-stream");
const {spawn} = require("child_process");
const Xvfb = require('xvfb');
const fs = require('fs');

class Simulator {
    constructor(port, width=1280, height =720) {
        this.width = width;
        this.height = height;
        this.localAddress = `http://localhost:${port}`
    }

    async init() {
        try {
            process.env.NO_VIEW_ENV && await this.initFalseView();
            await this.initPage();
            await this.initStreamVideo();
            return this.page;
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
        }
    }


    async initPage(width = this.width, height = this.height) {
        const options = {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
            // browserWSEndpoint: process.env.browserWSEndpoint || undefined,
            defaultViewport: {
                width,
                height,
            }
        }
        if (process.env.executablePath) {
            options.executablePath = process.env.executablePath
        }
        if (process.env.browserWSEndpoint) {
            options.browserWSEndpoint = process.env.browserWSEndpoint
        }
        try {
            console.log('lunch options', options)
            this.browser = await launch(options);
            this.page = await this.browser.newPage();
            await this.page.goto(this.localAddress);
        } catch (e) {
            console.log('error starting browser', e)
        }

    }


    initFalseView(width = this.width, height = this.height) {
        return new Promise((resolve, reject) => {
            const xvfb = new Xvfb({
                silent: true,
                xvfb_args: ["-screen", "0", `${width}x${height}x24`, "-ac"],
            });
            xvfb.start((err) => {
                    if (err) {
                        console.error(err);
                        reject(err)
                    }
                    resolve();
                }
            )
        })
    }

    async initStreamVideo() {
        const stream = await getStream(this.page, {
            video: true,
            // mimeType: 'video/mp4', //not working in chrome
            audio: false
        });
        const ffmpegParams = this.resolveFFMPEGParams();
        console.log('ffmpegParams', ffmpegParams)
        let ffmpeg = spawn("ffmpeg", ffmpegParams, {
            stdio: ["pipe", process.stdout, process.stderr]
        });
        const file = fs.createWriteStream(__dirname + "/test.mp4");
        stream.pipe(file)
        // stream.pipe(ffmpeg.stdin)
    }

    resolveFFMPEGParams() {
        if (process.env.FFEMPEG_PARAMS) {
            return process.env.FFEMPEG_PARAMS.split(',')
        } else {
            const ouput = process.env.CREATE_VIDEO ? "./screenshots/output.mp4" :
                process.env.UDP_ADDRESS ? process.env.UDP_ADDRESS
                    : "udp://239.255.42.41:30123";
            return ["-y", "-i", "-", "-c:v", "libx264", "-f", "mpegts", ouput]
        }

    }

}

module.exports = Simulator