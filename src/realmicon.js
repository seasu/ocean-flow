// 五個境界的線條圖示：感流（聽見漣漪）→ 聚流（往內收的漩渦）→ 化流（浪上生出火苗）→ 御流（捲起的大浪）→ 歸流（一圈完整的海）
export const REALM_COL = ['#7fe8ff', '#8fd14f', '#ffa53a', '#a98bff', '#ffcf5a'];
const GLYPH = [
  '<circle cx="12" cy="12" r="1.6"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9.2 9.2 0 0 0 0 13M18.5 5.5a9.2 9.2 0 0 1 0 13"/>',
  '<path d="M11 12a1 1 0 0 1 2 0a2 2 0 0 1-4 0a3 3 0 0 1 6 0a4 4 0 0 1-8 0a5 5 0 0 1 10 0a6 6 0 0 1-12 0"/>',
  '<path d="M3 19c1.5-1.5 3 1.5 4.5 0s3 1.5 4.5 0 3 1.5 4.5 0 3 1.5 4.5 0"/><path d="M12 15c-3-1.5-3.5-5 0-11 3.5 6 3 9.5 0 11z"/><path d="M12 15v-4"/>',
  '<path d="M3 18c4.5 0 5-11 11.5-11 3 0 5 2 5 4.5 0 2-1.6 3.2-3 2.6-1.3-.6-1.2-2.8.6-3"/><path d="M3 21h18"/>',
  '<circle cx="12" cy="12" r="9"/><path d="M6.5 13c1.8-1.8 3.7 1.8 5.5 0s3.7 1.8 5.5 0"/><circle cx="12" cy="8.2" r="1.2"/>',
];
export const realmGlyph = i => GLYPH[i] || GLYPH[0];
export const realmSvg = (i, w = 1.8, at = '') => `<svg ${at}viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${GLYPH[i] || GLYPH[0]}</svg>`;
