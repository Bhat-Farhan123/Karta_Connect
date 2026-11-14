import React,{useState,useEffect} from 'react';
import { supabase } from '../../lib/supabase';
import {BriefcaseBusiness,AtSign,Heart,Users,Sparkles,ArrowRight,Settings,ChevronRight,MoreHorizontal,Bell} from 'lucide-react';
import {photos} from '../../data';
import {Avatar} from '../../components/ui';
function NotificationsPage({role='Scholar', profile}){
    console.log('NotificationsPage is rendering');

 const profileName = profile?.full_name || profile?.name || 'Karta Scholar';
 console.log('NOTIFICATIONS PROFILE:', profile);
 const profilePhoto = profile?.profileImage || profile?.profile_image || profile?.avatar_url || null;
 const [scholarPhoto, setScholarPhoto] = useState('');

useEffect(() => {
  let cancelled = false;

  const loadScholarPhoto = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('scholar_profiles')
        .select('profile_image_path')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;

      if (!data?.profile_image_path) return;

      const { data: signed, error: imageError } = await supabase.storage
        .from('scholar-media')
        .createSignedUrl(data.profile_image_path, 3600);

      if (imageError) throw imageError;

      if (!cancelled) {
        setScholarPhoto(signed?.signedUrl || '');
      }
    } catch (error) {
      console.error('Unable to load scholar photo:', error);
    }
  };

  loadScholarPhoto();

  return () => {
    cancelled = true;
  };
}, [profile?.id]);
 const profileUniversity = profile?.university || '';
 const profileClass = profile?.graduation || profile?.class_of || '';
 const [tab,setTab]=useState('All');
 const [items,setItems]=useState([
  {id:1,type:'Jobs',unread:true,icon:'job',title:'New opportunity matching your profile',body:'Northstar Labs is looking for an AI Research Intern. Your skills in Python and AI may be a good fit.',time:'1h',action:'View opportunity'},
  {id:2,type:'Mentions',unread:true,icon:'mention',title:'Meera Kapoor mentioned you in a post',body:'“Great collaborating with Farhan on our research discussion. Looking forward to sharing more soon.”',time:'3h',action:'View post'},
  {id:3,type:'My posts',unread:true,icon:'post',title:'Your post is getting noticed',body:'Your recent community update received 12 appreciations and 4 comments.',time:'5h',action:'View analytics'},
  {id:4,type:'All',unread:false,icon:'connection',title:'Aarav Sharma accepted your connection request',body:'You and Aarav are now connected. Start a conversation and exchange ideas.',time:'1d',action:'Message'},
  {id:5,type:'Jobs',unread:false,icon:'job',title:'Your application is under review',body:'Northstar Labs has started reviewing your application for Junior Full-stack Engineer.',time:'2d',action:'View application'},
  {id:6,type:'All',unread:false,icon:'community',title:'Welcome to the Karta community',body:'Discover scholars, follow organizations and find opportunities that help you grow.',time:'3d',action:'Explore community'}
 ]);
 const [filter,setFilter]=useState('All');
 const visible=items.filter(n=>filter==='All'||n.type===filter);
 const unread=items.filter(n=>n.unread).length;
 const markAll=()=>setItems(v=>v.map(n=>({...n,unread:false})));
 const markRead=id=>setItems(v=>v.map(n=>n.id===id?{...n,unread:false}:n));
 const iconFor=t=>t==='job'?<BriefcaseBusiness size={19}/>:t==='mention'?<AtSign size={19}/>:t==='post'?<Heart size={19}/>:t==='connection'?<Users size={19}/>:<Sparkles size={19}/>;
 return <div className="notifications-page">
  <div className="notifications-grid">
   <aside className="notifications-left">
   <section className="notification-profile-card">
 <div
  className="notification-cover"
  style={{
    backgroundImage: "url('/students-cover.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
>
  <span>k.</span>
</div>
 <Avatar
  src={scholarPhoto || profilePhoto}
  initials={profileName.split(' ').map(n=>n[0]).join('').slice(0,2)}
  size="notification-avatar"
  alumni={role==='Alumni'}
 />
 <div className="notification-profile-copy">
  <b>{profileName}</b>
  <span>
   {role==='Alumni'?'Karta Alumni':role==='Scholar'?'Scholar':'Platform member'}
   {profileClass ? ` · Class of ${profileClass}` : ''}
  </span>
  {profileUniversity && <small>{profileUniversity}</small>}
  <button onClick={()=>markAll()}>
   View your activity <ArrowRight size={13}/>
  </button>
 </div>
</section>
    <button className="notification-manage" onClick={()=>setFilter('All')}><Settings size={17}/> Manage notifications <ChevronRight size={17}/></button>
   </aside>
   <main className="notifications-center">
    <div className="notifications-toolbar">
     <div className="notification-tabs" role="tablist" aria-label="Notification filters">
      {['All','Jobs','My posts','Mentions'].map(t=><button key={t} role="tab" aria-selected={filter===t} className={filter===t?'active':''} onClick={()=>setFilter(t)}>{t}</button>)}
     </div>
     <button className="notifications-mark-read" onClick={markAll}>Mark all as read</button>
    </div>
    <div className="notifications-list">
     {visible.map(n=><article key={n.id} className={`notification-item ${n.unread?'unread':''}`}>
      <span className={`notification-item-icon ${n.icon}`}>{iconFor(n.icon)}</span>
      <div className="notification-item-copy"><p><b>{n.title}</b></p><span>{n.body}</span>{n.action&&<button onClick={()=>markRead(n.id)}>{n.action} <ArrowRight size={13}/></button>}</div>
      <div className="notification-item-meta"><time>{n.time}</time><button aria-label="Mark notification as read" onClick={()=>markRead(n.id)}>{n.unread?<span className="notification-unread-dot"/>:<MoreHorizontal size={17}/>}</button></div>
     </article>)}
     {!visible.length&&<div className="notifications-empty"><Bell size={25}/><b>You're all caught up</b><span>New notifications will appear here.</span></div>}
    </div>
   </main>
   <aside className="notifications-right">
    <section className="notification-side-card"><span className="overline">YOUR KARTA COMMUNITY</span><h3>Stay in the loop</h3><p>Important updates about your connections, opportunities and activity will appear here.</p><div className="notification-side-stat"><b>{unread}</b><span>unread notifications</span></div></section>
    <section className="notification-side-card notification-tip"><span className="overline">A GOOD NEXT STEP</span><h3>Keep growing your network</h3><p>Connect with scholars who share your interests and discover new opportunities.</p><span className="notification-tip-mark">k.</span></section>
   </aside>
  </div>
 </div>
}

export default NotificationsPage;
