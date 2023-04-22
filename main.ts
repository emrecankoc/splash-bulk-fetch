import * as path from "https://deno.land/std@0.183.0/path/mod.ts";
import {
  createDirIfNotExists,
  downloadImage,
  handleServiceResponse,
  requiredPrompt,
} from "./utils.ts";

try {
  const BASE_UNSPLASH_API_URL = "https://api.unsplash.com";
  const currentDir = Deno.cwd();

  console.info("------------------------------");
  console.info("UNSPLASH BULK IMAGE DOWNLOADER");
  console.info("------------------------------");
  // get field from user
  const token = requiredPrompt("your secret token:", true);
  const collectionId = requiredPrompt("collection id to download:", true);
  const exportDir = requiredPrompt(
    "where to download (defaults to collectionId):"
  );
  const exportPath = path.join(currentDir, exportDir ?? collectionId ?? "");

  const isConfirmed = confirm(
    `the collection (${collectionId}) will be downloaded to the selected directory (${exportPath})`
  );

  if (!isConfirmed) {
    alert("it is not confirmed by user, cancelling the operation");
    Deno.exit();
  }

  createDirIfNotExists(exportPath);
  // unsplash api collection photos
  const images = await fetch(
    `${BASE_UNSPLASH_API_URL}/collections/${collectionId}/photos?per_page=50`,
    {
      headers: {
        Authorization: `Client-ID ${token}`,
        "Accept-Version": "v1",
      },
    }
  ).then(handleServiceResponse);

  console.info("collection info fetched");
  let i = 1;
  for (const element of images) {
    if (element?.urls?.raw && element?.id) {
      const type = element.urls.raw.endsWith(".jpg") ? "jpg" : "png";
      const resultExport = `${exportPath}/${collectionId}_${i++}_${
        element.id
      }.${type}`;
      console.info("------------------------------");
      console.info("fetching image from", element.urls.raw);
      await downloadImage(element.urls.raw, resultExport);
      console.info("image downloaded to:", resultExport);
      console.info("------------------------------");
    }
  }

  alert("completed");
  Deno.exit();
} catch (error) {
  console.error("an unexpected error occured", error);
}
