// Real Sun/Moon position math for the Panchanga wheel — computed with
// astronomy-engine (Don Cross's open-source library; ELP2000/VSOP87-
// based, no network calls), not guessed or approximated from the
// calendar date the way a "day-of-month" formula would. Verified before
// use by comparing this exact calculation, for 2026-08-31, against a
// real published Panchang (drikpanchang-class sites): the computed
// nakshatra (Revati) and sidereal moon sign (Pisces) matched exactly;
// the tithi came out one step ahead (Chaturthi vs. a same-day
// Tritiya-to-Chaturthi transition reported elsewhere for that date,
// itself confirmed by that date's own listed festival being literally
// named "Sankashti Chaturthi") — consistent with computing the
// *instantaneous* tithi rather than the traditional sunrise-anchored
// "tithi of the day," which is a different, deliberately out-of-scope
// calculation (it needs an observer location and local sunrise time).
import * as Astronomy from "astronomy-engine";
import { AYANAMSA_J2000_DEG, AYANAMSA_RATE_DEG_PER_YEAR, TITHIS } from "../data/panchanga.js";
import { NAKSHATRA_SEGMENT_DEGREES } from "../data/nakshatras.js";

const J2000_UTC = Date.UTC(2000, 0, 1, 12, 0, 0);

function norm360(deg) {
  return ((deg % 360) + 360) % 360;
}

export function ayanamsaDegrees(date) {
  const years = (date.getTime() - J2000_UTC) / (365.25 * 86400000);
  return AYANAMSA_J2000_DEG + AYANAMSA_RATE_DEG_PER_YEAR * years;
}

// Sun-Moon elongation (0-360°) → tithi. 0° = new moon, 180° = full moon.
// This is the actual definition of a tithi, not an approximation of one.
export function currentTithi(date) {
  const elongation = Astronomy.MoonPhase(date);
  const index = Math.min(29, Math.floor(elongation / 12));
  return { tithi: TITHIS[index], elongationDeg: elongation, degreeIntoTithi: elongation - index * 12 };
}

// Moon's true ecliptic longitude (of-date), minus the Lahiri ayanamsa,
// gives its sidereal longitude — which is what nakshatra boundaries are
// actually defined against in Vedic astronomy (not the tropical/Western
// longitude astronomy-engine returns by default).
export function currentNakshatraPosition(date) {
  const ayanamsa = ayanamsaDegrees(date);
  const tropicalLon = Astronomy.EclipticGeoMoon(date).lon;
  const siderealLon = norm360(tropicalLon - ayanamsa);
  const index = Math.min(26, Math.floor(siderealLon / NAKSHATRA_SEGMENT_DEGREES));
  return {
    index,
    siderealLonDeg: siderealLon,
    degreeIntoNakshatra: siderealLon - index * NAKSHATRA_SEGMENT_DEGREES,
    ayanamsaDeg: ayanamsa,
  };
}

export function currentMoonIllumination(date) {
  return Astronomy.Illumination(Astronomy.Body.Moon, date).phase_fraction; // 0-1
}

export function getPanchangaNow(date = new Date()) {
  const { tithi, elongationDeg, degreeIntoTithi } = currentTithi(date);
  const nak = currentNakshatraPosition(date);
  const illumination = currentMoonIllumination(date);
  return {
    date,
    tithi,
    elongationDeg,
    degreeIntoTithi,
    nakshatraIndex: nak.index,
    siderealLonDeg: nak.siderealLonDeg,
    degreeIntoNakshatra: nak.degreeIntoNakshatra,
    ayanamsaDeg: nak.ayanamsaDeg,
    illumination,
    waxing: elongationDeg < 180,
  };
}
