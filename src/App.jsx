import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, Copy, Languages as Focus, Heart, Home as HomeIcon, Menu, Moon, NotebookPen, Palette,
  Search, Settings as SettingsIcon, Share2, Sparkles, Sun, Target, Trophy, X, Zap
} from "lucide-react";
import {books, topics, plans, slug, bookFromSlug, totalChapters, teluguBookNames} from "./data.jsx";
import { fetchChapter, fetchReference } from "./api.jsx";
import { completeChapter, loadStore, markRead, saveStore, today } from "./storage.jsx";

const translations = [
  {id:"web", label:"English • WEB"},
  {id:"kjv", label:"English • KJV"},
  {id:"telotsa", label:"తెలుగు • Telugu Bible"}
];


function displayBookName(bookName, translation) {
  return translation === "telotsa" ? (teluguBookNames[bookName] || bookName) : bookName;
}

function App() {
  const [store, setStore] = useState(loadStore);
  const [translation, setTranslation] = useState("web");
  const [menu, setMenu] = useState(false);
  const [focus, setFocus] = useState(false);

  useEffect(() => saveStore(store), [store]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = store.settings.theme;
  }, [store.settings.theme]);

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      if (["input","textarea","select"].includes(tag)) return;
      if (e.key === "/" ) { e.preventDefault(); document.querySelector("#global-search")?.focus(); }
      if (e.key.toLowerCase() === "d") setStore(s => ({...s, settings:{...s.settings, theme:s.settings.theme==="dark"?"light":"dark"}}));
      if (e.key.toLowerCase() === "f") setFocus(v => !v);
      if (e.key === "+" || e.key === "=") setStore(s => ({...s, settings:{...s.settings, fontSize:Math.min(30,s.settings.fontSize+1)}}));
      if (e.key === "-") setStore(s => ({...s, settings:{...s.settings, fontSize:Math.max(15,s.settings.fontSize-1)}}));
      if (e.key === "Escape") setFocus(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const updateStore = (fn) => setStore(s => fn(s));

  return (
    <div className="app-shell">
      {!focus && <Header menu={menu} setMenu={setMenu} store={store} setStore={setStore} />}
      <main id="main" className={focus ? "focus-shell" : ""}>
        <Routes>
          <Route path="/" element={<Home store={store} />} />
          <Route path="/bible/:book" element={<BookChapters translation={translation} />} />
          <Route path="/bible/:book/:chapter" element={
            <Reader store={store} updateStore={updateStore} translation={translation} setTranslation={setTranslation} focus={focus} setFocus={setFocus}/>
          }/>
          <Route path="/books" element={<Books translation={translation} />} />
          <Route path="/search" element={<SearchPage store={store} updateStore={updateStore} />} />
          <Route path="/study" element={<Study store={store} />} />
          <Route path="/topics/:topic" element={<TopicPage />} />
          <Route path="/bookmarks" element={<Bookmarks store={store} updateStore={updateStore}/>} />
          <Route path="/highlights" element={<Highlights store={store} />} />
          <Route path="/notes" element={<Notes store={store} />} />
          <Route path="/collections" element={<Collections store={store} updateStore={updateStore}/>} />
          <Route path="/history" element={<History store={store} />} />
          <Route path="/reading-plans" element={<ReadingPlans store={store} updateStore={updateStore}/>} />
          <Route path="/settings" element={<Settings store={store} setStore={setStore} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      {!focus && <Footer />}
      {!focus && <MobileNav />}

    </div>
  );
}

function Header({menu,setMenu,store,setStore}) {
  return <header className="topbar">
    <div className="container nav-inner">
      <Link className="brand" to="/"><span className="brand-mark"><BookOpen size={18}/></span><span>Bible<span>Verse</span></span></Link>
      <nav className={menu ? "desktop-nav open" : "desktop-nav"}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/books">Bible</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/study">Study</NavLink>
      </nav>
      <div className="nav-actions">
        <button className="icon-btn" title="Toggle theme" onClick={()=>setStore(s=>({...s,settings:{...s.settings,theme:s.settings.theme==="dark"?"light":"dark"}}))}>
          {store.settings.theme==="dark" ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
        <button className="icon-btn mobile-menu" onClick={()=>setMenu(!menu)}><Menu size={20}/></button>
      </div>
    </div>
  </header>
}

function Home({store}) {
  return <div>
    <section className="hero">
      <div className="hero-glow"/>
      <div className="container hero-grid">
        <div>
          <span className="eyebrow"><Sparkles size={14}/> A calmer way to read Scripture</span>
          <h1>Read. <em>Reflect.</em><br/>Grow.</h1>
          <p>Explore the Bible with a peaceful, modern reading experience built for thoughtful study and everyday devotion.</p>
          <div className="hero-buttons"><Link className="btn primary" to="/bible">Start Reading <ArrowRight size={17}/></Link><Link className="btn secondary" to="/books">Explore the Bible</Link></div>
          <div className="trust-row"><span><Check size={14}/> Free to use</span><span><Check size={14}/> Private by default</span><span><Check size={14}/> Works offline for visited chapters</span></div>
        </div>
        <div className="hero-card">
          <div className="hero-card-top"><span>VERSE OF THE DAY</span><span className="dot"/></div>
          <blockquote>“For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.”</blockquote>
          <div className="hero-ref">John 3:16 <span>WEB</span></div>
          <Link to="/bible/john/3" className="text-link">Read chapter <ArrowRight size={15}/></Link>
        </div>
      </div>
    </section>

    <section className="container section">
      <div className="section-heading"><div><span className="eyebrow">YOUR JOURNEY</span><h2>Keep growing, one chapter at a time.</h2></div><Link to="/study" className="text-link">Open dashboard <ArrowRight size={15}/></Link></div>
      <div className="stats-grid">
        <Stat icon={<Target/>} label="Bible progress" value={`${Math.round((store.completed.length/totalChapters)*100)}%`} sub={`${store.completed.length} chapters completed`}/>
        <Stat icon={<Zap/>} label="Reading streak" value={`${store.streak.current} days`} sub={`Best: ${store.streak.longest} days`}/>
        <Stat icon={<Trophy/>} label="Daily goal" value={`${store.daily.date===today()?store.daily.count:0}/${store.goal}`} sub="chapters today"/>
        <Stat icon={<Bookmark/>} label="Saved verses" value={store.bookmarks.length} sub="bookmarks"/>
      </div>
    </section>

    <section className="container section two-col">
      <div className="panel">
        <div className="panel-head"><div><span className="eyebrow">CONTINUE READING</span><h3>{store.history[0] || "John 3"}</h3></div><Link className="btn small" to={store.history[0]?`/bible/${slug(store.history[0].split(" ")[0])}/${store.history[0].split(" ").pop()}`:"/bible/john/3"}>Continue</Link></div>
        <div className="progress-line"><span style={{width:`${Math.max(4,Math.round((store.completed.length/totalChapters)*100))}%`}}/></div>
        <p className="muted">Your reading position and study notes stay on this device unless you choose to sync them later.</p>
      </div>
      <div className="panel quote-panel">
        <Heart size={22}/>
        <p>“Now may the God of hope fill you with all joy and peace in believing.”</p>
        <span>Romans 15:13</span>
      </div>
    </section>

    <section className="container section">
      <div className="section-heading"><div><span className="eyebrow">EXPLORE</span><h2>Find a place to begin.</h2></div></div>
      <div className="topic-grid">{topics.slice(0,8).map(([name,ref])=><Link key={name} to={`/topics/${name.toLowerCase()}`} className="topic-card"><span>{name}</span><small>{ref}</small><ArrowRight size={16}/></Link>)}</div>
    </section>
  </div>
}

function Stat({icon,label,value,sub}){return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>}

function Books({translation}){
  const [testament,setTestament]=useState("Old Testament");
  const filtered=books.filter(b=>b.testament===testament);

  return <Page title="All Bible Books" kicker="66 BOOKS" subtitle="Choose a testament and explore every book of the Bible.">
    <div className="segmented testament-tabs">
      <button
        className={testament==="Old Testament"?"active":""}
        onClick={()=>setTestament("Old Testament")}
      >
        Old Testament
      </button>
      <button
        className={testament==="New Testament"?"active":""}
        onClick={()=>setTestament("New Testament")}
      >
        New Testament
      </button>
    </div>

    <div className="testament-books-heading">
      <span className="eyebrow">{testament==="Old Testament"?"39 BOOKS":"27 BOOKS"}</span>
      <h2>{testament}</h2>
    </div>

    <div className="book-grid">
      {filtered.map(b=><BookTile key={b.name} book={b} translation={translation}/>) }
    </div>
  </Page>
}

function BookTile({book,translation}){return <Link to={`/bible/${slug(book.name)}`} className="book-tile"><span className="book-num">{String(books.indexOf(book)+1).padStart(2,"0")}</span><div><strong>{displayBookName(book.name, translation)}</strong><small>{book.testament} · {book.chapters} chapters</small></div><ArrowRight size={16}/></Link>}

function BookChapters({translation}){
  const {book:bookParam}=useParams();
  const book=bookFromSlug(bookParam);
  if(!book) return <Page title="Book not found" kicker="BIBLE"><Empty text="That Bible book could not be found."/></Page>;
  return <Page title={displayBookName(book.name, translation)} kicker={book.testament.toUpperCase()} subtitle={`Choose a chapter of ${displayBookName(book.name, translation)}.`}>
    <div className="book-chapter-head panel">
      <div>
        <span className="eyebrow"><BookOpen size={14}/> {book.chapters} CHAPTERS</span>
        <h2>{displayBookName(book.name, translation)}</h2>
        <p>Select a chapter number. Each chapter opens the complete verse-by-verse reader.</p>
      </div>
      <Link className="btn secondary" to="/books"><ArrowLeft size={16}/> All books</Link>
    </div>
    <div className="chapter-grid" aria-label={`${book.name} chapter list`}>
      {Array.from({length:book.chapters},(_,index)=>{
        const chapter=index+1;
        return <Link key={chapter} className="chapter-card" to={`/bible/${slug(book.name)}/${chapter}`}>
          <span>CHAPTER</span><strong>{chapter}</strong><small>View verses →</small>
        </Link>;
      })}
    </div>
  </Page>;
}

function Reader({store,updateStore,translation,setTranslation,focus,setFocus}){
  const {book:bookParam,chapter:chapterParam}=useParams();
  const book=bookFromSlug(bookParam)||books[0];
  const chapter=Math.min(Math.max(1,Number(chapterParam)||1),book.chapters);
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [selected,setSelected]=useState(null);
  const [noteOpen,setNoteOpen]=useState(false);
  const [note,setNote]=useState("");
  const navigate=useNavigate();

  useEffect(()=>{
    let alive=true;
    setLoading(true); setError(""); setSelected(null);
    fetchChapter(book.name,chapter,translation).then(d=>{if(alive){setData(d); setLoading(false); updateStore(s=>markRead(s,`${book.name} ${chapter}`));}}).catch(e=>{if(alive){setError(e.message);setLoading(false)}})
    return ()=>{alive=false}
  },[book.name,chapter,translation]);

  const verses=useMemo(()=>data?.verses||[],[data]);
  const selectedKey=selected?`${book.name} ${chapter}:${selected}`:"";
  const isBookmarked=selected && store.bookmarks.includes(selectedKey);
  const highlight=selected ? store.highlights[selectedKey] : null;

  const toggleBookmark=()=>{
    if(!selected)return;
    updateStore(s=>({...s,bookmarks:s.bookmarks.includes(selectedKey)?s.bookmarks.filter(x=>x!==selectedKey):[selectedKey,...s.bookmarks]}));
  };
  const saveNote=()=>{
    if(!selected)return;
    updateStore(s=>({...s,notes:{...s.notes,[selectedKey]:note}})); setNoteOpen(false);
  };
  const setHighlight=(color)=>{
    if(!selected)return;
    updateStore(s=>({...s,highlights:{...s.highlights,[selectedKey]:color}}));
  };
  const share=async()=>{
    if(!selected)return;
    const v=verses.find(v=>v.verse===selected);
    const text=`${v.text.trim()} — ${book.name} ${chapter}:${selected}`;
    if(navigator.share) await navigator.share({title:"BibleVerse",text});
    else await navigator.clipboard.writeText(text);
  };
  const copy=async()=>{ if(!selected)return; const v=verses.find(v=>v.verse===selected); await navigator.clipboard.writeText(`${v.text.trim()} — ${book.name} ${chapter}:${selected}`); };

  return <div className={focus?"reader focus-reader":"reader"}>
    <div className="reader-top">
      {!focus && <Link to="/bible" className="back-link"><ArrowLeft size={15}/> Bible</Link>}
      <div className="reader-controls">
        <select value={translation} onChange={e=>setTranslation(e.target.value)}>{translations.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select>
        <button className="icon-btn" title="Focus mode" onClick={()=>setFocus(!focus)}><Focus size={17}/></button>
      </div>
    </div>
    <div className="chapter-nav">
      <button disabled={chapter<=1 && books.indexOf(book)===0} onClick={()=>goChapter(-1)}><ArrowLeft size={16}/> Previous</button>
      <div className="chapter-title"><span>{book.testament}</span><h1>{displayBookName(book.name, translation)} <small>Chapter {chapter}</small></h1><em>{verses.length ? `${verses.length} verses` : "Verses loading…"}</em></div>
      <button disabled={chapter>=book.chapters && books.indexOf(book)===books.length-1} onClick={()=>goChapter(1)}>Next <ArrowRight size={16}/></button>
    </div>
    {loading && <div className="loading"><div className="spinner"/>Opening Scripture…</div>}
    {error && <div className="error-box"><strong>Couldn’t load this chapter.</strong><p>{error}</p><button className="btn small" onClick={()=>location.reload()}>Retry</button></div>}
    {data && <article className={`scripture ${translation === "telotsa" ? "telugu-scripture" : ""}`} style={{"--reader-size":`${store.settings.fontSize}px`,"--reader-leading":store.settings.lineHeight,"--reader-width":`${store.settings.width}px`}}>
      <div className="scripture-meta"><span>{data.translation_name || "World English Bible"}</span><span>{data.translation_note || "Public Domain"}</span></div>
      {verses.map(v=>{
        const key=`${book.name} ${chapter}:${v.verse}`;
        return <div key={`${v.verse}-${v.section}`} className={`verse ${selected===v.verse?"selected":""} ${store.highlights[key]?"highlight-"+store.highlights[key]:""}`} onClick={()=>{setSelected(v.verse);setNote(store.notes[key]||"")}}>
          <sup>{v.verse}</sup><span>{v.text.trim()}</span>
          {store.notes[key] && <NotebookPen className="note-dot" size={14}/>}
        </div>
      })}
      <div className="reader-bottom"><button className="btn primary" onClick={()=>updateStore(s=>completeChapter(s,`${book.name} ${chapter}`))}><Check size={16}/> Mark chapter complete</button></div>
    </article>}
    {selected && <div className="verse-toolbar">
      <strong>{book.name} {chapter}:{selected}</strong>
      <button onClick={toggleBookmark}><Bookmark size={16} fill={isBookmarked?"currentColor":"none"}/>{isBookmarked?"Saved":"Save"}</button>
      <button onClick={copy}><Copy size={16}/>Copy</button>
      <button onClick={share}><Share2 size={16}/>Share</button>
      <button onClick={()=>setNoteOpen(true)}><NotebookPen size={16}/>Note</button>
      <div className="highlight-picker"><Palette size={16}/>{["yellow","green","blue","pink","purple"].map(c=><button key={c} className={`color-dot ${c} ${highlight===c?"active":""}`} onClick={()=>setHighlight(c)} aria-label={`Highlight ${c}`}/>)}</div>
    </div>}
    {noteOpen && <Modal title={`Note — ${book.name} ${chapter}:${selected}`} onClose={()=>setNoteOpen(false)}><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Write a personal note about this verse…"/><div className="modal-actions"><button className="btn secondary" onClick={()=>setNoteOpen(false)}>Cancel</button><button className="btn primary" onClick={saveNote}>Save note</button></div></Modal>}
  </div>;

  function goChapter(delta){
    const i=books.indexOf(book); let ni=i, nc=chapter+delta;
    if(nc<1){ni=i-1; nc=books[ni]?.chapters||1}
    if(nc>book.chapters){ni=i+1; nc=1}
    if(books[ni]) navigate(`/bible/${slug(books[ni].name)}/${nc}`);
  }
}

function SearchPage({store}){
  const [q,setQ]=useState("");
  const [loading,setLoading]=useState(false);
  const [results,setResults]=useState([]);
  const search=async(e)=>{
    e?.preventDefault(); if(!q.trim())return;
    setLoading(true); setResults([]);
    try{
      if(/^\d?\s?[A-Za-z ]+\s+\d+(:\d+(-\d+)?)?$/.test(q.trim())){
        const d=await fetchReference(q.trim());
        setResults(d.verses||[]);
      } else {
        const target=store.history[0]||"John 3";
        const [bn, ch] = target.match(/^(.+)\s(\d+)$/)?.slice(1)||["John","3"];
        const d=await fetchChapter(bn,Number(ch),"web");
        const term=q.toLowerCase();
        setResults((d.verses||[]).filter(v=>v.text.toLowerCase().includes(term)).map(v=>({...v,book_name:bn})));
      }
    }catch{setResults([])}
    setLoading(false);
  };
  return <Page title="Search Scripture" kicker="SEARCH" subtitle="Look up a reference, or search the currently cached reading context.">
    <form className="search-form" onSubmit={search}><Search size={19}/><input id="global-search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Try “John 3:16” or a word like “peace”"/><button className="btn primary">Search</button></form>
    <div className="search-hint"><span><Sparkles size={14}/> Reference search works directly. Keyword search checks the current/most recent chapter to stay lightweight.</span></div>
    {loading && <div className="loading"><div className="spinner"/>Searching…</div>}
    <div className="results">{results.map((r,i)=><div className="result-card" key={i}><span>{r.book_name} {r.chapter}:{r.verse}</span><p>{r.text.trim()}</p><Link to={`/bible/${slug(r.book_name)}/${r.chapter}`} className="text-link">Open chapter <ArrowRight size={14}/></Link></div>)}</div>
  </Page>
}

function Study({store}){
  const pct=Math.round(store.completed.length/totalChapters*100);
  return <Page title="Study Dashboard" kicker="YOUR STUDY" subtitle="A private overview of your reading, notes, highlights, and plans.">
    <div className="dashboard-grid">
      <div className="big-progress panel"><div className="ring" style={{"--p":`${pct}%`}}><strong>{pct}%</strong></div><div><span className="eyebrow">BIBLE PROGRESS</span><h3>{store.completed.length} chapters completed</h3><p className="muted">Keep showing up. A little reading each day adds up.</p></div></div>
      <Stat icon={<Zap/>} label="Current streak" value={`${store.streak.current} days`} sub={`Longest ${store.streak.longest}`}/>
      <Stat icon={<Target/>} label="Daily goal" value={`${store.daily.date===today()?store.daily.count:0}/${store.goal}`} sub={`${store.goal} chapters per day`}/>
      <Stat icon={<Bookmark/>} label="Bookmarks" value={store.bookmarks.length} sub="saved verses"/>
      <Stat icon={<NotebookPen/>} label="Notes" value={Object.keys(store.notes).length} sub="personal notes"/>
    </div>
    <div className="section mini-section"><div className="section-heading"><div><span className="eyebrow">READING PLANS</span><h2>Plans for every pace.</h2></div><Link to="/reading-plans" className="text-link">See all <ArrowRight size={15}/></Link></div><div className="plan-grid">{plans.slice(0,3).map(p=><PlanCard key={p.id} plan={p} store={store}/>)}</div></div>
  </Page>
}

function PlanCard({plan,store}){const p=store.plans[plan.id]||{day:0,active:false}; return <div className="plan-card"><div className="plan-icon"><BookOpen size={18}/></div><span className="eyebrow">{plan.duration}</span><h3>{plan.title}</h3><p>{plan.description}</p><div className="progress-line"><span style={{width:`${Math.min(100,(p.day/(Number.parseInt(plan.duration)||30))*100)}%`}}/></div><small>{p.day||0} days completed</small></div>}

function ReadingPlans({store,updateStore}){return <Page title="Reading Plans" kicker="MAKE IT A HABIT" subtitle="Choose a rhythm that fits your season."><div className="plan-grid">{plans.map(p=><div key={p.id} className="plan-card"><div className="plan-icon"><BookOpen size={18}/></div><span className="eyebrow">{p.duration}</span><h3>{p.title}</h3><p>{p.description}</p><button className="btn small" onClick={()=>updateStore(s=>({...s,plans:{...s.plans,[p.id]:{...(s.plans[p.id]||{}),active:true,day:s.plans[p.id]?.day||0}}}))}>{store.plans[p.id]?.active?"Plan active":"Start plan"} <ArrowRight size={14}/></button></div>)}</div></Page>}

function TopicPage(){const {topic}=useParams(); const title=topic?.charAt(0).toUpperCase()+topic?.slice(1); const item=topics.find(t=>t[0].toLowerCase()===topic); return <Page title={title||"Topic"} kicker="TOPIC STUDY" subtitle="A starting point for focused Scripture reading.">{item?<div className="topic-feature"><div><span className="eyebrow">{item[0]}</span><h2>Explore {item[0].toLowerCase()} in Scripture.</h2><p>Begin with a focused passage and continue reading the surrounding chapter for context.</p><Link className="btn primary" to={`/bible/${slug(item[1].split(" ")[0])}/${item[1].split(" ")[1].split(":")[0]}`}>Open {item[1]}</Link></div><div className="quote-panel large"><Heart size={22}/><p>“A focused reading habit can turn a familiar verse into a deeper study.”</p></div></div>:<Empty text="Topic not found."/>}</Page>}

function Bookmarks({store,updateStore}){return <Page title="Bookmarks" kicker="SAVED VERSES" subtitle="Keep the verses you want close.">{store.bookmarks.length?<div className="saved-list">{store.bookmarks.map(ref=><Saved key={ref} refText={ref} onRemove={()=>updateStore(s=>({...s,bookmarks:s.bookmarks.filter(x=>x!==ref)}))}/>)}</div>:<Empty text="No bookmarks yet. Tap Save on a verse while reading."/>}</Page>}
function Highlights({store}){const list=Object.entries(store.highlights); return <Page title="Highlights" kicker="YOUR COLORS" subtitle="Verses you marked while reading.">{list.length?<div className="saved-list">{list.map(([ref,color])=><div className={`saved-card swatch-${color}`} key={ref}><strong>{ref}</strong><span>{color} highlight</span></div>)}</div>:<Empty text="No highlights yet."/>}</Page>}
function Notes({store}){const list=Object.entries(store.notes).filter(([,v])=>v); return <Page title="Notes" kicker="PERSONAL STUDY" subtitle="Your private thoughts, saved locally on this device.">{list.length?<div className="saved-list">{list.map(([ref,n])=><div className="saved-card" key={ref}><strong>{ref}</strong><p>{n}</p></div>)}</div>:<Empty text="No notes yet."/>}</Page>}
function Collections({store,updateStore}){const [name,setName]=useState(""); const create=()=>{if(name.trim())updateStore(s=>({...s,collections:{...s.collections,[name.trim()]:[]}}));setName("")}; return <Page title="Collections" kicker="VERSE LIBRARY" subtitle="Organize saved verses around what you are studying."><div className="create-row"><input value={name} onChange={e=>setName(e.target.value)} placeholder="New collection name"/><button className="btn primary" onClick={create}>Create</button></div><div className="collection-grid">{Object.entries(store.collections).map(([n,arr])=><div className="collection-card" key={n}><div><Heart size={18}/><h3>{n}</h3><span>{arr.length} verses</span></div><ArrowRight size={17}/></div>)}</div></Page>}
function History({store}){return <Page title="Reading History" kicker="RECENTLY READ" subtitle="Jump back into chapters you opened recently.">{store.history.length?<div className="history-list">{store.history.map(ref=>{const m=ref.match(/^(.+)\s(\d+)$/); return <Link className="history-item" key={ref} to={`/bible/${slug(m?.[1]||"John")}/${m?.[2]||3}`}><BookOpen size={17}/><strong>{ref}</strong><ArrowRight size={16}/></Link>})}</div>:<Empty text="Your reading history will appear here."/>}</Page>}

function Settings({store,setStore}){const s=store.settings; const patch=(v)=>setStore(x=>({...x,settings:{...x.settings,...v}})); return <Page title="Reading Settings" kicker="PERSONALIZE" subtitle="Make the reading experience yours."><div className="settings-grid"><Setting title="Font size"><div className="range-row"><input type="range" min="15" max="30" value={s.fontSize} onChange={e=>patch({fontSize:Number(e.target.value)})}/><strong>{s.fontSize}px</strong></div></Setting><Setting title="Line height"><div className="choice-row">{[[1.55,"Compact"],[1.85,"Comfortable"],[2.1,"Spacious"]].map(([v,l])=><button key={l} className={s.lineHeight===v?"choice active":"choice"} onClick={()=>patch({lineHeight:v})}>{l}</button>)}</div></Setting><Setting title="Reading width"><div className="choice-row">{[[600,"Narrow"],[720,"Medium"],[900,"Wide"]].map(([v,l])=><button key={l} className={s.width===v?"choice active":"choice"} onClick={()=>patch({width:v})}>{l}</button>)}</div></Setting><Setting title="Font style"><div className="choice-row"><button className={s.font==="serif"?"choice active":"choice"} onClick={()=>patch({font:"serif"})}>Serif</button><button className={s.font==="sans"?"choice active":"choice"} onClick={()=>patch({font:"sans"})}>Sans</button></div></Setting><Setting title="Theme"><div className="choice-row"><button className={s.theme==="light"?"choice active":"choice"} onClick={()=>patch({theme:"light"})}><Sun size={15}/> Light</button><button className={s.theme==="sepia"?"choice active":"choice"} onClick={()=>patch({theme:"sepia"})}>Sepia</button><button className={s.theme==="dark"?"choice active":"choice"} onClick={()=>patch({theme:"dark"})}><Moon size={15}/> Dark</button></div></Setting><Setting title="Daily reading goal"><div className="choice-row">{[1,2,3,5].map(n=><button key={n} className={store.goal===n?"choice active":"choice"} onClick={()=>setStore(x=>({...x,goal:n}))}>{n} chapter{n>1?"s":""}</button>)}</div></Setting><Setting title="Keyboard shortcuts"><div className="shortcut-list"><span><kbd>F</kbd> Focus mode</span><span><kbd>/</kbd> Search</span><span><kbd>D</kbd> Theme</span><span><kbd>+</kbd> / <kbd>-</kbd> Font size</span><span><kbd>Esc</kbd> Exit focus</span></div></Setting></div></Page>}
function Setting({title,children}){return <div className="setting-card"><h3>{title}</h3>{children}</div>}
function About(){return <Page title="About BibleVerse" kicker="A SIMPLE PURPOSE" subtitle="Read. Reflect. Grow."><div className="about panel"><h2>A calmer place for Scripture.</h2><p>BibleVerse is designed to make Bible reading feel focused, peaceful, and personal. Your bookmarks, notes, highlights, goals, and progress are stored locally in your browser.</p><p>The reader supports the World English Bible, King James Version, and Telugu Bible data. Telugu chapter data is loaded as JSON and cached locally for faster repeat reading.</p><div className="source-box"><strong>Scripture data</strong><span>World English Bible is public domain.</span><a href="https://ebible.org/engwebp/" target="_blank" rel="noreferrer">eBible.org — World English Bible</a><a href="https://bible-api.com/" target="_blank" rel="noreferrer">Bible API</a></div></div></Page>}
function Saved({refText,onRemove}){const [book,chv]=refText.split(/ (?=\d)/); const [ch]=[chv?.split(":")[0]]; return <div className="saved-card"><div><strong>{refText}</strong><span>Saved verse reference</span></div><div className="saved-actions"><Link className="icon-btn" to={`/bible/${slug(book||"John")}/${ch||3}`}><ArrowRight size={16}/></Link><button className="icon-btn" onClick={onRemove}><X size={16}/></button></div></div>}
function Empty({text}){return <div className="empty panel"><BookOpen size={28}/><h3>Nothing here yet</h3><p>{text}</p><Link className="btn secondary" to="/bible">Start reading</Link></div>}
function Modal({title,onClose,children}){return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</div></div>}
function Page({title,kicker,subtitle,children}){return <div className="container page"><div className="page-head"><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{subtitle}</p></div>{children}</div>}
function MobileNav(){return <nav className="mobile-nav"><NavLink to="/"><HomeIcon size={18}/><span>Home</span></NavLink><NavLink to="/bible"><BookOpen size={18}/><span>Bible</span></NavLink><NavLink to="/search"><Search size={18}/><span>Search</span></NavLink><NavLink to="/study"><Target size={18}/><span>Study</span></NavLink><NavLink to="/settings"><SettingsIcon size={18}/><span>More</span></NavLink></nav>}
function Footer(){return <footer><div className="container footer-grid"><div><Link className="brand" to="/"><span className="brand-mark"><BookOpen size={18}/></span><span>Bible<span>Verse</span></span></Link><p>Read. Reflect. Grow.</p></div><div><strong>Explore</strong><Link to="/bible">Bible</Link><Link to="/books">Books</Link><Link to="/search">Search</Link></div><div><strong>Study</strong><Link to="/study">Dashboard</Link><Link to="/reading-plans">Reading plans</Link><Link to="/bookmarks">Bookmarks</Link></div><div><strong>About</strong><Link to="/about">BibleVerse</Link><Link to="/settings">Settings</Link></div></div><div className="container footer-bottom"><span>© 2026 BibleVerse</span><span>Scripture data: public-domain sources</span></div></footer>}

export default App;