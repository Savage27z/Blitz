const FLAGS: Record<string, string> = {
  "Algeria": "🇩🇿",
  "Argentina": "🇦🇷",
  "Australia": "🇦🇺",
  "Austria": "🇦🇹",
  "Belgium": "🇧🇪",
  "Bosnia & Herzegovina": "🇧🇦",
  "Brazil": "🇧🇷",
  "Cameroon": "🇨🇲",
  "Canada": "🇨🇦",
  "Cape Verde": "🇨🇻",
  "Colombia": "🇨🇴",
  "Congo DR": "🇨🇩",
  "Costa Rica": "🇨🇷",
  "Croatia": "🇭🇷",
  "Denmark": "🇩🇰",
  "Ecuador": "🇪🇨",
  "Egypt": "🇪🇬",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Ghana": "🇬🇭",
  "Iran": "🇮🇷",
  "Iraq": "🇮🇶",
  "Italy": "🇮🇹",
  "Ivory Coast": "🇨🇮",
  "Japan": "🇯🇵",
  "Jordan": "🇯🇴",
  "Mexico": "🇲🇽",
  "Morocco": "🇲🇦",
  "Myanmar": "🇲🇲",
  "Netherlands": "🇳🇱",
  "New Zealand": "🇳🇿",
  "Nigeria": "🇳🇬",
  "Norway": "🇳🇴",
  "Panama": "🇵🇦",
  "Paraguay": "🇵🇾",
  "Poland": "🇵🇱",
  "Portugal": "🇵🇹",
  "Qatar": "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  "Senegal": "🇸🇳",
  "Serbia": "🇷🇸",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  "Spain": "🇪🇸",
  "Switzerland": "🇨🇭",
  "Tunisia": "🇹🇳",
  "Turkey": "🇹🇷",
  "Uruguay": "🇺🇾",
  "USA": "🇺🇸",
  "Uzbekistan": "🇺🇿",
  "Vietnam": "🇻🇳",
  "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

export function getFlag(teamName: string): string {
  return FLAGS[teamName] || "🏳️";
}

const VENUES: Record<number, { stadium: string; city: string }> = {
  10001: { stadium: "MetLife Stadium", city: "New Jersey" },
  10002: { stadium: "AT&T Stadium", city: "Dallas" },
  10003: { stadium: "SoFi Stadium", city: "Los Angeles" },
  10004: { stadium: "Hard Rock Stadium", city: "Miami" },
  10005: { stadium: "Lumen Field", city: "Seattle" },
};

export function getVenue(fixtureId: number) {
  return VENUES[fixtureId] || { stadium: "FIFA Stadium", city: "TBD" };
}

const STAGES: Record<number, string> = {
  10001: "Semi-Final",
  10002: "Quarter-Final",
  10003: "Group B · Matchday 3",
  10004: "Group D · Matchday 2",
  10005: "Round of 16",
};

export function getStage(fixtureId: number): string {
  return STAGES[fixtureId] || "Group Stage";
}
