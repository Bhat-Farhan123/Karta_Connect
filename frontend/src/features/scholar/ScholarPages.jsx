import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { createPortal } from 'react-dom';
import { Home, Compass, Users, BriefcaseBusiness, MessageCircle, Bell, Bookmark, Settings, Search, Plus, Heart, MessageSquare, Share2, MoreHorizontal, Menu, X, GraduationCap, Building2, ShieldCheck, ShieldAlert, Upload, ArrowLeft, ArrowRight, ArrowUpRight, LogOut, UserRound, FileText, CheckCircle2, Clock3, Send, MapPin, Sparkles, LayoutDashboard, ChevronRight, SlidersHorizontal, Camera, Image as ImageIcon, AtSign, CalendarDays, Globe2, Mail, ExternalLink, Download, FolderKanban, Award, Pencil, Trash2, PauseCircle, PlayCircle, Eye, Check, Filter, Briefcase, CalendarCheck } from 'lucide-react';
import { photos, scholars, opportunities, feed } from '../../data';
import { cls, Avatar, Btn, Tag, PageHead } from '../../components/ui';
import { Header, Sidebar, Welcome, Metric, Person, FeedPost, Opportunity } from '../../components/shell';

import { Star } from 'lucide-react';
import { updatePost, deletePost } from '../../services/postService';

export function Discover({posts=feed,onViewOrganization=()=>{},onViewProfile=()=>{}}){
 const [tab,setTab]=useState('Scholars'),[q,setQ]=useState(''),[field,setField]=useState('All specializations'),[institution,setInstitution]=useState('All universities'),[degree,setDegree]=useState('All degrees'),[year,setYear]=useState('All years'),[graduation,setGraduation]=useState('Any year'),[location,setLocation]=useState('All locations'),[skill,setSkill]=useState(''),[interest,setInterest]=useState('All interests'),[sort,setSort]=useState('Recommended'),[showFilters,setShowFilters]=useState(true),[requests,setRequests]=useState([]);
 const academic={
  'Aarav Sharma':{degree:'B.Tech',course:'Computer Science & Engineering',specialization:'Artificial Intelligence',year:'4th Year',graduation:'2027',location:'Delhi, India',skills:'Python, Machine Learning, Research, AI',interests:'Research, Artificial Intelligence'},
  'Meera Kapoor':{degree:'B.Tech',course:'Biotechnology',specialization:'Life Sciences',year:'3rd Year',graduation:'2028',location:'Solan, Himachal Pradesh',skills:'Biotechnology, Laboratory Research, Python',interests:'Research, Life Sciences'},
  'Zoya Khan':{degree:'B.Des',course:'Product Design',specialization:'Design & Creativity',year:'3rd Year',graduation:'2028',location:'New Delhi, India',skills:'Figma, UI/UX, Prototyping, Visual Design',interests:'Design, Creativity, Technology'},
  'Rohan Verma':{degree:'B.Tech',course:'Data Science',specialization:'Data Science',year:'4th Year',graduation:'2027',location:'Pilani, Rajasthan',skills:'Python, SQL, Data Analysis, Machine Learning',interests:'Data Science, Artificial Intelligence'}
 };
 const meta=p=>({university:(p.field.split('·')[1]||'').trim(),...(academic[p.name]||{degree:'Other',course:p.field.split('·')[0].trim(),specialization:p.topic,year:'Not specified',graduation:'Not specified',location:'India',skills:'',interests:p.topic})});
 const values=(key,all)=>[all,...new Set(scholars.map(p=>meta(p)[key]).filter(Boolean))];
 const fields=values('specialization','All specializations'),institutions=values('university','All universities'),degrees=values('degree','All degrees'),years=values('year','All years'),gradYears=values('graduation','Any year'),locations=values('location','All locations'),interests=values('interests','All interests');
 const activeCount=[field!=='All specializations',institution!=='All universities',degree!=='All degrees',year!=='All years',graduation!=='Any year',location!=='All locations',!!skill.trim(),interest!=='All interests'].filter(Boolean).length;
 const people=scholars.filter(p=>{const m=meta(p);const text=[p.name,p.field,p.topic,m.university,m.degree,m.course,m.specialization,m.year,m.graduation,m.location,m.skills,m.interests].join(' ').toLowerCase();return text.includes(q.toLowerCase())&&(field==='All specializations'||m.specialization===field)&&(institution==='All universities'||m.university===institution)&&(degree==='All degrees'||m.degree===degree)&&(year==='All years'||m.year===year)&&(graduation==='Any year'||m.graduation===graduation)&&(location==='All locations'||m.location===location)&&(!skill.trim()||m.skills.toLowerCase().includes(skill.toLowerCase()))&&(interest==='All interests'||m.interests.split(', ').includes(interest));}).sort((a,b)=>sort==='Name A–Z'?a.name.localeCompare(b.name):0);
 const clearFilters=()=>{setQ('');setField('All specializations');setInstitution('All universities');setDegree('All degrees');setYear('All years');setGraduation('Any year');setLocation('All locations');setSkill('');setInterest('All interests');setSort('Recommended')};
 const toggleRequest=name=>setRequests(prev=>prev.includes(name)?prev.filter(x=>x!==name):[...prev,name]);
 return <><PageHead eyebrow="FIND YOUR PEOPLE" title="Discover scholars" sub="Find peers by university, course, skills, academic year and shared interests."/>
 <div className="discover-tools discover-tools-v4"><div className="tabs">{['Scholars','Organizations','Posts'].map(x=><button key={x} className={tab===x?'chosen':''} onClick={()=>setTab(x)}>{x}</button>)}</div><div className="search-inline"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search scholar name, course, skill or university..."/></div></div>
 {tab==='Scholars'?<><div className="discover-summary"><span><b>{people.length}</b> scholars found</span><label className="discover-sort">Sort by <select value={sort} onChange={e=>setSort(e.target.value)}><option>Recommended</option><option>Name A–Z</option></select></label></div>{people.length?<div className="scholar-grid">{people.map(p=><ScholarCard key={p.name} p={p} requested={requests.includes(p.name)} onConnect={()=>toggleRequest(p.name)} onViewProfile={onViewProfile} />)}</div>:<div className="empty-discovery"><Search size={25}/><b>No scholars found</b><span>Try broadening your filters or clearing some selections.</span><button className="text-action" onClick={clearFilters}>Clear all filters</button></div>}</>:tab==='Organizations'?<div className="org-grid">{['Northstar Labs','GreenCell Research','Orbit Studio'].map((n,i)=><div className="org-tile" key={n}><img src={[photos.lab,photos.research,photos.design][i]}/><div><Tag tone="green">Verified organization</Tag><h3>{n}</h3><p>Building opportunities for curious minds.</p><Btn kind="outline" onClick={()=>onViewOrganization({name:n,industry:['Technology & Artificial Intelligence','Life Sciences Research','Product Design'][i],location:['Bengaluru, India','Solan, India','New Delhi, India'][i],tagline:'Building opportunities for curious minds.',about:'Learn more about this organization, its work, team and opportunities on Karta Connect.',website:'',size:'',founded:'',mission:'',vision:''})}>View organization</Btn></div></div>)}</div>:posts.map(p=><FeedPost post={p} key={p.id}/>)}</>;
}
export function ScholarCard({p,requested=false,onConnect=()=>{},onViewProfile=()=>{}}){return <article className="scholar-card scholar-card-v4"><div className="scholar-cover" style={{backgroundImage:`url(${p.topic==='Life Sciences'?photos.research:p.topic==='Design & Creativity'?photos.design:photos.hero})`}}/><Avatar src={p.image} size="large-avatar"/><div className="scholar-card-body"><h3>{p.name}</h3><p>{p.field}</p><Tag tone="blue">{p.topic}</Tag><div className="mutual">{p.mutual}</div><button className="scholar-full-profile-link" onClick={()=>onViewProfile(p)}>View full profile <ArrowRight size={14}/></button><div className="scholar-card-actions"><button className={cls('connect-btn',requested&&'connected')} onClick={onConnect}>{requested?<><CheckCircle2 size={15}/> Request sent</>:<><Plus size={15}/> Connect</>}</button><button className="view-profile-btn" onClick={()=>onViewProfile(p)}>View profile</button></div></div></article>}
export function Profile({userProfile,setPage,posts=[],alumniRequest=null,onRequestAlumni=()=>{},role='Scholar'}){
 const [tab,setTab]=useState('About'),[editing,setEditing]=useState(false),[saved,setSaved]=useState(false);
const [profile, setProfile] = useState({
  name: userProfile?.full_name || 'Scholar',
  headline: '',
  location: '',
  university: '',
  state: '',
  city: '',
  country: 'India',
  degree: '',
  course: '',
  specialization: '',
  year: '',
  semester: '',
  enrollment: '',
  graduation: '',
  cgpa: '',
  about: '',
  email: userProfile?.email || '',
  phone: '',
  showEmail: false,
  showPhone: false
});
const [profileLoading, setProfileLoading] = useState(true);
const [profileSaving, setProfileSaving] = useState(false);
const [profileError, setProfileError] = useState('');
const [editingPost, setEditingPost] = useState(null);
const [editPostContent, setEditPostContent] = useState('');
const [editPostImage, setEditPostImage] = useState(null);
const [removePostImage, setRemovePostImage] = useState(false);
const [savingPost, setSavingPost] = useState(false);
const [activityPosts, setActivityPosts] = useState(posts);

useEffect(() => {
  setActivityPosts(posts);
}, [posts]);

const handleEditPost = (post) => {
  setEditingPost(post);
  setEditPostContent(post.content || post.text || '');
  setEditPostImage(null);
  setRemovePostImage(false);
};

const handleSaveEditedPost = async () => {
  if (!editingPost || !editPostContent.trim()) return;

  setSavingPost(true);

  try {
    await updatePost(editingPost.id, {
      content: editPostContent.trim(),
      imageFile: editPostImage,
      removeImage: removePostImage
    });

    setActivityPosts(current =>
      current.map(post =>
        post.id === editingPost.id
          ? {
              ...post,
              content: editPostContent.trim(),
              text: editPostContent.trim()
            }
          : post
      )
    );

    setEditingPost(null);
    setEditPostContent('');
    setEditPostImage(null);
    setRemovePostImage(false);
  } catch (error) {
    console.error('Failed to update post:', error);
    alert(error.message || 'Unable to update post.');
  } finally {
    setSavingPost(false);
  }
};

const handleDeletePost = async (post) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this post? This action cannot be undone.'
  );

  if (!confirmed) return;

  try {
    await deletePost(post.id);
    setActivityPosts(current => current.filter(p => p.id !== post.id));
    alert('Post deleted successfully.');
  } catch (error) {
    console.error('Failed to delete post:', error);
    alert(error.message || 'Unable to delete post.');
  }
};


