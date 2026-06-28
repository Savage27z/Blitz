/** ISO 3166-1 alpha-2 codes for flagcdn.com */
const COUNTRY_CODES: Record<string, string> = {
  Algeria: "dz",
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  "Bosnia & Herzegovina": "ba",
  Brazil: "br",
  Cameroon: "cm",
  Canada: "ca",
  "Cape Verde": "cv",
  Colombia: "co",
  "Congo DR": "cd",
  "Costa Rica": "cr",
  Croatia: "hr",
  Denmark: "dk",
  Ecuador: "ec",
  Egypt: "eg",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Iran: "ir",
  Iraq: "iq",
  Italy: "it",
  "Ivory Coast": "ci",
  Japan: "jp",
  Jordan: "jo",
  Mexico: "mx",
  Morocco: "ma",
  Myanmar: "mm",
  Netherlands: "nl",
  "New Zealand": "nz",
  Nigeria: "ng",
  Norway: "no",
  Panama: "pa",
  Paraguay: "py",
  Poland: "pl",
  Portugal: "pt",
  Qatar: "qa",
  "Saudi Arabia": "sa",
  Senegal: "sn",
  Serbia: "rs",
  "South Africa": "za",
  "South Korea": "kr",
  Spain: "es",
  Switzerland: "ch",
  Tunisia: "tn",
  Turkey: "tr",
  Uruguay: "uy",
  USA: "us",
  Uzbekistan: "uz",
  Vietnam: "vn",
  Wales: "gb-wls",
};

export function getCountryCode(teamName: string): string | null {
  return COUNTRY_CODES[teamName] ?? null;
}

/** flagcdn.com only serves these widths — anything else 404s */
const FLAGCDN_WIDTHS = [20, 40, 80, 160, 320, 640] as const;

export function snapFlagcdnWidth(displaySize: number): number {
  const min = Math.max(displaySize * 2, 20);
  return FLAGCDN_WIDTHS.find((w) => w >= min) ?? 640;
}

/** @deprecated use Flag component instead */
export function getFlag(teamName: string): string {
  return COUNTRY_CODES[teamName] ? "" : "🏳️";
}

export function getFlagUrl(teamName: string, displaySize = 28): string | null {
  const code = getCountryCode(teamName);
  if (!code) return null;
  return `https://flagcdn.com/w${snapFlagcdnWidth(displaySize)}/${code}.png`;
}
