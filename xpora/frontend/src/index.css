@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --orange: #F06A25;
  --orange-light: #FEF0E8;
  --orange-dark: #C4511A;
  --orange-grad: linear-gradient(135deg, #F06A25, #E8472B);
  --cream: #FDFAF7;
  --bg: #F8F4F0;
  --card: #FFFFFF;
  --text: #1A1208;
  --text2: #5A4E44;
  --text3: #9A8E84;
  --border: rgba(0,0,0,0.08);
  --radius: 14px;
  --radius-sm: 8px;
  --shadow: 0 2px 16px rgba(0,0,0,0.07);
  --shadow-lg: 0 8px 40px rgba(0,0,0,0.13);
  --serif: 'Playfair Display', Georgia, serif;
  --sans: 'DM Sans', sans-serif;
  --nav-h: 62px;
  --sidebar-w: 255px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--sans); background: var(--cream); color: var(--text); min-height: 100vh; }

a { color: inherit; text-decoration: none; }
button { font-family: var(--sans); cursor: pointer; border: none; }
input, textarea, select { font-family: var(--sans); }

/* SCROLLBAR */
::-webkit-scrollbar { width: 6px; } 
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }

/* BUTTONS */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; border-radius: 40px; font-size: 14px; font-weight: 500; transition: all 0.2s; border: none; cursor: pointer; }
.btn-primary { background: var(--orange-grad); color: #fff; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(240,106,37,0.35); }
.btn-ghost { background: transparent; color: var(--text); }
.btn-ghost:hover { background: var(--bg); }
.btn-outline { background: transparent; border: 1.5px solid var(--border); color: var(--text); }
.btn-outline:hover { border-color: var(--orange); color: var(--orange); }
.btn-danger { background: #FEE2E2; color: #DC2626; }
.btn-danger:hover { background: #FECACA; }
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-lg { padding: 13px 28px; font-size: 15px; }
.btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

/* NAV */
nav.main-nav {
  height: var(--nav-h); background: #fff; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; padding: 0 24px; gap: 16px;
  position: sticky; top: 0; z-index: 200;
}
.nav-logo { font-family: var(--serif); font-size: 22px; font-weight: 600; color: var(--text); cursor: pointer; letter-spacing: -0.5px; }
.nav-logo span { color: var(--orange); }
.nav-search { flex: 1; max-width: 440px; display: flex; align-items: center; gap: 8px; background: var(--bg); border: 1.5px solid transparent; border-radius: 40px; padding: 8px 16px; transition: border-color 0.2s; }
.nav-search:focus-within { border-color: var(--orange); }
.nav-search input { border: none; background: transparent; font-size: 14px; color: var(--text); outline: none; width: 100%; }
.nav-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--orange-grad); color: #fff; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; flex-shrink: 0; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.notif-btn { position: relative; background: none; border: none; cursor: pointer; color: var(--text2); padding: 6px; border-radius: 8px; }
.notif-btn:hover { background: var(--bg); }
.notif-dot { position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; background: var(--orange); border-radius: 50%; border: 2px solid #fff; }

/* SIDEBAR */
.sidebar { width: var(--sidebar-w); padding: 20px 14px; border-right: 1px solid var(--border); position: sticky; top: var(--nav-h); height: calc(100vh - var(--nav-h)); overflow-y: auto; flex-shrink: 0; }
.sidebar-profile { display: flex; align-items: center; gap: 10px; padding: 8px 10px; margin-bottom: 20px; }
.sidebar-name { font-weight: 600; font-size: 15px; }
.sidebar-handle { font-size: 12px; color: var(--text3); }
.sidebar-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius-sm); font-size: 14px; color: var(--text2); cursor: pointer; transition: all 0.15s; margin-bottom: 2px; }
.sidebar-link:hover, .sidebar-link.active { background: var(--orange-light); color: var(--orange-dark); font-weight: 500; }
.sidebar-section { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: var(--text3); text-transform: uppercase; padding: 0 12px; margin: 16px 0 6px; }
.sidebar-cat { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius-sm); font-size: 13px; color: var(--text2); cursor: pointer; transition: all 0.15s; }
.sidebar-cat:hover, .sidebar-cat.active { background: var(--bg); font-weight: 500; }

/* FEED */
.feed-layout { display: flex; min-height: calc(100vh - var(--nav-h)); }
.feed-main { flex: 1; padding: 28px 32px; max-width: 720px; min-width: 0; }
.feed-right { width: 270px; padding: 28px 16px; flex-shrink: 0; }
.feed-title { font-family: var(--serif); font-size: 28px; font-weight: 400; margin-bottom: 20px; }

