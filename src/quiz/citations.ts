/** Builders for the rule citations shown under every answer. */

import type { Citation } from './model.ts';

export const TOMSR_URL =
  'https://www.legislation.qld.gov.au/view/whole/html/inforce/current/sl-2016-0154';

export const COLREGS_URL =
  'https://www.amsa.gov.au/safety-navigation/navigating-coastal-waters/international-regulations-preventing-collisions-sea';

/** Transport Operations (Marine Safety) Regulation 2016. */
export function tomsrCitation(section: string, title: string): Citation {
  return {
    reference: `Transport Operations (Marine Safety) Regulation 2016, section ${section} (${title})`,
    url: TOMSR_URL,
  };
}

/** International Regulations for Preventing Collisions at Sea 1972. */
export function colregsCitation(rule: string, title: string): Citation {
  return {
    reference: `COLREGS, rule ${rule} (${title})`,
    url: COLREGS_URL,
  };
}

/** A Maritime Safety Queensland guidance page. */
export function msqCitation(title: string, url: string): Citation {
  return { reference: `Maritime Safety Queensland: ${title}`, url };
}

export const msqLifejackets = msqCitation(
  'lifejacket laws',
  'https://www.msq.qld.gov.au/safety/lifejackets',
);

export const msqSpeedLimits = msqCitation(
  'speed limits',
  'https://www.msq.qld.gov.au/waterways/speed-limits',
);

export const msqPwc = msqCitation(
  'personal watercraft',
  'https://www.msq.qld.gov.au/safety/personal-watercraft',
);

export const msqSafetyEquipment = msqCitation(
  'safety equipment for recreational ships',
  'https://www.msq.qld.gov.au/safety/safety-equipment-recreational-ships',
);

export const msqBuoyage = msqCitation(
  'beacons, buoys and marks',
  'https://www.msq.qld.gov.au/waterways/beacons-buoys-and-marks',
);

export const msqWaterLimits = msqCitation(
  'water limits maps',
  'https://www.msq.qld.gov.au/waterways/water-limit-maps',
);
