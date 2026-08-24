import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { UpgradedOSMResponse } from '../services/overpassService';

export type ActiveViewType = 'map' | 'report_design' | 'report_transit' | 'report_climate';

export interface MapSessionParams {
  lat: number;
  lng: number;
  zoom: number;
  minLat: string;
  minLng: string;
  maxLat: string;
  maxLng: string;
}

export interface WorkspaceContextType {
  activeView: ActiveViewType;
  setActiveView: (view: ActiveViewType) => void;
  mapParams: MapSessionParams | null;
  setMapParams: (params: MapSessionParams) => void;
  clearMapParams: () => void;
  osmData: UpgradedOSMResponse | null;
  setOsmData: (data: UpgradedOSMResponse | null) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  activeView: 'map',
  setActiveView: () => {},
  mapParams: null,
  setMapParams: () => {},
  clearMapParams: () => {},
  osmData: null,
  setOsmData: () => {},
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ActiveViewType>('map');
  const [mapParams, setMapParamsState] = useState<MapSessionParams | null>(() => {
    const saved = localStorage.getItem('civic_stride_map_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved map session', e);
      }
    }
    return null;
  });
  const [osmData, setOsmData] = useState<UpgradedOSMResponse | null>(() => {
    const saved = localStorage.getItem('civic_stride_osm_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved OSM data', e);
      }
    }
    return null;
  });

  const setMapParams = (params: MapSessionParams) => {
    setMapParamsState(params);
    localStorage.setItem('civic_stride_map_session', JSON.stringify(params));
  };

  const clearMapParams = () => {
    setMapParamsState(null);
    localStorage.removeItem('civic_stride_map_session');
  };

  const handleSetOsmData = (data: UpgradedOSMResponse | null) => {
    setOsmData(data);
    if (data) {
      localStorage.setItem('civic_stride_osm_data', JSON.stringify(data));
    } else {
      localStorage.removeItem('civic_stride_osm_data');
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeView,
        setActiveView,
        mapParams,
        setMapParams,
        clearMapParams,
        osmData,
        setOsmData: handleSetOsmData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

