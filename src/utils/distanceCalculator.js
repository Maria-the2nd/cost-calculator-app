/// <reference types="@types/google.maps" />
const ORIGIN_ADDRESS = 'Estrada de S. Marcos, nº 11, 2735-521 Cacém';
const API_KEY = 'AIzaSyDjcIn9k0AxNkWvL9hRDf4LJcJi17i3LAY';
// @ts-ignore
export class DistanceCalculator {
    constructor() {
        // @ts-ignore
        this.geocoder = new google.maps.Geocoder();
        // @ts-ignore
        this.distanceService = new google.maps.DistanceMatrixService();
    }
    static getInstance() {
        if (!DistanceCalculator.instance) {
            DistanceCalculator.instance = new DistanceCalculator();
        }
        return DistanceCalculator.instance;
    }
    async calculateDistance(postalCode) {
        try {
            // Format destination with postal code
            const destination = this.formatDestination(postalCode);
            // First, geocode the postal code to get coordinates
            const geocodeResult = await this.geocodeAddress(destination);
            if (!geocodeResult) {
                throw new Error('Could not geocode the postal code');
            }
            // Calculate distance using Distance Matrix API
            const distance = await this.getDistance(geocodeResult.formatted_address);
            return distance;
        }
        catch (error) {
            console.error('❌ Error calculating distance:', error);
            throw error;
        }
    }
    formatDestination(postalCode) {
        const cleanPostalCode = postalCode.trim().replace(/\s+/g, '');
        return cleanPostalCode.includes(',') ? cleanPostalCode : `${cleanPostalCode}, Portugal`;
    }
    geocodeAddress(address) {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            this.geocoder.geocode({ address }, (results, status) => {
                // @ts-ignore
                if (status === google.maps.GeocoderStatus.OK && (results === null || results === void 0 ? void 0 : results[0])) {
                    resolve(results[0]);
                }
                else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    }
    getDistance(destination) {
        return new Promise((resolve, reject) => {
            this.distanceService.getDistanceMatrix({
                origins: [ORIGIN_ADDRESS],
                destinations: [destination],
                // @ts-ignore
                travelMode: google.maps.TravelMode.DRIVING,
                // @ts-ignore
                unitSystem: google.maps.UnitSystem.METRIC,
            }, (response, status) => {
                var _a, _b;
                // @ts-ignore
                if (status === google.maps.DistanceMatrixStatus.OK && ((_b = (_a = response === null || response === void 0 ? void 0 : response.rows[0]) === null || _a === void 0 ? void 0 : _a.elements[0]) === null || _b === void 0 ? void 0 : _b.distance)) {
                    const distanceInKm = response.rows[0].elements[0].distance.value / 1000;
                    resolve(Number(distanceInKm.toFixed(1)));
                }
                else {
                    reject(new Error(`Distance calculation failed: ${status}`));
                }
            });
        });
    }
}
