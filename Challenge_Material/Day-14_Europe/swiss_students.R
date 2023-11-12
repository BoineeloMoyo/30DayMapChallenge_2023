###########################################################################################################
#----------------------- 01. Function to Install and Load R packages --------------#

install_and_load_packages <- function(packages) {
  for (package in packages) {
    if (!require(package, character.only = TRUE)) {
      install.packages(package, dependencies = TRUE)
      library(package, character.only = TRUE)
    }
  }
}

# Specify the packages you want to install and load
required_packages <- c("tidyverse", "BFS", "giscoR", "mapview", "sf", "leafsync", "leaflet.extras2")

install_and_load_packages(required_packages)

# Now you can use the libraries in your code
library(tidyverse)
library(BFS)
library(giscoR)
library(mapview)
library(sf)
library(leaflet)
library(leafsync)
###########################################################################################################
# ------------------------ 02. Get Swiss dataset ------------------------------#

# Swiss dataset: https://www.bfs.admin.ch/asset/de/px-x-1502000000_101
swiss_students <- BFS::bfs_get_data(number_bfs = "px-x-1502000000_101", language = "de", clean_names = TRUE)

students_gender <- swiss_students %>%
  pivot_wider(names_from = geschlecht, values_from = lernende) %>%
  mutate(share_woman = round(Frau/`Geschlecht - Total`*100, 1))

students_gender

#----------------------------03. Get mapping data -----------------------------#

swiss_sf <- gisco_get_nuts(
  country = "Switzerland", 
  nuts_level = 3, 
  resolution = "01")

swiss_sf
###########################################################################################################
#---------------------------- 04. Join the two datasets together -------------#

# # Preferably using NUTS-3 code if possible
# student_map <- students_gender %>%
#   filter(schulkanton != "Schweiz") %>%
#   mutate(schulkanton = str_remove(schulkanton, ".*/"),
#          schulkanton = str_trim(schulkanton),
#          schulkanton = recode(schulkanton, "Berne" = "Bern", "Grischun" = "Graubünden", "Wallis" = "Valais")) %>%
#   left_join(swiss_sf, by = c("schulkanton" = "NUTS_NAME"))
# 
# student_map

process_student_data <- function(data, sf_map) {
  processed_data <- data %>%
    filter(schulkanton != "Schweiz") %>%
    mutate(
      schulkanton = str_remove(schulkanton, ".*/"),
      schulkanton = str_trim(schulkanton),
      schulkanton = recode(schulkanton, "Berne" = "Bern", "Grischun" = "Graubünden", "Wallis" = "Valais")
    ) %>%
    left_join(sf_map, by = c("schulkanton" = "NUTS_NAME"))
  
  return(processed_data)
}

# Call the function with your data and map
student_map <- process_student_data(students_gender, swiss_sf)

################################################################################
#---------------- 05. Create an interactive map--------------------------------#

# Choose a purple color palette
purple_palette <- colorRampPalette(c("#f2ebf7", "#d0aad2", "#ae73a5", "#34232a"))(10)

swiss_student_map_bildungsstufe <- student_map %>%
  filter(jahr == "2001/02",
         schulkanton != "Schweiz",
         staatsangehorigkeit_kategorie == "Schweiz") %>%
  select(schulkanton, jahr, bildungsstufe, share_woman, geometry) %>%
  pivot_wider(names_from = "bildungsstufe", values_from = "share_woman") %>%
  sf::st_as_sf()

swiss_student_map_bildungsstufe %>%
  mapview(zcol = "Bildungsstufe - Total", 
          layer.name = "% of Women Education Level",
          col.regions = purple_palette)

################################################################################
#----------------- 06. Synchronize multiple maps ------------------------------#

leafsync::sync(
  swiss_student_map_bildungsstufe %>%
    mapview(zcol = "Tertiärstufe", layer.name = "% Women with Tertiary level"),
  swiss_student_map_bildungsstufe %>%
    mapview(zcol = "Sekundarstufe II", layer.name = "% Secondary level"),
  swiss_student_map_bildungsstufe %>%
    mapview(zcol = "Obligatorische Schule", layer.name = "% Mandatory school"),
  swiss_student_map_bildungsstufe %>%
    mapview(zcol = "Nicht auf Stufen aufteilbare Ausbildungen", layer.name = "% Training that cannot be categorised")
)

################################################################################

