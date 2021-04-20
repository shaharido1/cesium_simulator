const express = require('express')
const path = require('path')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const Simulator = require('./simulator');
const Cesium_manipulation = require('./cesium_manipulation');
const simulator = new Simulator(port);
const cesium_manipulation = new Cesium_manipulation();

app.use(express.static('public')); /* this line tells Express to use the public folder as our static folder from which we can serve static files*/
app.use(bodyParser.json({limit: '10mb'}));
app.use(express.urlencoded({extended: false}));

async function init() {
    const page = await simulator.init();
    await cesium_manipulation.init(page);
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'))
})

app.get('/test', (req, res) => {
    res.status(200).send('hello from simulator')
})


app.post('/draw', (req, res) => {
    if (!req.body) {
        return res.status(400).send('missing geo json')
    }
    cesium_manipulation.drawEntities(req.body);
    return res.status(200).send('drawing')
})

app.post('/direct', (req, res) => {
    console.log('direct request', req.body.lon, req.body.lat, req.body.alt)
    const {lon, lat, alt} = req.body
    if (!lon || !lat) {
        return res.status(400).send('missing lat and lon params')
    }
    cesium_manipulation.directPage([lon, lat, alt])
    return res.status(200).send('directing')
})
app.listen(port, () => {
    init().then(() => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
})