// ============================================================
// XPORA — single file app logic
// Replace SUPABASE_URL and SUPABASE_KEY below with your own
// ============================================================

const SUPABASE_URL = "https://epmlxdiyhwasuqihcryt.supabase.co";
const SUPABASE_KEY = "sb_publishable_Z_SbfZKFLkWn33ge6XwEaw_MSj_cQ";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const TAGS = ["Dreams","Travel","Life","Ideas","Career","Food","Tech","Love","Culture"];
const TAG_EMOJI = { Dreams:"🌙", Travel:"✈️", Life:"🌱", Ideas:"💡", Career:"💼", Food:"🍛", Tech:"💻", Love:"❤️", Culture:"🎭" };
const TRENDING = ["#dreams","#India","#travel","#life","#career","#food","#startup","#tech"];

let CURRENT_USER = null;
let CURRENT_PROFILE = null;
let CURRENT_TAG = "all";
let CURRENT_SORT = "new";
let CURRENT_NAV = "home";

// ============================================================
// TOAST
// ============================================================
function toast(msg, type) {
  const el = document.createElement("div");
  el.className = "toast";
  if (type === "error") el.style.background = "#DC2626";
  if (type === "success") el.style.background = "#16A34A";
  el.textContent = msg;
  document.getElementById("toast-container").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function timeAgo(d) {
  const s = Math.floor((new Date() - new Date(d)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ============================================================
// ROUTER
// ============================================================
const Router = {
  go(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const el = document.getElementById("page-" + page);
    if (el) el.classList.add("active");
    window.scrollTo(0, 0);
    if (page === "home") Home.loadFeatured();
    if (page === "feed") Feed.init();
    if (page === "admin") Admin.init();
    if (page === "write") Write.init();
  },
  goStory(id) {
    this.go("story");
    Story.load(id);
  },
  goProfile(username) {
    this.go("profile");
    Profile.load(username || (CURRENT_PROFILE && CURRENT_PROFILE.username));
  }
};

// ============================================================
// AUTH
// ============================================================
const Auth = {
  async init() {
    const { data } = await sb.auth.getSession();
    if (data.session) {
      CURRENT_USER = data.session.user;
      await this.loadProfile();
    }
    sb.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        CURRENT_USER = session.user;
        await this.loadProfile();
      } else {
        CURRENT_USER = null;
        CURRENT_PROFILE = null;
      }
    });
  },
  async loadProfile() {
    if (!CURRENT_USER) return;
    let { data } = await sb.from("profiles").select("*").eq("id", CURRENT_USER.id).single();
    if (!data) {
      const username = (CURRENT_USER.email || "user").split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + Math.floor(Math.random() * 1000);
      const fullName = CURRENT_USER.user_metadata?.full_name || CURRENT_USER.email.split("@")[0];
      const insertRes = await sb.from("profiles").insert({ id: CURRENT_USER.id, username, full_name: fullName, role: "user" }).select().single();
      data = insertRes.data;
    }
    CURRENT_PROFILE = data;
    this.updateNavUI();
  },
  updateNavUI() {
    if (!CURRENT_PROFILE) return;
    const initial = (CURRENT_PROFILE.full_name || "U")[0].toUpperCase();
    document.querySelectorAll("#nav-avatar, #side-avatar").forEach(el => {
      el.innerHTML = CURRENT_PROFILE.avatar_url ? `<img src="${CURRENT_PROFILE.avatar_url}">` : initial;
    });
    const sideName = document.getElementById("side-name");
    const sideHandle = document.getElementById("side-handle");
    if (sideName) sideName.textContent = CURRENT_PROFILE.full_name;
    if (sideHandle) sideHandle.textContent = "@" + CURRENT_PROFILE.username;
    const isAdmin = CURRENT_PROFILE.role === "admin" || CURRENT_PROFILE.role === "moderator";
    document.getElementById("nav-admin-btn").classList.toggle("hidden", !isAdmin);
    document.getElementById("navitem-admin").classList.toggle("hidden", !isAdmin);
  },
  async signUp() {
    const name = document.getElementById("signup-name").value.trim();
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const pass = document.getElementById("signup-pass").value;
    const errEl = document.getElementById("signup-error");
    errEl.textContent = "";
    if (!name || !username || !email || !pass) { errEl.textContent = "Please fill all fields"; return; }
    if (pass.length < 6) { errEl.textContent = "Password must be at least 6 characters"; return; }
    const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { full_name: name, username } } });
    if (error) { errEl.textContent = error.message; return; }
    CURRENT_USER = data.user;
    await sb.from("profiles").upsert({ id: data.user.id, username, full_name: name, role: "user" });
    await this.loadProfile();
    toast("Welcome to Xpora, " + name + "!", "success");
    Router.go("feed");
  },
  async signIn() {
    const email = document.getElementById("signin-email").value.trim();
    const pass = document.getElementById("signin-pass").value;
    const errEl = document.getElementById("signin-error");
    errEl.textContent = "";
    if (!email || !pass) { errEl.textContent = "Please fill all fields"; return; }
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) { errEl.textContent = error.message; return; }
    CURRENT_USER = data.user;
    await this.loadProfile();
    toast("Welcome back!", "success");
    Router.go("feed");
  },
  async signOut() {
    await sb.auth.signOut();
    CURRENT_USER = null;
    CURRENT_PROFILE = null;
    Router.go("home");
    toast("Signed out");
  }
};