useEffect(() => {
  let cancelled = false;

  const loadScholarProfile = async () => {
    if (!userProfile?.id) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError('');

    try {
      const { data, error } = await supabase
        .from('scholar_profiles')
        .select('*')
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (error) throw error;
      if (cancelled) return;

      if (data) {
        setProfile(current => ({
          ...current,
          headline: data.headline || '',
          about: data.about || '',
          university: data.university || '',
          degree: data.degree || '',
          course: data.course || '',
          specialization: data.specialization || '',
          year: data.academic_year || '',
          semester: data.semester || '',
          enrollment: data.enrollment_year?.toString() || '',
          graduation: data.graduation_year?.toString() || '',
          cgpa: data.cgpa || '',
          phone: data.phone || '',
          showEmail: data.show_email ?? false,
          showPhone: data.show_phone ?? false,
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'India',
          location: [data.city, data.state, data.country]
            .filter(Boolean)
            .join(', ')
        }));

        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setExperience(Array.isArray(data.experience) ? data.experience : []);
        setAchievements(Array.isArray(data.achievements) ? data.achievements : []);
        const savedCertifications = Array.isArray(data.certifications)
  ? data.certifications
  : [];

const certificationItems = await Promise.all(
  savedCertifications.map(async cert => {
    if (!cert.file_path) return cert;

    const { data: signed, error: signedError } = await supabase.storage
      .from('scholar-certificates')
      .createSignedUrl(cert.file_path, 3600);

    return {
      ...cert,
      file_url: signedError ? '' : signed?.signedUrl || ''
    };
  })
);

if (cancelled) return;
setCerts(certificationItems);
        setCustom(Array.isArray(data.custom_sections) ? data.custom_sections : []);

        setProfileImagePath(data.profile_image_path || '');
        setCoverImagePath(data.cover_image_path || '');

        const imagePaths = [
          data.profile_image_path,
          data.cover_image_path
        ].filter(Boolean);

        if (imagePaths.length) {
          const [profileResult, coverResult] = await Promise.all([
            data.profile_image_path
              ? supabase.storage
                  .from('scholar-media')
                  .createSignedUrl(data.profile_image_path, 3600)
              : Promise.resolve({ data: null, error: null }),

            data.cover_image_path
              ? supabase.storage
                  .from('scholar-media')
                  .createSignedUrl(data.cover_image_path, 3600)
              : Promise.resolve({ data: null, error: null })
          ]);

          if (cancelled) return;

          setProfileImage(profileResult.data?.signedUrl || '');
          setCoverImage(coverResult.data?.signedUrl || '');
        } else {
          setProfileImage('');
          setCoverImage('');
        }

        const savedResumes = Array.isArray(data.resumes)
          ? data.resumes
          : [];

        const resumeItems = await Promise.all(
          savedResumes.map(async resume => {
            const { data: signed, error: signedError } =
              await supabase.storage
                .from('resumes')
                .createSignedUrl(resume.path, 3600);

            return {
              ...resume,
              url: signedError ? '' : signed?.signedUrl || ''
            };
          })
        );

        if (cancelled) return;

        setResumes(resumeItems);
        setPrimaryResume(data.primary_resume_path || '');
      }
    } catch (error) {
      if (!cancelled) {
        setProfileError(error.message || 'Unable to load your profile.');
      }
    } finally {
      if (!cancelled) setProfileLoading(false);
    }
  };

  loadScholarProfile();

  return () => {
    cancelled = true;
  };
}, [userProfile?.id]);

const [profileImage,setProfileImage]=useState('');
const [coverImage,setCoverImage]=useState('');
const [profileImagePath, setProfileImagePath] = useState('');
const [coverImagePath, setCoverImagePath] = useState('');
const [profileImageFile,setProfileImageFile]=useState(null);
const [coverImageFile,setCoverImageFile]=useState(null);
const [skills,setSkills]=useState([]);
const [experience,setExperience]=useState([]);
const [projects,setProjects]=useState([]);
const [achievements,setAchievements]=useState([]);
 const [certs,setCerts]=useState([]),[resumes,setResumes]=useState([]),[primaryResume,setPrimaryResume]=useState('');
 const [custom,setCustom]=useState([{title:'Leadership & volunteering',body:'University cricket team vice-captain and community activities.'}]);
 const [showContact,setShowContact]=useState(false),[suggestions,setSuggestions]=useState(true);
 const pickImage = (file, setter, fileSetter) => {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    setProfileError('Please select a valid image file.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setProfileError('Image size must be less than 5 MB.');
    return;
  }

  setProfileError('');

  const reader = new FileReader();
  reader.onload = () => setter(String(reader.result));
  reader.readAsDataURL(file);

  fileSetter(file);
  setSaved(false);
};
 const update=(k,v)=>{setProfile(x=>({...x,[k]:v}));setSaved(false)};
 