/* POST CARD */
.post-card { background: var(--card); border-radius: var(--radius); border: 1px solid var(--border); padding: 22px; margin-bottom: 14px; transition: all 0.2s; }
.post-card:hover { border-color: #F5C9AD; box-shadow: var(--shadow); }
.post-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.post-author { font-weight: 500; font-size: 14px; }
.post-handle { font-size: 12px; color: var(--text3); }
.post-tag { margin-left: auto; }
.tag-badge { display: inline-flex; align-items: center; gap: 4px; background: var(--orange-light); color: var(--orange-dark); font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
.post-title { font-family: var(--serif); font-size: 20px; font-weight: 600; line-height: 1.3; margin-bottom: 8px; cursor: pointer; }
.post-title:hover { color: var(--orange); }
.post-excerpt { font-size: 13px; color: var(--text2); line-height: 1.65; cursor: pointer; }
.post-footer { display: flex; align-items: center; gap: 14px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); }
.post-meta { font-size: 12px; color: var(--text3); }
.post-actions { display: flex; gap: 4px; margin-left: auto; }
.action-btn { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--text3); background: none; border: none; cursor: pointer; padding: 5px 9px; border-radius: 7px; transition: all 0.15s; }
.action-btn:hover { background: var(--bg); color: var(--orange); }
.action-btn.active { color: var(--orange); }
.action-btn.liked { color: #E04040; }

/* VOTE BUTTONS */
.vote-group { display: flex; align-items: center; gap: 2px; }
.vote-btn { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 6px; background: none; border: 1px solid var(--border); color: var(--text3); cursor: pointer; font-size: 14px; transition: all 0.15s; }
.vote-btn:hover, .vote-btn.active { background: var(--orange-light); border-color: var(--orange); color: var(--orange); }
.vote-btn.downvoted { background: #FEE2E2; border-color: #DC2626; color: #DC2626; }
.vote-count { font-size: 13px; font-weight: 600; min-width: 24px; text-align: center; color: var(--text2); }

/* HERO */
.hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 24px 60px; background: radial-gradient(ellipse 80% 60% at 50% -5%, rgba(240,106,37,0.09) 0%, transparent 70%); }
.hero-eyebrow { font-size: 12px; font-weight: 500; letter-spacing: 2.5px; color: var(--orange); text-transform: uppercase; margin-bottom: 18px; }
.hero h1 { font-family: var(--serif); font-size: clamp(38px, 5.5vw, 68px); line-height: 1.1; max-width: 740px; font-weight: 400; }
.hero h1 em { color: var(--orange); font-style: italic; }
.hero-sub { margin: 22px 0 38px; font-size: 17px; color: var(--text2); max-width: 500px; line-height: 1.7; }
.hero-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.hero-tags { display: flex; gap: 8px; margin-top: 46px; flex-wrap: wrap; justify-content: center; }
.tag-pill { display: flex; align-items: center; gap: 5px; background: #fff; border: 1.5px solid var(--border); border-radius: 40px; padding: 7px 15px; font-size: 13px; color: var(--text2); cursor: pointer; transition: all 0.2s; }
.tag-pill:hover { border-color: var(--orange); color: var(--orange); transform: translateY(-1px); }

/* TYPING ANIMATION */
.typing-text { display: inline-block; }
.typing-cursor { display: inline-block; width: 2px; height: 1.1em; background: var(--orange); animation: blink 1s step-end infinite; vertical-align: text-bottom; margin-left: 2px; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* AUTH */
.auth-page { display: flex; min-height: 100vh; }
.auth-left { width: 46%; background: linear-gradient(145deg, #F5B99A 0%, #F0855A 55%, #E8472B 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 48px; position: relative; overflow: hidden; }
.auth-left::before { content: ''; position: absolute; top: -90px; right: -90px; width: 340px; height: 340px; border-radius: 50%; background: rgba(255,255,255,0.07); }
.auth-left::after { content: ''; position: absolute; bottom: -60px; left: -60px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,0.05); }
.auth-left-logo { font-family: var(--serif); font-size: 20px; font-weight: 600; color: #fff; position: absolute; top: 44px; left: 48px; }
.auth-left h2 { font-family: var(--serif); font-size: 34px; font-weight: 400; color: #fff; line-height: 1.2; margin-bottom: 12px; position: relative; z-index: 1; }
.auth-left p { font-size: 15px; color: rgba(255,255,255,0.72); position: relative; z-index: 1; }
.auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px; background: #fff; }
.auth-form { width: 100%; max-width: 380px; }
.auth-form h2 { font-family: var(--serif); font-size: 30px; font-weight: 400; margin-bottom: 4px; }
.auth-form .sub { font-size: 14px; color: var(--text3); margin-bottom: 28px; }
.google-btn { width: 100%; padding: 12px; border: 1.5px solid var(--border); border-radius: 40px; background: #fff; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; color: var(--text); }
.google-btn:hover { border-color: #aaa; box-shadow: var(--shadow); }
.divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; color: var(--text3); font-size: 13px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.form-input { width: 100%; padding: 12px 15px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--text); outline: none; transition: border-color 0.2s; margin-bottom: 10px; }
.form-input:focus { border-color: var(--orange); }
.form-input.error { border-color: #DC2626; }
.form-error { font-size: 12px; color: #DC2626; margin-bottom: 8px; margin-top: -6px; }
.auth-submit { width: 100%; padding: 13px; background: var(--orange-grad); color: #fff; border: none; border-radius: 40px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; margin-top: 4px; }
.auth-submit:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(240,106,37,0.35); }
.auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.auth-switch { text-align: center; margin-top: 18px; font-size: 14px; color: var(--text3); }
.auth-switch a { color: var(--orange); cursor: pointer; font-weight: 500; }

/* WRITE */
.write-page { min-height: 100vh; display: flex; flex-direction: column; }
.write-body { flex: 1; max-width: 740px; margin: 0 auto; width: 100%; padding: 44px 24px; }
.write-title-input { width: 100%; border: none; outline: none; font-family: var(--serif); font-size: 34px; font-weight: 600; color: var(--text); resize: none; background: transparent; line-height: 1.2; margin-bottom: 20px; }
.write-title-input::placeholder { color: #ccc; }
.write-meta-row { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.write-select { padding: 7px 14px; border: 1.5px solid var(--border); border-radius: 40px; font-size: 13px; color: var(--text); background: #fff; cursor: pointer; outline: none; }
.write-select:focus { border-color: var(--orange); }
.write-toolbar-btns { display: flex; gap: 4px; }
.tool-btn { width: 32px; height: 32px; border-radius: 7px; background: var(--bg); border: none; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text2); display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.tool-btn:hover { background: var(--orange-light); color: var(--orange); }
.write-editor { width: 100%; border: none; outline: none; font-size: 17px; color: var(--text); resize: none; background: transparent; line-height: 1.85; min-height: 420px; }
.write-editor::placeholder { color: #ccc; }
.write-bottom-bar { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border-top: 1px solid var(--border); background: #fff; position: sticky; bottom: 0; }
.word-count { font-size: 13px; color: var(--text3); }
.cover-preview { width: 100%; height: 220px; border-radius: var(--radius); object-fit: cover; margin-bottom: 20px; border: 1px solid var(--border); }

/* STORY DETAIL */
.story-page { max-width: 680px; margin: 0 auto; padding: 44px 24px 80px; }
.story-tag-row { margin-bottom: 14px; }
.story-h1 { font-family: var(--serif); font-size: clamp(28px, 4vw, 42px); font-weight: 600; line-height: 1.15; margin-bottom: 18px; }
.story-meta-row { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; padding-bottom: 26px; border-bottom: 1px solid var(--border); }
.story-body { font-size: 18px; line-height: 1.88; color: var(--text2); }
.story-body p { margin-bottom: 20px; }
.story-body h2 { font-family: var(--serif); font-size: 24px; font-weight: 600; margin: 32px 0 12px; color: var(--text); }
.story-body blockquote { border-left: 3px solid var(--orange); padding-left: 20px; color: var(--text2); font-style: italic; margin: 24px 0; }

/* COMMENTS */
.comments-section { margin-top: 44px; padding-top: 30px; border-top: 1px solid var(--border); }
.comments-title { font-family: var(--serif); font-size: 22px; font-weight: 400; margin-bottom: 18px; }
.comment-box { width: 100%; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 13px 15px; font-size: 14px; color: var(--text); outline: none; resize: none; min-height: 80px; margin-bottom: 10px; transition: border-color 0.2s; }
.comment-box:focus { border-color: var(--orange); }
.comment { display: flex; gap: 12px; margin-bottom: 18px; }
.comment-body { flex: 1; }
.comment-author-name { font-weight: 500; font-size: 14px; }
.comment-time { font-size: 12px; color: var(--text3); margin-left: 8px; }
.comment-text { font-size: 14px; color: var(--text2); line-height: 1.6; margin-top: 4px; }
.comment-reply-btn { font-size: 12px; color: var(--text3); background: none; border: none; cursor: pointer; margin-top: 6px; padding: 2px 0; }
.comment-reply-btn:hover { color: var(--orange); }
.nested-comments { margin-left: 44px; margin-top: 12px; padding-left: 16px; border-left: 2px solid var(--border); }
.removed-notice { font-size: 13px; color: var(--text3); font-style: italic; padding: 10px 0; }

/* PROFILE */
.profile-header { display: flex; align-items: flex-end; gap: 20px; padding: 32px; background: var(--card); border-radius: var(--radius); border: 1px solid var(--border); margin-bottom: 24px; }
.profile-avatar-lg { width: 88px; height: 88px; border-radius: 50%; background: var(--orange-grad); color: #fff; font-size: 34px; font-weight: 700; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; border: 3px solid #fff; box-shadow: var(--shadow); }
.profile-avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
.profile-name-h1 { font-family: var(--serif); font-size: 28px; font-weight: 600; }
.profile-handle-sub { font-size: 14px; color: var(--text3); margin-top: 3px; }
.profile-bio { font-size: 14px; color: var(--text2); margin-top: 8px; line-height: 1.6; }
.profile-stats { display: flex; gap: 20px; margin-top: 12px; font-size: 13px; color: var(--text2); }
.profile-stats strong { color: var(--text); font-weight: 600; }

/* WIDGETS */
.widget-card { background: var(--card); border-radius: var(--radius); border: 1px solid var(--border); padding: 18px; margin-bottom: 14px; }
.widget-title { font-weight: 600; font-size: 14px; margin-bottom: 12px; }
.trending-tag { display: inline-block; background: var(--bg); border-radius: 7px; padding: 5px 12px; font-size: 13px; color: var(--text2); margin: 0 5px 6px 0; cursor: pointer; transition: all 0.15s; }
.trending-tag:hover { background: var(--orange-light); color: var(--orange-dark); }

/* ADMIN */
.admin-layout { display: flex; min-height: 100vh; }
.admin-sidebar { width: 210px; background: #1A1208; padding: 22px 14px; position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-shrink: 0; }
.admin-logo { font-family: var(--serif); font-size: 18px; color: #fff; margin-bottom: 28px; padding: 0 8px; }
.admin-logo span { color: var(--orange); }
.admin-nav-item { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 8px; font-size: 13px; color: rgba(255,255,255,0.6); cursor: pointer; margin-bottom: 2px; transition: all 0.15s; }
.admin-nav-item:hover, .admin-nav-item.active { background: rgba(240,106,37,0.2); color: var(--orange); }
.admin-body { flex: 1; background: var(--bg); overflow-y: auto; }
.admin-topbar { background: var(--card); padding: 18px 28px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.admin-topbar h2 { font-family: var(--serif); font-size: 22px; font-weight: 400; }
.admin-content { padding: 24px 28px; }
.stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
.stat-card { background: var(--card); border-radius: var(--radius); padding: 18px; border: 1px solid var(--border); }
.stat-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 7px; }
.stat-num { font-family: var(--serif); font-size: 28px; font-weight: 600; }
.stat-change { font-size: 12px; color: #16A34A; margin-top: 3px; }
.admin-table-card { background: var(--card); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; margin-bottom: 20px; }
.admin-table-header { padding: 16px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.admin-table-header h3 { font-size: 15px; font-weight: 600; }
table { width: 100%; border-collapse: collapse; }
th { font-size: 11px; font-weight: 600; letter-spacing: 0.4px; color: var(--text3); text-transform: uppercase; padding: 11px 18px; text-align: left; background: var(--bg); }
td { padding: 13px 18px; font-size: 13px; color: var(--text2); border-top: 1px solid var(--border); vertical-align: middle; }
tr:hover td { background: rgba(240,106,37,0.02); }
.status-pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.status-approved { background: #DCFCE7; color: #15803D; }
.status-pending { background: #FEF9C3; color: #A16207; }
.status-rejected, .status-deleted { background: #FEE2E2; color: #DC2626; }
.status-review { background: #DBEAFE; color: #1D4ED8; }
.tbl-btn { font-size: 12px; font-weight: 500; padding: 4px 9px; border-radius: 5px; border: none; cursor: pointer; transition: all 0.15s; }
.tbl-btn-edit { background: var(--orange-light); color: var(--orange-dark); }
.tbl-btn-del { background: #FEE2E2; color: #DC2626; }
.tbl-btn-approve { background: #DCFCE7; color: #15803D; }
.tbl-btn:hover { opacity: 0.8; }

/* NOTIFICATIONS */
.notif-panel { position: absolute; top: calc(var(--nav-h) + 8px); right: 24px; width: 340px; background: var(--card); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-lg); z-index: 300; overflow: hidden; }
.notif-header { padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; font-weight: 600; font-size: 14px; }
.notif-item { display: flex; gap: 10px; padding: 13px 18px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
.notif-item:hover { background: var(--bg); }
.notif-item.unread { background: var(--orange-light); }
.notif-item.unread:hover { background: #FBE4D2; }
.notif-msg { font-size: 13px; color: var(--text2); line-height: 1.5; }
.notif-time { font-size: 11px; color: var(--text3); margin-top: 3px; }

/* TOAST */
.toast { position: fixed; bottom: 22px; right: 22px; background: var(--text); color: #fff; border-radius: var(--radius-sm); padding: 11px 18px; font-size: 14px; z-index: 9999; transform: translateY(70px); opacity: 0; transition: all 0.28s; pointer-events: none; max-width: 320px; }
.toast.show { transform: translateY(0); opacity: 1; }
.toast.success { background: #16A34A; }
.toast.error { background: #DC2626; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.38); display: flex; align-items: center; justify-content: center; z-index: 500; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
.modal-overlay.open { opacity: 1; pointer-events: all; }
.modal { background: var(--card); border-radius: var(--radius); padding: 28px; width: 92%; max-width: 460px; transform: translateY(18px); transition: transform 0.2s; max-height: 85vh; overflow-y: auto; }
.modal-overlay.open .modal { transform: translateY(0); }
.modal-title { font-family: var(--serif); font-size: 22px; font-weight: 400; margin-bottom: 4px; }
.modal-sub { font-size: 14px; color: var(--text3); margin-bottom: 22px; }
.modal-close { float: right; background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text3); margin-top: -2px; }

/* LOADER */
.loader { display: flex; align-items: center; justify-content: center; padding: 60px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--orange); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* HOW SECTION */
.how-section { background: var(--bg); padding: 64px 28px; }
.how-inner { max-width: 1060px; margin: 0 auto; }
.how-title { font-family: var(--serif); font-size: 34px; font-weight: 400; text-align: center; margin-bottom: 42px; }
.how-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px,1fr)); gap: 18px; }
.how-card { background: var(--card); border-radius: var(--radius); padding: 28px; border: 1px solid var(--border); }
.how-icon { width: 52px; height: 52px; border-radius: 14px; background: var(--orange-grad); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 22px; }
.how-card h3 { font-family: var(--serif); font-size: 19px; font-weight: 600; margin-bottom: 8px; }
.how-card p { font-size: 14px; color: var(--text2); line-height: 1.65; }

/* UPLOAD AREA */
.upload-area { border: 2px dashed var(--border); border-radius: var(--radius); padding: 28px; text-align: center; cursor: pointer; transition: all 0.2s; }
.upload-area:hover, .upload-area.drag-over { border-color: var(--orange); background: var(--orange-light); }
.upload-area p { font-size: 14px; color: var(--text3); margin-top: 8px; }

/* SEARCH RESULTS */
.search-result { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: var(--radius-sm); cursor: pointer; transition: background 0.15s; }
.search-result:hover { background: var(--bg); }

/* EMPTY STATE */
.empty-state { text-align: center; padding: 60px 20px; color: var(--text3); }
.empty-state h3 { font-family: var(--serif); font-size: 22px; color: var(--text2); margin-bottom: 10px; }

/* RESPONSIVE */
@media (max-width: 960px) {
  .auth-left { display: none; } .auth-right { width: 100%; }
  .feed-right { display: none; }
  .stats-grid { grid-template-columns: repeat(2,1fr); }
  .admin-sidebar { width: 56px; padding: 20px 8px; }
  .admin-nav-item span { display: none; }
  .sidebar { display: none; }
}
@media (max-width: 640px) {
  .feed-main { padding: 18px; }
  .story-page { padding: 24px 16px 60px; }
  .hero h1 { font-size: 32px; }
}