// ============================================================
// HOME
// ============================================================
const Home = {
  phrases: ["Share your dreams.", "Tell your story.", "Write what is real.", "Find your readers."],
  phraseIdx: 0,
  charIdx: 0,
  deleting: false,
  typeLoop() {
    const el = document.getElementById("typing-text");
    if (!el) return;
    const current = this.phrases[this.phraseIdx];
    if (!this.deleting && this.charIdx < current.length) {
      this.charIdx++;
      el.textContent = current.slice(0, this.charIdx);
      setTimeout(() => this.typeLoop(), 60);
    } else if (!this.deleting && this.charIdx === current.length) {
      this.deleting = true;
      setTimeout(() => this.typeLoop(), 1600);
    } else if (this.deleting && this.charIdx > 0) {
      this.charIdx--;
      el.textContent = current.slice(0, this.charIdx);
      setTimeout(() => this.typeLoop(), 32);
    } else {
      this.deleting = false;
      this.phraseIdx = (this.phraseIdx + 1) % this.phrases.length;
      setTimeout(() => this.typeLoop(), 200);
    }
  },
  async loadFeatured() {
    const el = document.getElementById("home-featured");
    el.innerHTML = "";
    const { data, error } = await sb.from("posts")
      .select("id,title,excerpt,tag,upvotes,profiles(full_name,avatar_url)")
      .eq("status", "approved").order("upvotes", { ascending: false }).limit(6);
    if (error || !data || data.length === 0) {
      el.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#999;padding:30px">No stories yet. Be the first!</div>`;
      return;
    }
    data.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.padding = "16px";
      card.style.cursor = "pointer";
      card.onclick = () => Router.go("signin");
      card.innerHTML = `
        <span class="tagbadge">${TAG_EMOJI[p.tag] || ""} ${escapeHtml(p.tag)}</span>
        <div style="font-family:var(--serif);font-size:17px;font-weight:700;margin:8px 0 6px">${escapeHtml(p.title)}</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.6">${escapeHtml(p.excerpt || "")}</div>
      `;
      el.appendChild(card);
    });
  }
};

