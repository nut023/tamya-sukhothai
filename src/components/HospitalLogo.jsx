import React from 'react';

// Compact & Crisp Hospital Logo Emblems for all 9 Sukhothai Hospitals
export function getHospitalLogoSvg(hospitalId, size = 38) {
  const configs = {
    'sukhothai': {
      bg: '#0284c7', // Sky Blue
      accent: '#0369a1',
      name: 'รพ.สุโขทัย'
    },
    'sri-sangworn': {
      bg: '#0d9488', // Teal
      accent: '#0f766e',
      name: 'รพ.ศรีสังวร'
    },
    'sawankhalok': {
      bg: '#2563eb', // Royal Blue
      accent: '#1d4ed8',
      name: 'รพ.สวรรคโลก'
    },
    'si-satchanalai': {
      bg: '#7c3aed', // Purple
      accent: '#6d28d9',
      name: 'รพ.ศรีสัชนาลัย'
    },
    'thung-saliam': {
      bg: '#059669', // Emerald
      accent: '#047857',
      name: 'รพ.ทุ่งเสลี่ยม'
    },
    'ban-dan-lan-hoi': {
      bg: '#d97706', // Amber
      accent: '#b45309',
      name: 'รพ.บ้านด่านฯ'
    },
    'si-nakhon': {
      bg: '#db2777', // Rose Pink
      accent: '#be185d',
      name: 'รพ.ศรีนคร'
    },
    'khiri-mat': {
      bg: '#4f46e5', // Indigo
      accent: '#4338ca',
      name: 'รพ.คีรีมาศ'
    },
    'kong-krailat': {
      bg: '#ea580c', // Orange
      accent: '#c2410c',
      name: 'รพ.กงไกรลาส'
    }
  };

  const conf = configs[hospitalId] || {
    bg: '#475569',
    accent: '#334155',
    name: 'รพ.'
  };

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
      <defs>
        <filter id="shadow-${hospitalId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
        <linearGradient id="bgGrad-${hospitalId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${conf.bg}" />
          <stop offset="100%" stop-color="${conf.accent}" />
        </linearGradient>
      </defs>

      <!-- Outer Circular Base -->
      <circle cx="50" cy="50" r="48" fill="white" stroke="${conf.bg}" stroke-width="3" filter="url(#shadow-${hospitalId})" />
      <circle cx="50" cy="50" r="43" fill="url(#bgGrad-${hospitalId})" />

      <!-- Inner White Hospital Silhouette Area -->
      <circle cx="50" cy="50" r="38" fill="white" />

      <!-- Hospital Building Icon Graphic -->
      <!-- Left Wing -->
      <rect x="25" y="44" width="13" height="26" rx="1.5" fill="${conf.bg}" opacity="0.85" />
      <rect x="28" y="47" width="3" height="4" rx="0.5" fill="white" />
      <rect x="33" y="47" width="3" height="4" rx="0.5" fill="white" />
      <rect x="28" y="54" width="3" height="4" rx="0.5" fill="white" />
      <rect x="33" y="54" width="3" height="4" rx="0.5" fill="white" />

      <!-- Right Wing -->
      <rect x="62" y="44" width="13" height="26" rx="1.5" fill="${conf.bg}" opacity="0.85" />
      <rect x="64" y="47" width="3" height="4" rx="0.5" fill="white" />
      <rect x="69" y="47" width="3" height="4" rx="0.5" fill="white" />
      <rect x="64" y="54" width="3" height="4" rx="0.5" fill="white" />
      <rect x="69" y="54" width="3" height="4" rx="0.5" fill="white" />

      <!-- Center Main Tower -->
      <rect x="35" y="32" width="30" height="38" rx="2" fill="${conf.bg}" />

      <!-- Center Windows Grid -->
      <rect x="40" y="37" width="4" height="4" rx="0.5" fill="white" />
      <rect x="48" y="37" width="4" height="4" rx="0.5" fill="white" />
      <rect x="56" y="37" width="4" height="4" rx="0.5" fill="white" />

      <rect x="40" y="44" width="4" height="4" rx="0.5" fill="white" />
      <rect x="48" y="44" width="4" height="4" rx="0.5" fill="white" />
      <rect x="56" y="44" width="4" height="4" rx="0.5" fill="white" />

      <!-- Emergency Hospital Entrance Arch -->
      <path d="M45 70 v-13 a1 1 0 0 1 1 -1 h8 a1 1 0 0 1 1 1 v13 z" fill="#0f172a" />
      <rect x="47" y="59" width="2" height="9" fill="#38bdf8" />
      <rect x="51" y="59" width="2" height="9" fill="#38bdf8" />

      <!-- Prominent Red Medical Cross Symbol on Top -->
      <circle cx="50" cy="23" r="10" fill="white" stroke="${conf.bg}" stroke-width="1.8" />
      <rect x="48" y="16.5" width="4" height="13" rx="0.8" fill="#ef4444" />
      <rect x="43.5" y="21" width="13" height="4" rx="0.8" fill="#ef4444" />

      <!-- Ground Base Line -->
      <rect x="20" y="70" width="60" height="2.5" rx="1" fill="${conf.bg}" />
    </svg>
  `;
}

export default function HospitalLogo({ hospitalId, size = 38, className = '' }) {
  const svgHtml = getHospitalLogoSvg(hospitalId, size);
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}
