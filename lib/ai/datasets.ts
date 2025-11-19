export const categorizedDatasets = {
  OSINT: [
    "Social media trends (e.g., Twitter/X sentiment on events)",
    "News archives (e.g., GDELT for global events)",
    "Economic indicators (e.g., World Bank data for policy impacts)",
    "Web scraping logs (e.g., public APIs for market data)",
  ],
  SIGINT: [
    "Radio frequency logs (e.g., comms patterns during conflicts)",
    "Network traffic summaries (e.g., cyber threat signals)",
    "Encrypted message metadata (e.g., volume spikes for anomaly detection)",
  ],
  HUMINT: [
    "Field reports (e.g., eyewitness accounts of interventions)",
    "Informant networks (e.g., relational graphs of actors)",
    "Survey data (e.g., public opinion polls on policies)",
  ],
  GEOINT: [
    "LiveUA map data (past year: lat/lon, timestamps, events, outcomes for causal spatial analysis)",
    "Satellite imagery metadata (e.g., change detection in areas)",
    "GPS tracks (e.g., movement patterns for migration effects)",
    "Environmental layers (e.g., GIS data for climate interventions)",
  ],
  MASINT: [
    "Sensor readings (e.g., radar/spectral data for material identification)",
    "Acoustic signals (e.g., underwater noise for naval ops)",
    "Chemical/biological traces (e.g., plume modeling for exposure effects)",
  ],
};

export const getDatasetSuggestions = (query: string): string[] => {
  // Simple predictive function: return relevant categories/datasources based on keywords
  const suggestions: string[] = [];
  if (
    query.toLowerCase().includes("location") ||
    query.toLowerCase().includes("map")
  ) {
    suggestions.push(...categorizedDatasets.GEOINT);
  }
  if (
    query.toLowerCase().includes("social") ||
    query.toLowerCase().includes("news")
  ) {
    suggestions.push(...categorizedDatasets.OSINT);
  }
  // Add more logic as needed
  return suggestions.slice(0, 5); // Limit to 3-5
};
