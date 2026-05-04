import { useMemo } from 'react';
import { CAB_TYPES } from '../data/mockData';

const SURGE_MULTIPLIER = 1.2;
const GST_RATE = 0.05;

export function calculateDistanceKm(fromCoords, toCoords) {
  if (!fromCoords || !toCoords) return null;

  const toRad = value => (value * Math.PI) / 180;
  const [fromLat, fromLng] = fromCoords;
  const [toLat, toLng] = toCoords;
  const earthRadiusKm = 6371;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) *
    Math.sin(dLng / 2) ** 2;

  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function useFare(cabId, promoDiscount = 0, distanceKm = null) {
  return useMemo(() => {
    const cab = CAB_TYPES.find(c => c.id === cabId) || CAB_TYPES[0];
    const km = distanceKm || 0;
    const baseFare = distanceKm ? cab.baseFare : 0;
    const distFare = distanceKm ? Math.round(km * cab.ratePerKm) : 0;
    const surge    = Math.round(distFare * (SURGE_MULTIPLIER - 1));
    const subtotal = distanceKm ? baseFare + distFare + surge : 0;
    const gst      = Math.round(subtotal * GST_RATE);
    const gross    = subtotal + gst;
    const discount = Math.min(promoDiscount, gross);
    const total    = gross - discount;

    return {
      km,
      baseFare,
      distFare,
      surge,
      gst,
      gross,
      discount,
      total,
      surgeMultiplier: SURGE_MULTIPLIER,
      isReady: Boolean(distanceKm),
    };
  }, [cabId, promoDiscount, distanceKm]);
}

export function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}