const saveScholarProfile = async () => {
  if (!userProfile?.id) {
    setProfileError('Your account could not be identified. Please sign in again.');
    return;
  }

  setProfileSaving(true);
  setProfileError('');
  setSaved(false);

  const newlyUploadedPaths = [];

  const toYear = value => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return null;

    const parsed = Number(cleaned);
    return Number.isInteger(parsed) ? parsed : null;
  };

  const uploadProfileImage = async (file, folder) => {
    if (!file) return null;

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${userProfile.id}/${folder}/${Date.now()}_${safeName}`;

    const { error } = await supabase.storage
      .from('scholar-media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;

    newlyUploadedPaths.push(path);
    return path;
  };

  try {
    const uploadedProfilePath = await uploadProfileImage(
      profileImageFile,
      'profile'
    );

    const uploadedCoverPath = await uploadProfileImage(
      coverImageFile,
      'cover'
    );

    const nextProfilePath = uploadedProfilePath || profileImagePath || null;
    const nextCoverPath = uploadedCoverPath || coverImagePath || null;

    const { error: dbError } = await supabase
      .from('scholar_profiles')
      .upsert({
        user_id: userProfile.id,

        headline: profile.headline.trim() || null,
        about: profile.about.trim() || null,

        university: profile.university.trim() || null,
        degree: profile.degree.trim() || null,
        course: profile.course.trim() || null,
        specialization: profile.specialization.trim() || null,

        academic_year: profile.year.trim() || null,
        semester: profile.semester.trim() || null,
        enrollment_year: toYear(profile.enrollment),
        graduation_year: toYear(profile.graduation),
        cgpa: profile.cgpa.trim() || null,

        phone: profile.phone.trim() || null,
        show_email: Boolean(profile.showEmail),
        show_phone: Boolean(profile.showPhone),

        city: profile.city.trim() || null,
        state: profile.state.trim() || null,
        country: profile.country.trim() || 'India',

        profile_image_path: nextProfilePath,
        cover_image_path: nextCoverPath,

        skills,
        projects,
        experience,
        achievements,
        certifications: certs.map(({ file_url, ...cert }) => cert),
        custom_sections: custom,

        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) throw dbError;

    // Remove replaced images only after the database save succeeds.
    const oldPathsToRemove = [];

    if (uploadedProfilePath && profileImagePath) {
      oldPathsToRemove.push(profileImagePath);
    }

    if (uploadedCoverPath && coverImagePath) {
      oldPathsToRemove.push(coverImagePath);
    }

    if (oldPathsToRemove.length) {
      await supabase.storage
        .from('scholar-media')
        .remove(oldPathsToRemove);
    }

    setProfileImagePath(nextProfilePath || '');
    setCoverImagePath(nextCoverPath || '');

    // Generate fresh signed URLs for the newly saved images.
    if (nextProfilePath) {
      const { data } = await supabase.storage
        .from('scholar-media')
        .createSignedUrl(nextProfilePath, 3600);

      if (data?.signedUrl) setProfileImage(data.signedUrl);
    }

    if (nextCoverPath) {
      const { data } = await supabase.storage
        .from('scholar-media')
        .createSignedUrl(nextCoverPath, 3600);

      if (data?.signedUrl) setCoverImage(data.signedUrl);
    }

    setProfileImageFile(null);
    setCoverImageFile(null);

    setSaved(true);
    setEditing(false);
  } catch (error) {
    // Clean up newly uploaded files if the profile save fails.
    if (newlyUploadedPaths.length) {
      await supabase.storage
        .from('scholar-media')
        .remove(newlyUploadedPaths);
    }

    setProfileError(error.message || 'Unable to save your profile. Please try again.');
  } finally {
    setProfileSaving(false);
  }
};


const uploadCertificateFile = async (index, file) => {
  if (!file) return;

  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.type)) {
    setResumeNotice('Upload a PDF, JPG, PNG or WebP certificate.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setResumeNotice('Certificate must be smaller than 5 MB.');
    return;
  }

  if (!userProfile?.id) {
    setResumeNotice('Please sign in again.');
    return;
  }

  setResumeSaving(true);

  let uploadedPath = '';

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    uploadedPath = `${userProfile.id}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('scholar-certificates')
      .upload(uploadedPath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    const { data: signed, error: signedError } = await supabase.storage
      .from('scholar-certificates')
      .createSignedUrl(uploadedPath, 3600);

    if (signedError) throw signedError;

    const nextCerts = certs.map((cert, i) =>
      i === index
        ? {
            ...cert,
            file_name: file.name,
            file_path: uploadedPath,
            file_url: signed?.signedUrl || '',
            file_size: file.size,
            uploaded_at: new Date().toISOString()
          }
        : cert
    );

    const { error: dbError } = await supabase
      .from('scholar_profiles')
      .upsert({
        user_id: userProfile.id,
        certifications: nextCerts.map(({ file_url, ...cert }) => cert),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) throw dbError;

    setCerts(nextCerts);
    setResumeNotice('Certificate uploaded and saved successfully.');
  } catch (error) {
    if (uploadedPath) {
      await supabase.storage
        .from('scholar-certificates')
        .remove([uploadedPath]);
    }

    setResumeNotice(error.message || 'Certificate upload failed.');
  } finally {
    setResumeSaving(false);
  }
};

const deleteCertificate = async index => {
  const cert = certs[index];

  if (!cert) return;

  if (!window.confirm(`Delete "${cert.name || cert.title || 'this certificate'}"?`)) {
    return;
  }

  const nextCerts = certs.filter((_, i) => i !== index);

  setResumeSaving(true);

  try {
    const { error: dbError } = await supabase
      .from('scholar_profiles')
      .upsert({
        user_id: userProfile.id,
        certifications: nextCerts.map(({ file_url, ...item }) => item),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) throw dbError;

    setCerts(nextCerts);

    if (cert.file_path) {
      const { error: storageError } = await supabase.storage
        .from('scholar-certificates')
        .remove([cert.file_path]);

      if (storageError) {
        setResumeNotice(
          `Certificate record deleted, but file cleanup failed: ${storageError.message}`
        );
        return;
      }
    }

    setResumeNotice('Certificate deleted successfully.');
  } catch (error) {
    setResumeNotice(error.message || 'Unable to delete certificate.');
  } finally {
    setResumeSaving(false);
  }
};


 const addRow=(setter,shape)=>setter(v=>[...v,shape]);
 
const hasText = value =>
  typeof value === 'string' && value.trim().length > 0;

const strengthItems = [
  { label: 'Professional headline', complete: hasText(profile.headline), tab: 'About', editor: true },
  { label: 'About section', complete: hasText(profile.about), tab: 'About', editor: true },
  { label: 'University', complete: hasText(profile.university), tab: 'Education', editor: true },
  { label: 'Degree', complete: hasText(profile.degree), tab: 'Education', editor: true },
  { label: 'Course', complete: hasText(profile.course), tab: 'Education', editor: true },
  { label: 'Specialization', complete: hasText(profile.specialization), tab: 'Education', editor: true },
  { label: 'Academic year', complete: hasText(profile.year), tab: 'Education', editor: true },
  { label: 'Semester', complete: hasText(profile.semester), tab: 'Education', editor: true },
  { label: 'Graduation year', complete: hasText(profile.graduation), tab: 'Education', editor: true },
  { label: 'Location', complete: hasText(profile.city) || hasText(profile.state), tab: 'About', editor: true },
  { label: 'Profile photo', complete: Boolean(profileImagePath || profileImage), tab: 'About', editor: true },
  { label: 'Cover image', complete: Boolean(coverImagePath || coverImage), tab: 'About', editor: true },
  { label: 'Experience', complete: experience.some(x => hasText(x.title) && hasText(x.company)), tab: 'Experience' },
  { label: 'Projects', complete: projects.some(x => hasText(x.title) && hasText(x.description)), tab: 'Projects' },
  { label: 'Skills', complete: skills.some(x => hasText(x.name)), tab: 'Skills' },
  { label: 'Achievements', complete: achievements.some(x => hasText(x.title)), tab: 'Achievements' },
  { label: 'Certifications', complete: certs.some(x => hasText(x.name || x.title)), tab: 'Certifications' },
  { label: 'Resume', complete: resumes.some(x => hasText(x.path)), tab: 'More' }
];

const strengthFields = strengthItems.filter(item => item.complete).length;
const strength = Math.round((strengthFields / strengthItems.length) * 100);
const missingItems = strengthItems.filter(item => !item.complete);

 const tabs=['About','Education','Experience','Projects','Skills','Achievements','Certifications','Activity','More'];
 const [resumeSaving, setResumeSaving] = useState(false);
const [resumeNotice, setResumeNotice] = useState('');
useEffect(() => {
  if (!resumeNotice) return;
  const timer = setTimeout(() => setResumeNotice(''), 3500);
  return () => clearTimeout(timer);
}, [resumeNotice]);

const uploadResume = async e => {
  const file = e.target.files?.[0];
  e.target.value = '';

  if (!file) return;

  const allowed = /\.(pdf|doc|docx)$/i.test(file.name);

  if (!allowed) {
    setResumeNotice('Only PDF, DOC and DOCX files are allowed.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setResumeNotice('Resume must be smaller than 5 MB.');
    return;
  }

  if (!userProfile?.id) {
    setResumeNotice('Please sign in again.');
    return;
  }

  setResumeSaving(true);
  setResumeNotice('');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userProfile.id}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    setResumeNotice(uploadError.message);
    setResumeSaving(false);
    return;
  }

  const newResume = {
    id: path,
    name: file.name,
    path,
    size: file.size,
    uploaded_at: new Date().toISOString()
  };

  const nextResumes = [...resumes, newResume];

const resumeMetadata = nextResumes.map(({ url, ...r }) => r);

const nextPrimary = primaryResume || path;

  const { error: dbError } = await supabase
    .from('scholar_profiles')
    .update({
  resumes: resumeMetadata,
  primary_resume_path: nextPrimary
})
    .eq('user_id', userProfile.id);

  if (dbError) {
    await supabase.storage.from('resumes').remove([path]);
    setResumeNotice(dbError.message);
    setResumeSaving(false);
    return;
  }

  const { data: signed } = await supabase.storage
    .from('resumes')
    .createSignedUrl(path, 3600);

  setResumes([...nextResumes,].map(r =>
    r.path === path ? { ...r, url: signed?.signedUrl || '' } : r
  ));
  setPrimaryResume(nextPrimary);
  setResumeNotice('Resume uploaded successfully.');
  setResumeSaving(false);
};

const openPrimaryResume = async () => {
  const primary = resumes.find(r => r.path === primaryResume);

  if (!primary) {
  setResumeNotice('Please upload a resume first to view your primary resume.');
  return;
}

  // Open a blank tab immediately to avoid popup blocking.
  const previewWindow = window.open('', '_blank');

  if (!previewWindow) {
    setResumeNotice('Please allow pop-ups to preview your resume.');
    return;
  }

  const { data, error } = await supabase.storage
    .from('resumes')
    .createSignedUrl(primary.path, 3600);

  if (error || !data?.signedUrl) {
    previewWindow.close();
    setResumeNotice('Unable to open your resume. Please try again.');
    return;
  }

  previewWindow.location.href = data.signedUrl;
};

const makePrimaryResume = async path => {
  const { error } = await supabase
    .from('scholar_profiles')
    .update({ primary_resume_path: path })
    .eq('user_id', userProfile.id);

  if (error) {
    setResumeNotice(error.message);
    return;
  }

  setPrimaryResume(path);
  setResumeNotice('Primary resume updated.');
};

const deleteResume = async resume => {
  if (!window.confirm(`Delete "${resume.name}"?`)) return;

  const nextResumes = resumes.filter(r => r.path !== resume.path);
  const nextPrimary = primaryResume === resume.path
    ? (nextResumes[0]?.path || '')
    : primaryResume;

  const { error: dbError } = await supabase
    .from('scholar_profiles')
    .update({
      resumes: nextResumes.map(({ url, ...r }) => r),
      primary_resume_path: nextPrimary || null
    })
    .eq('user_id', userProfile.id);

  if (dbError) {
    setResumeNotice(dbError.message);
    return;
  }

  const { error: storageError } = await supabase.storage
    .from('resumes')
    .remove([resume.path]);

  setResumes(nextResumes);
  setPrimaryResume(nextPrimary);

  setResumeNotice(
    storageError
      ? `Resume metadata deleted, but file cleanup failed: ${storageError.message}`
      : 'Resume deleted successfully.'
  );
};
 const field=(label,key,placeholder='')=><label className="kp-field">{label}<input value={profile[key]||''} placeholder={placeholder} onChange={e=>update(key,e.target.value)}/></label>;
 return <>
  {resumeNotice && createPortal(
    <div className="resume-toast">
      <div className="resume-toast-icon"><FileText size={20}/></div>
      <div className="resume-toast-content">
        <strong>Profile notification</strong>
        <span>{resumeNotice}</span>
      </div>
      <button onClick={() => setResumeNotice('')}><X size={18}/></button>
    </div>,
    document.body
  )}
  <div className="kp-page">
  <section className="kp-hero" style={{backgroundImage:`linear-gradient(100deg,#102b50b8,#1e4c7b44),url(${coverImage||''})`}}><label className="kp-cover-edit"><Camera size={14}/> Change cover<input type="file" accept="image/*" onChange={e=>pickImage(e.target.files?.[0],setCoverImage,setCoverImageFile)}/></label></section>
  <section className="kp-identity">
  <div className="kp-avatar-wrap">
    <Avatar
      src={profileImage || undefined}
      initials=""
      size="kp-avatar"
      alumni={role === 'Alumni'}
    />
    <label className="kp-photo-edit">
      <Camera size={13}/>
      <input
        type="file"
        accept="image/*"
        onChange={e => pickImage(e.target.files?.[0], setProfileImage, setProfileImageFile)}
      />
    </label>
  </div><div className="kp-identity-copy"><div className="kp-name-row">
  <h1>
    {profile.name}
    
  </h1>

  <Tag tone="green">
    {role === 'Alumni' ? 'Karta Alumni' : 'Karta scholar'}
  </Tag>
</div>{profile.headline && <p>{profile.headline}</p>}

{(profile.university || profile.city || profile.state) && (
  <span>
    <GraduationCap size={14}/>
    {[profile.university, profile.city, profile.state].filter(Boolean).join(' · ')}
  </span>
)}

{(profile.degree || profile.course || profile.year || profile.graduation) && (
  <small>
    {[profile.degree, profile.course, profile.year, profile.graduation && `Class of ${profile.graduation}`]
      .filter(Boolean)
      .join(' · ')}
  </small>
)}</div><div className="kp-identity-actions">
  <Btn kind="outline" onClick={()=>setEditing(v=>!v)}>
    <Pencil size={14}/>
    {editing?'Close editor':'Edit profile'}
  </Btn>

  <Btn kind="blue" onClick={openPrimaryResume}>
    <FileText size={14}/> View My Resume
  </Btn>

  
</div>
</section>
  {role!=='Alumni'&&<section className="alumni-request-card"><div><span className="overline">ACCOUNT STATUS</span><h2>Ready for your next chapter?</h2><p>When you graduate, request to update your Scholar account to Karta Alumni. Your existing account and history stay with you.</p></div>{alumniRequest?.status==='Pending'?<Tag tone="yellow">Pending Admin verification</Tag>:alumniRequest?.status==='Rejected'?<><Tag tone="red">Request needs updates</Tag><button className="alumni-request-action" onClick={()=>onRequestAlumni(null)}>Update and resubmit request</button></>:alumniRequest?.status==='Approved'?<Tag tone="green">KARTA ALUMNI · Approved</Tag>:<button className="alumni-request-action" onClick={()=>onRequestAlumni('open')}>Request Alumni status <ArrowRight size={14}/></button>}</section>}
  {alumniRequest==='open'&&<section className="alumni-request-form"><h2>Request Alumni status</h2><p>Your account will remain a Scholar until Admin verifies your graduation.</p><form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);onRequestAlumni({graduationYear:f.get('graduationYear'),degree:f.get('degree'),department:f.get('department'),graduationDate:f.get('graduationDate'),notes:f.get('notes')})}}><label>Graduation year<input name="graduationYear" required pattern="20[0-9]{2}" placeholder="2027"/></label><label>Completed / expected degree<input name="degree" required placeholder="B.Tech"/></label><label>Department / programme<input name="department" required placeholder="Computer Science & Engineering"/></label><label>Graduation date<input name="graduationDate" type="date"/></label><label className="alumni-form-wide">Additional details<textarea name="notes" rows="3" placeholder="Add any details Admin should know"/></label><div className="alumni-form-actions"><button type="button" className="alumni-request-cancel" onClick={()=>onRequestAlumni(null)}>Cancel</button><button className="alumni-request-action" type="submit">Submit for verification <ArrowRight size={14}/></button></div></form></section>}
  
  
