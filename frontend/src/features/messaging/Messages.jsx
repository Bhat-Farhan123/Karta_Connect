import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, ArrowRight, MoreHorizontal, Send, Search, X, Check,
  MessageCircle, Trash2, BellOff, CheckCheck
} from 'lucide-react';
import { scholars } from '../../data';
import { Avatar, PageHead } from '../../components/ui';

const starterMessages = (person) => [
  {
    id: `${person.name}-welcome`,
    from: 'them',
    text: `Hi Farhan! Great to connect with you. I'd love to hear more about your projects.`,
    time: '10:24 AM',
  },
  {
    id: `${person.name}-reply`,
    from: 'me',
    text: `Hey ${person.name.split(' ')[0]}! Thanks for reaching out. Happy to share more.`,
    time: '10:31 AM',
  },
];

const initialRequests = [
  { id: 'req-1', name: 'Ishita Malhotra', field: 'Product Strategy · Ashoka University', image: scholars[1]?.image, note: 'Would like to connect and discuss your AI projects.' },
  { id: 'req-2', name: 'Kabir Sethi', field: 'Computer Science · BITS Pilani', image: scholars[3]?.image, note: 'Found your profile through the scholar network.' },
];

function Messages({ initialPerson }) {
  const firstPerson = initialPerson || scholars[0];
  const [contacts, setContacts] = useState(() => {
    const list = [...scholars];
    return list.some((person) => person.name === firstPerson.name) ? list : [firstPerson, ...list];
  });
  const [active, setActive] = useState(firstPerson);
  const [draft, setDraft] = useState('');
  const [conversations, setConversations] = useState(() =>
    Object.fromEntries([...scholars, ...(firstPerson ? [firstPerson] : [])].map((person) => [person.name, starterMessages(person)]))
  );
  const [requests, setRequests] = useState(initialRequests);
  const [showRequests, setShowRequests] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const activeMessages = conversations[active.name] || [];
  const availablePeople = useMemo(
    () => scholars.filter((person) => person.name.toLowerCase().includes(contactSearch.toLowerCase())),
    [contactSearch]
  );

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [active.name, activeMessages.length]);

  const selectContact = (person) => {
    setActive(person);
    setDraft('');
    setMenuOpen(false);
    setShowNewChat(false);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const clean = draft.trim();
    if (!clean) return;
    const message = { id: `msg-${Date.now()}`, from: 'me', text: clean, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setConversations((current) => ({ ...current, [active.name]: [...(current[active.name] || []), message] }));
    setDraft('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const acceptRequest = (request) => {
    const person = { name: request.name, field: request.field, image: request.image, topic: request.field };
    setContacts((current) => current.some((item) => item.name === person.name) ? current : [person, ...current]);
    setConversations((current) => ({ ...current, [person.name]: [{ id: `${person.name}-accepted`, from: 'them', text: 'Thanks for connecting! Looking forward to staying in touch.', time: 'Just now' }] }));
    setRequests((current) => current.filter((item) => item.id !== request.id));
    selectContact(person);
    setShowRequests(false);
  };

  const removeConversation = () => {
    setContacts((current) => current.filter((person) => person.name !== active.name));
    setConversations((current) => {
      const next = { ...current };
      delete next[active.name];
      return next;
    });
    const nextPerson = contacts.find((person) => person.name !== active.name);
    if (nextPerson) setActive(nextPerson);
    setMenuOpen(false);
  };

  const getPreview = (person) => {
    const messages = conversations[person.name] || [];
    return messages.length ? messages[messages.length - 1].text : 'Start a conversation';
  };

  return (
    <>
      <PageHead eyebrow="ONE CONVERSATION AWAY" title="Messages" sub="Good collaborations often start with a simple hello." />
      <section className="messages" aria-label="Messages">
        <aside className="message-list">
          <h3>
            Conversations
            <button className="message-icon-button" type="button" aria-label="Start a new conversation" title="New conversation" onClick={() => { setShowNewChat(true); setContactSearch(''); }}><Plus size={18} /></button>
          </h3>
          <div className="conversation-items">
            {contacts.map((person) => (
              <button key={person.name} type="button" className={active.name === person.name ? 'selected-chat' : ''} onClick={() => selectContact(person)}>
                <Avatar src={person.image} />
                <span><b>{person.name}</b><small>{getPreview(person)}</small></span>
                <i>{active.name === person.name ? 'Active' : ' '}</i>
              </button>
            ))}
            {!contacts.length && <div className="message-empty">No conversations yet. Start a new one.</div>}
          </div>
          <div className="requests">
            <b>Message requests · {requests.length}</b>
            <p>New people would like to connect.</p>
            <button type="button" onClick={() => setShowRequests(true)}>Review requests <ArrowRight size={14} /></button>
          </div>
        </aside>

        <div className="chat">
          {active ? <>
            <div className="chat-title">
              <Avatar src={active.image} />
              <span><b>{active.name}</b><small>{active.field}</small></span>
              <div className="chat-menu-wrap">
                <button type="button" className="message-icon-button" aria-label="Conversation options" onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={20} /></button>
                {menuOpen && <div className="chat-options-menu">
                  <button type="button" onClick={() => { setMuted((value) => !value); setMenuOpen(false); }}><BellOff size={15} /> {muted ? 'Unmute conversation' : 'Mute conversation'}</button>
                  <button type="button" onClick={() => { setMenuOpen(false); setShowRequests(true); }}><MessageCircle size={15} /> Message requests</button>
                  <button type="button" className="danger" onClick={removeConversation}><Trash2 size={15} /> Delete conversation</button>
                </div>}
              </div>
            </div>
            <div className="chat-messages" ref={messagesRef}>
              <small className="today">TODAY</small>
              {activeMessages.map((message) => (
                <div key={message.id} className={`message ${message.from === 'me' ? 'mine' : 'received'}`}>
                  <span>{message.text}</span>
                  <small className="message-time">{message.time}{message.from === 'me' && <CheckCheck size={12} />}</small>
                </div>
              ))}
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a thoughtful message..." aria-label="Write a message" />
              <button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={17} /></button>
            </form>
          </> : <div className="message-empty chat-empty"><MessageCircle size={30} /><b>Select a conversation</b><span>Choose someone from your conversations to start messaging.</span></div>}
        </div>
      </section>

      {showNewChat && <div className="message-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowNewChat(false); }}>
        <section className="message-modal" role="dialog" aria-modal="true" aria-labelledby="new-chat-title">
          <div className="message-modal-head"><div><h2 id="new-chat-title">New conversation</h2><p>Choose a scholar to start a conversation.</p></div><button type="button" className="message-icon-button" onClick={() => setShowNewChat(false)} aria-label="Close"><X size={19} /></button></div>
          <label className="message-search"><Search size={17} /><input autoFocus value={contactSearch} onChange={(event) => setContactSearch(event.target.value)} placeholder="Search scholars..." /></label>
          <div className="message-modal-list">
            {availablePeople.map((person) => <button key={person.name} type="button" onClick={() => { setContacts((current) => current.some((item) => item.name === person.name) ? current : [person, ...current]); setConversations((current) => ({ ...current, [person.name]: current[person.name] || [] })); selectContact(person); }}><Avatar src={person.image} /><span><b>{person.name}</b><small>{person.field}</small></span><small>{contacts.some((item) => item.name === person.name) ? 'Open chat' : 'New chat'}</small><ArrowRight size={16} /></button>)}
            {!availablePeople.length && <p className="message-empty">No new scholars found.</p>}
          </div>
        </section>
      </div>}

      {showRequests && <div className="message-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowRequests(false); }}>
        <section className="message-modal" role="dialog" aria-modal="true" aria-labelledby="requests-title">
          <div className="message-modal-head"><div><h2 id="requests-title">Message requests</h2><p>Accept requests from scholars you'd like to connect with.</p></div><button type="button" className="message-icon-button" onClick={() => setShowRequests(false)} aria-label="Close"><X size={19} /></button></div>
          <div className="message-modal-list">
            {requests.map((request) => <div className="message-request-row" key={request.id}><Avatar src={request.image} /><div className="message-request-copy"><b>{request.name}</b><small>{request.field}</small><p>{request.note}</p><div><button type="button" className="request-accept" onClick={() => acceptRequest(request)}><Check size={14} /> Accept</button><button type="button" className="request-decline" onClick={() => setRequests((current) => current.filter((item) => item.id !== request.id))}>Decline</button></div></div></div>)}
            {!requests.length && <p className="message-empty">You're all caught up. No pending requests.</p>}
          </div>
        </section>
      </div>}
    </>
  );
}

export default Messages;
