import fs from "fs/promises";
import data from "./data/analysis2.json";
import reviewData from "./data/data.json";

const dataSet = data as Response;
const reviewDataSet = reviewData as review[];

interface Result {
  id: number;
  sentiment: "positive" | "negative";
  containsFeatureRequest: boolean;
  requestedFeature: string | null;
  rating: number;
}

interface Response {
  results: Result[];
}

interface review {
  id: number;
  date: string;
  wordCount: number;
  rating: number;
  review: string;
}

async function saveSortedResults() {
  let resultsWithARequestedFeature = dataSet.results.filter((result) => {
    return result.containsFeatureRequest && result.requestedFeature;
  });
  let sortResultsByRating = resultsWithARequestedFeature.sort((a, b) => {
    return a.rating - b.rating || a.sentiment.localeCompare(b.sentiment);
  });
  let toJson = JSON.stringify(sortResultsByRating);
  await fs.writeFile("./data/sorted.json", toJson);
}

saveSortedResults();