// ============================================================
// FEED
// ============================================================
const Feed = {
  bookmarks: new Set(),
  votes: {},
  async init() {
    Auth.updateNavUI();
    this.renderCategories();
    this.renderTrending();
    await this.fetchBookmarks();
    await this.fetchVotes();
    await this.load();
  },
  renderCategories() {
    const el = document.getElementById("cat-list");
    const cats = [{ val: "all", label: "All", emoji: "🌍" }].concat(TAGS.map(t => ({ val: t, label: t, emoji: TAG_EMOJI[t] })));
    el.innerHTML = cats.map(c => `<div class="navlink ${CURRENT_TAG === c.val ? "active" : ""}" onclick="Feed.setTag('${c.val}')">${c.emoji} ${c.label}</div>`).join("");
  },
  renderTrending() {
    document.getElementById("trending-tags").innerHTML = TRENDING.map(t =>
      `<span style="display:inline-block;background:var(--bg);padding:5px 12px;border-radius:20px;font-size:13px;margin:0 4px 6px 0;cursor:pointer" onclick="Feed.setTag('${t.slice(1)}')">${t}</span>`
    ).join("");
  },
  setTag(tag) {
    CURRENT_TAG = tag;
    CURRENT_NAV = "home";
    this.renderCategories();
    document.getElementById("navitem-home").classList.add("active");
    document.getElementById("navitem-bookmarks").classList.remove("active");
    this.load();
  },
  setNav(nav) {
    CURRENT_NAV = nav;
    document.getElementById("navitem-home").classList.toggle("active", nav === "home");
    document.getElementById("navitem-bookmarks").classList.toggle("active", nav === "bookmarks");
    if (nav === "bookmarks") this.loadBookmarked();
    else this.load();
  },
  setSort(sort) {
    CURRENT_SORT = sort;
    document.getElementById("sort-new").className = sort === "new" ? "btn btn-sm" : "btn btn-sm btn-outline";
    document.getElementById("sort-new").style.background = sort === "new" ? "var(--orange)" : "";
    document.getElementById("sort-new").style.color = sort === "new" ? "#fff" : "";
    document.getElementById("sort-top").className = sort === "top" ? "btn btn-sm" : "btn btn-sm btn-outline";
    document.getElementById("sort-top").style.background = sort === "top" ? "var(--orange)" : "";
    document.getElementById("sort-top").style.color = sort === "top" ? "#fff" : "";
    this.load();
  },
  async fetchBookmarks() {
    if (!CURRENT_USER) return;
    const { data } = await sb.from("bookmarks").select("post_id").eq("user_id", CURRENT_USER.id);
    this.bookmarks = new Set((data || []).map(b => b.post_id));
  },
  async fetchVotes() {
    if (!CURRENT_USER) return;
    const { data } = await sb.from("votes").select("post_id,vote_type").eq("user_id", CURRENT_USER.id);
    this.votes = {};
    (data || []).forEach(v => this.votes[v.post_id] = v.vote_type);
  },
  async load() {
    const list = document.getElementById("feed-list");
    list.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;
    let q = sb.from("posts").select("id,title,excerpt,tag,created_at,upvotes,downvotes,comment_count,author_id,profiles(username,full_name,avatar_url)").eq("status", "approved");
    if (CURRENT_TAG !== "all") q = q.eq("tag", CURRENT_TAG);
    if (CURRENT_SORT === "top") q = q.order("upvotes", { ascending: false });
    else q = q.order("created_at", { ascending: false });
    const { data, error } = await q.limit(50);
    document.getElementById("feed-count").textContent = (data ? data.length : 0) + " stories";
    this.renderList(data, error);
  },
  async loadBookmarked() {
    const list = document.getElementById("feed-list");
    list.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;
    if (!CURRENT_USER) return;
    const { data } = await sb.from("bookmarks").select("posts(id,title,excerpt,tag,created_at,upvotes,downvotes,comment_count,author_id,profiles(username,full_name,avatar_url))").eq("user_id", CURRENT_USER.id);
    const posts = (data || []).map(b => b.posts).filter(Boolean);
    document.getElementById("feed-count").textContent = posts.length + " saved";
    this.renderList(posts, null);
  },
  search(q) {
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(async () => {
      if (!q || q.length < 2) { this.load(); return; }
      const { data } = await sb.from("posts").select("id,title,excerpt,tag,created_at,upvotes,downvotes,comment_count,author_id,profiles(username,full_name,avatar_url)")
        .eq("status", "approved").ilike("title", `%${q}%`).limit(30);
      this.renderList(data, null);
    }, 300);
  },
  renderList(data, error) {
    const list = document.getElementById("feed-list");
    if (error) { list.innerHTML = `<div class="card" style="padding:30px;text-align:center;color:#999">Error loading stories.</div>`; return; }
    if (!data || data.length === 0) {
      list.innerHTML = `<div class="card" style="padding:40px;text-align:center">
        <div style="font-size:40px;margin-bottom:10px">🌙</div>
        <div style="font-family:var(--serif);font-size:20px;margin-bottom:8px">No stories yet</div>
        <p style="color:#999;margin-bottom:16px">Be the first to share!</p>
        <button class="btn btn-primary" onclick="Router.go('write')">Write first story</button>
      </div>`;
      return;
    }
    list.innerHTML = data.map(p => this.cardHtml(p)).join("");
  },
  cardHtml(p) {
    const name = p.profiles ? p.profiles.full_name : "Unknown";
    const username = p.profiles ? p.profiles.username : "unknown";
    const initial = (name || "U")[0].toUpperCase();
    const avatarHtml = (p.profiles && p.profiles.avatar_url) ? `<img src="${p.profiles.avatar_url}">` : initial;
    const isSaved = this.bookmarks.has(p.id);
    const vote = this.votes[p.id];
    const score = (p.upvotes || 0) - (p.downvotes || 0);
    return `
    <div class="postcard">
      <div class="postcard-body">
        <div class="postcard-header">
          <div class="avatar" style="width:36px;height:36px;font-size:14px" onclick="Router.goProfile('${username}')">${avatarHtml}</div>
          <div>
            <div style="font-weight:700;font-size:14px;cursor:pointer" onclick="Router.goProfile('${username}')">${escapeHtml(name)}</div>
            <div style="font-size:12px;color:#888">@${escapeHtml(username)} · ${timeAgo(p.created_at)}</div>
          </div>
          <span class="tagbadge" style="margin-left:auto">${TAG_EMOJI[p.tag] || ""} ${escapeHtml(p.tag)}</span>
        </div>
        <div class="postcard-title" onclick="Router.goStory('${p.id}')">${escapeHtml(p.title)}</div>
        <div class="postcard-excerpt" onclick="Router.goStory('${p.id}')">${escapeHtml(p.excerpt || "")}</div>
        <div class="postcard-actions">
          <div class="votegroup">
            <button class="votebtn ${vote === "up" ? "up-active" : ""}" onclick="Feed.vote('${p.id}','up',this)">▲</button>
            <span class="votecount">${score}</span>
            <button class="votebtn ${vote === "down" ? "down-active" : ""}" onclick="Feed.vote('${p.id}','down',this)">▼</button>
          </div>
          <button class="actbtn" onclick="Router.goStory('${p.id}')">💬 ${p.comment_count || 0}</button>
          <button class="actbtn ${isSaved ? "active-save" : ""}" onclick="Feed.toggleSave('${p.id}',this)">${isSaved ? "Saved" : "Save"}</button>
          <button class="actbtn" onclick="Feed.share('${p.id}')">Share</button>
          <button class="actbtn" style="margin-left:auto;color:#bbb" onclick="Report.open('${p.id}')">⚑</button>
        </div>
      </div>
    </div>`;
  },
  async vote(postId, type, btnEl) {
    if (!CURRENT_USER) { toast("Please sign in to vote"); return; }
    const current = this.votes[postId];
    if (current === type) {
      await sb.from("votes").delete().match({ user_id: CURRENT_USER.id, post_id: postId });
      delete this.votes[postId];
    } else {
      await sb.from("votes").upsert({ user_id: CURRENT_USER.id, post_id: postId, vote_type: type });
      this.votes[postId] = type;
    }
    if (CURRENT_NAV === "bookmarks") this.loadBookmarked(); else this.load();
  },
  async toggleSave(postId, btnEl) {
    if (!CURRENT_USER) { toast("Please sign in to save"); return; }
    if (this.bookmarks.has(postId)) {
      await sb.from("bookmarks").delete().match({ user_id: CURRENT_USER.id, post_id: postId });
      this.bookmarks.delete(postId);
      toast("Removed from bookmarks");
    } else {
      await sb.from("bookmarks").insert({ user_id: CURRENT_USER.id, post_id: postId });
      this.bookmarks.add(postId);
      toast("Saved!", "success");
    }
    if (CURRENT_NAV === "bookmarks") this.loadBookmarked(); else this.load();
  },
  share(postId) {
    const url = window.location.origin + window.location.pathname + "#story-" + postId;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    toast("Link copied!");
  }
};

