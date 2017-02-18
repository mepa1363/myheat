<template>
<div>
    <div id="map"></div>
    <md-button class="md-icon-button md-raised md-primary app-map-locate" @click="locateMe">
        <md-icon>near_me</md-icon>
    </md-button>
    <md-button class="md-icon-button md-raised md-primary app-map-zoom-in" @click="zoomIn">
        <md-icon>add</md-icon>
    </md-button>
    <md-button class="md-icon-button md-raised md-primary app-map-zoom-out" @click="zoomOut">
        <md-icon>remove</md-icon>
    </md-button>
    <md-card class="app-map-layer-control">
        <md-card-media>
            <a @click="toggleBaseMap">
                <img :src="baseMapUrl">
            </a>
            <md-ink-ripple></md-ink-ripple>
        </md-card-media>
    </md-card>
    <md-card class="app-map-legend">
        <span class="app-map-legend-title">Low Heat Loss</span>
        <span class="app-map-legend-item" style="background: #006837"></span>
        <span class="app-map-legend-item" style="background: #1a9850"></span>
        <span class="app-map-legend-item" style="background: #66bd63"></span>
        <span class="app-map-legend-item" style="background: #a6d96a"></span>
        <span class="app-map-legend-item" style="background: #d9ef8b"></span>
        <span class="app-map-legend-item" style="background: #fee08b"></span>
        <span class="app-map-legend-item" style="background: #fdae61"></span>
        <span class="app-map-legend-item" style="background: #f46d43"></span>
        <span class="app-map-legend-item" style="background: #d73027"></span>
        <span class="app-map-legend-item" style="background: #a50026"></span>
        <span class="app-map-legend-title">High Heat Loss</span>

    </md-card>
    <span style="display: none"> {{ getLayer }}</span>
</div>
</template>

<script>
import L from 'leaflet'
import calgaryParcel from '../parcel'

const cartoLight = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    maxZoom: 20,
    detectRetina: true,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
})

const hereHybrid = L.tileLayer('//{s}.aerial.maps.api.here.com/maptile/2.1/maptile/newest/hybrid.day/{z}/{x}/{y}/256/png8?app_id=gPNDV6fNNuwnxGf4yGoc&app_code=P-JVyExwlDyh5HDC0EwHwA', {
    maxZoom: 20,
    detectRetina: true,
    attribution: 'Map &copy; 1987-2017 <a href="http://developer.here.com">HERE</a>',
    subdomains: '1234'
})

const color = {
    'null': '#C8C8C8',
    1: '#006837',
    2: '#1a9850',
    3: '#66bd63',
    4: '#a6d96a',
    5: '#d9ef8b',
    6: '#fee08b',
    7: '#fdae61',
    8: '#f46d43',
    9: '#d73027',
    10: '#a50026'
}

export default {
    data() {
        return {
            map: null,
            parcelLayer: null,
            geojsonFeature: null,
            liteBaseMap: true,
            baseMapUrl: 'src/assets/earth.png'
        }
    },
    mounted() {
        this.map = L.map('map', {
            center: [51.0865, -114.155],
            zoom: 16,
            layers: [cartoLight],
            zoomControl: false
        })

        this.parcelLayer = calgaryParcel

        L.geoJSON(this.parcelLayer, {
            style: function(feature) {
                return {
                    'weight': 2,
                    'color': color[feature.properties.heatscore],
                    'opacity': 1,
                    'fillColor': color[feature.properties.heatscore],
                    'fillOpacity': 1
                }
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties && feature.properties.heatscore && feature.properties.id) {
                    var myheatUrl = 'https://myheat.ca/calgary/home?id=' + feature.properties.id
                    layer.bindPopup('<div class="app-map-popup-header">' +
                        '<i class="material-icons" style="font-size: 60px; color: ' + color[feature.properties.heatscore] + '">home</i><br />' +
                        'HEAT Score: <b>' + feature.properties.heatscore + '</b></div>' +
                        '<div class="app-map-popup-content">' +
                        '<a href="' + myheatUrl + '" target="_blank" style="color: #2196f3;">Find out more...</a>' +
                        '</div>')
                }
            }
        }).addTo(this.map)
    },
    updated() {
        this.geojsonFeature && this.map.removeLayer(this.geojsonFeature)
        this.geojsonFeature = L.geoJSON(this.$store.state.mapLayer)
        this.map.fitBounds(this.geojsonFeature.getBounds())

    },
    computed: {
        getLayer() {
            return this.$store.state.mapLayer
        }
    },
    methods: {
        zoomIn() {
            this.map.setZoom(this.map.getZoom() + 1)
        },
        zoomOut() {
            this.map.setZoom(this.map.getZoom() - 1)
        },
        locateMe() {
            this.map.locate({
                setView: true,
                maxZoom: 18
            })
        },
        toggleBaseMap() {
            if (this.liteBaseMap) {
                this.map.removeLayer(cartoLight)
                this.map.addLayer(hereHybrid)
                this.liteBaseMap = false
                this.baseMapUrl = 'src/assets/street.png'
            } else {
                this.map.removeLayer(hereHybrid)
                this.map.addLayer(cartoLight)
                this.liteBaseMap = true
                this.baseMapUrl = 'src/assets/earth.png'
            }
            var mapCenter = this.map.getBounds()
            var southWest = mapCenter._southWest
            var northEast = mapCenter._northEast
            var mapCenterGeoJson = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [southWest.lng, southWest.lat],
                            [southWest.lng, northEast.lat],
                            [northEast.lng, northEast.lat],
                            [northEast.lng, southWest.lat],
                            [southWest.lng, southWest.lat]
                        ]
                    ]
                }
            }
            this.$store.commit('addGeoJsonLayer', mapCenterGeoJson)
        }
    }
}
</script>



















<style src="../../node_modules/leaflet/dist/leaflet.css"></style>

<style>
#map {
    position: absolute;
    height: 100%;
    width: 100%;
}

.app-map-zoom-in {
    position: absolute;
    z-index: 1002;
    top: 20px;
    left: 10px;
    background-color: '#fff';
}

.app-map-zoom-out {
    position: absolute;
    z-index: 1002;
    top: 70px;
    left: 10px;
}

.app-map-locate {
    position: absolute;
    z-index: 1002;
    top: 120px;
    left: 10px;
}

.app-map-layer-control {
    position: absolute;
    z-index: 1002;
    bottom: 20px;
    right: 10px;
    width: 75px;
}

.app-map-layer-control .md-card-media img {
    padding: 2px;
}

.app-map-layer-control:hover {
    cursor: pointer;
}

.app-map-legend {
    position: absolute;
    z-index: 1002;
    bottom: 20px;
    left: 10px;
    width: 425px;
    padding: 10px;
    flex-direction: row;
}

.app-map-legend-item {
    width: 20px;
    height: 20px;
    float: left;
}

.app-map-legend-title {
    padding: 10px;
    font-size: 12px;
}

.leaflet-popup-content-wrapper {
    padding: 1px;
    text-align: center;
    -webkit-border-radius: 10px;
    border-radius: 10px;
}

.leaflet-popup-content {
    margin: 15px 10px 15px 10px;
    line-height: 1.4;
}

.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
    background: #ffffff;
}

.leaflet-container a.leaflet-popup-close-button {
    display: none;
}
</style>
