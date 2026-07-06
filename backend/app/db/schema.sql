-- PostGIS Spatial Schema Initialization for Civic-Stride
-- UN SDGs 11 & 13 Multi-Criteria Urban Mobility Index

-- Enable PostGIS extension if it does not already exist
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Neighbourhood Boundaries (Polygon Geometries)
CREATE TABLE IF NOT EXISTS neighbourhood_boundaries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    design_index DECIMAL(4, 3), -- Calculated index [0, 1]
    transit_proximity_index DECIMAL(4, 3), -- Calculated index [0, 1]
    micro_climate_index DECIMAL(4, 3), -- Calculated index [0, 1]
    composite_index DECIMAL(4, 3), -- Overall sustainability score
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index on neighbourhood boundary geometries for fast geometric lookup
CREATE INDEX IF NOT EXISTS idx_neighbourhood_boundaries_geom 
ON neighbourhood_boundaries USING GIST(geom);


-- 2. Sidewalk & Walkway Lines (LineString Geometries)
CREATE TABLE IF NOT EXISTS sidewalk_lines (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    name VARCHAR(255),
    highway VARCHAR(100),
    footway VARCHAR(100),
    cycleway VARCHAR(100),
    surface VARCHAR(100),
    width VARCHAR(50),
    geom GEOMETRY(LineString, 4326) NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index on sidewalk geometries for intersections and distance lookups
CREATE INDEX IF NOT EXISTS idx_sidewalk_lines_geom 
ON sidewalk_lines USING GIST(geom);


-- 3. Transit Hubs (Point Geometries)
CREATE TABLE IF NOT EXISTS transit_hubs (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    name VARCHAR(255),
    transit_type VARCHAR(100), -- 'bus_stop', 'subway_station', 'railway_station', etc.
    operator VARCHAR(255),
    geom GEOMETRY(Point, 4326) NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index on transit hubs for fast proximity queries (400m/800m buffer buffers)
CREATE INDEX IF NOT EXISTS idx_transit_hubs_geom 
ON transit_hubs USING GIST(geom);


-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_neighbourhood_boundaries_modtime
    BEFORE UPDATE ON neighbourhood_boundaries
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_sidewalk_lines_modtime
    BEFORE UPDATE ON sidewalk_lines
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_transit_hubs_modtime
    BEFORE UPDATE ON transit_hubs
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
