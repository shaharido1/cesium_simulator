
class Cesium_manipulation {
    constructor(initGeoJson  = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        34.87313, 32.19360
                    ]
                }
            }
        ]
    }) {
        this.initGeoJson = initGeoJson
    }

    async init(page,
               initView = [34.87313, 32.19360, 5000],
               initGeoJson = this.initGeoJson

               ) {
        this.page = page;
        this.directPage(initView)
        this.drawEntities(initGeoJson)

    }

    drawEntities(geoJson) {
        this.page&& this.page.evaluate((geoJson) => {
            try {
                viewer.dataSources.add(Cesium.GeoJsonDataSource.load(geoJson, {
                    stroke: Cesium.Color.HOTPINK,
                    fill: Cesium.Color.PINK,
                }));
            } catch (e) {
                console.log(e)
            }
        }, geoJson);

    }

    directPage([lat, lon, alt]) {
        this.centerPosition = [lat, lon, alt || 15000];
        console.log('directing', this.centerPosition);
        this.centerInterval && clearInterval(this.centerInterval);
        const duration = 10;
        this.flyToInInterval(duration, this.centerPosition);
        this.centerInterval = setInterval(() => this.flyToInInterval(duration, this.centerPosition), duration * 1000)
    }

    flyToInInterval(duration, [lat, lon, alt]) {
        lat = this.centerPosition[0] + Math.random() / 100;
        lon = this.centerPosition[1] + Math.random() / 100;
        alt = this.centerPosition[2] + Math.random();
        console.log('try to fly', [lat, lon, alt])
        this.page&& this.page.evaluate(([lat, lon, alt], duration) => {
            try {
                const destination = Cesium.Cartesian3.fromDegrees(lat, lon, alt);
                viewer.camera.flyTo({
                    destination,
                    duration
                });
                return destination;
            } catch (e) {
                console.log(e)
            }
        }, [lat, lon, alt], duration);
    }
}

module.exports = Cesium_manipulation