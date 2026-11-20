import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initialConversations, initialPosts, online, people } from "../data/social";

const SocialContext = createContext(null);
const CHATS_KEY = "anveshya.chats";

let seq = Date.now();
const nextId = () => String(++seq);

// ---------------------------------------------------------------------------
// Phase 1 chat: everything runs on the device. Your messages are real and
// saved; friends' replies are simulated (typing… then a reply) so the Share
// tab behaves like a live chat until the backend (e.g. Supabase realtime)
// replaces simulateReply() with real incoming messages.
// ---------------------------------------------------------------------------

const REPLIES = {
  greet: ["Hey! 👋", "Hii! What's up?", "Hello! Clear skies today?", "Heyy 🌙"],
  question: ["Hmm good question — let me check and get back to you", "I think so! Want to plan it together?", "Not sure yet 🤔", "Yes, definitely!"],
  thanks: ["Anytime! ✨", "Happy to help 🙂", "No problem!"],
  sky: ["Did you see the Jupiter–Mars pairing? 🪐", "The sky was so clear last night", "Can't wait for the next meteor shower ☄️", "I'm trying to spot the ISS tonight 🛰️"],
  generic: ["Haha nice 😄", "That's so cool!", "Totally agree", "Ooh tell me more", "Love this 💫", "Wow 🤩", "True true", "Let's do it!"],
  post: ["Ooh this is beautiful 😍", "Saving this one!", "Wow, where's this from?", "This is amazing 🔭"],
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function replyFor(msg) {
  if (msg.post) return pick(REPLIES.post);
  if (msg.image) return pick(["Nice shot! 📸", "Whoa, did you take this?", "That looks incredible"]);
  const t = (msg.text || "").toLowerCase();
  if (/\b(hi|hey|hello|hii|yo|namaste)\b/.test(t)) return pick(REPLIES.greet);
  if (/\b(thanks|thank you|thx|ty)\b/.test(t)) return pick(REPLIES.thanks);
  if (t.includes("?")) return pick(REPLIES.question);
  if (/(star|moon|planet|sky|launch|meteor|telescope|isro|nasa|jupiter|mars)/.test(t)) return pick(REPLIES.sky);
  return pick(REPLIES.generic);
}

// Re-attach live people objects after loading from storage.
function hydrate(list) {
  return list.map((c) => ({
    ...c,
    members: (c.members || []).map((m) => people[m.id] || m),
    messages: (c.messages || []).map((m) => ({ ...m })),
  }));
}

export function SocialProvider({ children }) {
  const [posts, setPosts] = useState(initialPosts);
  const [liked, setLiked] = useState(() => new Set());
  const [conversations, setConversations] = useState(initialConversations);
  const [loaded, setLoaded] = useState(false);
  const [typing, setTyping] = useState({}); // convId -> userId
  const activeChat = useRef(null);
  const convRef = useRef(conversations);
  convRef.current = conversations;
  const timers = useRef([]);
  const blockedRef = useRef(new Set());

  // saved posts/reels (ids); a couple of reels saved to start with
  const [saved, setSaved] = useState(() => new Set(["r2", "r3"]));
  // reels you opened, newest first: { id, time }
  const [watched, setWatched] = useState([]);

  // ---------- persistence ----------
  useEffect(() => {
    AsyncStorage.getItem(CHATS_KEY)
      .then((raw) => raw && setConversations(hydrate(JSON.parse(raw))))
      .catch(() => {})
      .finally(() => setLoaded(true));
    return () => timers.current.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => AsyncStorage.setItem(CHATS_KEY, JSON.stringify(conversations)).catch(() => {}), 300);
    return () => clearTimeout(t);
  }, [conversations, loaded]);

  const later = (ms, fn) => timers.current.push(setTimeout(fn, ms));
  const patchConv = useCallback((id, fn) => setConversations((cs) => cs.map((c) => (c.id === id ? fn(c) : c))), []);

  // ---------- feed ----------
  const markWatched = useCallback((id) => {
    setWatched((prev) => [{ id, time: new Date() }, ...prev.filter((w) => w.id !== id)].slice(0, 50));
  }, []);
  const toggleSave = useCallback((id) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const toggleLike = useCallback(
    (postId) => {
      const was = liked.has(postId);
      setLiked((prev) => {
        const next = new Set(prev);
        was ? next.delete(postId) : next.add(postId);
        return next;
      });
      setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, likes: p.likes + (was ? -1 : 1) } : p)));
    },
    [liked]
  );
  const addComment = useCallback((postId, user, text) => {
    setPosts((ps) => ps.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, { id: nextId(), user, text }] } : p)));
  }, []);

  // ---------- chat ----------
  const simulateReply = useCallback(
    (convId, sent, convHint) => {
      // ✓✓ delivered shortly after sending
      later(700, () =>
        patchConv(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === sent.id && m.status === "sent" ? { ...m, status: "delivered" } : m)) }))
      );
      {
        const c = convHint || convRef.current.find((x) => x.id === convId);
        if (!c || !c.members.length) return;
        const replier = c.type === "group" ? pick(c.members) : c.members[0];
        if (blockedRef.current.has(replier.id)) return;
        const isOnline = online.has(replier.id) || c.type === "group";
        const startTyping = isOnline ? 1200 + Math.random() * 800 : 5000 + Math.random() * 3000;
        const typeFor = 1400 + Math.random() * 1600;
        later(startTyping, () => setTyping((t) => ({ ...t, [convId]: replier.id })));
        later(startTyping + typeFor, () => {
          setTyping((t) => {
            const n = { ...t };
            delete n[convId];
            return n;
          });
          const reply = { id: nextId(), from: replier.id, text: replyFor(sent), time: new Date().toISOString(), status: "seen" };
          patchConv(convId, (cc) => ({
            ...cc,
            messages: [...cc.messages.map((m) => (m.from === "me" ? { ...m, status: "seen" } : m)), reply],
            unread: activeChat.current === convId ? 0 : (cc.unread || 0) + 1,
          }));
        });
      }
    },
    [patchConv]
  );

  const sendMessage = useCallback(
    (conversationId, message) => {
      const msg = { id: nextId(), from: "me", time: new Date().toISOString(), status: "sent", ...message };
      patchConv(conversationId, (c) => ({ ...c, messages: [...c.messages, msg] }));
      simulateReply(conversationId, msg);
      return msg;
    },
    [patchConv, simulateReply]
  );

  // Sharing a post to a friend drops it into (or creates) your DM with them.
  const sharePost = useCallback(
    (friend, post) => {
      const id = `dm-${friend.id}`;
      const msg = { id: nextId(), from: "me", time: new Date().toISOString(), status: "sent", post: { id: post.id, text: post.text, author: post.user.name } };
      setConversations((cs) => {
        if (cs.some((c) => c.id === id)) return cs.map((c) => (c.id === id ? { ...c, messages: [...c.messages, msg] } : c));
        return [{ id, type: "dm", members: [friend], unread: 0, messages: [msg] }, ...cs];
      });
      simulateReply(id, msg, { id, type: "dm", members: [friend] });
      return id;
    },
    [simulateReply]
  );

  const react = useCallback(
    (convId, msgId, emoji) =>
      patchConv(convId, (c) => ({
        ...c,
        messages: c.messages.map((m) => {
          if (m.id !== msgId) return m;
          const reactions = { ...(m.reactions || {}) };
          const mine = Object.keys(reactions).find((e) => reactions[e].includes("me"));
          if (mine) reactions[mine] = reactions[mine].filter((u) => u !== "me");
          if (mine !== emoji) reactions[emoji] = [...(reactions[emoji] || []), "me"];
          Object.keys(reactions).forEach((e) => !reactions[e].length && delete reactions[e]);
          return { ...m, reactions };
        }),
      })),
    [patchConv]
  );

  const deleteMessage = useCallback((convId, msgId) => patchConv(convId, (c) => ({ ...c, messages: c.messages.filter((m) => m.id !== msgId) })), [patchConv]);
  const updateConversation = useCallback((convId, patch) => patchConv(convId, (c) => ({ ...c, ...patch })), [patchConv]);
  const clearChat = useCallback((convId) => patchConv(convId, (c) => ({ ...c, messages: [], unread: 0 })), [patchConv]);
  const deleteChat = useCallback((convId) => setConversations((cs) => cs.filter((c) => c.id !== convId)), []);

  const markRead = useCallback((conversationId) => {
    setConversations((cs) => cs.map((c) => (c.id === conversationId && c.unread ? { ...c, unread: 0 } : c)));
  }, []);
  const setActiveChat = useCallback((id) => {
    activeChat.current = id;
  }, []);
  const setBlocked = useCallback((ids) => {
    blockedRef.current = new Set(ids || []);
  }, []);

  const openDm = useCallback((friend) => {
    const id = `dm-${friend.id}`;
    setConversations((cs) => (cs.some((c) => c.id === id) ? cs : [{ id, type: "dm", members: [friend], unread: 0, messages: [] }, ...cs]));
    return id;
  }, []);

  const createGroup = useCallback((name, members) => {
    const id = `grp-${nextId()}`;
    const created = { id: nextId(), from: "system", text: `You created "${name}"`, time: new Date().toISOString() };
    setConversations((cs) => [{ id, type: "group", name, members, unread: 0, messages: [created] }, ...cs]);
    return id;
  }, []);

  const unreadCount = conversations.reduce((n, c) => n + (c.muted ? 0 : c.unread || 0), 0);

  const value = useMemo(
    () => ({
      posts, liked, toggleLike, addComment,
      conversations, sendMessage, sharePost, markRead, openDm, createGroup, react, deleteMessage, updateConversation, clearChat, deleteChat,
      typing, setActiveChat, setBlocked,
      unreadCount, people, saved, toggleSave, watched, markWatched,
    }),
    [posts, liked, toggleLike, addComment, conversations, sendMessage, sharePost, markRead, openDm, createGroup, react, deleteMessage, updateConversation, clearChat, deleteChat, typing, setActiveChat, setBlocked, unreadCount, saved, toggleSave, watched, markWatched]
  );
  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used inside SocialProvider");
  return ctx;
}
