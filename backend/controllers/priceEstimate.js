const axios = require('axios');

// Haversine formula to calculate distance between two coordinates in km
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Geocode an address using Nominatim
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'NKR-Delivery-System/1.0 (nkr-delivery@example.com)'
        },
        timeout: 5000
      }
    );

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return null;
  }
};

// Base rates per km and minimums by delivery option
const RATES = {
  standard:  { perKm: 0.50, minimum: 4.99 },
  express:   { perKm: 0.80, minimum: 9.99 },
  same_day:  { perKm: 1.20, minimum: 19.99 }
};

// Size multipliers
const SIZE_MULTIPLIERS = {
  xs:     1.0,
  small:  1.1,
  medium: 1.2,
  large:  1.5,
  xl:     2.0
};

const estimatePrice = async (req, res) => {
  const {
    pickup_address,
    delivery_address,
    delivery_option = 'standard',
    package_size = 'medium',
    package_weight = 1
  } = req.body;

  if (!pickup_address || !delivery_address) {
    return res.status(400).json({ message: 'pickup_address and delivery_address are required' });
  }

  try {
    // Geocode both addresses
    const [pickupCoords, deliveryCoords] = await Promise.all([
      geocodeAddress(pickup_address),
      geocodeAddress(delivery_address)
    ]);

    let distanceKm;
    let geocodingFailed = false;

    if (!pickupCoords || !deliveryCoords) {
      // Fall back to 10km estimate if geocoding fails
      distanceKm = 10;
      geocodingFailed = true;
    } else {
      distanceKm = haversineDistance(
        pickupCoords.lat,
        pickupCoords.lng,
        deliveryCoords.lat,
        deliveryCoords.lng
      );
      // Minimum 1 km
      if (distanceKm < 1) distanceKm = 1;
    }

    const rate = RATES[delivery_option] || RATES.standard;
    const sizeMultiplier = SIZE_MULTIPLIERS[package_size] || SIZE_MULTIPLIERS.medium;
    const weight = parseFloat(package_weight) || 1;

    // Base price: distance * rate/km * size multiplier, but at least minimum
    const rawBase = distanceKm * rate.perKm * sizeMultiplier;
    const basePrice = Math.max(rawBase, rate.minimum);

    // Weight surcharge: €1.00 per kg over 5 kg
    const weightSurcharge = weight > 5 ? (weight - 5) * 1.0 : 0;

    const total = basePrice + weightSurcharge;

    res.json({
      distance_km: Math.round(distanceKm * 100) / 100,
      base_price: Math.round(basePrice * 100) / 100,
      size_surcharge: Math.round((basePrice - Math.max(distanceKm * rate.perKm, rate.minimum)) * 100) / 100,
      weight_surcharge: Math.round(weightSurcharge * 100) / 100,
      total: Math.round(total * 100) / 100,
      geocoding_failed: geocodingFailed,
      pickup_coords: pickupCoords,
      delivery_coords: deliveryCoords,
      breakdown: {
        distance_km: Math.round(distanceKm * 100) / 100,
        delivery_option,
        rate_per_km: rate.perKm,
        minimum_price: rate.minimum,
        package_size,
        size_multiplier: sizeMultiplier,
        package_weight: weight,
        weight_surcharge: Math.round(weightSurcharge * 100) / 100,
        base_price: Math.round(basePrice * 100) / 100,
        total: Math.round(total * 100) / 100
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { estimatePrice };
