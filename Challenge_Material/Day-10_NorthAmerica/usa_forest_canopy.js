var mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
  { elementType: "labels.text.fill", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.stroke", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c9b2a6" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "geometry.stroke",
    stylers: [{ color: "#dcd2be" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ae9e90" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#000040" }, { visibility: "on" }],
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels.text.fill",
    stylers: [{ color: "#408080" }, { visibility: "off" }],
  },
];

Map.setOptions("mapStyle", { mapStyle: mapStyle });

// Load the canopy height image
var canopy_height = ee.Image("users/nlang/ETH_GlobalCanopyHeight_2020_10m_v1");

// Load the built-in geometry for USA
var usa = ee
  .FeatureCollection("USDOS/LSIB_SIMPLE/2017")
  .filter(ee.Filter.eq("country_na", "United States"));

Map.centerObject(usa, 5);

// Clip to your desired extent
var us_forest = canopy_height.clip(usa);

var fr_vis = {
  max: 50,
  min: 0,
  palette: ["#aeb2a6", "#4a6741", "#25591f", "#19270d"],
};

// Load the DEM data and make a hillshade
var dem = ee.Image("WWF/HydroSHEDS/03VFDEM");
var us_dem = dem.clip(usa);

var exaggeration = 5;
var us_hillshade = ee.Terrain.hillshade(us_dem);

// Create dem and hillshade vis parameters

var dem_vis = {
  min: 0,
  max: 2000,
  palette: ["006600", "002200", "fff700", "ab7634", "c4d0ff", "ffffff"],
};
var hill_vis = { min: 0, max: 300, palette: ["000000", "ffffff"] };

//Displaying the Maps
Map.addLayer(us_hillshade, hill_vis, "Hillshade");
Map.addLayer(us_forest, fr_vis, "Cont");
Map.addLayer(us_dem, dem_vis, "DEM");

// // Creates a color bar thumbnail image for use in legend from the given color palette.
//LEGEND: Vertical, Gradient

// set position of panel
var legendpos = ui.Panel({
  style: {
    position: "top-center",
    padding: "8px 15px",
  },
});

// Create legend title
var legendTitle = ui.Label({
  value: "Forest Canopy Height",
  style: {
    fontWeight: "bold",
    fontSize: "16px",
    margin: "0 0 4px 0",
    padding: "0",
  },
});

// Add the title to the panel
legendpos.add(legendTitle);

// create the legend image
var lon = ee.Image.pixelLonLat().select("latitude");
var gradient = lon.multiply((fr_vis.max - fr_vis.min) / 100).add(fr_vis.min);
var legendImage = gradient.visualize(fr_vis);

// create text on top of legend
var panel1 = ui.Panel({
  widgets: [ui.Label(fr_vis["max"])],
});

legendpos.add(panel1);

// create thumbnail from the image
var thumbnail = ui.Thumbnail({
  image: legendImage,
  params: { bbox: "0,0,10,100", dimensions: "10x200" },
  style: { padding: "1px", position: "bottom-center" },
});

// add the thumbnail to the legend
legendpos.add(thumbnail);

// create text on top of legend
var panel2 = ui.Panel({
  widgets: [ui.Label(fr_vis["min"])],
});

legendpos.add(panel2);

Map.add(legendpos);

// Create the title label.
var title = ui.Label({
  value: "North America Forest Canopy Height:  Map by: Boineelo Moyo",
  style: {
    position: "top-center",
    fontWeight: "bold",
    fontSize: "16px",
    margin: "0 0 4px 0",
    padding: "8px 15px",
  },
});
title.style().set("position", "top-center");
Map.add(title);
