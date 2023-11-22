/**
* Author: Boineelo Moyo
* Copyright 2019 Google LLC
*
* NDVI animation for Botswana for 2022 to 2023

*/

// Import necessary modules
var style = require("users/gena/packages:style");
var utils = require("users/gena/packages:utils");
var text = require("users/gena/packages:text");

// Fetch a MODIS NDVI collection and select NDVI.
var dataset = ee.ImageCollection("MODIS/006/MOD13Q1").select("NDVI");

var bw = ee
  .FeatureCollection("USDOS/LSIB_SIMPLE/2017")
  .filter(ee.Filter.eq("country_na", "Botswana"));

// Define the regional bounds of animation frames matched to the study area
var region = ee.Geometry.Polygon(
  [
    [
      [17.86702384452514, -27.50904449899728],
      [29.951984782025136, -27.50904449899728],
      [29.951984782025136, -16.784340061730326],
      [17.86702384452514, -16.784340061730326],
    ],
  ],
  null,
  false
);

// Add day-of-year (DOY) property to each image.
var col = dataset.map(function (img) {
  var doy = ee.Date(img.get("system:time_start")).getRelative("day", "year");
  return img.set("doy", doy);
});

// Get a collection of distinct images by 'doy'.
var distinctDOY = col.filterDate("2022-01-01", "2023-01-01");

// Define a filter that identifies which images from the complete
// collection match the DOY from the distinct DOY collection.
var filter = ee.Filter.equals({ leftField: "doy", rightField: "doy" });

// Define a join.
var join = ee.Join.saveAll("doy_matches");

// Apply the join and convert the resulting FeatureCollection to an
// ImageCollection.
var joinCol = ee.ImageCollection(join.apply(distinctDOY, col, filter));

// Apply median reduction among matching DOY collections.
var comp = joinCol.map(function (img) {
  var doyCol = ee.ImageCollection.fromImages(img.get("doy_matches"));
  return doyCol.reduce(ee.Reducer.median());
});

// Define RGB visualization parameters.
var visParams = {
  min: 0.0,
  max: 9000.0,
  palette: [
    "FFFFFF",
    "CE7E45",
    "DF923D",
    "F1B555",
    "FCD163",
    "99B718",
    "74A901",
    "66A000",
    "529400",
    "3E8601",
    "207401",
    "056201",
    "004C00",
    "023B01",
    "012E01",
    "011D01",
    "011301",
  ],
};

// get text location
var pt = text.getLocation(region, "right", "2%", "35%");

// Labelling
// geometryGradientBar = geometryGradientBar; // <-- this is a drawn geometry;
var style = require("users/gena/packages:style");
var utils = require("users/gena/packages:utils");
var text = require("users/gena/packages:text");

// Create RGB visualization images for use as animation frames.
var rgbVis = comp.map(function (img) {
  var textVis = {
    fontSize: 32,
    textColor: "ffffff",
    outlineColor: "000000",
    outlineWidth: 2.5,
    outlineOpacity: 0.6,
  };

  //Add Title
  var label_title = "Botswana NDVI Timeseries";
  var scale = Map.getScale() * 1;
  geometryLabel = geometryLabel;
  // var scale = 15000
  Map.addLayer(geometryLabel);
  var title_text = text.draw(label_title, geometryLabel, scale, {
    fontSize: 32,
  });

  // Add Date
  var scale1 = 18000;
  var locate = text.getLocation(region, "right", "35%", "45%");
  var date_label = text.draw(img.get("system:index"), locate, scale, textVis);

  // Gradient Bar

  var min = 0;
  var max = 1;
  var textProperties = {
    fontSize: 32,
    textColor: "ffffff",
    outlineColor: "000000",
    outlineWidth: 0,
    outlineOpacity: 0.6,
  };

  Map.addLayer(geometryGradientBar);
  var labels = ee.List.sequence(min, max);
  var gradientBar = style.GradientBar.draw(geometryGradientBar, {
    min: min,
    max: max,
    palette: visParams.palette,
    labels: labels,
    format: "%.0f",
    text: textProperties,
  });

  //NDVI Text Label
  var NDVI_Label = "NDVI";
  var scales = Map.getScale() * 1;
  geometryLabel1 = geometryLabel1;
  Map.addLayer(geometryLabel);
  var NDVI_text = text.draw(NDVI_Label, geometryLabel1, scales, {
    fontSize: 32,
  });

  return img
    .visualize(visParams)
    .clip(bw)
    .blend(title_text)
    .blend(date_label)
    .blend(gradientBar);
});

// Define GIF visualization arguments.
var gifParams = {
  region: region,
  dimensions: 600,
  crs: "EPSG:3857",
  framesPerSecond: 120,
  format: "gif",
};

// Print the GIF URL to the console.
print(rgbVis.getVideoThumbURL(gifParams));

// Render the GIF animation in the console.
print(ui.Thumbnail(rgbVis, gifParams));
