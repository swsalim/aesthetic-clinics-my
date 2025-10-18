import {
  AddressComponent,
  AddressType,
  Client,
  GeocodeResult,
} from '@googlemaps/google-maps-services-js';

export class GoogleMapsService {
  private readonly client: Client;
  private readonly apiKey: string;

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error('Google Maps API key is missing');
    }

    this.client = new Client({});
    this.apiKey = apiKey;
  }

  private extractAddressComponent(
    result: GeocodeResult,
    type: AddressType,
    shortName: boolean = false,
  ): string | null {
    const component = result.address_components.find((c: AddressComponent) =>
      c.types.includes(type),
    );
    return component ? (shortName ? component.short_name : component.long_name) : null;
  }

  async geocodeAddress(
    address: string,
    postalCode: string,
  ): Promise<{
    lat: number;
    lng: number;
    placeId: string;
    neighborhood: string | null;
    city: string | null;
  }> {
    const addressString = [address, postalCode, 'Malaysia'].filter(Boolean).join(', ');

    const geocodeResponse = await this.client.geocode({
      params: {
        address: addressString,
        region: 'my',
        key: this.apiKey,
      },
    });

    if (!geocodeResponse.data.results?.length) {
      throw new Error('Could not geocode the provided address');
    }

    const result = geocodeResponse.data.results[0];
    const { lat, lng } = result.geometry.location;

    const neighborhood =
      this.extractAddressComponent(result, 'sublocality_level_1' as AddressType, true) ||
      this.extractAddressComponent(result, 'neighborhood' as AddressType, true) ||
      null;

    const city =
      this.extractAddressComponent(result, 'locality' as AddressType, true) ||
      this.extractAddressComponent(result, 'administrative_area_level_2' as AddressType, true) ||
      null;

    return {
      lat,
      lng,
      placeId: result.place_id || '',
      neighborhood,
      city,
    };
  }
}
