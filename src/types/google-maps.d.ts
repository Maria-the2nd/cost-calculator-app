// Type definitions for Google Maps API
// This file provides TypeScript type definitions for the Google Maps JavaScript API

declare global {
  interface Window {
    google: typeof google;
    mapsApiLoaded: () => void;
  }
}

declare namespace google.maps {
  class Geocoder {
    geocode(
      request: {address?: string},
      callback: (
        results: GeocoderResult[],
        status: GeocoderStatus
      ) => void
    ): void;
  }
  
  interface GeocoderResult {
    formatted_address: string;
    geometry: {
      location: {
        lat(): number;
        lng(): number;
      }
    }
  }
  
  enum GeocoderStatus {
    OK = 'OK',
    ZERO_RESULTS = 'ZERO_RESULTS',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }
  
  class DistanceMatrixService {
    getDistanceMatrix(
      request: DistanceMatrixRequest,
      callback: (
        response: DistanceMatrixResponse,
        status: DistanceMatrixStatus
      ) => void
    ): void;
  }
  
  interface DistanceMatrixRequest {
    origins: string[];
    destinations: string[];
    travelMode: TravelMode;
    unitSystem: UnitSystem;
  }
  
  interface DistanceMatrixResponse {
    rows: {
      elements: {
        status: string;
        distance: {
          text: string;
          value: number;
        };
        duration: {
          text: string;
          value: number;
        };
      }[];
    }[];
  }
  
  enum DistanceMatrixStatus {
    OK = 'OK',
    ZERO_RESULTS = 'ZERO_RESULTS',
    MAX_DIMENSIONS_EXCEEDED = 'MAX_DIMENSIONS_EXCEEDED',
    OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
    REQUEST_DENIED = 'REQUEST_DENIED',
    INVALID_REQUEST = 'INVALID_REQUEST',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }
  
  enum TravelMode {
    DRIVING = 'DRIVING',
    WALKING = 'WALKING',
    BICYCLING = 'BICYCLING',
    TRANSIT = 'TRANSIT'
  }
  
  enum UnitSystem {
    METRIC = 0,
    IMPERIAL = 1
  }
}

export {}; 