<section className="kp-strength">
  <div className="kp-strength-head">
    <div>
      <b>Profile strength</b>
      <span>Build a complete profile to help organizations discover you.</span>
    </div>
    <strong>{profileLoading ? '...' : `${strength}%`}</strong>
  </div>

  <div className="kp-progress">
    <i style={{ width: `${profileLoading ? 0 : strength}%` }} />
  </div>

  <div className="kp-checklist">
    <span>{strengthFields}/{strengthItems.length} completed</span>
    <span>
      {missingItems.length === 0
        ? '✓ Profile complete'
        : `${missingItems.length} items remaining`}
    </span>
  </div>

  {!profileLoading && (
    <div style={{ marginTop: 16, display: 'grid', gap: 9 }}>
      {missingItems.length > 0 ? (
        <>
          <b style={{ fontSize: 13, color: '#193657' }}>
            Complete these sections
          </b>

          {missingItems.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setTab(item.tab);
                if (item.editor) setEditing(true);
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5eaf1',
                borderRadius: 9,
                background: '#fff',
                color: '#31577f',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 13
              }}
            >
              <span>○ {item.label}</span>
              <span>Complete →</span>
            </button>
          ))}
        </>
      ) : (
        <div style={{
          padding: 12,
          borderRadius: 9,
          background: '#eaf8f0',
          color: '#16865c',
          fontSize: 13,
          fontWeight: 600
        }}>
          ✓ Excellent! Your profile is fully completed.
        </div>
      )}
    </div>
  )}
