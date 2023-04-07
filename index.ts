import data from "./data/data.json";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs/promises";
dotenv.config();

const dataSet = data as review[];

interface review {
  id: number;
  date: string;
  wordCount: number;
  rating: number;
  review: string;
}

// Define the API endpoint
const apiEndpoint = "https://api.openai.com/v1/chat/completions";

// Define the API request headers
const headers = {
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  "Content-Type": "application/json",
};

async function makeRequests() {
  const limit = 300;
  let count = 0;
  let responses: any = [];
  for await (const data of dataSet) {
    if (count >= limit) {
      break;
    }
    console.log(`Making a request for ${count}`);
    let requestData = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `For the following review give me a response as json object formatted like {id: ${data.id},  sentiment: the sentiment (negative or positive), containsFeatureRequest: boolean, requestedFeature: the feature requested}: \n ${data.review} \n \n if unable to determine a field put NULL as the value. Make the response from this api request easily usable with JSON.parse and only return the object.`,
        },
      ],
      max_tokens: 1024,
      temperature: 0.2,
      n: 1,
    };
    let response = await axios.post(apiEndpoint, requestData, { headers });
    let raw = response.data.choices[0].message.content;
    const formattedItem = raw.replace("\n", "");
    const parsedJson = JSON.parse(formattedItem);
    const fileContents = await fs.readFile("analysis.json", "utf-8");
    const readFileContentsAsJson = JSON.parse(fileContents);
    readFileContentsAsJson.results.push(parsedJson);
    const writeFileContentsAsJson = JSON.stringify(readFileContentsAsJson);
    await fs.writeFile("analysis.json", writeFileContentsAsJson);
    console.log(`Completed write ${count}`);
    count++;
  }
  return responses;
}
async function doJob() {
  let analysis = await makeRequests();
}

doJob();
