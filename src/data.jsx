export const teluguBookNames = {"Genesis": "ఆదికాండము", "Exodus": "నిర్గమకాండము", "Leviticus": "లేవీయకాండము", "Numbers": "సంఖ్యాకాండము", "Deuteronomy": "ద్వితీయోపదేశకాండము", "Joshua": "యెహోషువ", "Judges": "న్యాయాధిపతులు", "Ruth": "రూతు", "1 Samuel": "1 సమూయేలు", "2 Samuel": "2 సమూయేలు", "1 Kings": "1 రాజులు", "2 Kings": "2 రాజులు", "1 Chronicles": "1 దినవృత్తాంతములు", "2 Chronicles": "2 దినవృత్తాంతములు", "Ezra": "ఎజ్రా", "Nehemiah": "నెహెమ్యా", "Esther": "ఎస్తేరు", "Job": "యోబు", "Psalms": "కీర్తనలు", "Proverbs": "సామెతలు", "Ecclesiastes": "ప్రసంగి", "Song of Solomon": "పరమగీతము", "Isaiah": "యెషయా", "Jeremiah": "యిర్మీయా", "Lamentations": "విలాపవాక్యములు", "Ezekiel": "యెహెజ్కేలు", "Daniel": "దానియేలు", "Hosea": "హోషేయ", "Joel": "యోవేలు", "Amos": "ఆమోసు", "Obadiah": "ఓబద్యా", "Jonah": "యోనా", "Micah": "మీకా", "Nahum": "నహూము", "Habakkuk": "హబక్కూకు", "Zephaniah": "జెఫన్యా", "Haggai": "హగ్గయి", "Zechariah": "జెకర్యా", "Malachi": "మలాకీ", "Matthew": "మత్తయి", "Mark": "మార్కు", "Luke": "లూకా", "John": "యోహాను", "Acts": "అపొస్తలుల కార్యములు", "Romans": "రోమీయులకు", "1 Corinthians": "1 కొరింథీయులకు", "2 Corinthians": "2 కొరింథీయులకు", "Galatians": "గలతీయులకు", "Ephesians": "ఎఫెసీయులకు", "Philippians": "ఫిలిప్పీయులకు", "Colossians": "కొలొస్సయులకు", "1 Thessalonians": "1 థెస్సలొనీకయులకు", "2 Thessalonians": "2 థెస్సలొనీకయులకు", "1 Timothy": "1 తిమోతికి", "2 Timothy": "2 తిమోతికి", "Titus": "తీతుకు", "Philemon": "ఫిలేమోనుకు", "Hebrews": "హెబ్రీయులకు", "James": "యాకోబు", "1 Peter": "1 పేతురు", "2 Peter": "2 పేతురు", "1 John": "1 యోహాను", "2 John": "2 యోహాను", "3 John": "3 యోహాను", "Jude": "యూదా", "Revelation": "ప్రకటన గ్రంథము"};

export const books = [
["Genesis",50],["Exodus",40],["Leviticus",27],["Numbers",36],["Deuteronomy",34],["Joshua",24],["Judges",21],["Ruth",4],["1 Samuel",31],["2 Samuel",24],["1 Kings",22],["2 Kings",25],["1 Chronicles",29],["2 Chronicles",36],["Ezra",10],["Nehemiah",13],["Esther",10],["Job",42],["Psalms",150],["Proverbs",31],["Ecclesiastes",12],["Song of Solomon",8],["Isaiah",66],["Jeremiah",52],["Lamentations",5],["Ezekiel",48],["Daniel",12],["Hosea",14],["Joel",3],["Amos",9],["Obadiah",1],["Jonah",4],["Micah",7],["Nahum",3],["Habakkuk",3],["Zephaniah",3],["Haggai",2],["Zechariah",14],["Malachi",4],
["Matthew",28],["Mark",16],["Luke",24],["John",21],["Acts",28],["Romans",16],["1 Corinthians",16],["2 Corinthians",13],["Galatians",6],["Ephesians",6],["Philippians",4],["Colossians",4],["1 Thessalonians",5],["2 Thessalonians",3],["1 Timothy",6],["2 Timothy",4],["Titus",3],["Philemon",1],["Hebrews",13],["James",5],["1 Peter",5],["2 Peter",3],["1 John",5],["2 John",1],["3 John",1],["Jude",1],["Revelation",22]
].map(([name, chapters], index) => ({ name, chapters, testament: index < 39 ? "Old Testament" : "New Testament" }));

export const topics = [
  ["Love","John 3:16"],["Faith","Hebrews 11:1"],["Hope","Romans 15:13"],["Peace","John 14:27"],
  ["Prayer","Philippians 4:6"],["Wisdom","James 1:5"],["Strength","Isaiah 41:10"],["Forgiveness","1 John 1:9"],
  ["Grace","Ephesians 2:8"],["Courage","Joshua 1:9"],["Patience","Romans 12:12"],["Joy","Philippians 4:4"]
];

export const plans = [
  {id:"one-year", title:"Bible in 1 Year", duration:"365 days", description:"A steady journey through the whole Bible."},
  {id:"nt-90", title:"New Testament in 90 Days", duration:"90 days", description:"Read through the New Testament at a focused pace."},
  {id:"psalms-30", title:"Psalms in 30 Days", duration:"30 days", description:"Spend a month praying through the Psalms."},
  {id:"proverbs-31", title:"Proverbs in 31 Days", duration:"31 days", description:"One chapter of wisdom each day."},
  {id:"gospels", title:"Gospel Reading Plan", duration:"30 days", description:"Walk through the life and ministry of Jesus."},
  {id:"beginner", title:"Beginner Bible Plan", duration:"21 days", description:"A gentle introduction to foundational passages."}
];

export const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "");
export const bookFromSlug = (value) => books.find(b => slug(b.name) === value);
export const totalChapters = books.reduce((sum,b) => sum + b.chapters, 0);