# CivicStride 🚶‍♂️🌳🚆

CivicStride is an urban spatial analytics and civic diagnostic platform engineered to evaluate pedestrian liveability, climate resilience, and transit equity across custom geofenced regions using OpenStreetMap (OSM) data and PostGIS spatial indexing.

---

## 📸 Visual Overview

### 1. Platform Landing & Exploration
![Landing Hero](docs/screenshots/landing-hero.png)

### 2. Spatial Bounding Box Geofencing
Select arbitrary urban coordinates or load preset study regions for automated spatial extraction.
![Bounding Box Selector](docs/screenshots/bbox-selector.png)

### 3. Diagnostic Report Suite

| Climate & Comfort | Infrastructure Quality | Transit Matrix |
| :---: | :---: | :---: |
| ![Climate Report](docs/screenshots/report-climate.png) | ![Infrastructure Report](docs/screenshots/report-infrastructure.png) | ![Transit Report](docs/screenshots/report-transit.png) |
| *Thermal comfort, green canopy, & shade coverage* | *Sidewalk connectivity & pedestrian safety* | *Multimodal transit access & 15-min catchment* |

### 4. Global Baselines & Comparisons
Benchmark your region's spatial performance against standard municipal benchmarks.
![Global Baselines](docs/screenshots/global-baselines.png)

---

## 🌟 Key Features

* **Real-time Spatial Querying:** Fetches live nodes, ways, and relations directly from the Overpass API across custom bounding boxes.
* **Climate & Comfort Scoring:** Computes urban heat mitigation, natural canopy density, and shaded pedestrian corridor ratios.
* **Pedestrian Infrastructure Diagnostics:** Measures intersection density, walkway continuity, and sidewalk-to-roadway coverage.
* **Transit Catchment Matrix:** Quantifies 15-minute city access, public transit node density, and multimodal connectivity.
* **Spatial Database Engine:** Backed by PostgreSQL and PostGIS for high-performance spatial containment (`ST_Contains`, `ST_Intersects`) and geometry indexing (`GIST`).

---

## 🏗️ Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **Backend:** Python (FastAPI / Flask service pipeline), GeoPandas, Shapely
* **Database & Spatial Engine:** PostgreSQL, PostGIS, Overpass API (OpenStreetMap)

---

## 📂 Repository Structure
