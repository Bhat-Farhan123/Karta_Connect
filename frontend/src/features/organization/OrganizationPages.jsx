import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Home, Compass, Users, BriefcaseBusiness, MessageCircle, Bell, Bookmark, Settings, Search, Plus, Heart, MessageSquare, Share2, MoreHorizontal, Menu, X, GraduationCap, Building2, ShieldCheck, ShieldAlert, Upload, ArrowLeft, ArrowRight, ArrowUpRight, LogOut, UserRound, FileText, CheckCircle2, Clock3, Send, MapPin, Sparkles, LayoutDashboard, ChevronRight, SlidersHorizontal, Camera, Image as ImageIcon, AtSign, CalendarDays, Globe2, Mail, ExternalLink, Download, FolderKanban, Award, Pencil, Trash2, PauseCircle, PlayCircle, Eye, Check, Filter, Briefcase, CalendarCheck } from 'lucide-react';
import { photos, scholars, opportunities, feed } from '../../data';
import { cls, Avatar, Btn, Tag, PageHead } from '../../components/ui';
import { Header, Sidebar, Welcome, Metric, Person, FeedPost, Opportunity } from '../../components/shell';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export function OrganizationProfile({
  setPage,
  posts = [],
  onDeletePost,
  onEditPost
}){
  const { user, profile, refreshProfile } = useAuth();
 const [tab,setTab]=useState('Overview'),[editing,setEditing]=useState(false),[saved,setSaved]=useState(false),[logo,setLogo]=useState(''),[cover,setCover]=useState('');
 
const [company, setCompany] = useState({
  name: '',
  tagline: '',
  industry: '',
  website: '',
  location: '',
  size: '',
  founded: '',
  about: '',
  email: '',
  mission: '',
  vision: '',
});

 const [custom,setCustom]=useState([{title:'Our culture',body:'Curiosity, thoughtful collaboration and continuous learning.'}]);
 const [products, setProducts] = useState([]);

useEffect(() => {
  setProducts(profile?.organization?.products_services || []);
}, [profile?.organization?.products_services]);
const [team,setTeam]=useState([]);
 const update=(k,v)=>setCompany(p=>({...p,[k]:v}));
 const [saving, setSaving] = useState(false);
const [saveError, setSaveError] = useState('');

const saveOrganizationProfile = async () => {
  if (!user?.id) {
    setSaveError('You must be logged in to save your profile.');
    return;
  }

  setSaving(true);
  setSaveError('');
  setSaved(false);

  try {
    const { error } = await supabase
      .from('organization_profiles')
      .update({
  organization_name: company.name.trim(),
industry: company.industry.trim(),
tagline: company.tagline.trim(),
website: company.website.trim(),
about: company.about.trim(),
logo_url: logo || null,
cover_url: cover || null,
  city: company.location.split(',')[0]?.trim() || null,
  state: company.location.split(',')[1]?.trim() || null,
  country: company.location.split(',')[2]?.trim() || null,

  public_email: company.email.trim() || null,
  company_size: company.size.trim() || null,
  founded_year: company.founded.trim()
    ? Number(company.founded)
    : null,

  mission: company.mission.trim() || null,
  vision: company.vision.trim() || null,

  updated_at: new Date().toISOString(),
})
      .eq('user_id', user.id);

    if (error) throw error;

    await refreshProfile();

    setEditing(false);
    setSaved(true);
  } catch (error) {
    console.error('Organization profile save error:', error);
    setSaveError(error.message || 'Unable to save organization profile.');
  } finally {
    setSaving(false);
  }
};


const saveProducts = async (nextProducts = products) => {
  if (!user?.id) {
    setSaveError('You must be logged in to save products.');
    return;
  }

  setSaving(true);
  setSaveError('');
  setSaved(false);

  try {
    const { error } = await supabase
      .from('organization_profiles')
      .update({
        products_services: nextProducts,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) throw error;

    await refreshProfile();
    setSaved(true);
  } catch (error) {
    console.error('Products save error:', error);
    setSaveError(error.message || 'Unable to save products and services.');
  } finally {
    setSaving(false);
  }
};
 useEffect(() => {
  const org = profile?.organization;

  if (!org) return;

  const location = [
    org.city,
    org.state,
    org.country,
  ].filter(Boolean).join(', ');

  setCompany({
  name: org.organization_name || '',
  tagline: org.tagline || '',
  industry: org.industry || '',
  website: org.website || '',
  location: [org.city, org.state, org.country]
    .filter(Boolean)
    .join(', '),
  size: org.company_size || '',
  founded: org.founded_year?.toString() || '',
  about: org.about || '',
  email: org.public_email || '',
  mission: org.mission || '',
  vision: org.vision || '',
});

  setLogo(org.logo_url || '');
  setCover(org.cover_url || '');
}, [profile?.organization]);

const pick = async (file, setter, folder) => {
  if (!file) return;

  if (!user?.id) {
    setSaveError('You must be logged in to upload images.');
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    setSaveError('Please upload a JPG, PNG, or WebP image.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setSaveError('Image size must be less than 5 MB.');
    return;
  }

  setSaving(true);
  setSaveError('');
  setSaved(false);

  try {
    const extension =
      file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];

    const filePath = `${user.id}/organization/${folder}-${Date.now()}.${extension}`;

    // Upload image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-media')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profile-media')
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    // Save image URL directly to organization_profiles
    const column = folder === 'logo' ? 'logo_url' : 'cover_url';

    const { error: updateError } = await supabase
      .from('organization_profiles')
      .update({
        [column]: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Update UI and refresh profile data
    setter(imageUrl);
    await refreshProfile();

    setSaved(true);
  } catch (error) {
    console.error('Organization image upload error:', error);
    setSaveError(error.message || 'Image upload failed.');
  } finally {
    setSaving(false);
  }
};

const orgPosts = posts.filter(
  p =>
    p.authorType?.toLowerCase() === 'organization' &&
    p.name?.trim() === company.name?.trim()
);
 const tabs=['Overview','About','Products','Team','Jobs','Activity','More'];
 const field=(label,key)=><label className="kp-field">{label}<input value={company[key]||''} onChange={e=>update(key,e.target.value)}/></label>;

 return <div className="kp-page kp-org-page"><section className="ko-hero" style={{backgroundImage:`linear-gradient(90deg,#102b50c7,#102b5033),url(${cover||photos.team})`}}><label className="kp-cover-edit"><Camera size={14}/> Change banner<input type="file" accept="image/*" onChange={e=>pick(e.target.files?.[0],setCover,'cover')}/></label></section><section className="ko-identity"><div className="ko-logo-wrap">{logo?<img src={logo} alt="Organization logo"/>:<div className="ko-logo">{company.name.slice(0,1)}</div>}<label><Camera size={13}/><input type="file" accept="image/*" onChange={e=>pick(e.target.files?.[0],setLogo,'logo')}/></label></div><div className="ko-copy"><div className="kp-name-row"><h1>{company.name}</h1><Tag tone="green">Verified organization</Tag></div><p>{company.tagline}</p><span><Building2 size={14}/> {company.industry} · {company.location}</span><small><Globe2 size={13}/> {company.website} · {company.size}</small></div><Btn kind="blue" onClick={()=>{setEditing(v=>!v);setSaved(false)}}><Pencil size={14}/>{editing?'Close editor':'Edit company profile'}</Btn></section>
 <nav className="kp-tabs">{tabs.map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</nav>
 {editing&&<section className="kp-editor"><div className="kp-section-head"><div><span className="overline">ORGANIZATION EDITOR</span><h2>Company information</h2></div><Btn
  kind="blue"
  onClick={saveOrganizationProfile}
>
  {saving ? 'Saving...' : 'Save changes'}
  <Check size={14}/>
</Btn></div><div className="kp-form-grid">{field('Organization name','name')}{field('Industry','industry')}{field('Website','website')}{field('Public contact email','email')}{field('Headquarters','location')}{field('Company size','size')}{field('Founded','founded')}{field('Tagline','tagline')}<label className="kp-field kp-wide">About<textarea rows="4" value={company.about} onChange={e=>update('about',e.target.value)}/></label><label className="kp-field">Mission<input value={company.mission} onChange={e=>update('mission',e.target.value)}/></label><label className="kp-field">Vision<input value={company.vision} onChange={e=>update('vision',e.target.value)}/></label></div><small className="kp-note">Karta verification status and legal identity are controlled by Karta Admin and cannot be edited here.</small></section>}
 {saveError && (
  <p className="kp-note" style={{ color: 'red' }}>
    {saveError}
  </p>
)}

{saved && (
  <p className="kp-saved">
    <CheckCircle2 size={15}/> Organization profile saved successfully.
  </p>
)}
 <div className="ko-body"><main>
 {tab==='Overview'&&<><section className="ko-profile-stats"><div><b>{orgPosts.length}</b><span>Community posts</span></div><div><b>{products.length}</b><span>Products & services</span></div><div><b>{team.length}</b><span>Team members</span></div><div><b>{company.founded||'—'}</b><span>Year founded</span></div></section><section className="kp-card"><div className="kp-section-head"><h2>About {company.name}</h2><button onClick={()=>setTab('About')}>Read company story <ArrowRight size={14}/></button></div><p>{company.about}</p><div className="kp-facts"><div><small>Industry</small><b>{company.industry}</b></div><div><small>Headquarters</small><b>{company.location}</b></div><div><small>Company size</small><b>{company.size}</b></div><div><small>Founded</small><b>{company.founded}</b></div></div></section><section className="kp-card"><h2>Mission & vision</h2><div className="kp-facts"><div><small>Mission</small><b>{company.mission}</b></div><div><small>Vision</small><b>{company.vision}</b></div></div></section></>}
 {tab==='About'&&<section className="kp-card"><h2>Company story</h2><p>{company.about}</p><h3>Mission</h3><p>{company.mission}</p><h3>Vision</h3><p>{company.vision}</p></section>}
 {tab==='Products'&&<section className="kp-card"><div className="kp-section-head"><h2>Products & services</h2><button onClick={() => {
  const nextProducts = [
    ...products,
    {
      title: 'New offering',
      description: 'Describe your product or service.',
    },
  ];
  setProducts(nextProducts);
  saveProducts(nextProducts);
}}><Plus size={15}/> Add</button></div> {products.length === 0 ? (
  <div className="kp-empty">
    <Sparkles size={24} />
    <h3>No products or services added yet</h3>
    <p>Introduce your organization's products and services here.</p>
  </div>
) : products.map((x,i)=>(
  <article className="kp-entry" key={i}>
    <div className="kp-entry-icon"><Sparkles/></div>
    <div>
      <h3>{x.title}</h3>
      <p>{x.description}</p>
      <button
  className="kp-inline-edit"
  onClick={async () => {
    const title = prompt('Product or service name', x.title);
    if (title === null) return;

    const description = prompt(
      'Product or service description',
      x.description
    );
    if (description === null) return;

    const nextProducts = products.map((z, j) =>
      j === i ? { ...z, title, description } : z
    );

    setProducts(nextProducts);
    await saveProducts(nextProducts);
  }}
>
  Edit
</button>
    </div>
  </article>
))}</section>}
 {tab==='Team'&&<section className="kp-card"><div className="kp-section-head"><h2>Team & representatives</h2><button onClick={()=>setTeam(v=>[...v,{name:'New team member',role:'Team member'}])}><Plus size={15}/> Add member</button></div>{team.length === 0 ? (
  <div className="kp-empty">
    <Users size={24} />
    <h3>No team members added yet</h3>
    <p>Introduce your organization representatives and team members here.</p>
  </div>
) : team.map((x,i)=>(
  <div className="kp-entry" key={i}>
    <div className="kp-entry-icon"><Users/></div>
    <div>
      <h3>{x.name}</h3>
      <p>{x.role}</p>
    </div>
  </div>
))}</section>}
 {tab==='Jobs'&&<section className="kp-card"><div className="kp-section-head"><h2>Open opportunities</h2><button onClick={()=>setPage('Manage jobs')}>Manage jobs <ArrowRight size={14}/></button></div><p>Explore current openings and applications published by this organization.</p><Btn kind="blue" onClick={()=>setPage('Manage jobs')}>View organization jobs</Btn></section>}
{tab === 'Activity' && (
  <section className="kp-activity">
    <div className="kp-section-head">
      <div>
        <h2>Company activity</h2>
        <span className="kp-muted">
          All updates published by this organization
        </span>
      </div>
      <div className="kp-activity-actions">
        <b>{orgPosts.length} posts</b>
        <button onClick={() => setPage('Community')}>
          Create a post <Plus size={14} />
        </button>
      </div>
    </div>

    {orgPosts.length ? (
      orgPosts.map(p => (
        <div key={p.id} className="kp-managed-post">
          <FeedPost post={p} />
          <div className="kp-post-management">
            <button
              type="button"
              onClick={() => {
                const updatedContent = window.prompt(
                  'Edit your post:',
                  p.content || p.text || ''
                );

                if (updatedContent !== null && updatedContent.trim()) {
                  onEditPost(p.id, { content: updatedContent.trim() });
                }
              }}
            >
              <Pencil size={14} /> Edit
            </button>

            <button
              type="button"
              className="kp-delete-post"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this post?')) {
                  onDeletePost(p.id);
                }
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      ))
    ) : (
      <div className="kp-empty kp-activity-empty">
        <MessageSquare size={24} />
        <h3>No company posts yet</h3>
        <p>Posts published by your organization will appear here automatically.</p>
        <button onClick={() => setPage('Community')}>
          Publish an update <ArrowRight size={14} />
        </button>
      </div>
    )}
  </section>
)}
 {tab==='More'&&<section className="kp-card"><div className="kp-section-head"><h2>Custom company sections</h2><button onClick={()=>setCustom(v=>[...v,{title:'New section',body:'Add your organization information.'}])}><Plus size={15}/> Add section</button></div>{custom.map((x,i)=><article className="kp-entry"><div className="kp-entry-icon"><FileText/></div><div><h3>{x.title}</h3><p>{x.body}</p><button className="kp-inline-edit" onClick={()=>{const title=prompt('Section title',x.title);if(title!==null)setCustom(v=>v.map((z,j)=>j===i?{...z,title}:z))}}>Edit section</button></div></article>)}<div className="kp-empty">Gallery, workplace culture, awards, partnerships and custom content can be added here.</div></section>}
 </main><aside className="kp-side"><section className="kp-card"><h3>Organization information</h3><p><Globe2 size={14}/> {company.website}</p><p><Mail size={14}/> {company.email}</p><p><MapPin size={14}/> {company.location}</p><Tag tone="green">Verified by Karta</Tag></section>
 <section className="kp-card">
  <h3>Organization presence</h3>
  <div className="kp-empty">
    <LayoutDashboard size={22} />
    <p>Organization analytics will appear here once activity data is available.</p>
  </div>
</section></aside></div>
 <p className="kp-disclaimer">Frontend preview · Organization edits and media are local only. Supabase persistence, member permissions, verified status enforcement and real job/activity data are not connected yet.</p></div>;
}
export function OrganizationPublicProfile({organization,onBack,posts=[]}){
 const [tab,setTab]=useState('Overview');
 const org=organization||{};
 const orgPosts=posts.filter(p=>p.authorType==='Organization'||p.name===org.name);
 const tabs=['Overview','About','Jobs','Activity'];
 return <div className="kp-page kp-org-page public-org-page">
  <button className="public-profile-back" onClick={onBack}><ArrowLeft size={16}/> Back to organizations</button>
  <section className="ko-hero" style={{backgroundImage:`linear-gradient(90deg,#102b50c7,#102b5033),url(${photos.team})`}}/>
  <section className="ko-identity"><div className="ko-logo-wrap"><div className="ko-logo">{(org.name||'O').slice(0,1)}</div></div><div className="ko-copy"><div className="kp-name-row"><h1>{org.name||'Karta organization'}</h1><Tag tone="green">Verified organization</Tag></div><p>{org.tagline||'Building opportunities for curious minds.'}</p><span><Building2 size={14}/> {org.industry||'Organization'} · {org.location||'Location not provided'}</span><small><Globe2 size={13}/> {org.website||'Website not provided'} · {org.size||'Organization size not provided'}</small></div></section>
  <div className="public-profile-notice"><ShieldCheck size={15}/> Public organization profile · Private account and administrator information is not displayed.</div>
  <nav className="kp-tabs">{tabs.map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</nav>
  <div className="ko-body"><main>
   {tab==='Overview'&&<><section className="kp-card"><h2>About {org.name}</h2><p>{org.about||'This organization has not added an About section yet.'}</p><div className="kp-facts"><div><small>Industry</small><b>{org.industry||'Not provided'}</b></div><div><small>Location</small><b>{org.location||'Not provided'}</b></div><div><small>Company size</small><b>{org.size||'Not provided'}</b></div><div><small>Founded</small><b>{org.founded||'Not provided'}</b></div></div></section><section className="kp-card"><h2>Mission & vision</h2><div className="kp-facts"><div><small>Mission</small><b>{org.mission||'Not provided'}</b></div><div><small>Vision</small><b>{org.vision||'Not provided'}</b></div></div></section></>}
   {tab==='About'&&<section className="kp-card"><h2>Organization story</h2><p>{org.about||'This organization has not added an About section yet.'}</p><h3>Mission</h3><p>{org.mission||'Not provided'}</p><h3>Vision</h3><p>{org.vision||'Not provided'}</p></section>}
   {tab==='Jobs'&&<section className="kp-card"><h2>Opportunities</h2><p>Explore jobs and internships published by this organization in the Jobs section.</p></section>}
   {tab==='Activity'&&<section className="kp-card"><h2>Organization activity</h2>{orgPosts.length?orgPosts.map(p=><FeedPost key={p.id} post={p}/>):<div className="kp-empty">No public activity has been shared yet.</div>}</section>}
  </main><aside className="kp-side"><section className="kp-card"><h3>Organization information</h3><p><Globe2 size={14}/> {org.website||'Website not provided'}</p><p><MapPin size={14}/> {org.location||'Location not provided'}</p><Tag tone="green">Verified by Karta</Tag></section><section className="kp-card"><h3>Profile visibility</h3><p className="kp-muted">Public organization information is visible to Karta scholars. Private account information remains restricted.</p></section></aside></div>
  <p className="kp-disclaimer">Organization profile preview · Demo information. Live organization data and verified access checks will be connected during backend integration.</p>
 </div>;
}

export function OrganizationTalent({onViewProfile=()=>{}}){
 const [q,setQ]=useState(''),[topic,setTopic]=useState('All areas'),[selected,setSelected]=useState(null),[shortlisted,setShortlisted]=useState([]);
 const topics=['All areas',...new Set(scholars.map(p=>p.topic))];
 const people=scholars.filter(p=>(p.name+' '+p.field+' '+p.topic).toLowerCase().includes(q.toLowerCase())&&(topic==='All areas'||p.topic===topic));
 const toggle=name=>setShortlisted(v=>v.includes(name)?v.filter(x=>x!==name):[...v,name]);
 return <div className="org-talent-page"><PageHead eyebrow="TALENT DISCOVERY" title="Find the people behind great ideas." sub="Explore emerging talent, discover fresh perspectives and build a shortlist for your next opportunity." action={<div className="org-talent-head-stat"><span>YOUR TALENT POOL</span><b>{scholars.length.toString().padStart(2,'0')} <small>scholars</small></b></div>}/><div className="org-talent-toolbar"><div className="search-inline"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search scholars by name, skill or institution"/></div><select value={topic} onChange={e=>setTopic(e.target.value)}>{topics.map(x=><option key={x}>{x}</option>)}</select><span><Users size={14}/>{people.length} matches</span></div><div className="org-talent-section-head"><div><span className="overline">DISCOVER PEOPLE</span><h2>Scholars worth knowing</h2><p>Professional profiles from across the Karta community.</p></div><div className="org-talent-section-note"><ShieldCheck size={15}/> Profiles shared by Karta scholars</div></div><div className="org-talent-grid">{people.map((p,i)=><article className="org-talent-card" key={p.name}><div className="org-talent-card-top"><span className="org-talent-index">0{i+1}</span><span className="org-talent-online"><i/> Karta scholar</span><button className="org-talent-more" aria-label={`More about ${p.name}`} onClick={()=>onViewProfile(p)}><MoreHorizontal size={18}/></button></div><div className="org-talent-person"><Avatar src={p.image} size="org-talent-avatar"/><div className="org-talent-copy"><b>{p.name}</b><span>{p.field}</span><small>{p.institution||p.university||'Karta scholar community'}</small></div></div><div className="org-talent-topic"><Tag>{p.topic}</Tag><span><Users size={13}/>{p.mutual||'New to your network'}</span></div><div className="org-talent-card-foot"><button className="org-secondary-btn" onClick={()=>onViewProfile(p)}>View profile <ArrowUpRight size={14}/></button><button className={shortlisted.includes(p.name)?'org-shortlisted':'org-primary-btn'} onClick={()=>toggle(p.name)}>{shortlisted.includes(p.name)?<><Check size={14}/> Shortlisted</>:<><Plus size={14}/> Shortlist</>}</button></div></article>)}</div>{!people.length&&<div className="empty-discovery"><Search size={25}/><b>No scholars match your search</b><span>Try another name, skill or area of interest.</span></div>}{selected&&<div className="org-modal-backdrop" onClick={()=>setSelected(null)}><section className="org-scholar-modal" onClick={e=>e.stopPropagation()}><button className="org-modal-close" onClick={()=>setSelected(null)}><X size={18}/></button><Avatar src={selected.image} size="org-modal-avatar"/><h2>{selected.name}</h2><p>{selected.field}</p><Tag>{selected.topic}</Tag><p className="org-modal-note">This is a scholar profile preview. Full profile details and resume access will be permission-checked through Supabase after backend integration.</p><Btn kind="blue" onClick={()=>toggle(selected.name)}>{shortlisted.includes(selected.name)?'Remove from shortlist':'Add to shortlist'}</Btn></section></div>}</div>;
}
export function OrganizationPostComposer({onPublish}){
  const { profile } = useAuth();
const organizationName = profile?.organization?.organization_name || 'Organization';
 const [text,setText]=useState('');
const [image,setImage]=useState('');
const [imageFile,setImageFile]=useState(null);
const [kind,setKind]=useState('Company update'),[expanded,setExpanded]=useState(false),[notice,setNotice]=useState(''),[tab,setTab]=useState('For you');
 const pick = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;

  if (!f.type.startsWith('image/')) {
    setNotice('Please choose an image file.');
    return;
  }

  if (f.size > 5 * 1024 * 1024) {
    setNotice('Please choose an image smaller than 5 MB.');
    return;
  }

  setImageFile(f);

  const r = new FileReader();
  r.onload = () => {
    setImage(String(r.result));
    setExpanded(true);
  };
  r.readAsDataURL(f);
};
const publish = () => {
  if (!text.trim()) return;

  onPublish?.({
    id: Date.now(),
    name: organizationName,
    field: 'Verified organization',
    time: 'Just now',
    kind,
    text,
    photo: image || null,
    imageFile: imageFile || null,
    likes: 0,
    comments: 0,
    authorType: 'Organization',
  });

  setText('');
  setImage('');
  setImageFile(null);
  setExpanded(false);
  setNotice('Post published to the Scholar feed.');
};
 const openEditor=article=>{setExpanded(true);setNotice('');if(article)setKind('Company update')};
 return <section className="org-post-composer org-linkedin-composer">
  <div className="org-composer-tabs" role="tablist" aria-label="Organization feed">
   {['For you','Network'].map(t=><button key={t} role="tab" aria-selected={tab===t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}
  </div>
  <div className="org-composer-inline">
   <div className="org-brand-mark org-composer-avatar">
  {profile?.organization?.logo_url ? (
    <img
      src={profile.organization.logo_url}
      alt={`${organizationName} logo`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '50%',
      }}
    />
  ) : (
    organizationName.slice(0, 1).toUpperCase()
  )}
</div>
   {!expanded&&<button className="org-composer-prompt" onClick={()=>openEditor(false)}>Start a post, share an idea or ask your community...</button>}
   {expanded&&<div className="org-composer-expanded-inline">
    <div className="org-composer-editor-top"><span>Share with the Karta community</span><button onClick={()=>setExpanded(false)} aria-label="Close composer"><X size={16}/></button></div>
    <select value={kind} onChange={e=>setKind(e.target.value)}><option>Company update</option><option>Event announcement</option><option>Research & innovation</option><option>Hiring announcement</option></select>
    <textarea autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="What would you like to share with scholars?"/>
    {image&&<div className="org-post-preview"><img src={image} alt="Post preview"/><button onClick={()=>setImage('')}><X size={14}/> Remove image</button></div>}
    {notice&&notice!=='Post published to the Scholar feed.'&&<small className="org-form-error">{notice}</small>}
    <div className="org-composer-foot"><label className="org-secondary-btn"><ImageIcon size={15}/> Add photo<input type="file" accept="image/*" onChange={pick}/></label><span>Images up to 5 MB</span><button className="org-secondary-btn org-composer-cancel" onClick={()=>{setExpanded(false);setText('');setImage('')}}>Cancel</button><button className="org-primary-btn" disabled={!text.trim()} onClick={publish}><Send size={14}/> Publish</button></div>
   </div>}
  </div>
  {!expanded&&<div className="org-composer-actions">
   <label className="org-composer-action photo"><ImageIcon size={19}/> Photo<input type="file" accept="image/*" onChange={pick}/></label>
   <button onClick={()=>{setExpanded(true);setNotice('Video posting is not available yet. You can share a photo or a text update.')}}><Camera size={19}/> Video</button>
   <button onClick={()=>openEditor(true)}><FileText size={19}/> Write an article</button>
  </div>}
  {notice==='Post published to the Scholar feed.'&&<div className="org-success"><CheckCircle2 size={14}/>{notice}</div>}
 </section>
}
export function OrganizationCommunity({posts,setPosts,onPublish}){
  const { profile } = useAuth();
const organizationName = profile?.organization?.organization_name || 'Organization';
 const mine=posts.filter(p=>p.authorType==='Organization');
 return <><PageHead eyebrow="ORGANIZATION COMMUNITY" title="Your voice in the Karta community." sub="Share company updates, event announcements, research stories and hiring news with scholars."/><OrganizationPostComposer onPublish={onPublish}/><div className="org-list-toolbar"><div><h2>Published updates</h2><p>Posts shared by your organization with scholars.</p></div><span>{mine.length} posts</span></div><div className="org-community-posts">{mine.map(p=><article className="org-community-post" key={p.id}><div className="feed-author"><div className="org-brand-mark small">
  {organizationName.slice(0, 1).toUpperCase()}
</div><div className="feed-author-meta"><b>{p.name}</b><span>{p.kind} · {p.time}</span></div><button className="dots" title="Delete post" onClick={()=>setPosts(v=>v.filter(x=>x.id!==p.id))}><Trash2 size={16}/></button></div><p>{p.text}</p>{p.photo&&<img src={p.photo} alt="Organization post"/>}<small><Heart size={12}/> {p.likes||0} appreciations · {p.comments||0} comments</small></article>)}</div>{!mine.length&&<div className="empty-discovery"><MessageSquare size={25}/><b>No organization posts yet</b><span>Publish your first update to introduce your organization to scholars.</span></div>}</>;
}
export function OrganizationJobs({jobs,setJobs,onViewApplicants}){
  const { profile } = useAuth();
const organizationName = profile?.organization?.organization_name || 'Organization';
 const blank={title:'',type:'Internship',location:'Remote · India',pay:'',description:'',deadline:'',requirements:'',image:''};
 const [editing,setEditing]=useState(null),[form,setForm]=useState(blank),[filter,setFilter]=useState('All'),[notice,setNotice]=useState('');
 const startNew=()=>{setEditing('new');setForm(blank);setNotice('')};
 const startEdit=j=>{setEditing(j.id);setForm({...j})};
 const save=()=>{if(!form.title.trim()||!form.description.trim()){setNotice('Add an opportunity title and description before publishing.');return}if(editing==='new'){setJobs(v=>[{...form,id:Date.now(),company: organizationName,status:'Active',applicants:0,created:'Just now'},...v]);setNotice('Your opportunity has been published in this preview.')}else{setJobs(v=>v.map(j=>j.id===editing?{...j,...form}:j));setNotice('Your changes have been saved in this preview.')}setEditing(null);setForm(blank)};
 const toggleStatus=id=>setJobs(v=>v.map(j=>j.id===id?{...j,status:j.status==='Active'?'Paused':'Active'}:j));
 const remove=id=>{if(window.confirm('Delete this opportunity?'))setJobs(v=>v.filter(j=>j.id!==id))};
 const shown=jobs.filter(j=>filter==='All'||j.status===filter);
 return <><PageHead eyebrow="OPPORTUNITY MANAGEMENT" title="Create opportunities. Find your next great hire." sub="Publish internships and jobs, keep listings up to date and track the interest they receive." action={<Btn kind="blue" onClick={startNew}><Plus size={16}/> Create opportunity</Btn>}/>
 <div className="org-jobs-welcome"><div className="org-jobs-welcome-mark"><BriefcaseBusiness size={22}/></div><div><b>Your next great teammate could be one opportunity away.</b><span>Keep your listings fresh and make it easy for talented scholars to find you.</span></div><span className="org-jobs-welcome-tag"><Sparkles size={14}/> Hiring workspace</span></div><div className="org-job-metrics"><div className="metric-active"><span><i><BriefcaseBusiness size={16}/></i> ACTIVE LISTINGS</span><b>{jobs.filter(j=>j.status==='Active').length}</b><small>Opportunities open now</small></div><div className="metric-applications"><span><i><Users size={16}/></i> TOTAL APPLICATIONS</span><b>{jobs.reduce((n,j)=>n+(j.applicants||0),0)}</b><small>Scholars interested in your roles</small></div><div className="metric-paused"><span><i><PauseCircle size={16}/></i> PAUSED / CLOSED</span><b>{jobs.filter(j=>j.status!=='Active').length}</b><small>Listings not accepting applications</small></div></div>
 {notice&&<div className="org-success"><CheckCircle2 size={16}/>{notice}<button onClick={()=>setNotice('')}><X size={14}/></button></div>}
 {editing!==null&&<section className="org-editor"><div className="org-section-title"><div><span className="overline">{editing==='new'?'NEW LISTING':'EDIT LISTING'}</span><h2>{editing==='new'?'Create a job or internship':'Update opportunity details'}</h2></div><button onClick={()=>setEditing(null)}><X size={18}/></button></div><div className="org-form-grid"><label className="org-form-wide">Opportunity title<input value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))} placeholder="e.g. AI Research Intern"/></label><label>Type<select value={form.type} onChange={e=>setForm(v=>({...v,type:e.target.value}))}>{['Internship','Full-time','Part-time','Research','Contract'].map(x=><option key={x}>{x}</option>)}</select></label><label>Location<input value={form.location} onChange={e=>setForm(v=>({...v,location:e.target.value}))} placeholder="Remote · India"/></label><label>Stipend / salary<input value={form.pay} onChange={e=>setForm(v=>({...v,pay:e.target.value}))} placeholder="e.g. ₹15,000–20,000 / month"/></label><label>Application deadline<input type="date" value={form.deadline||''} onChange={e=>setForm(v=>({...v,deadline:e.target.value}))}/></label><label className="org-form-wide">Opportunity image<input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f&&f.size<=5*1024*1024){const r=new FileReader();r.onload=()=>setForm(v=>({...v,image:String(r.result)}));r.readAsDataURL(f)}}}/>{form.image&&<img className="org-job-image-preview" src={form.image} alt="Opportunity preview"/>}</label><label className="org-form-wide">Description<textarea rows="4" value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))} placeholder="Describe the role, responsibilities and what the scholar will learn..."/></label><label className="org-form-wide">Skills / requirements<textarea rows="2" value={form.requirements||''} onChange={e=>setForm(v=>({...v,requirements:e.target.value}))} placeholder="e.g. Python, communication, research skills"/></label></div><div className="org-editor-foot"><span>Preview only · Listings will be stored in Supabase after backend integration.</span><div><button className="org-secondary-btn" onClick={()=>setEditing(null)}>Cancel</button><Btn kind="blue" onClick={save}>{editing==='new'?'Publish opportunity':'Save changes'} <ArrowRight size={15}/></Btn></div></div></section>}
 <div className="org-list-toolbar"><div><span className="overline">YOUR HIRING PIPELINE</span><h2>Opportunities</h2><p>Manage every role published by your organization.</p></div><div className="tabs">{['All','Active','Paused'].map(x=><button key={x} className={filter===x?'chosen':''} onClick={()=>setFilter(x)}>{x}<small>{x==='All'?jobs.length:jobs.filter(j=>j.status===x).length}</small></button>)}</div></div>
 <div className="org-listings">{shown.map((j,index)=><article className="org-listing-row" key={j.id}><div className="org-listing-icon"><BriefcaseBusiness size={21}/><span>{String(index+1).padStart(2,'0')}</span></div><div className="org-listing-main"><div className="org-listing-title-line"><b>{j.title}</b><Tag tone={j.status==='Active'?'green':'orange'}>{j.status||'Active'}</Tag></div><span>{j.type} <i/> {j.location}</span><small>{j.pay||'Compensation discussed'} {j.deadline?'· Apply by '+j.deadline:''}</small></div><button className="org-listing-stats org-applicant-count" title="View applicants for this opportunity" onClick={()=>onViewApplicants?.(j.title)}><b>{j.applicants||0}</b><small><Users size={11}/> Applicants</small></button><div className="org-listing-actions"><button title="View applicants" onClick={()=>onViewApplicants?.(j.title)}><ArrowUpRight size={16}/></button><button title="Edit" onClick={()=>startEdit(j)}><Pencil size={15}/></button><button title={j.status==='Active'?'Pause':'Activate'} onClick={()=>toggleStatus(j.id)}>{j.status==='Active'?<PauseCircle size={16}/>:<PlayCircle size={16}/>}</button><button title="Delete" onClick={()=>remove(j.id)}><Trash2 size={15}/></button></div></article>)}{!shown.length&&<div className="empty-discovery"><BriefcaseBusiness size={25}/><b>No listings in this view</b><span>Create an opportunity or choose another filter.</span></div>}</div>
 </>;
}
export function OrganizationApplicants({jobs,applicants,setApplicants,selectedJob,setSelectedJob,onStatusChange,setPage,onMessageCandidate}){
 const [q,setQ]=useState(''),[filter,setFilter]=useState('All'),[selected,setSelected]=useState(null),[reviewNote,setReviewNote]=useState(''),[profileTab,setProfileTab]=useState('Overview'),[selectedIds,setSelectedIds]=useState([]),[sort,setSort]=useState('Newest first');
 const statuses=['All','New','Reviewing','Shortlisted','Selected','Rejected'];
 const filtered=applicants.filter(a=>(a.name+' '+a.role+' '+a.institution+' '+(a.field||'')+' '+(a.skills||'')+' '+(a.email||'')).toLowerCase().includes(q.toLowerCase())&&(filter==='All'||a.status===filter)&&(!selectedJob||a.role===selectedJob)).sort((a,b)=>sort==='Name A–Z'?a.name.localeCompare(b.name):sort==='Role A–Z'?a.role.localeCompare(b.role):0);
 useEffect(()=>{if(!selected)return;const previous=document.body.style.overflow;const previousHtml=document.documentElement.style.overflow;document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';return()=>{document.body.style.overflow=previous;document.documentElement.style.overflow=previousHtml}},[selected]);
 const count=s=>applicants.filter(a=>a.status===s).length;
 const changeStatus=(id,status,extra={})=>{const target=applicants.find(a=>a.id===id);setApplicants(v=>v.map(a=>a.id===id?{...a,status,...extra}:a));if(target?.applicationId)onStatusChange?.(target.applicationId,status);setSelected(v=>v?.id===id?{...v,status,...extra}:v)};
 const selectJob=title=>{setSelectedJob(title||null);setSelectedIds([])};
 const toggleApplicant=id=>setSelectedIds(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
 const toggleAll=()=>setSelectedIds(v=>filtered.length&&filtered.every(a=>v.includes(a.id))?v.filter(id=>!filtered.some(a=>a.id===id)):[...new Set([...v,...filtered.map(a=>a.id)])]);
 const bulkUpdate=status=>{if(!selectedIds.length)return;const targets=applicants.filter(a=>selectedIds.includes(a.id));setApplicants(v=>v.map(a=>selectedIds.includes(a.id)?{...a,status}:a));targets.forEach(a=>{if(a.applicationId)onStatusChange?.(a.applicationId,status)});setSelectedIds([])};

 return <div className="recruitment-dashboard">
  <div className="recruitment-heading"><div><span className="recruitment-eyebrow">HIRING WORKSPACE</span><h1>Recruitment dashboard</h1><p>Manage open roles, review applications and move great candidates forward.</p></div><div className="recruitment-heading-actions"><Btn kind="outline" onClick={()=>setPage?.('Manage jobs')}>Manage jobs <BriefcaseBusiness size={14}/></Btn><Btn kind="outline" onClick={()=>selectJob(null)}>All applicants <ArrowRight size={14}/></Btn></div></div>
  <div className="recruitment-stats">
   <article><span>Total applicants</span><b>{applicants.length}</b><small>Across all open roles</small></article>
   <article><span>Needs review</span><b>{count('New')+count('Reviewing')}</b><small>New and in-review candidates</small></article>
   <article><span>Shortlisted</span><b>{count('Shortlisted')}</b><small>Promising candidates</small></article>
   <article><span>New applications</span><b>{count('New')}</b><small>Awaiting first review</small></article><article><span>Selected</span><b>{count('Selected')}</b><small>Successful candidates</small></article>
  </div>
  <section className="recruitment-jobs-section"><div className="recruitment-section-head"><div><span className="recruitment-eyebrow">YOUR OPEN ROLES</span><h2>Hiring by opportunity</h2></div><span>{jobs.filter(j=>j.status==='Active').length} active listings</span></div>
   <div className="recruitment-job-grid">{jobs.map(j=><article key={j.id} className={`recruitment-job-card ${selectedJob===j.title?'selected':''}`}><div className="recruitment-job-top"><Tag tone={j.status==='Active'?'green':'orange'}>{j.status||'Active'}</Tag><span><Users size={14}/> {applicants.filter(a=>a.role===j.title).length} applicants</span></div><h3>{j.title}</h3><p>{j.type||'Opportunity'} · {j.location||j.place||'Location not specified'}</p><div className="recruitment-job-progress"><span style={{width:`${Math.min(100,(applicants.filter(a=>a.role===j.title).length/Math.max(1,applicants.length))*100)}%`}}/></div><button onClick={()=>selectJob(selectedJob===j.title?null:j.title)}>{selectedJob===j.title?'Showing applicants':'View applicants'} <ArrowRight size={13}/></button></article>)}
    {!jobs.length&&<div className="empty-discovery">No opportunities published yet. Create a job to start receiving applicants.</div>}</div>
  </section>
  <section className="recruitment-candidates-section"><div className="recruitment-section-head"><div><span className="recruitment-eyebrow">CANDIDATE PIPELINE</span><h2>{selectedJob?`Applicants for ${selectedJob}`:'All applicants'}</h2></div>{selectedJob&&<button className="recruitment-clear" onClick={()=>selectJob(null)}>Clear job filter <X size={13}/></button>}</div>
   <div className="recruitment-toolbar"><div className="recruitment-search"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, university, skill, email or role"/></div><label className="recruitment-sort">Sort <select value={sort} onChange={e=>setSort(e.target.value)}><option>Newest first</option><option>Name A–Z</option><option>Role A–Z</option></select></label><div className="recruitment-status-tabs">{statuses.map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}{x!=='All'&&<small>{count(x)}</small>}</button>)}</div></div>
   <div className="recruitment-bulkbar"><label><input type="checkbox" checked={filtered.length>0&&filtered.every(a=>selectedIds.includes(a.id))} onChange={toggleAll}/> Select all shown <span>{selectedIds.length} selected</span></label><div><button disabled={!selectedIds.length} onClick={()=>bulkUpdate('Shortlisted')}>Shortlist selected</button><button disabled={!selectedIds.length} onClick={()=>bulkUpdate('Rejected')}>Reject selected</button></div></div><div className="recruitment-candidate-list">{filtered.map(a=><article className="recruitment-candidate" key={a.id}><input className="recruitment-row-check" aria-label={`Select ${a.name}`} type="checkbox" checked={selectedIds.includes(a.id)} onChange={()=>toggleApplicant(a.id)}/><Avatar src={a.image}/><div className="recruitment-candidate-info"><b>{a.name}</b><span>{a.institution} · {a.field}</span><small>{a.role} · Applied {a.applied}</small></div><div className="recruitment-candidate-status"><Tag tone={a.status==='Rejected'?'orange':a.status==='Shortlisted'?'green':'blue'}>{a.status}</Tag></div><select aria-label={'Update status for '+a.name} value={a.status} onChange={e=>changeStatus(a.id,e.target.value)}>{statuses.slice(1).map(x=><option key={x}>{x}</option>)}</select><button className="recruitment-review-btn" onClick={()=>{setSelected(a);setProfileTab('Overview');setReviewNote(a.reviewNote||'')}}>Review candidate <ArrowRight size={14}/></button></article>)}{!filtered.length&&<div className="recruitment-empty"><Users size={25}/><b>No matching applicants</b><span>Try a different search, status or job filter.</span></div>}</div>
  </section>
  {selected&&createPortal(<div className="org-modal-backdrop" onClick={()=>setSelected(null)}><section className="org-scholar-modal org-app-modal recruitment-review-modal" onClick={e=>e.stopPropagation()}><button className="org-modal-close" onClick={()=>setSelected(null)}><X size={18}/></button><div className="recruitment-review-head"><Avatar src={selected.image} size="org-modal-avatar"/><div><h2>{selected.name}</h2><p>{selected.field} · {selected.institution}</p><Tag>{selected.status}</Tag></div></div><div className="recruitment-review-grid"><div><span>Applied role</span><b>{selected.role}</b></div><div><span>Applied</span><b>{selected.applied}</b></div><div><span>Email</span><b>{selected.email||'Not provided'}</b></div><div><span>Resume</span><b>{selected.resumeName||selected.resume?.name||'Not attached'}</b></div></div><div className="candidate-profile-tabs">{['Overview','Education','Experience','Projects','Skills','Achievements'].map(t=><button key={t} className={profileTab===t?'active':''} onClick={()=>setProfileTab(t)}>{t}</button>)}</div><div className="candidate-profile-content">{profileTab==='Overview'?<><div className="candidate-profile-intro"><span>ABOUT THE SCHOLAR</span><p>{selected.about||`${selected.name} is a Karta scholar applicant interested in ${selected.field||'their field'}. Explore the sections to review the academic and professional information available in their profile.`}</p></div><div className="candidate-profile-facts"><div><small>University</small><b>{selected.institution||'Not provided'}</b></div><div><small>Area of study</small><b>{selected.field||'Not provided'}</b></div><div><small>Graduation year</small><b>{selected.graduationYear||'Not provided'}</b></div><div><small>Location</small><b>{selected.location||'Not provided'}</b></div></div></>:profileTab==='Education'?<div className="candidate-profile-entry"><GraduationCap/><div><b>{selected.degree||selected.field||'Academic qualification'}</b><span>{selected.institution||'Institution not provided'}</span><small>{selected.graduationYear?`Expected graduation ${selected.graduationYear}`:'Graduation year not provided'}{selected.cgpa?` · CGPA ${selected.cgpa}`:''}</small></div></div>:profileTab==='Experience'?<div className="candidate-profile-empty"><BriefcaseBusiness/><b>Experience details</b><span>{selected.experience||'No work experience has been included in this demo applicant record. Full experience entries will appear here when available on the scholar profile.'}</span></div>:profileTab==='Projects'?<div className="candidate-profile-empty"><FolderKanban/><b>Projects and portfolio</b><span>{selected.projects||'Project descriptions, technologies and portfolio links will be displayed here when provided by the scholar.'}</span></div>:profileTab==='Skills'?<div className="candidate-profile-skills">{(selected.skills||[selected.field||'Relevant subject knowledge','Communication','Problem solving']).toString().split(',').map(x=><span key={x}>{x.trim()}</span>)}</div>:<div className="candidate-profile-empty"><Award/><b>Achievements and certifications</b><span>{selected.achievements||'No achievements or certifications have been added to this demo applicant profile yet.'}</span></div>}</div>{(selected.resumeData||selected.resume?.data)&&<div className="org-modal-actions"><a className="org-secondary-btn" href={selected.resumeData||selected.resume.data} download={selected.resumeName||selected.resume?.name||'candidate-resume.pdf'}><Download size={15}/> Download resume</a><a className="org-secondary-btn" href={selected.resumeData||selected.resume.data} target="_blank" rel="noreferrer"><Eye size={15}/> Preview resume</a></div>}{selected.coverLetter&&<div className="recruitment-cover-letter"><span>Cover letter</span><p>{selected.coverLetter}</p></div>}<label className="recruitment-note-label">Internal review notes<textarea value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder="Add feedback for your hiring team..."/></label><div className="org-modal-actions recruitment-decision-actions"><Btn kind="outline" onClick={()=>{onMessageCandidate?.(selected);setSelected(null);setPage?.('Messages')}}><MessageCircle size={15}/> Message candidate</Btn><Btn kind="outline" onClick={()=>{changeStatus(selected.id,'Reviewing',{reviewNote});setSelected(null)}}>Move to review</Btn><Btn kind="outline" onClick={()=>{changeStatus(selected.id,'Rejected',{reviewNote});setSelected(null)}}>Reject</Btn><Btn kind="blue" onClick={()=>{changeStatus(selected.id,'Shortlisted',{reviewNote});setSelected(null)}}>Shortlist</Btn></div><p className="org-modal-note">Demo mode: review notes and candidate conversations are held in local app state. Backend permissions will enforce organization-initiated messaging.</p></section></div>,document.body)}
 </div>;
}

