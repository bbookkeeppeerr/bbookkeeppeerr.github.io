/// <reference types="chrome" />

/**
 * A list of youtube default file names for thumbnails sorted by size
 * @type {string[]}
 */
const filenames = [
  "maxresdefault.jpg", // 1280x720
  "sddefault.jpg", // 640x480
  "hqdefault.jpg", // 480x360
  "mqdefault.jpg", // 320x180
  "default.jpg", // 120x90
];

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.includes("youtube.com")) {
    // get the url and video code, return if not found
    const currentUrl = new URL(tab.url);
    const videoCode = currentUrl.searchParams.get("v");
    if (!videoCode) return;

    const imageName = await fetchImage(videoCode, 0);

    if (imageName) {
      chrome.tabs.create({ url: imageName });
    }
  }
});

/**
 * Construct the url for the passed in video code,
 * return the fileImage if present, if all options returned 404 return null
 * @param {String} videoCode
 * @param {Number} index
 * @returns {String|null} fileImage url
 */
async function fetchImage(videoCode, index) {
  if (filenames.length > index) {
    const url = `https://img.youtube.com/vi/${videoCode}/${filenames[index]}`;
    const response = await fetch(url);
    if (!response.ok) {
      return fetchImage(videoCode, index + 1);
    }
    return url;
  }
  return null;
}
