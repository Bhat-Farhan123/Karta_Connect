
import React,{useState,useEffect} from 'react';
import {Image as ImageIcon,AtSign,CalendarDays,ArrowRight,  ArrowLeft,
CheckCircle2} from 'lucide-react';
import {Avatar,Btn,PageHead} from '../../components/ui';
import { supabase } from '../../lib/supabase';

function CreatePost({onPublish, onBack, profile}) {
  let[text,setText]=useState(''),[image,setImage]=useState(''),[imageFile,setImageFile]=useState(null),[kind,setKind]=useState('Community update'),[published,setPublished]=useState(false);

  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPhoto = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('scholar_profiles')
        .select('profile_image_path')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error || !data?.profile_image_path) return;

      const { data: signed, error: imageError } = await supabase.storage
        .from('scholar-media')
        .createSignedUrl(data.profile_image_path, 3600);

      if (!cancelled && !imageError) {
        setProfilePhoto(signed?.signedUrl || '');
      }
    };

    loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);
    return <>
  <button
    type="button"
    onClick={onBack}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: 'none',
      background: 'transparent',
      color: '#245b9e',
      fontWeight: 600,
      cursor: 'pointer',
      marginBottom: '18px'
    }}
  >
    <ArrowLeft size={17} />
    Back to Home
  </button>

  <PageHead
    eyebrow="SHARE WITH YOUR PEOPLE"
    title="Put an idea out into the world."
    sub="A milestone, a question, a little progress — it all belongs here."
  /><section className="create-post"><div className="feed-author"><Avatar src={profilePhoto} initials="FN"/><div><b>Farhan Nisar</b><span>Posting to the Scholar community</span></div></div><select className="post-kind-select" value={kind} onChange={e=>setKind(e.target.value)}><option>Community update</option><option>Achievement</option><option>Research & learning</option><option>Opportunity</option></select><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="What's happening in your world?"/>{image&&<div className="post-image-preview"><img src={image}/><button onClick={()=>setImage('')}>Remove image</button></div>}<div className="create-tools"><label className="create-upload"><ImageIcon/> Add photo<input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)if(f){setImageFile(f);const r=new FileReader();r.onload=()=>setImage(String(r.result));r.readAsDataURL(f)}}}/></label><button type="button"><AtSign/> Mention someone</button><button type="button"><CalendarDays/> Add an event</button><Btn kind="blue" disabled={!text.trim()} onClick={()=>{if(text.trim()){onPublish?.({id:Date.now(),name:'Farhan Nisar',field:'Scholar · Shoolini University',time:'Just now',kind,text,photo:image||null,imageFile:imageFile,likes:0,comments:0});setText('');setImage('');setImageFile(null);setPublished(true)}}}>Publish post <ArrowRight size={15}/></Btn></div>{published&&<p className="published"><CheckCircle2 size={16}/> Your post is now at the top of the community feed.</p>}</section></>}
export default CreatePost;
