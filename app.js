import { readFileSync } from "fs";
import { join } from "path";
import express from "express";
// const { Feature, Map, View } = require("ol");
import { Icon, Style } from "ol/style.js";
import { Tile, Vector } from "ol/layer.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { fromLonLat } from "ol/proj.js";
import { Map, Feature, View } from "ol";
import { LineString } from "ol/geom.js";

const app = express();
const port = process.env.PORT || 6000;

const countries = [
  { name: "Nigeria", lon: 3.3792, lat: 6.5244 },
  { name: "Ghana", lon: -0.186964, lat: 5.6037 },
  { name: "Togo", lon: 0.8248, lat: 8.6195 },
  { name: "Benin", lon: 2.3158, lat: 6.335},
  // Add more countries as desired...
];

const arrowSource = new VectorSource();
for (let i = 0; i < 100; i++) {
  const startPoint = fromLonLat([
    Math.random() * 30 - 20,
    Math.random() * 20 - 10,
  ]);
  const endPoint = fromLonLat([
    countries[Math.floor(Math.random() * countries.length)].lon,
    countries[Math.floor(Math.random() * countries.length)].lat,
  ]);
  const feature = new Feature({
    geometry: new LineString([startPoint, endPoint]),
    arrowSize: Math.random() * 0.5 + 0.1,
    bearing: getBearing(startPoint, endPoint),
  });
  arrowSource.addFeature(feature);
}

function getBearing(startPoint, endPoint) {
  const [x, y] = [
    endPoint[0] - startPoint[0],
    endPoint[1] - startPoint[1],
  ];
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return bearing >= 0 ? bearing : 360 + bearing;
}

function arrowStyle(feature) {
  const bearing = feature.get("bearing");
  const arrowSize = feature.get("arrowSize");
  return new Style({
    image: new Icon({
      src: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAMBJREFUSEvt1tENwjAMBNDrZnQyYDJgM3QIS2mFyDm61B+Q3zZ5tRO7WVA0liIXf3gk8ycA5/fEK4C7sogj1TcAxGMQv/TwGTDNLu6AGV2kug30K+6AiaVxF5zGnXAKd8MyPgOW8ICjCbT12CvF0eev0x7wvgmMLqrMY2dby+EjU72yn5cfLmVv1HekLuaOWEIZgROWUSecQl0wK4J9YD+m/xY/NZ9DLgJlV5/2svdQ7luuPVbre/Oes5xSH/B78BMGGiwfSLAzLAAAAABJRU5ErkJggg==`,
      scale: arrowSize,
      rotation: (bearing * Math.PI) / 180,
      rotateWithView: true,
    }),
  });
}

const map = new Map({
  layers: [
    new Tile({
      source: new OSM(),
    }),
    new Vector({
      source: arrowSource,
      style: arrowStyle,
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

const mapHtml = readFileSync(join(__dirname, "views", "map.ejs"), "utf8");
app.get("/", (req, res) => {
  res.send(mapHtml);
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