</section>

  {editing&&<section className="kp-editor"><div className="kp-section-head"><div><span className="overline">PROFILE EDITOR</span><h2>Update your professional identity</h2></div><Btn
  kind="blue"
  disabled={profileLoading || profileSaving}
  onClick={saveScholarProfile}
>
  {profileSaving ? 'Saving...' : 'Save changes'}
  <Check size={14}/>
</Btn></div><div className="kp-form-grid">{field('Professional headline','headline')}{field('University / institution','university')}{field('State','state')}{field('City','city')}{field('Degree','degree')}{field('Course / programme','course')}{field('Specialization','specialization')}{field('Enrollment year','enrollment')}{field('Current academic year','year')}{field('Current semester','semester')}{field('Expected graduation year','graduation')}{field('CGPA / percentage (optional)','cgpa')}{field('Email address','email')}{field('Phone number','phone')}<label className="kp-field kp-wide">About<textarea rows="4" value={profile.about} onChange={e=>update('about',e.target.value)}/></label></div><div className="kp-privacy-toggles"><label><input type="checkbox" checked={profile.showEmail} onChange={e=>update('showEmail',e.target.checked)}/> Show email on my profile</label><label><input type="checkbox" checked={profile.showPhone} onChange={e=>update('showPhone',e.target.checked)}/> Show phone on my profile</label></div>{profileLoading && <p className="kp-note">Loading your saved profile...</p>}
{saved && <Tag tone="green">Profile saved successfully</Tag>}
{profileError && <p className="kp-note" role="alert">{profileError}</p>}<small className="kp-note">Official name is assigned by Karta Admin and cannot be edited here. Academic details are self-declared and manually maintained by the scholar.</small></section>}
  <nav className="kp-tabs">{tabs.map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</nav>
  <div className="kp-content">
   <main className="kp-main">
    {tab==='About'&&<><section className="kp-card"><div className="kp-section-head"><h2>About</h2><button onClick={()=>setEditing(true)}>Edit</button></div><p>{profile.about}</p></section><section className="kp-card"><div className="kp-section-head"><h2>Academic snapshot</h2><button onClick={()=>setEditing(true)}>Edit</button></div><div className="kp-facts"><div><small>University</small><b>{profile.university}</b></div><div><small>Degree</small><b>{profile.degree}</b></div><div><small>Course</small><b>{profile.course}</b></div><div><small>Specialization</small><b>{profile.specialization}</b></div><div><small>Academic year</small><b>{profile.year}</b></div><div><small>Semester</small><b>{profile.semester}</b></div><div><small>Graduation</small><b>{profile.graduation}</b></div><div><small>Academic location</small><b>{profile.city}, {profile.state}</b></div></div><Tag tone="blue">Self-declared academic information</Tag></section></>}
    {tab==='Education'&&<section className="kp-card"><div className="kp-section-head"><h2>Education</h2><button onClick={()=>setEditing(true)}>Edit academic details</button></div><div className="kp-timeline"><div className="kp-timeline-icon"><GraduationCap/></div><div><h3>{profile.degree} · {profile.course}</h3><b>{profile.university}</b><p>{profile.specialization} · {profile.enrollment} – {profile.graduation}</p><p>{profile.year} · {profile.semester} {profile.cgpa&&`· ${profile.cgpa}`}</p><Tag tone="blue">Self-declared</Tag></div></div><div className="kp-empty-add"><button onClick={()=>addRow(setCustom,{title:'Previous qualification',body:'Add school, diploma or previous degree details in More.'})}><Plus size={15}/> Add previous qualification in More</button></div></section>}
    
{tab === 'Experience' && (
  <section className="kp-card kp-experience-panel">
    <div className="kp-section-head">
      <div>
        <span className="overline">YOUR CAREER JOURNEY</span>
        <h2>Professional experience</h2>
        <p className="kp-experience-subtitle">
          Showcase internships, employment, research and volunteering.
        </p>
      </div>

      <div className="kp-activity-actions">
        <button
          type="button"
          onClick={() => addRow(setExperience, {
            title: '',
            company: '',
            dates: '',
            description: '',
            skills: '',
            employmentType: '',
            location: '',
            current: false
          })}
        >
          <Plus size={15} /> Add experience
        </button>

        <Btn
          kind="blue"
          onClick={saveScholarProfile}
          disabled={profileSaving || profileLoading}
        >
          {profileSaving ? 'Saving...' : 'Save experience'}
          <Check size={14} />
        </Btn>
      </div>
    </div>

    {experience.length > 0 ? (
      <div className="kp-experience-list">
        {experience.map((x, i) => (
          <article className="kp-experience-card" key={i}>
            <div className="kp-experience-timeline">
              <div className="kp-experience-icon">
                <BriefcaseBusiness size={19} />
              </div>
              {i !== experience.length - 1 && (
                <span className="kp-experience-line" />
              )}
            </div>

            <div className="kp-experience-content">
              <div className="kp-experience-card-head">
                <div>
                  <span className="kp-experience-index">
                    EXPERIENCE {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3>{x.title || 'Your job title'}</h3>
                  <p className="kp-experience-company">
                    {x.company || 'Company or organization'}
                  </p>
                </div>

                <button
                  type="button"
                  className="kp-experience-delete"
                  title="Delete experience"
                  onClick={() =>
                    setExperience(v => v.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="kp-experience-meta">
                {x.dates && (
                  <span><CalendarDays size={14} /> {x.dates}</span>
                )}
                {x.employmentType && (
                  <span><Briefcase size={14} /> {x.employmentType}</span>
                )}
                {x.location && (
                  <span><MapPin size={14} /> {x.location}</span>
                )}
                {x.current && (
                  <span className="kp-current-role">Currently working</span>
                )}
              </div>

              <div className="kp-experience-fields">
                <label className="kp-field">
                  Job title / designation
                  <input
                    value={x.title || ''}
                    placeholder="e.g. Software Engineering Intern"
                    onChange={e => setExperience(v => v.map((item, j) =>
                      j === i ? {...item, title: e.target.value} : item
                    ))}
                  />
                </label>

                <label className="kp-field">
                  Company / organization
                  <input
                    value={x.company || ''}
                    placeholder="e.g. Bellurbis Technologies"
                    onChange={e => setExperience(v => v.map((item, j) =>
                      j === i ? {...item, company: e.target.value} : item
                    ))}
                  />
                </label>

                <label className="kp-field">
                  Duration
                  <input
                    value={x.dates || ''}
                    placeholder="e.g. May 2026 – July 2026"
                    onChange={e => setExperience(v => v.map((item, j) =>
                      j === i ? {...item, dates: e.target.value} : item
                    ))}
                  />
                </label>

                <label className="kp-field">
                  Employment type
                  <select
                    value={x.employmentType || ''}
                    onChange={e => setExperience(v => v.map((item, j) =>
                      j === i ? {...item, employmentType: e.target.value} : item
                    ))}
                  >
                    <option value="">Select type</option>
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Research">Research</option>
                    <option value="Volunteering">Volunteering</option>
                  </select>
                </label>

                <label className="kp-field kp-experience-wide">
                  Location
                  <input
                    value={x.location || ''}
                    placeholder="e.g. Gurugram, India"
                    onChange={e => setExperience(v => v.map((item, j) =>
                      j === i ? {...item, location: e.target.value} : item
                    ))}
                  />
                </label>

                <label className="kp-field kp-experience-wide">
                  Description and responsibilities
                  <textarea
                    rows="4"
                    value={x.description || ''}
                    placeholder="Describe your responsibilities, contributions and achievements..."
                    onChange={e => setExperience(v => v.map((item, j) =>
                      j === i ? {...item, description: e.target.value} : item
                    ))}
                  />
                </label>

                <label className="kp-field kp-experience-wide">
                  Skills and technologies
                  <input
                    value={x.skills || ''}
                    placeholder="React, Python, FastAPI, Supabase"
                    onChange={e => setExperience(v => v.map((item, j) =>
                      j === i ? {...item, skills: e.target.value} : item
                    ))}
                  />
                  <small>Separate skills with commas.</small>
                </label>

                <label className="kp-experience-current">
                  <input
                    type="checkbox"
                    checked={Boolean(x.current)}
                    onChange={e => setExperience(v => v.map((item, j) =>
                      j === i ? {...item, current: e.target.checked} : item
                    ))}
                  />
                  I currently work here
                </label>
              </div>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <div className="kp-experience-empty">
        <div className="kp-experience-empty-icon">
          <BriefcaseBusiness size={25} />
        </div>
        <h3>Your professional journey starts here</h3>
        <p>
          Add internships, jobs, research positions or volunteering
          experience to help organizations understand your journey.
        </p>
        <button
          type="button"
          onClick={() => addRow(setExperience, {
            title: '',
            company: '',
            dates: '',
            description: '',
            skills: '',
            employmentType: '',
            location: '',
            current: false
          })}
        >
          <Plus size={16} /> Add your first experience
        </button>
      </div>
    )}

    <small className="kp-note">
      Your experience details are saved to your scholar profile.
      Remember to click Save experience after editing.
    </small>
  </section>
)}
    
{tab==='Projects'&&<section className="kp-card">
  <div className="kp-section-head">
    <h2>Featured projects</h2>

    <div className="kp-activity-actions">
      <button onClick={() => addRow(setProjects, {
        title: '',
        description: '',
        tech: '',
        github: '',
        demo: '',
        role: ''
      })}>
        <Plus size={15}/> Add project
      </button>

      <Btn
        kind="blue"
        onClick={saveScholarProfile}
        disabled={profileSaving || profileLoading}
      >
        {profileSaving ? 'Saving...' : 'Save projects'}
        <Check size={14}/>
      </Btn>
    </div>
  </div>

  {projects.map((x, i) => (
    <article className="kp-project" key={i}>
      <div className="kp-project-cover">
        <Sparkles size={25}/>
        <span>PROJECT {String(i + 1).padStart(2, '0')}</span>
      </div>

      <div className="kp-project-body">
        <label className="kp-field">
          Project title
          <input
            value={x.title || ''}
            placeholder="Enter project title"
            onChange={e => setProjects(v => v.map((p, j) =>
              j === i ? {...p, title: e.target.value} : p
            ))}
          />
        </label>

        <label className="kp-field">
          Description
          <textarea
            rows="3"
            value={x.description || ''}
            placeholder="Describe your project"
            onChange={e => setProjects(v => v.map((p, j) =>
              j === i ? {...p, description: e.target.value} : p
            ))}
          />
        </label>

        <label className="kp-field">
          Your role
          <input
            value={x.role || ''}
            placeholder="e.g. Full-stack Developer"
            onChange={e => setProjects(v => v.map((p, j) =>
              j === i ? {...p, role: e.target.value} : p
            ))}
          />
        </label>

        <label className="kp-field">
          Technologies (comma separated)
          <input
            value={x.tech || ''}
            placeholder="React, Node.js, Supabase"
            onChange={e => setProjects(v => v.map((p, j) =>
              j === i ? {...p, tech: e.target.value} : p
            ))}
          />
        </label>

        <label className="kp-field">
          GitHub URL
          <input
            value={x.github || ''}
            placeholder="https://github.com/..."
            onChange={e => setProjects(v => v.map((p, j) =>
              j === i ? {...p, github: e.target.value} : p
            ))}
          />
        </label>

        <label className="kp-field">
          Live demo URL
          <input
            value={x.demo || ''}
            placeholder="https://..."
            onChange={e => setProjects(v => v.map((p, j) =>
              j === i ? {...p, demo: e.target.value} : p
            ))}
          />
        </label>

        <button
          type="button"
          onClick={() => setProjects(v => v.filter((_, j) => j !== i))}
        >
          <Trash2 size={14}/> Delete project
        </button>
      </div>
    </article>
  ))}

  {!projects.length && (
    <div className="kp-empty">
      No projects added yet. Click Add project to get started.
    </div>
  )}

  <small className="kp-note">
    Add your project details and remember to save your changes.
  </small>
</section>}

  

{tab === 'Skills' && (
  <section className="kp-card kp-skills-panel">
    <div className="kp-section-head">
      <div>
        <span className="overline">PROFESSIONAL DEVELOPMENT</span>
        <h2>Skills & expertise</h2>
        <p className="kp-muted">
          Highlight the capabilities that make you stand out.
        </p>
      </div>

      <div className="kp-activity-actions">
        <button
          type="button"
          onClick={() => addRow(setSkills, {
            id: crypto.randomUUID(),
            name: '',
            level: 'Beginner',
            category: 'Programming',
            endorsements: 0
          })}
        >
          <Plus size={15} /> Add skill
        </button>

        <Btn
          kind="blue"
          onClick={saveScholarProfile}
          disabled={profileSaving || profileLoading}
        >
          {profileSaving ? 'Saving...' : 'Save skills'}
          <Check size={14} />
        </Btn>
      </div>
    </div>

    {skills.length > 0 && (
      <div className="kp-skills-summary">
        <div>
          <strong>{skills.filter(s => s.name?.trim()).length}</strong>
          <span>Added skills</span>
        </div>
        <div>
          <strong>{new Set(skills.filter(s => s.name?.trim()).map(s => s.category)).size}</strong>
          <span>Categories</span>
        </div>
        <div>
          <strong>{skills.filter(s => s.level === 'Expert' || s.level === 'Advanced').length}</strong>
          <span>Advanced skills</span>
        </div>
      </div>
    )}

    <div className="kp-skills-grid">
      {skills.map((skill, index) => {
        const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
        const levelIndex = Math.max(0, levels.indexOf(skill.level || 'Beginner'));

        return (
          <article className="kp-skill-card" key={skill.id || index}>
            <div className="kp-skill-card-top">
              <div className="kp-skill-symbol">
                <Sparkles size={18} />
              </div>

              <span className={`kp-skill-category category-${(skill.category || 'Programming').toLowerCase()}`}>
                {skill.category || 'Programming'}
              </span>

              <button
                type="button"
                className="kp-skill-delete"
                title="Delete skill"
                aria-label={`Delete ${skill.name || 'skill'}`}
                onClick={() => setSkills(items =>
                  items.filter((_, i) => i !== index)
                )}
              >
                <Trash2 size={15} />
              </button>
            </div>

            <label className="kp-field">
              Skill name
              <input
                value={skill.name || ''}
                placeholder="e.g. React.js"
                onChange={e => setSkills(items =>
                  items.map((item, i) =>
                    i === index
                      ? { ...item, name: e.target.value }
                      : item
                  )
                )}
              />
            </label>

            <label className="kp-field">
              Category
              <select
                value={skill.category || 'Programming'}
                onChange={e => setSkills(items =>
                  items.map((item, i) =>
                    i === index
                      ? { ...item, category: e.target.value }
                      : item
                  )
                )}
              >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Programming</option>
                <option>Professional</option>
              </select>
            </label>

            <div className="kp-skill-level">
              <div className="kp-skill-level-heading">
                <span>Proficiency</span>
                <strong>{levels[levelIndex]}</strong>
              </div>

              <div className="kp-skill-meter">
                {levels.map((level, i) => (
                  <span
                    key={level}
                    className={i <= levelIndex ? 'filled' : ''}
                  />
                ))}
              </div>

              <select
                aria-label="Skill proficiency"
                value={skill.level || 'Beginner'}
                onChange={e => setSkills(items =>
                  items.map((item, i) =>
                    i === index
                      ? { ...item, level: e.target.value }
                      : item
                  )
                )}
              >
                {levels.map(level => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </div>
          </article>
        );
      })}
    </div>

    {!skills.length && (
      <div className="kp-empty">
        <Sparkles size={25} />
        <h3>Your skills showcase starts here</h3>
        <p>Add your technical and professional capabilities to help organizations understand your strengths.</p>
        <button
          type="button"
          onClick={() => addRow(setSkills, {
            id: crypto.randomUUID(),
            name: '',
            level: 'Beginner',
            category: 'Programming',
            endorsements: 0
          })}
        >
          <Plus size={15} /> Add your first skill
        </button>
      </div>
    )}

    <small className="kp-note">
      Proficiency levels are self-declared and can be updated anytime.
    </small>
  </section>
)}



{tab === 'Achievements' && (
  <section className="kp-card kp-achievements-panel">
    <div className="kp-section-head">
      <div>
        <span className="overline">MILESTONES & RECOGNITION</span>
        <h2>Achievements & recognition</h2>
        <p className="kp-muted">
          Celebrate your awards, leadership, competitions and milestones.
        </p>
      </div>

      <div className="kp-activity-actions">
        <button
          type="button"
          onClick={() => addRow(setAchievements, {
            id: crypto.randomUUID(),
            title: '',
            category: 'Award',
            issuer: '',
            date: '',
            description: ''
          })}
        >
          <Plus size={15}/> Add achievement
        </button>

        <Btn
          kind="blue"
          onClick={saveScholarProfile}
          disabled={profileSaving || profileLoading}
        >
          {profileSaving ? 'Saving...' : 'Save achievements'}
          <Check size={14}/>
        </Btn>
      </div>
    </div>

    {achievements.length > 0 ? (
      <div className="kp-achievement-grid">
        {achievements.map((item, index) => (
          <article className="kp-achievement-card" key={item.id || index}>
            <div className="kp-achievement-top">
              <div className="kp-achievement-icon">
                <Award size={23}/>
              </div>
              <span className="kp-achievement-number">
                MILESTONE {String(index + 1).padStart(2, '0')}
              </span>
              <button
                type="button"
                className="kp-achievement-delete"
                title="Delete achievement"
                onClick={() => setAchievements(items =>
                  items.filter((_, i) => i !== index)
                )}
              >
                <Trash2 size={15}/>
              </button>
            </div>

            <div className="kp-achievement-preview">
              <span className="kp-achievement-category">
                {item.category || 'Achievement'}
              </span>
              <h3>{item.title || 'Your achievement title'}</h3>
              <p>{item.issuer || 'Issuing organization'}</p>
              {item.date && (
                <span className="kp-achievement-date">
                  <CalendarDays size={13}/> {item.date}
                </span>
              )}
              {item.description && (
                <p className="kp-achievement-description">
                  {item.description}
                </p>
              )}
            </div>

            <div className="kp-achievement-editor">
              <label className="kp-field">
                Achievement title
                <input
                  value={item.title || ''}
                  placeholder="e.g. Best Bowler — Regional Cricket Tournament"
                  onChange={e => setAchievements(items => items.map((x, i) =>
                    i === index ? {...x, title: e.target.value} : x
                  ))}
                />
              </label>

              <div className="kp-form-grid">
                <label className="kp-field">
                  Category
                  <select
                    value={item.category || 'Award'}
                    onChange={e => setAchievements(items => items.map((x, i) =>
                      i === index ? {...x, category: e.target.value} : x
                    ))}
                  >
                    <option>Award</option>
                    <option>Competition</option>
                    <option>Leadership</option>
                    <option>Academic</option>
                    <option>Sports</option>
                    <option>Volunteering</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="kp-field">
                  Date
                  <input
                    type="text"
                    value={item.date || ''}
                    placeholder="e.g. June 2026"
                    onChange={e => setAchievements(items => items.map((x, i) =>
                      i === index ? {...x, date: e.target.value} : x
                    ))}
                  />
                </label>
              </div>

              <label className="kp-field">
                Issuing organization
                <input
                  value={item.issuer || ''}
                  placeholder="Organization or institution"
                  onChange={e => setAchievements(items => items.map((x, i) =>
                    i === index ? {...x, issuer: e.target.value} : x
                  ))}
                />
              </label>

              <label className="kp-field">
                Description
                <textarea
                  rows="3"
                  value={item.description || ''}
                  placeholder="Describe the achievement and why it matters..."
                  onChange={e => setAchievements(items => items.map((x, i) =>
                    i === index ? {...x, description: e.target.value} : x
                  ))}
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <div className="kp-achievement-empty">
        <Award size={27}/>
        <h3>Your milestones deserve recognition</h3>
        <p>
          Add awards, competition results, leadership roles and
          other accomplishments to your profile.
        </p>
        <button
          type="button"
          onClick={() => addRow(setAchievements, {
            id: crypto.randomUUID(),
            title: '',
            category: 'Award',
            issuer: '',
            date: '',
            description: ''
          })}
        >
          <Plus size={15}/> Add your first achievement
        </button>
      </div>
    )}
  </section>
)}


{tab === 'Certifications' && (
  <section className="kp-card kp-certifications-panel">
    <div className="kp-section-head">
      <div>
        <span className="overline">VERIFIED LEARNING</span>
        <h2>Licenses & certifications</h2>
        <p className="kp-muted">
          Showcase professional credentials and supporting documents.
        </p>
      </div>

      <div className="kp-activity-actions">
        <button
          type="button"
          onClick={() => addRow(setCerts, {
            id: crypto.randomUUID(),
            name: '',
            issuer: '',
            issue_date: '',
            expiry_date: '',
            credential_id: '',
            credential_url: '',
            description: '',
            file_path: '',
            file_name: '',
            file_size: 0
          })}
        >
          <Plus size={15}/> Add certification
        </button>

        <Btn
          kind="blue"
          onClick={saveScholarProfile}
          disabled={profileSaving || profileLoading}
        >
          {profileSaving ? 'Saving...' : 'Save certifications'}
          <Check size={14}/>
        </Btn>
      </div>
    </div>

    {certs.length > 0 ? (
      <div className="kp-certification-list">
        {certs.map((cert, index) => (
          <article className="kp-certification-card" key={cert.id || index}>
            <div className="kp-certification-heading">
              <div className="kp-certification-symbol">
                <Award size={22}/>
              </div>

              <div className="kp-certification-heading-copy">
                <span className="kp-certification-label">
                  PROFESSIONAL CREDENTIAL {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{cert.name || cert.title || 'Your certification'}</h3>
                <p>{cert.issuer || 'Issuing organization'}</p>
              </div>

              <button
                type="button"
                className="kp-achievement-delete"
                title="Delete certification"
                disabled={resumeSaving}
                onClick={() => deleteCertificate(index)}
              >
                <Trash2 size={15}/>
              </button>
            </div>

            <div className="kp-certification-meta">
              {cert.issue_date && (
                <span>
                  <CalendarDays size={14}/>
                  Issued {cert.issue_date}
                </span>
              )}
              {cert.expiry_date && (
                <span>
                  <Clock3 size={14}/>
                  Expires {cert.expiry_date}
                </span>
              )}
              {cert.file_path && (
                <span className="kp-certification-uploaded">
                  <CheckCircle2 size={14}/> Document uploaded
                </span>
              )}
            </div>

            <div className="kp-certification-fields">
              <label className="kp-field">
                Certificate name
                <input
                  value={cert.name || cert.title || ''}
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  onChange={e => setCerts(items => items.map((x, i) =>
                    i === index ? {...x, name: e.target.value} : x
                  ))}
                />
              </label>

              <label className="kp-field">
                Issuing organization
                <input
                  value={cert.issuer || ''}
                  placeholder="e.g. Amazon Web Services"
                  onChange={e => setCerts(items => items.map((x, i) =>
                    i === index ? {...x, issuer: e.target.value} : x
                  ))}
                />
              </label>

              <div className="kp-form-grid">
                <label className="kp-field">
                  Issue date
                  <input
                    type="date"
                    value={cert.issue_date || ''}
                    onChange={e => setCerts(items => items.map((x, i) =>
                      i === index ? {...x, issue_date: e.target.value} : x
                    ))}
                  />
                </label>

                <label className="kp-field">
                  Expiry date
                  <input
                    type="date"
                    value={cert.expiry_date || ''}
                    onChange={e => setCerts(items => items.map((x, i) =>
                      i === index ? {...x, expiry_date: e.target.value} : x
                    ))}
                  />
                </label>
              </div>

              <label className="kp-field">
                Credential ID
                <input
                  value={cert.credential_id || ''}
                  placeholder="Certificate or credential number"
                  onChange={e => setCerts(items => items.map((x, i) =>
                    i === index ? {...x, credential_id: e.target.value} : x
                  ))}
                />
              </label>

              <label className="kp-field">
                Verification URL
                <input
                  type="url"
                  value={cert.credential_url || ''}
                  placeholder="https://..."
                  onChange={e => setCerts(items => items.map((x, i) =>
                    i === index ? {...x, credential_url: e.target.value} : x
                  ))}
                />
              </label>

              <label className="kp-field kp-certification-wide">
                Description
                <textarea
                  rows="3"
                  value={cert.description || ''}
                  placeholder="What did you learn or demonstrate?"
                  onChange={e => setCerts(items => items.map((x, i) =>
                    i === index ? {...x, description: e.target.value} : x
                  ))}
                />
              </label>
            </div>

            <div className="kp-certification-document">
              <div className="kp-certification-file-icon">
                <FileText size={22}/>
              </div>

              <div className="kp-certification-file-copy">
                <strong>
                  {cert.file_name || 'Supporting certificate document'}
                </strong>
                <span>
                  {cert.file_name
                    ? cert.file_size
                      ? (cert.file_size / 1024 / 1024).toFixed(2) + ' MB'
                      : 'Uploaded document'
                    : 'PDF, JPG, PNG or WebP · Maximum 5 MB'}
                </span>
              </div>

              {cert.file_url && (
                <a
                  href={cert.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="kp-certification-preview"
                >
                  <Eye size={15}/> Preview
                </a>
              )}

              <label className="kp-upload-btn">
                <Upload size={14}/>
                {cert.file_path ? 'Replace file' : 'Upload file'}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  disabled={resumeSaving}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    uploadCertificateFile(index, file);
                  }}
                />
              </label>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <div className="kp-certification-empty">
        <div className="kp-certification-empty-icon">
          <Award size={27}/>
        </div>
        <h3>Build your credential collection</h3>
        <p>
          Add professional certificates, licenses and completed courses.
          Upload supporting documents to strengthen your profile.
        </p>
        <button
          type="button"
          onClick={() => addRow(setCerts, {
            id: crypto.randomUUID(),
            name: '',
            issuer: '',
            issue_date: '',
            expiry_date: '',
            credential_id: '',
            credential_url: '',
            description: '',
            file_path: '',
            file_name: '',
            file_size: 0
          })}
        >
          <Plus size={15}/> Add your first certification
        </button>
      </div>
    )}

    <small className="kp-note">
      Uploaded documents are stored in private Supabase Storage.
      Only the scholar currently has access through the configured storage policies.
    </small>
  </section>
)}


{tab === 'Activity' && (
  <section className="kp-activity">
    <div className="kp-section-head">
      <div>
        <h2>Your activity</h2>
        <span className="kp-muted">
          All posts you've published to the Karta community
        </span>
      </div>

      <div className="kp-activity-actions">
        <b>{activityPosts.filter(
          p => p.author_id === userProfile?.id ||
               p.name === userProfile?.full_name
        ).length} posts</b>

        <button onClick={() => setPage('Create post')}>
          <Plus size={14} /> Create post
        </button>
      </div>
    </div>

    {activityPosts.filter(
      p => p.author_id === userProfile?.id ||
           p.name === userProfile?.full_name
    ).length ? (
      activityPosts
        .filter(
          p => p.author_id === userProfile?.id ||
               p.name === userProfile?.full_name
        )
        .map(p => (
          <FeedPost
            key={p.id}
            post={p}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
          />
        ))
    ) : (
      <div className="kp-empty kp-activity-empty">
        <MessageSquare size={24} />
        <h3>Your posts will appear here</h3>
        <p>
          Every post you publish from the community feed will be collected
          here, so you and other members can explore your contributions.
        </p>
        <button onClick={() => setPage('Create post')}>
          Share your first post <ArrowRight size={14} />
        </button>
      </div>
    )}
  </section>
)}    
{tab==='More'&&<>
  
<section className="kp-card kp-resume-panel" id="kp-resumes">
  <div className="kp-section-head">
    <div>
      <span className="overline">CAREER DOCUMENTS</span>
      <h2>My resumes</h2>
      <p className="kp-muted">
        Manage your professional resumes and choose the version you want organizations to consider.
      </p>
    </div>

    <label className="kp-upload-btn kp-resume-add">
      <Upload size={15} />
      {resumeSaving ? 'Uploading...' : 'Add resume'}
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        disabled={resumeSaving}
        onChange={uploadResume}
      />
    </label>
  </div>

  <div className="kp-resume-info">
    <FileText size={18} />
    <span>
      Upload PDF, DOC or DOCX files. Maximum size: 5 MB per resume.
    </span>
  </div>

  {resumes.length > 0 ? (
    <div className="kp-resume-grid">
      {resumes.map((r, index) => {
        const isPrimary = primaryResume === r.path;
        const extension = r.name?.split('.').pop()?.toUpperCase() || 'FILE';

        return (
          <article
            className={`kp-resume-card ${isPrimary ? 'is-primary' : ''}`}
            key={r.id || r.path}
          >
            <div className="kp-resume-card-top">
              <div className={`kp-resume-file-icon ${extension.toLowerCase()}`}>
                <FileText size={25} />
                <span>{extension}</span>
              </div>

              {isPrimary ? (
                <span className="kp-resume-primary-badge">
                  <CheckCircle2 size={13} /> PRIMARY RESUME
                </span>
              ) : (
                <span className="kp-resume-version">
                  RESUME {String(index + 1).padStart(2, '0')}
                </span>
              )}
            </div>

            <div className="kp-resume-card-content">
              <h3 title={r.name}>{r.name}</h3>

              <div className="kp-resume-meta">
                <span>
                  <FileText size={13} />
                  {r.size
                    ? (r.size / 1024 / 1024).toFixed(2) + ' MB'
                    : 'File size unavailable'}
                </span>

                <span>
                  <CalendarDays size={13} />
                  {r.uploaded_at
                    ? new Date(r.uploaded_at).toLocaleDateString()
                    : 'Upload date unavailable'}
                </span>
              </div>
            </div>

            <div className="kp-resume-card-actions">
              {isPrimary ? (
                <span className="kp-resume-primary-note">
                  <Check size={14} /> Default resume
                </span>
              ) : (
                <button
                  type="button"
                  className="kp-resume-primary-btn"
                  onClick={() => makePrimaryResume(r.path)}
                  disabled={resumeSaving}
                >
                  <Star size={14} /> Make primary
                </button>
              )}

              <div className="kp-resume-document-actions">
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Preview resume"
                  >
                    <Eye size={15} /> Preview
                  </a>
                ) : (
                  <span className="kp-muted">Preview unavailable</span>
                )}

                <button
                  type="button"
                  onClick={() => deleteResume(r)}
                  disabled={resumeSaving}
                  title="Delete resume"
                  aria-label={`Delete ${r.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  ) : (
    <div className="kp-resume-empty">
      <div className="kp-resume-empty-icon">
        <FileText size={30} />
      </div>
      <h3>Your professional resume starts here</h3>
      <p>
        Upload your latest CV to showcase your education, experience,
        projects and professional achievements.
      </p>
      <label className="kp-resume-empty-upload">
        <Upload size={15} /> Upload your first resume
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          disabled={resumeSaving}
          onChange={uploadResume}
        />
      </label>
    </div>
  )}

  <small className="kp-note">
    Resumes are stored in private Supabase Storage. Organization and Admin
    access must be enforced through the appropriate storage authorization policies.
  </small>
</section>


  <section className="kp-card">
    <div className="kp-section-head">
      <h2>Custom sections & other information</h2>
      <div className="kp-activity-actions">
        <button onClick={()=>addRow(setCustom,{title:'',body:''})}>
          <Plus size={15}/> Add section
        </button>
        <Btn kind="blue" onClick={saveScholarProfile} disabled={profileSaving||profileLoading}>
          {profileSaving?'Saving...':'Save sections'} <Check size={14}/>
        </Btn>
      </div>
    </div>

    {custom.map((x,i)=>(
      <article className="kp-entry" key={i}>
        <div className="kp-entry-icon"><FileText/></div>
        <div style={{flex:1}}>
          <label className="kp-field">
            Section title
            <input
              value={x.title||''}
              onChange={e=>setCustom(v=>v.map((a,j)=>j===i?{...a,title:e.target.value}:a))}
            />
          </label>

          <label className="kp-field">
            Information
            <textarea
              rows="4"
              value={x.body||''}
              onChange={e=>setCustom(v=>v.map((a,j)=>j===i?{...a,body:e.target.value}:a))}
            />
          </label>

          <button type="button" onClick={()=>setCustom(v=>v.filter((_,j)=>j!==i))}>
            <Trash2 size={14}/> Delete section
          </button>
        </div>
      </article>
    ))}

    {!custom.length&&<div className="kp-empty">No custom sections added yet.</div>}
  </section>
</>}

   </main>
   <aside className="kp-side"><section className="kp-card"><h3>Contact & privacy</h3><p className="kp-muted">You control whether personal contact details appear on your profile.</p>{profile.showEmail&&<p><Mail size={14}/> {profile.email}</p>}{profile.showPhone&&profile.phone&&<p><AtSign size={14}/> {profile.phone}</p>}<Tag tone="green">Karta member profile</Tag></section><section className="kp-card"><h3>Profile analytics</h3><div className="kp-analytics"><div><b>248</b><small>Profile views</small></div><div><b>12</b><small>Organization visits</small></div><div><b>8</b><small>Authorized resume views</small></div><div><b>18</b><small>Connections</small></div></div><small className="kp-note">Demo figures only. Real analytics require event tracking.</small></section><section className="kp-card"><h3>Academic identity</h3><b>{profile.university}</b><p className="kp-muted">{profile.course} · {profile.year}</p><small>Scholar ID · KRT20270045</small></section></aside>
  </div>
<p className="kp-disclaimer">
  Profile information and resumes are connected to Supabase.
  Profile photos, cover images, role-based access workflows,
  verified organization visit tracking and real analytics
  still require implementation or verification.
</p>
 </div>

 {editingPost && createPortal(
  <div
    className="kp-post-modal-overlay"
    onMouseDown={e => {
      if (e.target === e.currentTarget) setEditingPost(null);
    }}
  >
    <div
      className="kp-post-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kp-edit-post-title"
    >
      <div className="kp-post-modal-header">
        <div>
          <span className="overline">YOUR ACTIVITY</span>
          <h2 id="kp-edit-post-title">Edit post</h2>
        </div>
        <button type="button" onClick={() => setEditingPost(null)}>
          <X size={20}/>
        </button>
      </div>

      <label className="kp-post-edit-label">
        What's on your mind?
        <textarea
          rows={6}
          value={editPostContent}
          onChange={e => setEditPostContent(e.target.value)}
          placeholder="Share something with the Karta community..."
        />
      </label>

      <label className="kp-post-image-upload">
        <ImageIcon size={18}/>
        <span>{editPostImage ? editPostImage.name : 'Choose or replace image'}</span>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            setEditPostImage(e.target.files?.[0] || null);
            setRemovePostImage(false);
          }}
        />
      </label>

      {editPostImage && (
        <button
          type="button"
          className="kp-post-image-remove"
          onClick={() => setEditPostImage(null)}
        >
          Remove selected image
        </button>
      )}

      {!editPostImage && editingPost.media_urls?.length > 0 && (
        <button
          type="button"
          className="kp-post-image-remove"
          onClick={() => setRemovePostImage(true)}
        >
          {removePostImage ? 'Image will be removed' : 'Remove current image'}
        </button>
      )}

      <div className="kp-post-modal-footer">
        <button
          type="button"
          className="kp-post-cancel"
          onClick={() => setEditingPost(null)}
          disabled={savingPost}
        >
          Cancel
        </button>

        <button
          type="button"
          className="kp-post-save"
          onClick={handleSaveEditedPost}
          disabled={savingPost || !editPostContent.trim()}
        >
          {savingPost ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  </div>,
  document.body
)}
</>;
}
export function Network({onViewProfile=()=>{}}){
 const [tab,setTab]=useState('Connections'),[query,setQuery]=useState('');
 const [uniFilter,setUniFilter]=useState('All universities'),[courseFilter,setCourseFilter]=useState('All courses'),[yearFilter,setYearFilter]=useState('All years'),[gradFilter,setGradFilter]=useState('Any graduation year'),[skillFilter,setSkillFilter]=useState(''),[filtersOpen,setFiltersOpen]=useState(false);
 const [connections,setConnections]=useState([scholars[0],scholars[2]]);
 const [incoming,setIncoming]=useState([scholars[1]]);
 const [sentRequests,setSentRequests]=useState([]);
 const scholarMeta={
  'Aarav Sharma':{university:'IIT Delhi',course:'Computer Science & Engineering',year:'4th Year',graduation:'2027',skills:'Python, Machine Learning, Research, AI'},
  'Meera Kapoor':{university:'Shoolini University',course:'Biotechnology',year:'3rd Year',graduation:'2028',skills:'Biotechnology, Laboratory Research, Python'},
  'Zoya Khan':{university:'NIFT Delhi',course:'Product Design',year:'3rd Year',graduation:'2028',skills:'Figma, UI/UX, Prototyping, Visual Design'},
  'Rohan Verma':{university:'BITS Pilani',course:'Data Science',year:'4th Year',graduation:'2027',skills:'Python, SQL, Data Analysis, Machine Learning'}
 };
 const meta=p=>scholarMeta[p.name]||{university:(p.field.split('·')[1]||'').trim(),course:p.field.split('·')[0].trim(),year:'Not specified',graduation:'Not specified',skills:p.topic||''};
 const discoverPeople=scholars.filter(p=>{const m=meta(p);const searchable=[p.name,p.field,p.topic,m.university,m.course,m.year,m.graduation,m.skills].join(' ').toLowerCase();return searchable.includes(query.toLowerCase())&&(uniFilter==='All universities'||m.university===uniFilter)&&(courseFilter==='All courses'||m.course===courseFilter)&&(yearFilter==='All years'||m.year===yearFilter)&&(gradFilter==='Any graduation year'||m.graduation===gradFilter)&&(!skillFilter.trim()||m.skills.toLowerCase().includes(skillFilter.toLowerCase()));});
 const visible=(tab==='Connections'?connections:tab==='Requests received'?incoming:discoverPeople.filter(p=>!connections.some(c=>c.name===p.name))).filter(p=>tab==='Discover'?true:(p.name+p.field+p.topic).toLowerCase().includes(query.toLowerCase()));
 const clearDiscoverFilters=()=>{setQuery('');setUniFilter('All universities');setCourseFilter('All courses');setYearFilter('All years');setGradFilter('Any graduation year');setSkillFilter('')};
 const accept=p=>{setConnections(v=>v.some(x=>x.name===p.name)?v:[...v,p]);setIncoming(v=>v.filter(x=>x.name!==p.name));};
 const sendRequest=p=>{if(connections.some(x=>x.name===p.name)||sentRequests.some(x=>x.name===p.name))return;setSentRequests(v=>[...v,p]);};
 const cancelRequest=p=>setSentRequests(v=>v.filter(x=>x.name!==p.name));
 const remove=p=>setConnections(v=>v.filter(x=>x.name!==p.name));
 return <div className="network-page"><div className="network-page-heading"><div><span className="overline">YOUR COMMUNITY</span><h1>My network</h1><p>Stay connected with the people you learn and grow with.</p></div><div className="network-heading-actions"><span className="network-heading-count">{connections.length} connections</span><div className="network-heading-search"><div className="search-inline"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='Discover'?'Search scholars by name, university, course or skills':'Search your network'} aria-label={tab==='Discover'?'Search scholars':'Search your network'}/><button type="button" className="network-search-clear" aria-label="Clear search" onClick={()=>setQuery('')}><X size={14}/></button></div>{tab==='Discover'&&<button type="button" className={`network-filter-toggle ${filtersOpen?'is-open':''}`} onClick={()=>setFiltersOpen(v=>!v)} aria-expanded={filtersOpen}><SlidersHorizontal size={16}/><span>Filters</span>{(uniFilter!=='All universities'||courseFilter!=='All courses'||yearFilter!=='All years'||gradFilter!=='Any graduation year'||skillFilter.trim())&&<i className="network-filter-dot"/>}</button>}</div></div></div>
 <div className="network-controls"><div className="tabs">{['Connections','Requests received','Discover'].map(x=><button key={x} className={tab===x?'chosen':''} onClick={()=>{setTab(x);setFiltersOpen(false);}}>{x}{x==='Requests received'&&incoming.length>0?<i className="network-count">{incoming.length}</i>:null}</button>)}</div></div>
 {tab==='Discover'&&filtersOpen&&<section className="network-discovery-filters"><div className="network-discovery-title"><div><b>Filter scholars</b><span>Refine results by academic background and skills</span></div><button onClick={clearDiscoverFilters}>Clear all</button></div><div className="network-discovery-grid"><label>University<select value={uniFilter} onChange={e=>setUniFilter(e.target.value)}>{['All universities',...new Set(scholars.map(p=>meta(p).university).filter(Boolean))].map(x=><option key={x}>{x}</option>)}</select></label><label>Course / programme<select value={courseFilter} onChange={e=>setCourseFilter(e.target.value)}>{['All courses',...new Set(scholars.map(p=>meta(p).course).filter(Boolean))].map(x=><option key={x}>{x}</option>)}</select></label><label>Academic year<select value={yearFilter} onChange={e=>setYearFilter(e.target.value)}>{['All years','1st Year','2nd Year','3rd Year','4th Year'].map(x=><option key={x}>{x}</option>)}</select></label><label>Graduation year<select value={gradFilter} onChange={e=>setGradFilter(e.target.value)}>{['Any graduation year',...new Set(scholars.map(p=>meta(p).graduation).filter(x=>x!=='Not specified'))].map(x=><option key={x}>{x}</option>)}</select></label><label>Skills<input value={skillFilter} onChange={e=>setSkillFilter(e.target.value)} placeholder="e.g. React, Python, AI"/></label></div><div className="network-discovery-result"><span><b>{visible.length}</b> scholars match your search</span><button type="button" className="network-filter-apply" onClick={()=>setFiltersOpen(false)}>Apply filters</button></div></section>}
 {tab==='Requests received'?<div className="network-request-list">{visible.map(p=><div className="network-request" key={p.name}><Avatar src={p.image}/><div className="network-request-copy"><b>{p.name}</b><span>{p.field}</span><small>{p.mutual}</small></div><button className="request-accept" onClick={()=>accept(p)}><CheckCircle2 size={15}/> Accept</button><button className="request-ignore" onClick={()=>setIncoming(v=>v.filter(x=>x.name!==p.name))}>Ignore</button></div>)}{!visible.length&&<div className="empty-discovery">No pending requests.</div>}</div>:<>{visible.length?<div className="scholar-grid">{visible.map(p=><article className="scholar-card scholar-card-v4 network-scholar-card" key={p.name}><button type="button" className="network-card-profile-hit" aria-label={`View ${p.name}'s full profile`} onClick={()=>onViewProfile(p)}><div className="scholar-cover" style={{backgroundImage:`url(${p.topic==='Life Sciences'?photos.research:p.topic==='Design & Creativity'?photos.design:photos.hero})`}}/><Avatar src={p.image} size="large-avatar"/><div className="scholar-card-body"><h3>{p.name}</h3><p>{p.field}</p><Tag tone="blue">{p.topic}</Tag><div className="mutual">{p.mutual}</div></div></button><div className="scholar-card-actions">{tab==='Connections'?<><button className="connect-btn" onClick={()=>onViewProfile(p)}>View full profile <ArrowRight size={14}/></button><button className="view-profile-btn" onClick={()=>remove(p)}>Remove connection</button></> :<>{connections.some(x=>x.name===p.name)?<button className="connect-btn" disabled>Connected</button>:sentRequests.some(x=>x.name===p.name)?<button className="connect-btn is-pending" onClick={()=>cancelRequest(p)}>Request sent · Cancel</button>:<button className="connect-btn" onClick={()=>sendRequest(p)}>Connect</button>}<button className="view-profile-btn" onClick={()=>onViewProfile(p)}>View full profile</button></>}</div></article>)}</div>:<div className="empty-discovery"><Users size={25}/><b>{tab==='Discover'&&query.trim()?'No scholars match your search':tab==='Discover'?'No new scholars to discover':'No people here yet'}</b><span>{tab==='Discover'&&query.trim()?'Try another name, university, course or skill, or adjust your filters.':'Discover scholars and start building your network.'}</span>{tab==='Discover'&&query.trim()&&<button type="button" className="view-profile-btn" onClick={clearDiscoverFilters}>Clear search and filters</button>}</div>}</>}
 </div>;
}
export function Opportunities({orgJobs=[],applications=[],onApply,setPage}){
 const [filter,setFilter]=useState('All'),[detail,setDetail]=useState(null),[applyJob,setApplyJob]=useState(null),[resume,setResume]=useState(null),[cover,setCover]=useState(''),[notice,setNotice]=useState('');
 const combined=[...orgJobs.filter(j=>j.status==='Active').map(j=>({...j,place:j.location,tag:(j.type||'Opportunity').toUpperCase(),image:j.image||photos.team,company:j.company||'Karta organization'})),...opportunities];
 const filtered=combined.filter(j=>filter==='All'||j.type===filter);
 const chooseResume=file=>{if(!file)return;if(file.type!=='application/pdf'){setNotice('Please upload a PDF resume.');return}if(file.size>5*1024*1024){setNotice('Resume must be smaller than 5 MB.');return}const reader=new FileReader();reader.onload=()=>setResume({name:file.name,data:String(reader.result),size:file.size});reader.readAsDataURL(file)};
 const submit=()=>{if(!resume){setNotice('Please attach a resume before submitting.');return}onApply?.(applyJob,{name:resume.name,data:resume.data,coverLetter:cover,version:1});setApplyJob(null);setResume(null);setCover('');setNotice('Application submitted successfully. You can manage it from My Applications.');};
 return <><PageHead eyebrow="YOUR NEXT MOVE" title="Opportunities worth opening." sub="Discover jobs, internships and research opportunities shared by organizations in the Karta community." action={<Btn kind="outline" onClick={()=>setPage('My applications')}>My applications <ArrowRight size={14}/></Btn>}/>{notice&&<div className="org-success"><CheckCircle2 size={16}/>{notice}<button onClick={()=>setNotice('')}><X size={14}/></button></div>}<div className="discover-tools"><div className="tabs">{['All','Internship','Full-time','Research','Part-time'].map(x=><button key={x} className={filter===x?'chosen':''} onClick={()=>setFilter(x)}>{x}</button>)}</div></div><div className="opportunity-grid">{filtered.map((j,i)=>{const applied=applications.some(a=>String(a.jobId)===String(j.id??j.title));return <article className="opportunity-card" key={j.id||j.title}><img src={j.image||photos.team} alt="Opportunity"/><div className="opportunity-card-body"><Tag>{j.tag||j.type}</Tag><h3>{j.title}</h3><b>{j.company}</b><p><MapPin size={14}/>{j.place||j.location}</p><div className="opportunity-foot"><strong>{j.pay}</strong><button onClick={()=>setDetail(j)}>{applied?'View application':'View details'} <ArrowRight size={14}/></button></div></div></article>})}</div>{!filtered.length&&<div className="empty-discovery">No opportunities in this category yet.</div>}
 {detail&&<div className="job-modal-backdrop" onClick={()=>setDetail(null)}><section className="job-detail-modal" onClick={e=>e.stopPropagation()}><button className="job-modal-close" onClick={()=>setDetail(null)}><X/></button><img className="job-detail-cover" src={detail.image||photos.team} alt=""/><div className="job-detail-content"><Tag>{detail.tag||detail.type}</Tag><h2>{detail.title}</h2><b>{detail.company}</b><div className="job-detail-facts"><span><MapPin size={15}/>{detail.place||detail.location}</span><span><Briefcase size={15}/>{detail.type||'Opportunity'}</span><span><Sparkles size={15}/>{detail.pay||'Compensation discussed'}</span><span><Clock3 size={15}/>Deadline: {detail.deadline||'To be announced'}</span></div><h3>About the opportunity</h3><p>{detail.description||`Join ${detail.company} and contribute to meaningful projects while learning alongside an experienced team.`}</p><h3>Responsibilities</h3><p>{detail.responsibilities||'Collaborate with the team, contribute to assigned projects, communicate progress and document your work.'}</p><h3>Skills & requirements</h3><p>{detail.requirements||'Relevant academic background, curiosity, communication skills and willingness to learn.'}</p><div className="job-detail-actions"><Btn kind="outline" onClick={()=>setDetail(null)}>Close</Btn><Btn onClick={()=>{setApplyJob(detail);setDetail(null);setResume(null);setNotice('')}}>{applications.some(a=>String(a.jobId)===String(detail.id??detail.title))?'Apply again':'Apply for this role'} <ArrowRight size={15}/></Btn></div></div></section></div>}
 {applyJob&&<div className="job-modal-backdrop" onClick={()=>setApplyJob(null)}><section className="job-apply-modal" onClick={e=>e.stopPropagation()}><button className="job-modal-close" onClick={()=>setApplyJob(null)}><X/></button><span className="overline blue-text">APPLICATION</span><h2>Apply for {applyJob.title}</h2><p>{applyJob.company} · {applyJob.place||applyJob.location}</p><label className="job-upload-box"><Upload size={22}/><b>{resume?resume.name:'Upload a job-specific resume'}</b><span>PDF only · Maximum 5 MB. Choose a different resume for each role.</span><input type="file" accept="application/pdf,.pdf" onChange={e=>chooseResume(e.target.files?.[0])}/></label>{resume&&<div className="job-resume-selected"><FileText/><span>{resume.name}</span><button onClick={()=>setResume(null)}>Remove</button></div>}<label className="job-cover-label">Cover letter (optional)<textarea rows="5" value={cover} onChange={e=>setCover(e.target.value)} placeholder="Tell the organization why you're interested in this role..."/></label><div className="job-detail-actions"><Btn kind="outline" onClick={()=>setApplyJob(null)}>Cancel</Btn><Btn disabled={!resume} onClick={submit}>Submit application <ArrowRight size={15}/></Btn></div></section></div>}</>;
}
export function MyApplications({applications=[],onUpdate}){
 const [editing,setEditing]=useState(null),[resume,setResume]=useState(null),[cover,setCover]=useState(''),[notice,setNotice]=useState('');
 const locked=a=>['Shortlisted','Selected','Rejected','Withdrawn'].includes(a.status);
 const edit=a=>{setEditing(a);setResume(a.resume||null);setCover(a.coverLetter||'');setNotice('')};
 const choose=file=>{if(!file)return;if(file.type!=='application/pdf'||file.size>5*1024*1024){setNotice('Choose a PDF resume smaller than 5 MB.');return}const reader=new FileReader();reader.onload=()=>setResume({name:file.name,data:String(reader.result),size:file.size});reader.readAsDataURL(file)};
 const save=()=>{if(!resume){setNotice('Attach a resume to save your changes.');return}onUpdate(editing.id,{resume,coverLetter:cover,updatedAt:new Date().toLocaleString(),version:(editing.version||1)+1});setEditing(null);setNotice('Your application has been updated. The organization will see the latest version.');};
 return <><PageHead eyebrow="YOUR CAREER JOURNEY" title="My applications" sub="Track every opportunity and keep the resume attached to each application up to date."/>{notice&&<div className="org-success"><CheckCircle2 size={16}/>{notice}<button onClick={()=>setNotice('')}><X size={14}/></button></div>}<div className="my-applications-list">{applications.map(a=><article className="my-application-card" key={a.id}><div className="my-application-top"><div><span className="overline">{a.company}</span><h3>{a.title}</h3><p>{a.location} · Applied {a.applied}</p></div><Tag tone={a.status==='Rejected'?'orange':a.status==='Selected'?'green':a.status==='Shortlisted'?'green':'blue'}>{a.status}</Tag></div><div className="my-application-resume"><FileText/><div><b>{a.resume?.name||'Resume not attached'}</b><small>Submitted version {a.version||1}{a.updatedAt?` · Updated ${a.updatedAt}`:''}</small></div><button onClick={()=>edit(a)} disabled={locked(a)}>Edit application <Pencil size={14}/></button></div>{a.history?.length>0&&<details className="application-history"><summary>Resume & edit history ({a.history.length})</summary>{a.history.map((h,i)=><p key={i}><FileText size={14}/>{h.name} <small>· {h.date}</small></p>)}</details>}{locked(a)&&<small className="application-locked-note">Editing is closed because this application is {a.status.toLowerCase()}. Contact the organization if you need to replace a document.</small>}</article>)}{!applications.length&&<div className="empty-discovery"><FileText size={26}/><b>No applications yet</b><span>When you apply for an opportunity, it will appear here.</span></div>}</div>
 {editing&&<div className="job-modal-backdrop" onClick={()=>setEditing(null)}><section className="job-apply-modal" onClick={e=>e.stopPropagation()}><button className="job-modal-close" onClick={()=>setEditing(null)}><X/></button><span className="overline blue-text">UPDATE APPLICATION</span><h2>{editing.title}</h2><p>You can replace the resume you submitted and update your cover letter while the application is still being reviewed.</p><label className="job-upload-box"><Upload size={22}/><b>{resume?.name||'Choose replacement resume'}</b><span>PDF only · Maximum 5 MB</span><input type="file" accept="application/pdf,.pdf" onChange={e=>choose(e.target.files?.[0])}/></label><label className="job-cover-label">Cover letter<textarea rows="5" value={cover} onChange={e=>setCover(e.target.value)}/></label><div className="job-detail-actions"><Btn kind="outline" onClick={()=>setEditing(null)}>Cancel</Btn><Btn disabled={!resume} onClick={save}>Save changes <Check size={15}/></Btn></div></section></div>}</>;
}
