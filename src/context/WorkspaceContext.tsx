import { createContext, useState, ReactNode } from 'react';

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
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  activeView: 'map',
  setActiveView: () => {},
  mapParams: null,
  setMapParams: () => {},
  clearMapParams: () => {},
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

  const setMapParams = (params: MapSessionParams) => {
    setMapParamsState(params);
    localStorage.setItem('civic_stride_map_session', JSON.stringify(params));
  };

  const clearMapParams = () => {
    setMapParamsState(null);
    localStorage.removeItem('civic_stride_map_session');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeView,
        setActiveView,
        mapParams,
        setMapParams,
        clearMapParams,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