// ============================================================
// WRITE
// ============================================================
const Write = {
  init() {
    if (!CURRENT_USER) { Router.go("signin"); return; }
    document.getElementById("write-title").value = "";
    document.getElementById("write-body").value = "";
    document.getElementById("write-wordcount").textContent = "0 words";
    const sel = document.getElementById("write-tag");
    sel.innerHTML = TAGS.map(t => `<option value="${t}">${TAG_EMOJI[t]} ${t}</option>`).join("");
  },
  autoresize(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  },
  wordcount(el) {
    const words = el.value.trim().split(/\s+/).filter(Boolean).length;
    document.getElementById("write-wordcount").textContent = words + " words";
  },
  async publish() {
    const title = document.getElementById("write-title").value.trim();
    const body = document.getElementById("write-body").value.trim();
    const tag = document.getElementById("write-tag").value;
    if (!title) { toast("Please add a title", "error"); return; }
    if (body.length < 30) { toast("Write at least 30 characters", "error"); return; }
    const btn = document.getElementById("publish-btn");
    btn.disabled = true;
    btn.textContent = "Publishing...";
    const excerpt = body.replace(/[#*_>]/g, "").trim().slice(0, 160) + (body.length > 160 ? "…" : "");
    const { error } = await sb.from("posts").insert({
      author_id: CURRENT_USER.id, title, body, excerpt, tag,
      status: "approved", ai_status: "approved", published_at: new Date().toISOString()
    });
    btn.disabled = false;
    btn.textContent = "Publish";
    if (error) { toast("Failed: " + error.message, "error"); return; }
    toast("Story published!", "success");
    Router.go("feed");
  }
};

// ============================================================
// STORY DETAIL
// ============================================================
const Story = {
  currentId: null,
  async load(id) {
    this.currentId = id;
    const el = document.getElementById("story-content");
    el.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;
    const { data: post, error } = await sb.from("posts").select("*,profiles(username,full_name,avatar_url)").eq("id", id).single();
    if (error || !post) { el.innerHTML = `<div style="text-align:center;padding:40px"><h2>Story not found</h2><button class="btn btn-primary" onclick="Router.go('feed')" style="margin-top:14px">Back to feed</button></div>`; return; }
    sb.from("posts").update({ views: (post.views || 0) + 1 }).eq("id", id);
    const { data: comments } = await sb.from("comments").select("*,profiles(username,full_name,avatar_url)").eq("post_id", id).eq("status", "approved").order("created_at", { ascending: false });
    let userVote = null;
    if (CURRENT_USER) {
      const { data: v } = await sb.from("votes").select("vote_type").match({ user_id: CURRENT_USER.id, post_id: id }).maybeSingle();
      userVote = v ? v.vote_type : null;
    }
    const name = post.profiles ? post.profiles.full_name : "Unknown";
    const username = post.profiles ? post.profiles.username : "unknown";
    const initial = (name || "U")[0].toUpperCase();
    const avatarHtml = (post.profiles && post.profiles.avatar_url) ? `<img src="${post.profiles.avatar_url}">` : initial;
    const score = (post.upvotes || 0) - (post.downvotes || 0);
    const bodyHtml = (post.body || "").split("\n\n").map(p => `<p>${escapeHtml(p)}</p>`).join("");
    el.innerHTML = `
      <span class="tagbadge">${TAG_EMOJI[post.tag] || ""} ${escapeHtml(post.tag)}</span>
      <h1 style="margin-top:14px">${escapeHtml(post.title)}</h1>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border)">
        <div class="avatar" style="width:38px;height:38px" onclick="Router.goProfile('${username}')">${avatarHtml}</div>
        <div>
          <div style="font-weight:700;font-size:14px">${escapeHtml(name)}</div>
          <div style="font-size:12px;color:#888">@${escapeHtml(username)} · ${timeAgo(post.created_at)}</div>
        </div>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
          <div class="votegroup">
            <button class="votebtn ${userVote === "up" ? "up-active" : ""}" onclick="Story.vote('up')">▲</button>
            <span class="votecount" id="story-score">${score}</span>
            <button class="votebtn ${userVote === "down" ? "down-active" : ""}" onclick="Story.vote('down')">▼</button>
          </div>
          <button class="actbtn" onclick="Feed.share('${post.id}')">Share</button>
          <button class="actbtn" onclick="Report.open('${post.id}')">⚑</button>
        </div>
      </div>
      <div class="storybody">${bodyHtml}</div>
      <div style="margin-top:36px;padding-top:24px;border-top:1px solid var(--border)">
        <h3 style="font-family:var(--serif);margin-bottom:14px">${(comments || []).length} comments</h3>
        ${CURRENT_USER ? `
          <textarea class="comment-box" id="new-comment" placeholder="Share your thoughts..."></textarea>
          <button class="btn btn-primary" onclick="Story.postComment()">Post comment</button>
        ` : `<p style="color:#999;margin-bottom:16px"><a style="color:var(--orange);cursor:pointer" onclick="Router.go('signin')">Sign in</a> to comment</p>`}
        <div id="comments-list" style="margin-top:20px">${this.commentsHtml(comments)}</div>
      </div>
    `;
  },
  commentsHtml(comments) {
    if (!comments || comments.length === 0) return "";
    return comments.map(c => {
      const name = c.profiles ? c.profiles.full_name : "Anon";
      const initial = (name || "A")[0].toUpperCase();
      const avatarHtml = (c.profiles && c.profiles.avatar_url) ? `<img src="${c.profiles.avatar_url}">` : initial;
      return `<div class="comment">
        <div class="avatar" style="width:32px;height:32px;font-size:12px">${avatarHtml}</div>
        <div>
          <div style="font-weight:700;font-size:13px">${escapeHtml(name)} <span style="color:#999;font-weight:400;margin-left:6px">${timeAgo(c.created_at)}</span></div>
          <div style="font-size:14px;color:var(--text2);margin-top:2px">${escapeHtml(c.body)}</div>
        </div>
      </div>`;
    }).join("");
  },
  async vote(type) {
    if (!CURRENT_USER) { toast("Please sign in to vote"); return; }
    const { data: existing } = await sb.from("votes").select("vote_type").match({ user_id: CURRENT_USER.id, post_id: this.currentId }).maybeSingle();
    if (existing && existing.vote_type === type) {
      await sb.from("votes").delete().match({ user_id: CURRENT_USER.id, post_id: this.currentId });
    } else {
      await sb.from("votes").upsert({ user_id: CURRENT_USER.id, post_id: this.currentId, vote_type: type });
    }
    this.load(this.currentId);
  },
  async postComment() {
    const text = document.getElementById("new-comment").value.trim();
    if (!text) return;
    const { error } = await sb.from("comments").insert({ post_id: this.currentId, author_id: CURRENT_USER.id, body: text, status: "approved" });
    if (error) { toast("Failed to post comment", "error"); return; }
    toast("Comment posted!", "success");
    this.load(this.currentId);
  }
};

// ============================================================
// PROFILE
// ============================================================
const Profile = {
  async load(username) {
    const el = document.getElementById("profile-content");
    el.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;
    if (!username) { el.innerHTML = `<p>No profile to show.</p>`; return; }
    const { data: profile } = await sb.from("profiles").select("*").eq("username", username).single();
    if (!profile) { el.innerHTML = `<p>User not found.</p>`; return; }
    const isOwn = CURRENT_PROFILE && CURRENT_PROFILE.username === username;
    const { data: posts } = await sb.from("posts").select("id,title,excerpt,tag,created_at,upvotes,comment_count,status")
      .eq("author_id", profile.id).order("created_at", { ascending: false });
    const initial = (profile.full_name || "U")[0].toUpperCase();
    const avatarHtml = profile.avatar_url ? `<img src="${profile.avatar_url}">` : initial;
    const visiblePosts = isOwn ? posts : (posts || []).filter(p => p.status === "approved");
    el.innerHTML = `
      <div class="card" style="padding:24px;margin-bottom:20px;display:flex;align-items:center;gap:16px">
        <div class="avatar" style="width:64px;height:64px;font-size:24px;position:relative">${avatarHtml}</div>
        <div style="flex:1">
          <div style="font-family:var(--serif);font-size:22px;font-weight:700">${escapeHtml(profile.full_name)}</div>
          <div style="font-size:13px;color:#888">@${escapeHtml(profile.username)}</div>
          <div style="font-size:13px;color:var(--text2);margin-top:6px">${(visiblePosts || []).length} stories</div>
        </div>
        ${isOwn ? `<button class="btn btn-outline" onclick="Profile.openEdit()">Edit profile</button>` : ""}
      </div>
      <h3 style="font-family:var(--serif);margin-bottom:14px">${isOwn ? "Your stories" : "Stories"}</h3>
      <div id="profile-posts">${this.postsHtml(visiblePosts, isOwn)}</div>
    `;
  },
  postsHtml(posts, isOwn) {
    if (!posts || posts.length === 0) return `<div class="card" style="padding:30px;text-align:center;color:#999">No stories yet.</div>`;
    return posts.map(p => `
      <div class="postcard">
        <div class="postcard-body">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span class="tagbadge">${TAG_EMOJI[p.tag] || ""} ${escapeHtml(p.tag)}</span>
            ${isOwn && p.status !== "approved" ? `<span class="pill" style="background:#FEF9C3;color:#A16207">${escapeHtml(p.status)}</span>` : ""}
          </div>
          <div class="postcard-title" onclick="Router.goStory('${p.id}')">${escapeHtml(p.title)}</div>
          <div class="postcard-excerpt" onclick="Router.goStory('${p.id}')">${escapeHtml(p.excerpt || "")}</div>
          ${isOwn ? `<div style="margin-top:10px"><button class="btn btn-danger btn-sm" onclick="Profile.deletePost('${p.id}')">Delete</button></div>` : ""}
        </div>
      </div>
    `).join("");
  },
  async deletePost(id) {
    if (!confirm("Delete this story?")) return;
    await sb.from("posts").delete().eq("id", id);
    toast("Story deleted");
    this.load(CURRENT_PROFILE.username);
  },
  openEdit() {
    const modal = document.getElementById("modal-root");
    modal.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="modal">
          <h3 style="font-family:var(--serif);margin-bottom:16px">Edit profile</h3>
          <input class="form-input" id="edit-name" value="${escapeHtml(CURRENT_PROFILE.full_name || "")}" placeholder="Full name">
          <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="Profile.saveEdit()">Save changes</button>
        </div>
      </div>
    `;
  },
  async saveEdit() {
    const name = document.getElementById("edit-name").value.trim();
    if (!name) return;
    await sb.from("profiles").update({ full_name: name }).eq("id", CURRENT_USER.id);
    CURRENT_PROFILE.full_name = name;
    document.getElementById("modal-root").innerHTML = "";
    toast("Profile updated!", "success");
    Auth.updateNavUI();
    this.load(CURRENT_PROFILE.username);
  }
};

// ============================================================
// REPORT
// ============================================================
const Report = {
  open(postId) {
    if (!CURRENT_USER) { toast("Please sign in to report"); return; }
    const modal = document.getElementById("modal-root");
    modal.innerHTML = `
      <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="modal">
          <h3 style="font-family:var(--serif);margin-bottom:6px">Report content</h3>
          <p style="font-size:13px;color:#999;margin-bottom:16px">Help us keep Xpora safe.</p>
          <select class="form-input" id="report-reason">
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="fake_information">Fake information</option>
            <option value="other">Other</option>
          </select>
          <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="Report.submit('${postId}')">Submit report</button>
        </div>
      </div>
    `;
  },
  async submit(postId) {
    const reason = document.getElementById("report-reason").value;
    await sb.from("reports").insert({ reporter_id: CURRENT_USER.id, post_id: postId, reason, status: "pending" });
    document.getElementById("modal-root").innerHTML = "";
    toast("Report submitted. Thank you.", "success");
  }
};

// ============================================================
// ADMIN
// ============================================================
const Admin = {
  currentTab: "dashboard",
  init() {
    if (!CURRENT_PROFILE || (CURRENT_PROFILE.role !== "admin" && CURRENT_PROFILE.role !== "moderator")) {
      toast("Admin access only", "error");
      Router.go("feed");
      return;
    }
    document.getElementById("admin-welcome").textContent = "Admin: " + CURRENT_PROFILE.full_name;
    this.setTab("dashboard", document.querySelector(".admin-item"));
  },
  setTab(tab, el) {
    this.currentTab = tab;
    document.querySelectorAll(".admin-item").forEach(i => i.classList.remove("active"));
    if (el) el.classList.add("active");
    document.getElementById("admin-title").textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
    this.render(tab);
  },
  async render(tab) {
    const el = document.getElementById("admin-content");
    el.innerHTML = `<div class="loader"><div class="spinner"></div></div>`;
    if (tab === "dashboard") return this.renderDashboard(el);
    if (tab === "pending") return this.renderPending(el);
    if (tab === "stories") return this.renderStories(el);
    if (tab === "users") return this.renderUsers(el);
    if (tab === "comments") return this.renderComments(el);
    if (tab === "reports") return this.renderReports(el);
  },
  async renderDashboard(el) {
    const [posts, users, comments, reports, pending] = await Promise.all([
      sb.from("posts").select("id", { count: "exact", head: true }),
      sb.from("profiles").select("id", { count: "exact", head: true }),
      sb.from("comments").select("id", { count: "exact", head: true }),
      sb.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      sb.from("posts").select("id", { count: "exact", head: true }).eq("status", "pending")
    ]);
    document.getElementById("admin-pending-badge").textContent = pending.count > 0 ? "(" + pending.count + ")" : "";
    el.innerHTML = `
      <div class="statgrid">
        <div class="statcard"><div style="font-size:11px;color:#888;text-transform:uppercase">Total stories</div><div style="font-size:26px;font-weight:700;color:#16A34A">${posts.count || 0}</div></div>
        <div class="statcard"><div style="font-size:11px;color:#888;text-transform:uppercase">Total users</div><div style="font-size:26px;font-weight:700;color:#2563EB">${users.count || 0}</div></div>
        <div class="statcard"><div style="font-size:11px;color:#888;text-transform:uppercase">Comments</div><div style="font-size:26px;font-weight:700;color:#9333EA">${comments.count || 0}</div></div>
        <div class="statcard"><div style="font-size:11px;color:#888;text-transform:uppercase">Pending</div><div style="font-size:26px;font-weight:700;color:#EA580C">${pending.count || 0}</div></div>
        <div class="statcard"><div style="font-size:11px;color:#888;text-transform:uppercase">Reports</div><div style="font-size:26px;font-weight:700;color:#DC2626">${reports.count || 0}</div></div>
      </div>
      <div class="card" style="padding:18px">
        <h3 style="margin-bottom:12px">Quick actions</h3>
        <button class="btn btn-primary" onclick="Admin.setTab('pending',document.querySelectorAll('.admin-item')[1])">Review pending (${pending.count || 0})</button>
        <button class="btn btn-outline" onclick="Admin.setTab('reports',document.querySelectorAll('.admin-item')[5])">View reports (${reports.count || 0})</button>
      </div>
    `;
  },
  async renderPending(el) {
    const { data } = await sb.from("posts").select("*,profiles(username,full_name)").eq("status", "pending").order("created_at", { ascending: false });
    if (!data || data.length === 0) { el.innerHTML = `<div class="card" style="padding:30px;text-align:center"><h3>No pending posts</h3><p style="color:#999">All caught up.</p></div>`; return; }
    el.innerHTML = data.map(p => `
      <div class="card" style="padding:18px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-weight:700;font-size:13px">@${escapeHtml(p.profiles ? p.profiles.username : "?")}</span>
          <span style="font-size:12px;color:#888">${timeAgo(p.created_at)}</span>
        </div>
        <div style="font-family:var(--serif);font-size:17px;font-weight:700;margin-bottom:6px">${escapeHtml(p.title)}</div>
        <div style="font-size:14px;color:var(--text2);max-height:100px;overflow:hidden;margin-bottom:12px">${escapeHtml((p.body || "").slice(0, 300))}...</div>
        <button class="btn btn-sm" style="background:#DCFCE7;color:#15803D" onclick="Admin.approvePost('${p.id}')">Approve</button>
        <button class="btn btn-sm" style="background:#FEE2E2;color:#DC2626" onclick="Admin.rejectPost('${p.id}')">Reject</button>
        <button class="btn btn-sm btn-outline" onclick="Admin.deletePost('${p.id}')">Delete</button>
      </div>
    `).join("");
  },
  async renderStories(el) {
    const { data } = await sb.from("posts").select("*,profiles(username)").order("created_at", { ascending: false }).limit(80);
    el.innerHTML = `<div class="card"><table>
      <tr><th>Title</th><th>Author</th><th>Tag</th><th>Status</th><th>Actions</th></tr>
      ${(data || []).map(p => `
        <tr>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(p.title)}</td>
          <td>@${escapeHtml(p.profiles ? p.profiles.username : "?")}</td>
          <td>${escapeHtml(p.tag)}</td>
          <td><span class="pill" style="background:${p.status === "approved" ? "#DCFCE7" : p.status === "pending" ? "#FEF9C3" : "#FEE2E2"};color:${p.status === "approved" ? "#15803D" : p.status === "pending" ? "#A16207" : "#DC2626"}">${escapeHtml(p.status)}</span></td>
          <td>
            ${p.status !== "approved" ? `<button class="btn btn-sm" style="background:#DCFCE7;color:#15803D" onclick="Admin.approvePost('${p.id}')">Approve</button>` : ""}
            <button class="btn btn-sm" style="background:#FEE2E2;color:#DC2626" onclick="Admin.deletePost('${p.id}')">Delete</button>
          </td>
        </tr>
      `).join("")}
    </table></div>`;
  },
  async renderUsers(el) {
    const { data } = await sb.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);
    el.innerHTML = `<div class="card"><table>
      <tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr>
      ${(data || []).map(u => `
        <tr>
          <td>${escapeHtml(u.full_name)}</td>
          <td>@${escapeHtml(u.username)}</td>
          <td><span class="pill" style="background:${u.role === "admin" ? "var(--orange-light)" : "#F0F0F0"};color:${u.role === "admin" ? "var(--orange-dark)" : "#666"}">${escapeHtml(u.role)}</span></td>
          <td><span class="pill" style="background:${u.is_banned ? "#FEE2E2" : u.is_suspended ? "#FEF9C3" : "#DCFCE7"};color:${u.is_banned ? "#DC2626" : u.is_suspended ? "#A16207" : "#15803D"}">${u.is_banned ? "Banned" : u.is_suspended ? "Suspended" : "Active"}</span></td>
          <td>
            ${u.role !== "admin" ? `<button class="btn btn-sm" style="background:#FEF9C3;color:#A16207" onclick="Admin.warnUser('${u.id}','${escapeHtml(u.username)}')">Warn</button>` : ""}
            ${!u.is_suspended && u.role !== "admin" ? `<button class="btn btn-sm" style="background:var(--orange-light);color:var(--orange-dark)" onclick="Admin.suspendUser('${u.id}')">Suspend</button>` : ""}
            ${u.is_suspended ? `<button class="btn btn-sm" style="background:#DCFCE7;color:#15803D" onclick="Admin.unsuspendUser('${u.id}')">Unsuspend</button>` : ""}
            ${!u.is_banned && u.role !== "admin" ? `<button class="btn btn-sm" style="background:#FEE2E2;color:#DC2626" onclick="Admin.banUser('${u.id}','${escapeHtml(u.username)}')">Ban</button>` : ""}
            ${u.role !== "admin" ? `<button class="btn btn-sm" style="background:#DBEAFE;color:#1D4ED8" onclick="Admin.makeAdmin('${u.id}')">Make admin</button>` : ""}
          </td>
        </tr>
      `).join("")}
    </table></div>`;
  },
  async renderComments(el) {
    const { data } = await sb.from("comments").select("*,profiles(username),posts(title)").order("created_at", { ascending: false }).limit(100);
    el.innerHTML = `<div class="card"><table>
      <tr><th>Author</th><th>Comment</th><th>Post</th><th>Status</th><th>Action</th></tr>
      ${(data || []).map(c => `
        <tr>
          <td>@${escapeHtml(c.profiles ? c.profiles.username : "?")}</td>
          <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(c.body)}</td>
          <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(c.posts ? c.posts.title : "?")}</td>
          <td><span class="pill" style="background:${c.status === "approved" ? "#DCFCE7" : "#FEE2E2"};color:${c.status === "approved" ? "#15803D" : "#DC2626"}">${escapeHtml(c.status)}</span></td>
          <td>${c.status === "approved" ? `<button class="btn btn-sm" style="background:#FEE2E2;color:#DC2626" onclick="Admin.removeComment('${c.id}')">Remove</button>` : ""}</td>
        </tr>
      `).join("")}
    </table></div>`;
  },
  async renderReports(el) {
    const { data } = await sb.from("reports").select("*,profiles(username),posts(title)").order("created_at", { ascending: false });
    if (!data || data.length === 0) { el.innerHTML = `<div class="card" style="padding:30px;text-align:center;color:#999">No reports.</div>`; return; }
    el.innerHTML = `<div class="card"><table>
      <tr><th>Reporter</th><th>Reason</th><th>Post</th><th>Status</th><th>Actions</th></tr>
      ${data.map(r => `
        <tr>
          <td>@${escapeHtml(r.profiles ? r.profiles.username : "?")}</td>
          <td><span class="pill" style="background:#DBEAFE;color:#1D4ED8">${escapeHtml(r.reason)}</span></td>
          <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(r.posts ? r.posts.title : "?")}</td>
          <td><span class="pill" style="background:${r.status === "pending" ? "#FEF9C3" : "#DCFCE7"};color:${r.status === "pending" ? "#A16207" : "#15803D"}">${escapeHtml(r.status)}</span></td>
          <td>${r.status === "pending" ? `
            ${r.post_id ? `<button class="btn btn-sm" style="background:#FEE2E2;color:#DC2626" onclick="Admin.rejectPost('${r.post_id}')">Remove post</button>` : ""}
            <button class="btn btn-sm" style="background:#DCFCE7;color:#15803D" onclick="Admin.dismissReport('${r.id}')">Dismiss</button>
          ` : ""}</td>
        </tr>
      `).join("")}
    </table></div>`;
  },
  async approvePost(id) {
    await sb.from("posts").update({ status: "approved" }).eq("id", id);
    toast("Post approved", "success");
    this.render(this.currentTab);
  },
  async rejectPost(id) {
    await sb.from("posts").update({ status: "rejected" }).eq("id", id);
    toast("Post rejected");
    this.render(this.currentTab);
  },
  async deletePost(id) {
    if (!confirm("Delete permanently?")) return;
    await sb.from("posts").delete().eq("id", id);
    toast("Post deleted");
    this.render(this.currentTab);
  },
  async warnUser(id, username) {
    await sb.from("notifications").insert({ user_id: id, type: "system", title: "Warning", message: "Your recent content violated community guidelines." });
    toast("Warning sent to @" + username, "success");
  },
  async suspendUser(id) {
    await sb.from("profiles").update({ is_suspended: true }).eq("id", id);
    toast("User suspended");
    this.render(this.currentTab);
  },
  async unsuspendUser(id) {
    await sb.from("profiles").update({ is_suspended: false }).eq("id", id);
    toast("User unsuspended", "success");
    this.render(this.currentTab);
  },
  async banUser(id, username) {
    if (!confirm("Permanently ban @" + username + "?")) return;
    await sb.from("profiles").update({ is_banned: true }).eq("id", id);
    toast("User banned");
    this.render(this.currentTab);
  },
  async makeAdmin(id) {
    await sb.from("profiles").update({ role: "admin" }).eq("id", id);
    toast("User promoted to admin", "success");
    this.render(this.currentTab);
  },
  async removeComment(id) {
    await sb.from("comments").update({ status: "removed" }).eq("id", id);
    toast("Comment removed");
    this.render(this.currentTab);
  },
  async dismissReport(id) {
    await sb.from("reports").update({ status: "dismissed" }).eq("id", id);
    toast("Report dismissed");
    this.render(this.currentTab);
  }
};

// ============================================================
// INIT
// ============================================================
(async function init() {
  await Auth.init();
  Home.typeLoop();
  Home.loadFeatured();
  if (CURRENT_USER) {
    Router.go("feed");
  }
})();
