# # Install necessary R packages
# if (!requireNamespace("BFS", quietly = TRUE)) install.packages("BFS")
# if (!requireNamespace("foreign", quietly = TRUE)) install.packages("foreign")

# # Load the necessary R libraries
# library(BFS)
# library(foreign)

# # Convert .px to CSV using R
# swiss_data <- read.px("px-x-1502000000_101.px")
# write.csv(swiss_data, "swiss_data.csv")
# Install necessary R packages
if (!requireNamespace("pxR", quietly = TRUE)) install.packages("pxR")

# Load the necessary R library
library(pxR)

# Set the working directory
setwd("C:/Users/boimo/Desktop/Forests")

# Load the .px file
swiss_data <- read.px("px-x-1502000000_101.px")

# Save as CSV
write.csv(swiss_data, "swiss_data.csv")
