import React,{useState,useEffect} from 'react';
import { supabase } from '../../lib/supabase';
import {GraduationCap,Building2,Upload,ShieldCheck,Award,Users,MessageSquare,Bookmark,BriefcaseBusiness,Image as ImageIcon,Camera,FileText,CalendarDays,Send,ArrowRight} from 'lucide-react';
import {photos,scholars,opportunities,feed} from '../../data';
import {Avatar,Btn} from '../../components/ui';
import {Welcome,FeedPost,Person,Opportunity} from '../../components/shell';


function Dashboard({role,profile,setPage,posts=feed,onPublish,onViewProfile,onEditPost,PostComposer}) {
  let admin=role==='Admin', org=role==='Organization';

  const [feedTab,setFeedTab]=useState('For you');
  const [adminFeedTab,setAdminFeedTab]=useState('All posts');
  const [adminPostText,setAdminPostText]=useState('');
  const [adminPostImage,setAdminPostImage]=useState('');
  const [adminPostImageFile, setAdminPostImageFile] = useState(null);
  const [scholarPhoto, setScholarPhoto] = useState('');

useEffect(() => {
  let cancelled = false;

  const loadScholarPhoto = async () => {
    if (!profile?.id) {
      setScholarPhoto('');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scholar_profiles')
        .select('profile_image_path')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;

      if (!data?.profile_image_path) {
        if (!cancelled) setScholarPhoto('');
        return;
      }

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

  const profileName = profile?.full_name || profile?.name || 'Karta Scholar';
  const profilePhoto =
  scholarPhoto ||
  profile?.profileImage ||
  profile?.profile_image ||
  profile?.avatar_url ||
  photos.portrait2;
  const profileUniversity = profile?.university || 'University not added';
const profileGraduation = profile?.graduation_year || '';
const profileCourse = profile?.course || profile?.degree || '';

  const visiblePosts=admin
    ?(adminFeedTab==='Scholars'
      ?posts.filter(p=>p.authorType==='Scholar'||(p.field||'').includes('Scholar'))
      :adminFeedTab==='Organizations'
      ?posts.filter(p=>p.authorType==='Organization'||(p.field||'').includes('organization'))
      :adminFeedTab==='Official'
      ?posts.filter(p=>p.name==='Karta Connect'||p.kind==='Official announcement'||p.kind==='Official update')
      :posts)
    :feedTab==='Network'
      ?posts.filter(p=>p.kind!=='Official update'&&p.kind!=='Sponsored')
      :posts;

  return <>
    {admin&&<Welcome role={role} setPage={setPage}/>}

    <div className="dashboard-columns">
      {!org&&<aside className="left-rail">
        {admin?<>
          <section className="profile-summary-card admin-home-profile">
            <div className="admin-profile-colorbar"><span>k.</span></div>
            <div className="profile-summary-body">
              <b>Karta Connect</b>
              <span>Platform administrator</span>
              <small>Building a stronger scholar community</small>
              <button onClick={()=>setPage('Overview')}>Admin overview <ArrowRight size={13}/></button>
            </div>
          </section>

          <section className="left-shortcuts">
            <b>Admin workspace</b>
            <button onClick={()=>setPage('Scholars')}><GraduationCap size={16}/> Manage scholars</button>
            <button onClick={()=>setPage('Organizations')}><Building2 size={16}/> Verify organizations</button>
            <button onClick={()=>setPage('Bulk upload')}><Upload size={16}/> Bulk upload</button>
            <button onClick={()=>setPage('Moderation')}><ShieldCheck size={16}/> Content moderation</button>
            <button className="admin-team-shortcut" onClick={()=>setPage('Alumni Management')}><Award size={16}/> Alumni management <ArrowRight size={14}/></button>
            <button className="admin-team-shortcut" onClick={()=>setPage('Admin management')}><Users size={16}/> Manage admin team <ArrowRight size={14}/></button>
          </section>

          <section className="left-shortcuts admin-community-note">
            <b>Community pulse</b>
            <p>Keep the community active by sharing updates, celebrating scholars and welcoming organizations.</p>
            <button onClick={()=>setPage('Community feed')}><MessageSquare size={16}/> Manage community posts</button>
          </section>
        </>:<>
          <section className="profile-summary-card">
                      <div
            className="profile-summary-cover"
              style={{backgroundImage: "url('/students-cover.jpg')"}}
            />

                        <Avatar
              src={scholarPhoto || photos.portrait2}
              size="profile-summary-avatar"
              alumni={role==='Alumni'}
            />

            <div className="profile-summary-body">
              <b>{profileName}</b>

              <span>
            {role === 'Alumni' ? 'Karta Alumni' : 'Scholar'}
            {profileCourse && ` · ${profileCourse}`}
            <br />
            {profileGraduation && ` Expected graduation: ${profileGraduation}`}
            </span>

              <small>{profileUniversity}</small>

              <button onClick={()=>setPage('My profile')}>
                View my profile <ArrowRight size={13}/>
              </button>
            </div>
          </section>

          <section className="left-shortcuts">
            <b>Quick access</b>
            <button onClick={()=>setPage('My network')}><Users size={16}/> My network</button>
            <button onClick={()=>setPage('Opportunities')}><Bookmark size={16}/> Saved opportunities</button>
            <button onClick={()=>setPage('Opportunities')}><BriefcaseBusiness size={16}/> Explore opportunities</button>
          </section>
                </>}

       

      </aside>}
          
      

      <main className="feed-column">
        <div className="section-top">
          <div>
            <span className="overline">THE LATEST</span>
            <h2>{admin?'Community feed':org?'Your organization':'From your community'}</h2>
          </div>
          <button
  className="manage-feed-btn"
  onClick={()=>setPage(admin?'Community feed':org?'Manage jobs':'Discover')}
>
  {admin ? 'Manage feed' : org ? 'Manage jobs' : 'View all'}
  <ArrowRight size={16}/>
</button>
        </div>

        {admin&&<>
          <section className="quick-compose admin-scholar-composer">
            <textarea
              id="admin-home-post-input"
              className="admin-home-post-input"
              value={adminPostText}
              onChange={e=>setAdminPostText(e.target.value)}
              placeholder="What would you like to share with the Karta community?"
            />

            {adminPostImage&&<div className="admin-feed-image-preview">
              <img src={adminPostImage} alt="Post preview"/>
              <button onClick={()=>setAdminPostImage('')}>Remove image</button>
            </div>}

            <div className="composer-actions admin-home-composer-actions">
              <label>
                <ImageIcon size={19}/> Photo
                <input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be smaller than 10 MB.");
        e.target.value = "";
        return;
      }

      setAdminPostImageFile(file);

      const reader = new FileReader();
      reader.onload = () => setAdminPostImage(String(reader.result));
      reader.readAsDataURL(file);
    }
  }}
/>
              </label>
              <button type="button"><CalendarDays size={18}/> Event</button>
              <Btn disabled={!adminPostText.trim()} onClick={()=>{
                onPublish?.({
                  id:Date.now(),
                  name:'Karta Connect',
                  field:'Official platform',
                  time:'Just now',
                  kind:'Official announcement',
                  text:adminPostText,
                  photo: adminPostImage || null,
imageFile: adminPostImageFile,
                  likes:0,
                  comments:0,
                  authorType:'Official'
                });
                setAdminPostText('');
                setAdminPostImage('');
                setAdminPostImageFile(null);
              }}>
                <Send size={14}/> Publish
              </Btn>
            </div>
          </section>

          <div className="feed-tabs admin-home-feed-tabs" role="tablist" aria-label="Community feed filter">
            {['All posts','Scholars','Organizations','Official'].map(tab=>
              <button
                key={tab}
                role="tab"
                aria-selected={adminFeedTab===tab}
                className={adminFeedTab===tab?'active':''}
                onClick={()=>setAdminFeedTab(tab)}
              >{tab}</button>
            )}
          </div>
        </>}

        {org&&<PostComposer onPublish={onPublish}/>}

        {!admin&&!org&&<div className="feed-tabs" role="tablist" aria-label="Feed filter">
          <button role="tab" aria-selected={feedTab==='For you'} className={feedTab==='For you'?'active':''} onClick={()=>setFeedTab('For you')}>For you</button>
          <button role="tab" aria-selected={feedTab==='Network'} className={feedTab==='Network'?'active':''} onClick={()=>setFeedTab('Network')}>Network</button>
        </div>}

        {!admin&&!org&&<section className="quick-compose v18-composer">
          <div className="composer-top">
            <Avatar
              src={profilePhoto}
              initials={profileName.split(' ').map(n=>n[0]).join('').slice(0,2)}
              alumni={role==='Alumni'}
            />
            <button className="composer-prompt" onClick={()=>setPage('Create post')}>
              Start a post, share an idea or ask your community...
            </button>
          </div>
          <div className="composer-actions">
            <button onClick={()=>setPage('Create post')}><ImageIcon size={19}/> Photo</button>
            <button onClick={()=>setPage('Create post')}><Camera size={19}/> Video</button>
            <button onClick={()=>setPage('Create post')}><FileText size={19}/> Write an article</button>
          </div>
        </section>}

        {visiblePosts.map(p=>(
  <FeedPost
    key={p.id}
    post={p}
    onViewProfile={onViewProfile}
    onEditPost={onEditPost}
  />
))}
      </main>

      <aside className="right-rail">
        <section className="rail-block">
          <div className="rail-heading">
            <div>
              <span className="overline">GOOD PEOPLE, GOOD IDEAS</span>
              <h3>{admin?'Community members':'People to know'}</h3>
            </div>
            <button onClick={()=>setPage('Discover')}>See all</button>
          </div>
          {scholars.slice(0,3).map(p=><Person key={p.name} person={p} onViewProfile={onViewProfile}/>)}
        </section>

        <section className="rail-block jobs-rail">
          <div className="rail-heading">
            <div>
              <span className="overline">MAKE YOUR MOVE</span>
              <h3>{org?'Your open roles':'Picked for you'}</h3>
            </div>
            <button onClick={()=>setPage('Opportunities')}>All jobs</button>
          </div>
          {opportunities.slice(0,2).map(j=><Opportunity key={j.title} job={j}/>)}
        </section>

        <div className="quote-card">
          <span>“</span>
          <p>Alone we can do so little; together we can do so much.</p>
          <small>— Helen Keller</small>
          <div className="quote-decoration"/>
        </div>
      </aside>
    </div>
  </>;
}


export default Dashboard;
