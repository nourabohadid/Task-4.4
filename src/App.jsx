import React,{useEffect,useMemo,useState} from 'react';

const STORE='acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed=[
 {id:'f1',title:'Black backpack',category:'accessories',status:'lost',location:'Library - second floor',description:'Black backpack with a small red keychain. Left near the study desks.',owner:'you',created:'Oct 23',emoji:'🎒'},
 {id:'f2',title:'Dark backpack',category:'accessories',status:'found',location:'Library - main stairwell',description:'Found a dark backpack with a small red keychain near the library stairs.',owner:'other',created:'Oct 24',emoji:'🎒',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f3',title:'Student ID card',category:'documents',status:'found',location:'Near Gate 3',description:'A student card was turned in. No personal details are published.',owner:'other',created:'Oct 24',emoji:'🪪',collectionPoint:'Student Services Office',handoverStatus:'received'},
 {id:'f4',title:'Wireless earbuds',category:'electronics',status:'lost',location:'Main cafeteria',description:'White earbuds in a distinctive blue case. Lost on Monday.',owner:'other',created:'Oct 24',emoji:'🎧'},
 {id:'f5',title:'Earbuds in blue case',category:'electronics',status:'found',location:'Cafeteria entrance',description:'White earbuds in a blue charging case found near the coffee counter.',owner:'other',created:'Oct 25',emoji:'🎧',collectionPoint:'',handoverStatus:'reported'},
 {id:'f6',title:'Blue sports bottle',category:'other',status:'lost',location:'Sports Hall - lockers',description:'Tall blue metal water bottle, possibly left after practice.',owner:'other',created:'Oct 25',emoji:'🥤'},
 {id:'f7',title:'Metal water bottle',category:'other',status:'found',location:'Sports Hall - benches',description:'Blue reusable metal bottle found after a basketball session.',owner:'other',created:'Oct 25',emoji:'🥤',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f8',title:'Engineering lab coat',category:'clothing',status:'claimed',location:'Building C',description:'Owner verified the item and collected it from the reception desk.',owner:'you',created:'Oct 22',emoji:'🥼',collectionPoint:'Library Reception',handoverStatus:'released'},
 {id:'f9',title:'Small notebook',category:'other',status:'lost',location:'C7 lecture room',description:'Brown cover with handwritten engineering notes.',owner:'other',created:'Oct 25',emoji:'📒'},
 {id:'f10',title:'Scientific calculator',category:'electronics',status:'lost',location:'B2 lecture hall',description:'Black scientific calculator with a protective cover.',owner:'other',created:'Oct 26',emoji:'🧮'},
 {id:'f11',title:'Calculator',category:'electronics',status:'found',location:'B2 study area',description:'Scientific calculator with a black cover, found on a desk.',owner:'you',created:'Oct 26',emoji:'🧮',collectionPoint:'Library Reception',handoverStatus:'received'},
 {id:'f12',title:'Canvas tote bag',category:'accessories',status:'lost',location:'Main campus bus stop',description:'Beige tote with green writing on one side.',owner:'other',created:'Oct 26',emoji:'👜'},
 {id:'f13',title:'USB flash drive',category:'electronics',status:'found',location:'Building A computer lab',description:'A small black flash drive was found beside a workstation.',owner:'other',created:'Oct 27',emoji:'💾',collectionPoint:'',handoverStatus:'reported'},
];
const categories=['all','electronics','clothing','documents','accessories','other'];
const statuses=['lost','found','claimed'];
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function validate(f,arr,id){
 if(!f.title.trim()||f.title.trim().length<2)return 'Title must be at least 2 characters.';
 if(!categories.slice(1).includes(f.category))return 'Choose a category.';
 if(!statuses.includes(f.status))return 'Choose lost, found or claimed.';
 if(arr.some(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase()))return 'An item with the same title has already been reported at this location.';
 return '';
}
export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('board');
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!selectedItem) return;
    const onEscape = event => {
      if (event.key === 'Escape') setSelectedItem(null);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [selectedItem]);

  const filtered = useMemo(() => items.filter(item =>
    (view === 'all' || item.status === view) &&
    (cat === 'all' || item.category === cat) &&
    (filterStatus === 'all' || item.status === filterStatus) &&
    `${item.title} ${item.location} ${item.description}`.toLowerCase().includes(q.toLowerCase())
  ), [items, view, q, cat, filterStatus]);

  const columns = [
    { key: 'lost', title: 'LOST', sub: 'Searching for these things', icon: '↗' },
    { key: 'found', title: 'FOUND', sub: 'Looking for the owners', icon: '⌁' },
    { key: 'claimed', title: 'CLAIMED', sub: 'Back where they belong', icon: '✓' },
  ];

  function navigate(nextView = 'all') {
    setPage('board');
    setView(nextView);
    setFilterStatus('all');
    setQ('');
    setCat('all');
    setSelectedItem(null);
    setMessage('');
  }

  function create() {
    setCurrent(null);
    setForm({ ...clean });
    setError('');
    setSelectedItem(null);
    setPage('form');
  }

  function edit(row) {
    // Demo mode: editing is available on every report.
    setCurrent(row.id);
    setForm({
      title: row.title,
      category: row.category,
      status: row.status,
      location: row.location,
      description: row.description,
    });
    setError('');
    setSelectedItem(null);
    setPage('form');
  }

  function submit(event) {
    event.preventDefault();
    const validationError = validate(form, items, current);
    if (validationError) {
      setError(validationError);
      return;
    }

    const report = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      owner: 'you',
      created: 'Today',
      emoji: current ? items.find(item => item.id === current)?.emoji : '📌',
      ...(current ? {} : { collectionPoint: '', handoverStatus: 'reported' }),
    };

    if (current) {
      setItems(previous => previous.map(item =>
        item.id === current ? { ...item, ...report } : item
      ));
      setMessage('Report updated.');
    } else {
      setItems(previous => [{ id: `f-${Date.now()}`, ...report }, ...previous]);
      setMessage('Your report has been posted.');
    }
    setPage('board');
    setView('all');
    setFilterStatus('all');
    setCurrent(null);
  }

  function handleItemAction() {
    if (!selectedItem || selectedItem.status === 'claimed') return;

    if (selectedItem.status === 'found') {
      // UI demo only: show the claim in the Claimed column.
      // A production application must verify ownership before marking an item claimed.
      setItems(previous => previous.map(item =>
        item.id === selectedItem.id
          ? { ...item, status: 'claimed', handoverStatus: 'released' }
          : item
      ));
      setPage('board');
      setView('claimed');
      setFilterStatus('all');
      setQ('');
      setCat('all');
      setMessage(`Demo claim recorded for "${selectedItem.title}". Ownership has not been verified.`);
    } else {
      setMessage(`Found-item response noted for "${selectedItem.title}" (demo only; no message was sent).`);
    }
    setSelectedItem(null);
  }

  function reset() {
    setItems(seed);
    navigate('all');
    setMessage('Example reports restored.');
  }

  return (
    <div className="notice-app">
      <style>{`
        /* Card controls: keep item details and Edit as separate buttons. */
        .notice-app .sticky { display: flex; flex-direction: column; }
        .notice-app .sticky .sticky-top { flex-shrink: 0; }
        .notice-app .sticky .item-open {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          text-align: left;
          flex: 1 1 auto;
          width: 100%;
          min-height: 0;
          margin: 0;
          padding: 0;
          background: transparent;
          color: inherit;
          border: 0;
          border-radius: 0;
          box-shadow: none;
          font: inherit;
          cursor: pointer;
        }
        .notice-app .sticky .item-open:focus-visible,
        .notice-app .sticky .card-edit-button:focus-visible {
          outline: 3px solid #b97536;
          outline-offset: 2px;
        }
        .notice-app .sticky .item-open .sticky-bottom {
          width: 100%;
          margin-top: auto;
        }
        .notice-app .sticky .card-edit-button {
          display: block;
          box-sizing: border-box;
          width: 100%;
          margin: 12px 0 0;
          padding: 10px 14px;
          border: 1px solid #d3b35c;
          border-radius: 7px;
          background: #ffdf68;
          color: #252b30;
          box-shadow: none;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .notice-app .sticky .card-edit-button:hover { background: #f3cc52; }
      `}</style>
      <header className="header">
        <div className="headline">
          <span className="sun">✺</span>
          <button onClick={() => navigate('all')} className="wordmark">
            FOUND<span>on campus</span>
          </button>
          <p>Community noticeboard</p>
        </div>
        <div className="header-links">
          <button onClick={() => navigate('all')}>Noticeboard</button>
          <button onClick={() => navigate('lost')}>Missing items</button>
          <button onClick={() => navigate('found')}>Recently found</button>
          <button onClick={() => navigate('claimed')}>Claimed</button>
        </div>
        <button className="report-button" onClick={create}>+ Post a report</button>
      </header>

      <div className="ruleline">
        <span>SEARCH • DISCOVER • REUNITE</span>
        <span>Helping lost things find their way back.</span>
      </div>

      {page === 'board' ? (
        <main className="workspace">
          <aside className="filters">
            <p className="kicker">YOUR NOTICEBOARD</p>
            <h1>Lost something?<br /><em>You're in the right place.</em></h1>
            <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
            <div className="filterbox">
              <h3>Browse reports</h3>
              <label>
                Search items
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="What are you looking for?" />
              </label>
              <label>
                Item category
                <select value={cat} onChange={e => setCat(e.target.value)}>
                  <option value="all">All categories</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{cap(category)}</option>
                  ))}
                </select>
              </label>
              {view === 'all' && (
                <label>
                  Report status
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{cap(status)}</option>
                    ))}
                  </select>
                </label>
              )}
              <div className="filterbuttons">
                <button onClick={() => setMessage(`${filtered.length} reports shown.`)}>Apply</button>
                <button onClick={() => { setQ(''); setCat('all'); setFilterStatus('all'); }}>Clear</button>
              </div>
            </div>
            <button className="reset" onClick={reset}>Reset demo data</button>
          </aside>

          <section className="board">
            <div className="board-top">
              <div>
                <p className="kicker">CAMPUS COMMUNITY</p>
                <h2>{view === 'lost' ? 'Missing items' : view === 'found' ? 'Recently found' : view === 'claimed' ? 'Claimed items' : 'Latest notices'} <span>({filtered.length})</span></h2>
              </div>
              <span className="time-note">Updated today</span>
            </div>
            {message && (
              <div className="message" role="status">
                {message}
                <button onClick={() => setMessage('')} aria-label="Dismiss message">✕</button>
              </div>
            )}

            <div className="board-grid">
              {columns.filter(column => view === 'all' || column.key === view).map(column => {
                const columnItems = filtered.filter(item => item.status === column.key);
                return (
                  <div className="board-column" key={column.key}>
                    <div className="column-head">
                      <span className={'col-icon ' + column.key}>{column.icon}</span>
                      <div><strong>{column.title}</strong><small>{column.sub}</small></div>
                      <span className="col-count">{columnItems.length}</span>
                    </div>
                    <div className="sticky-list">
                      {columnItems.map(item => (
                        <article className="sticky" key={item.id}>
                          <div className="sticky-top">
                            <span>{item.category}</span>
                          </div>
                          <button
                            type="button"
                            className="item-open"
                            onClick={() => setSelectedItem(item)}
                            aria-label={`Open actions for ${item.title}`}
                          >
                            <div className="sticky-emoji">{item.emoji}</div>
                            <h3>{item.title}</h3>
                            <p>{item.description || 'No additional description.'}</p>
                            {item.status !== 'lost' && (
                              <div className="handover-note">
                                {item.handoverStatus === 'received' && item.collectionPoint
                                  ? `Received at ${item.collectionPoint}`
                                  : item.handoverStatus === 'released'
                                    ? 'Collected by owner'
                                    : 'Reported found - not confirmed at a collection point'}
                              </div>
                            )}
                            <div className="sticky-bottom">
                              <span>⌖ {item.location || 'Location not provided'}</span>
                              <small>{item.created}</small>
                            </div>
                          </button>
                          <button
                            type="button"
                            className="card-edit-button"
                            onClick={() => edit(item)}
                            aria-label={`Edit report: ${item.title}`}
                          >
                            ✎ Edit report
                          </button>
                        </article>
                      ))}
                      {columnItems.length === 0 && <div className="empty-column">Nothing here yet</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      ) : (
        <main className="report-page">
          <div className="crumbs">
            <button onClick={() => navigate('all')}>← Noticeboard</button>
            <span>/</span><span>Report an item</span>
          </div>
          <div className="report-layout">
            <div className="report-intro">
              <span className="seal">✺</span>
              <p className="kicker">HELP THE COMMUNITY</p>
              <h1>{current ? 'Update your report' : 'Tell us what happened.'}</h1>
              <p>Small details can help someone recognize their belongings.</p>
              <div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div>
            </div>
            <section className="form-paper">
              <header>
                <p>NEW NOTICE / FORM 01</p>
                <h2>{current ? 'Edit report' : 'Report an item'}</h2>
              </header>
              <form onSubmit={submit}>
                <label>Item title <b>*</b>
                  <input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} placeholder="e.g., Black backpack" />
                </label>
                <label>Status <b>*</b>
                  <select value={form.status} onChange={e => setForm(s => ({ ...s, status: e.target.value }))}>
                    <option value="">Choose one</option>
                    {statuses.map(status => <option key={status} value={status}>{cap(status)}</option>)}
                  </select>
                </label>
                <label>Category <b>*</b>
                  <select value={form.category} onChange={e => setForm(s => ({ ...s, category: e.target.value }))}>
                    <option value="">Select item category</option>
                    {categories.slice(1).map(category => <option key={category} value={category}>{cap(category)}</option>)}
                  </select>
                </label>
                <label>Last known location
                  <input value={form.location} onChange={e => setForm(s => ({ ...s, location: e.target.value }))} placeholder="Location (optional)" />
                </label>
                <label>More details
                  <textarea rows="6" value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} placeholder="Describe your item" />
                </label>
                {error && <div className="form-error" role="alert">{error}</div>}
                <div className="form-actions">
                  <button type="button" onClick={() => navigate('all')}>Go back</button>
                  <button className="report-button" type="submit">{current ? 'Save report' : 'Publish notice'}</button>
                </div>
              </form>
            </section>
          </div>
        </main>
      )}

      {selectedItem && (
        <div className="action-overlay" onMouseDown={event => {
          if (event.target === event.currentTarget) setSelectedItem(null);
        }}>
          <div className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="action-title">
            <button className="action-close" onClick={() => setSelectedItem(null)} aria-label="Close">✕</button>
            <p className="kicker">ITEM ACTIONS</p>
            <h2 id="action-title">{selectedItem.status === 'found'
              ? 'Is this yours?'
              : selectedItem.status === 'lost'
                ? 'Have you found this item?'
                : 'Already reunited'}</h2>
            <p className="action-subtitle">{selectedItem.title}</p>
            {selectedItem.status === 'claimed' ? (
              <p>This report is already marked as claimed. No further action is available.</p>
            ) : (
              <>
                <p>{selectedItem.status === 'found'
                  ? 'For this demo, claiming moves the item to the Claimed board. Actual claims require ownership verification.'
                  : 'Indicate that you may have found this missing item.'}</p>
                <p className="action-disclaimer">This is a UI demo. No request or message is sent to another person.</p>
                <button className="action-primary" onClick={handleItemAction}>
                  {selectedItem.status === 'found' ? 'Claim this item (demo)' : 'I found this item'}
                </button>
              </>
            )}
            <button className="action-secondary" onClick={() => setSelectedItem(null)}>Cancel</button>
          </div>
        </div>
      )}

      <footer className="pagefooter">
        <span>FOUND / Campus noticeboard</span>
        <span>Community project • Demo only</span>
      </footer>
    </div>
  );
}
