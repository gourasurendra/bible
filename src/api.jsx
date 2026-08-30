const API = "https://bible-api.com";

// Telugu Bible JSON source.
// The repository contains each of the 66 books as a separate JSON file.
// We fetch JSON instead of scraping HTML from eBible.org, which avoids the
// CORS/HTML-parsing problem that caused "Failed to fetch" in the reader.
const TELUGU_RAW_BASE = "https://raw.githubusercontent.com/aruljohn/Bible-telugu/main";

const TELUGU_FILES = {
  Genesis: "Genesis.json",
  Exodus: "Exodus.json",
  Leviticus: "Leviticus.json",
  Numbers: "Numbers.json",
  Deuteronomy: "Deuteronomy.json",
  Joshua: "Joshua.json",
  Judges: "Judges.json",
  Ruth: "Ruth.json",
  "1 Samuel": "1 Samuel.json",
  "2 Samuel": "2 Samuel.json",
  "1 Kings": "1 Kings.json",
  "2 Kings": "2 Kings.json",
  "1 Chronicles": "1 Chronicles.json",
  "2 Chronicles": "2 Chronicles.json",
  Ezra: "Ezra.json",
  Nehemiah: "Nehemiah.json",
  Esther: "Esther.json",
  Job: "Job.json",
  Psalms: "Psalms.json",
  Proverbs: "Proverbs.json",
  Ecclesiastes: "Ecclesiastes.json",
  "Song of Solomon": "Song of Songs.json",
  Isaiah: "Isaiah.json",
  Jeremiah: "Jeremiah.json",
  Lamentations: "Lamentations.json",
  Ezekiel: "Ezekiel.json",
  Daniel: "Daniel.json",
  Hosea: "Hosea.json",
  Joel: "Joel.json",
  Amos: "Amos.json",
  Obadiah: "Obadiah.json",
  Jonah: "Jonah.json",
  Micah: "Micah.json",
  Nahum: "Nahum.json",
  Habakkuk: "Habakkuk.json",
  Zephaniah: "Zephaniah.json",
  Haggai: "Haggai.json",
  Zechariah: "Zechariah.json",
  Malachi: "Malachi.json",
  Matthew: "Matthew.json",
  Mark: "Mark.json",
  Luke: "Luke.json",
  John: "John.json",
  Acts: "Acts.json",
  Romans: "Romans.json",
  "1 Corinthians": "1 Corinthians.json",
  "2 Corinthians": "2 Corinthians.json",
  Galatians: "Galatians.json",
  Ephesians: "Ephesians.json",
  Philippians: "Philippians.json",
  Colossians: "Colossians.json",
  "1 Thessalonians": "1 Thessalonians.json",
  "2 Thessalonians": "2 Thessalonians.json",
  "1 Timothy": "1 Timothy.json",
  "2 Timothy": "2 Timothy.json",
  Titus: "Titus.json",
  Philemon: "Philemon.json",
  Hebrews: "Hebrews.json",
  James: "James.json",
  "1 Peter": "1 Peter.json",
  "2 Peter": "2 Peter.json",
  "1 John": "1 John.json",
  "2 John": "2 John.json",
  "3 John": "3 John.json",
  Jude: "Jude.json",
  Revelation: "Revelation.json"
};

const teluguCacheKey = (book, chapter) =>
  `bibleverse:telugu:${book}:${chapter}`;

export async function fetchChapter(book, chapter, translation = "web") {
  if (translation === "telotsa") {
    return fetchTeluguChapter(book, chapter);
  }

  const url = `${API}/${encodeURIComponent(`${book} ${chapter}`)}?translation=${encodeURIComponent(translation)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Unable to load ${book} ${chapter}.`);
  }

  return res.json();
}

export async function fetchReference(reference, translation = "web") {
  if (translation === "telotsa") {
    return fetchTeluguReference(reference);
  }

  const url = `${API}/${encodeURIComponent(reference)}?translation=${encodeURIComponent(translation)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Unable to load that reference.");
  }

  return res.json();
}

async function fetchTeluguChapter(book, chapter) {
  const fileName = TELUGU_FILES[book];

  if (!fileName) {
    throw new Error(`No Telugu Bible data is configured for ${book}.`);
  }

  const chapterNumber = Number(chapter);
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
    throw new Error("Invalid chapter number.");
  }

  const cacheKey = teluguCacheKey(book, chapterNumber);

  // Use a previously downloaded chapter immediately when available.
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // LocalStorage may be unavailable; continue with network request.
  }

  const url = `${TELUGU_RAW_BASE}/${encodeURIComponent(fileName)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-cache"
  });

  if (!res.ok) {
    throw new Error(
      `Unable to load Telugu ${book} ${chapter}. Check your internet connection and try again.`
    );
  }

  const bookData = await res.json();
  const chapterData = Array.isArray(bookData.chapters)
    ? bookData.chapters.find(item => Number(item.chapter) === chapterNumber)
    : null;

  if (!chapterData || !Array.isArray(chapterData.verses)) {
    throw new Error(`Telugu ${book} chapter ${chapterNumber} was not found.`);
  }

  const verses = chapterData.verses
    .map(item => ({
      verse: Number(item.verse),
      text: String(item.text || "").replace(/\s+/g, " ").trim()
    }))
    .filter(item => Number.isFinite(item.verse) && item.text)
    .sort((a, b) => a.verse - b.verse);

  if (!verses.length) {
    throw new Error(`No Telugu verses were found for ${book} ${chapterNumber}.`);
  }

  const result = {
    reference: `${book} ${chapterNumber}`,
    translation_name: "Telugu Bible",
    translation_note: "Telugu Bible JSON • aruljohn/Bible-telugu • MIT repository",
    verses
  };

  // Cache the normalized chapter for later/offline reading.
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch {
    // Ignore storage quota/privacy errors.
  }

  return result;
}

async function fetchTeluguReference(reference) {
  const match = reference.trim().match(/^(.+?)\s+(\d+)(?::(\d+))?$/);

  if (!match) {
    throw new Error("Use a reference such as John 3:16.");
  }

  const book = match[1];
  const chapter = Number(match[2]);
  const data = await fetchTeluguChapter(book, chapter);

  if (!match[3]) return data;

  const verseNumber = Number(match[3]);
  const verse = data.verses.filter(item => item.verse === verseNumber);

  if (!verse.length) {
    throw new Error(`${book} ${chapter}:${verseNumber} was not found.`);
  }

  return {
    ...data,
    verses: verse,
    reference: `${book} ${chapter}:${verseNumber}`
  };
}
