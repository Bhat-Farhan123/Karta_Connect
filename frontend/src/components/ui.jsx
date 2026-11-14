import React from 'react';

export const cls=(...x)=>x.filter(Boolean).join(' ');

export function Avatar({src,initials='FN',size='',alumni=false}){
  const face=src?<img className={`avatar ${size}`} src={src} alt=""/>:<span className={`avatar fallback ${size}`}>{initials}</span>;
  return alumni?<><style>{`@keyframes kartaAlumniShimmer{0%{background-position:0% 50%;filter:drop-shadow(0 0 3px #d6a84b66)}50%{background-position:100% 50%;filter:drop-shadow(0 0 8px #f4d47a99)}100%{background-position:0% 50%;filter:drop-shadow(0 0 3px #d6a84b66)}}.karta-alumni-avatar-ring{display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;padding:3px;border-radius:50%;background:linear-gradient(120deg,#9b7428,#f8e6a1,#c18b2e,#fff0b2,#9b7428);background-size:260% 260%;animation:kartaAlumniShimmer 3.2s ease-in-out infinite;line-height:0}.karta-alumni-avatar-ring>.avatar{display:block;border:2px solid #fff;border-radius:50%;box-sizing:content-box}.karta-alumni-avatar-ring .avatar{vertical-align:middle}`}</style><span className="karta-alumni-avatar-ring" title="Karta Alumni" aria-label="Karta Alumni">{face}</span></>:face;
}
export function Btn({children,kind='blue',...p}){return <button className={`btn ${kind}`} {...p}>{children}</button>}
export function Tag({children,tone='blue'}){return <span className={`tag ${tone}`}>{children}</span>}
export function PageHead({eyebrow,title,sub,action}){return <div className="page-head"><div>{eyebrow&&<div className="overline blue-text">{eyebrow}</div>}<h1>{title}</h1><p>{sub}</p></div>{action}</div>}
