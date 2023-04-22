import {
  readAll,
  readerFromStreamReader,
} from "https://deno.land/std@0.184.0/streams/mod.ts";
import * as fs from "https://deno.land/std@0.184.0/fs/mod.ts";

export async function handleServiceResponse(response: Response) {
  if (response.status < 300) {
    return await response.json();
  } else {
    const resp = await response.json();
    console.log("resp", resp);
    throw new Error(
      "Service returned an error, status:" +
        response.status +
        ", message:" +
        resp?.error?.message
    );
  }
}

export function createDirIfNotExists(exportPath: string) {
  if (!fs.existsSync(exportPath, { isDirectory: true, isReadable: true })) {
    console.info("directory not found, creating...");
    Deno.mkdir(exportPath);
  }
}

export function requiredPrompt(question: string, required = false) {
  let answer = prompt(question);
  let i = 0;
  while ((answer == null || answer == undefined) && required && i < 3) {
    console.error("this field is required");
    answer = prompt(question);
    i++;
  }
  if ((answer == null || answer == undefined) && required && i >= 3) {
    throw new Error("required prompt is not given by user 3 times");
  }
  return answer;
}

export async function downloadImage(imageUrl: string, exportPath: string) {
  try {
    //we don't want to download existing files
    if (fs.existsSync(exportPath)) {
      console.info(`${exportPath} already exists, skipping...`);
      return;
    }

    const res = await fetch(imageUrl);
    console.log("fetched");
    if (res.status > 299) {
      console.error(`response status was ${res.status}, this is not handled.`);
      return;
    }
    if (res.body) {
      const reader = readerFromStreamReader(res.body.getReader());
      const allContent = await readAll(reader);
      await Deno.writeFile(exportPath, allContent);
    }
  } catch (error) {
    console.error("download failed", error);
  }
}
