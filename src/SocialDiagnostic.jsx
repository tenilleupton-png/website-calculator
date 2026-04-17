import { useState } from "react";
 
const T = {
  bg:"#E8E0D4", dark:"#1A1A1A", orange:"#E85D26", cream:"#F5F0EB",
  sand:"#D4C8B8", black:"#1A1A1A", rule:"rgba(107,95,82,0.2)",
  red:"#C0392B", redBg:"rgba(192,57,43,0.08)",
  amber:"#C4860A", amberBg:"rgba(196,134,10,0.08)",
  green:"#2D6A20", greenBg:"rgba(45,106,32,0.08)",
};
const mono={fontFamily:"'IBM Plex Mono',monospace"};
const serif={fontFamily:"'Playfair Display',serif"};
const sans={fontFamily:"'Lato',sans-serif"};
const ragColor=s=>s==="red"?T.red:s==="amber"?T.amber:T.green;
const ragBg=s=>s==="red"?T.redBg:s==="amber"?T.amberBg:T.greenBg;
const ragLabel=s=>s==="red"?"Critical":s==="amber"?"Improve":"Strong";
 
const PLATFORMS=[
  {id:"instagram",label:"Instagram",icon:"📷",placeholder:"instagram.com/yourbusiness"},
  {id:"facebook",label:"Facebook",icon:"📘",placeholder:"facebook.com/yourbusiness"},
  {id:"linkedin",label:"LinkedIn",icon:"💼",placeholder:"linkedin.com/company/yourbusiness"},
  {id:"tiktok",label:"TikTok",icon:"🎵",placeholder:"tiktok.com/@yourbusiness"},
  {id:"youtube",label:"YouTube",icon:"▶️",placeholder:"youtube.com/@yourbusiness"},
  {id:"twitter",label:"X/Twitter",icon:"✕",placeholder:"x.com/yourbusiness"},
];
 
const PLATFORM_CHECKS={
  instagram:[
    {id:"bio",cat:"Profile",label:"Bio clarity & keyword use",canAssess:true},
    {id:"link",cat:"Profile",label:"Link in bio — destination quality",canAssess:true},
    {id:"handle",cat:"Profile",label:"Handle consistency & searchability",canAssess:true},
    {id:"bizProfile",cat:"Profile",label:"Business profile configured",canAssess:true},
    {id:"followers",cat:"Presence",label:"Follower count & growth signal",canAssess:true},
    {id:"postCount",cat:"Presence",label:"Post volume & consistency",canAssess:true},
    {id:"reels",cat:"Content Strategy",label:"Reels usage (highest reach format)",canAssess:true},
    {id:"highlights",cat:"Content Strategy",label:"Story Highlights configured",canAssess:true},
    {id:"ctaCaptions",cat:"Lead Gen",label:"CTA presence in captions",canAssess:true},
    {id:"linkBioDest",cat:"Lead Gen",label:"Link drives to a lead action",canAssess:true},
    {id:"engagement",cat:"Performance",label:"Engagement rate",canAssess:false},
    {id:"reach",cat:"Performance",label:"Reach & impressions",canAssess:false},
    {id:"storyViews",cat:"Performance",label:"Story view rate",canAssess:false},
  ],
  facebook:[
    {id:"bio",cat:"Profile",label:"About section completeness",canAssess:true},
    {id:"link",cat:"Profile",label:"Website link present",canAssess:true},
    {id:"category",cat:"Profile",label:"Business category correct",canAssess:true},
    {id:"cta",cat:"Profile",label:"Page CTA button configured",canAssess:true},
    {id:"followers",cat:"Presence",label:"Follower / Like count",canAssess:true},
    {id:"postFreq",cat:"Content Strategy",label:"Post frequency (visible)",canAssess:true},
    {id:"adLibrary",cat:"Lead Gen",label:"Paid ads running (Meta Ad Library)",canAssess:true},
    {id:"reviews",cat:"Lead Gen",label:"Reviews / ratings visible",canAssess:true},
    {id:"engagement",cat:"Performance",label:"Post engagement rate",canAssess:false},
    {id:"reach",cat:"Performance",label:"Page reach & impressions",canAssess:false},
  ],
  linkedin:[
    {id:"bio",cat:"Profile",label:"Company description quality",canAssess:true},
    {id:"tagline",cat:"Profile",label:"Tagline present & specific",canAssess:true},
    {id:"logo",cat:"Profile",label:"Logo & cover image set",canAssess:true},
    {id:"website",cat:"Profile",label:"Website URL linked",canAssess:true},
    {id:"followers",cat:"Presence",label:"Follower count",canAssess:true},
    {id:"postFreq",cat:"Content Strategy",label:"Recent post activity",canAssess:true},
    {id:"contentMix",cat:"Content Strategy",label:"Content type variety",canAssess:true},
    {id:"ctaPosts",cat:"Lead Gen",label:"CTA / lead posts visible",canAssess:true},
    {id:"showcase",cat:"Lead Gen",label:"Products / services section",canAssess:true},
    {id:"engagement",cat:"Performance",label:"Post impressions & engagement",canAssess:false},
  ],
  tiktok:[
    {id:"bio",cat:"Profile",label:"Bio clarity & keyword use",canAssess:true},
    {id:"link",cat:"Profile",label:"Link in bio present",canAssess:true},
    {id:"followers",cat:"Presence",label:"Follower count",canAssess:true},
    {id:"postCount",cat:"Presence",label:"Video count",canAssess:true},
    {id:"likes",cat:"Presence",label:"Total likes (visible)",canAssess:true},
    {id:"contentType",cat:"Content Strategy",label:"Educational vs entertainment mix",canAssess:true},
    {id:"engagement",cat:"Performance",label:"Per-video view & engagement rate",canAssess:false},
  ],
  youtube:[
    {id:"bio",cat:"Profile",label:"Channel description quality",canAssess:true},
    {id:"handle",cat:"Profile",label:"Custom URL / handle set",canAssess:true},
    {id:"subscribers",cat:"Presence",label:"Subscriber count",canAssess:true},
    {id:"videoCount",cat:"Presence",label:"Video library size",canAssess:true},
    {id:"thumbs",cat:"Content Strategy",label:"Thumbnail consistency",canAssess:true},
    {id:"playlists",cat:"Content Strategy",label:"Content in playlists",canAssess:true},
    {id:"cta",cat:"Lead Gen",label:"End screens / cards with CTAs",canAssess:true},
    {id:"viewRate",cat:"Performance",label:"View count & watch time",canAssess:false},
  ],
  twitter:[
    {id:"bio",cat:"Profile",label:"Bio clarity & keyword use",canAssess:true},
    {id:"link",cat:"Profile",label:"Website link present",canAssess:true},
    {id:"pinned",cat:"Profile",label:"Pinned post (strategic use)",canAssess:true},
    {id:"followers",cat:"Presence",label:"Follower count & ratio",canAssess:true},
    {id:"postFreq",cat:"Content Strategy",label:"Post frequency & recency",canAssess:true},
    {id:"engagement",cat:"Performance",label:"Impression & engagement rate",canAssess:false},
  ],
};
 
const SCAN_STEPS=["Resolving platform profiles...","Reading profile metadata...","Analysing bio and description...","Checking link-in-bio destination...","Scanning content strategy signals...","Assessing lead generation setup...","Checking for paid activity...","Reviewing cross-platform consistency...","Generating diagnostic..."];
 
function detectPlatform(url){
  if(!url)return null;const u=url.toLowerCase();
  if(u.includes("instagram.com"))return"instagram";
  if(u.includes("facebook.com")||u.includes("fb.com"))return"facebook";
  if(u.includes("linkedin.com"))return"linkedin";
  if(u.includes("tiktok.com"))return"tiktok";
  if(u.includes("youtube.com")||u.includes("youtu.be"))return"youtube";
  if(u.includes("twitter.com")||u.includes("x.com"))return"twitter";
  return null;
}
function cleanUrl(url){return url?url.startsWith("http")?url:`https://${url}`:"";}
function CHECKS_FOR(p){return PLATFORM_CHECKS[p]||PLATFORM_CHECKS.instagram;}
function groupChecks(defs,res){
  const cats={};
  (defs||[]).forEach(def=>{
    if(!cats[def.cat])cats[def.cat]=[];
    const r=res?.[def.id];
    cats[def.cat].push({...def,...(r||{}),status:r?.status||"amber",finding:r?.finding||"Could not assess"});
  });
  return cats;
}
 
export default function SocialDiagnostic(){
  const[inputs,setInputs]=useState([{id:1,url:""}]);
  const[stage,setStage]=useState("input");
  const[progress,setProgress]=useState(0);
  const[scanStep,setScanStep]=useState("");
  const[results,setResults]=useState([]);
  const[summary,setSummary]=useState(null);
  const[email,setEmail]=useState("");
  const[emailSent,setEmailSent]=useState(false);
  const[expanded,setExpanded]=useState(null);
 
  const addInput=()=>setInputs(p=>[...p,{id:Date.now(),url:""}]);
  const removeInput=id=>setInputs(p=>p.filter(i=>i.id!==id));
  const updateInput=(id,val)=>setInputs(p=>p.map(i=>i.id===id?{...i,url:val}:i));
  const pmeta=pid=>PLATFORMS.find(p=>p.id===pid)||{label:pid,icon:"🌐",color:T.orange};
 
  const runScan=async()=>{
    const valid=inputs.map(i=>i.url.trim()).filter(Boolean);
    if(!valid.length)return;
    setStage("scanning");setProgress(0);
    const step=async i=>{setScanStep(SCAN_STEPS[i]);setProgress(Math.round(((i+1)/SCAN_STEPS.length)*80));await new Promise(r=>setTimeout(r,380+Math.random()*220));};
    for(let i=0;i<5;i++)await step(i);
    const platformResults=[];
    for(const url of valid){
      const platform=detectPlatform(url);
      const checks=CHECKS_FOR(platform);
      const assessable=checks.filter(c=>c.canAssess);
      const notAssessable=checks.filter(c=>!c.canAssess);
      try{
        const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Search and analyse: ${cleanUrl(url)}\n\nReturn ONLY JSON:\n{"platform":"${platform||"unknown"}","profileUrl":"${cleanUrl(url)}","handle":"handle","businessName":"name","businessType":"type","followers":"count","following":"count","postCount":"count","bio":"bio text","hasLink":false,"linkDestination":"none","checks":{${assessable.map(c=>`"${c.id}":{"status":"red|amber|green","finding":"one sentence"}`).join(",")}},"topStrengths":[],"criticalGaps":[],"quickWins":[],"leadGenScore":"red|amber|green","profileScore":"red|amber|green","contentScore":"red|amber|green","notAssessable":["${notAssessable.map(c=>c.label).join('","')}"],"additionalObservations":"observations"}`}]})});
        const data=await res.json();
        let parsed=null;
        for(const b of(data.content||[])){if(b.type==="text"){try{const c=b.text.replace(/```json|```/g,"").trim();const s=c.indexOf("{"),e=c.lastIndexOf("}");if(s!==-1&&e!==-1)parsed=JSON.parse(c.slice(s,e+1));}catch{}}}
        if(parsed){parsed.platform=platform||parsed.platform||"unknown";parsed.checkDefs=checks;platformResults.push(parsed);}
      }catch{platformResults.push({platform:platform||"unknown",profileUrl:cleanUrl(url),handle:url,error:"Could not access this profile — it may be private or the URL may be incorrect.",checkDefs:checks});}
    }
    for(let i=5;i<8;i++)await step(i);
    setProgress(88);setScanStep("Generating AI diagnostic...");
    let summaryData=null;
    try{
      const profileSummaries=platformResults.map(r=>`${r.platform} (@${r.handle}): ${r.followers||"?"} followers, lead gen: ${r.leadGenScore||"?"}, gaps: ${(r.criticalGaps||[]).join("; ")}`).join("\n");
      const sr=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`You are Tenille Upton, TI Strategy Co. Social media diagnostic across ${platformResults.length} platforms.\n\n${profileSummaries}\n\nReturn ONLY JSON:\n{"headline":"biggest problem max 15 words","overallSummary":"2-3 sentences specific and direct","biggestGap":"one sentence","platformConsistency":"red|amber|green","consistencyNote":"one sentence","priorityAction":"specific action","roiLine":"one sentence on lead gen impact","diagnosticCTA":"one sentence urgency"}`}]})});
      const sd=await sr.json();
      for(const b of(sd.content||[])){if(b.type==="text"){try{const c=b.text.replace(/```json|```/g,"").trim();const s=c.indexOf("{"),e=c.lastIndexOf("}");if(s!==-1&&e!==-1)summaryData=JSON.parse(c.slice(s,e+1));}catch{}}}
    }catch{}
    setResults(platformResults);setSummary(summaryData);setExpanded(platformResults[0]?.platform||null);setProgress(100);await new Promise(r=>setTimeout(r,300));setStage("result");
  };
 
  const reset=()=>{setInputs([{id:1,url:""}]);setStage("input");setProgress(0);setResults([]);setSummary(null);setEmail("");setEmailSent(false);};
 
  return(
    <div style={{background:T.bg,minHeight:"100vh",color:T.black,fontFamily:"'Lato',sans-serif",WebkitFontSmoothing:"antialiased"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400&family=Lato:wght@300;400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input::placeholder{color:#6B5F52;}input:focus{outline:none;}button{cursor:pointer;}.fade{animation:fadeUp 0.5s ease forwards;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}`}</style>
 
      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${T.rule}`,padding:"0 40px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",background:T.bg}}>
        <span style={{...serif,fontSize:15,color:T.black}}>TI Strategy <span style={{color:T.orange}}>Co.</span></span>
        <span style={{...mono,fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:T.black}}>Free Social Media Diagnostic</span>
      </div>
 
      {/* INPUT */}
      {stage==="input"&&(
        <div style={{maxWidth:680,margin:"0 auto",padding:"72px 32px 80px",textAlign:"center"}} className="fade">
          <span style={{...mono,fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:T.orange,display:"block",marginBottom:20}}>Free Diagnostic · No Login Required</span>
          <h1 style={{...serif,fontSize:"clamp(32px,5vw,52px)",fontWeight:400,lineHeight:1.1,marginBottom:20,color:T.black}}>Is your social media<br/><em style={{fontStyle:"italic",color:T.orange}}>generating leads?</em></h1>
          <p style={{fontSize:15,color:T.black,lineHeight:1.8,fontWeight:300,marginBottom:48,maxWidth:500,margin:"0 auto 48px"}}>Paste your social media profile URLs below. We scan what's publicly visible — profile optimisation, content strategy signals, and lead generation gaps.</p>
          <div style={{textAlign:"left",marginBottom:24}}>
            <div style={{...mono,fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:T.black,marginBottom:14}}>Paste your social media URLs</div>
            {inputs.map(inp=>{
              const detected=detectPlatform(inp.url);const meta=detected?pmeta(detected):null;
              return(
                <div key={inp.id} style={{display:"flex",marginBottom:2,border:`1px solid ${detected?T.orange:T.sand}`,background:"#fff",transition:"border-color 0.2s"}}>
                  <div style={{width:48,background:"rgba(232,224,212,0.4)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,borderRight:`1px solid ${T.sand}`}}><span style={{fontSize:18}}>{meta?.icon||"🔗"}</span></div>
                  <input value={inp.url} onChange={e=>updateInput(inp.id,e.target.value)} onKeyDown={e=>e.key==="Enter"&&addInput()} placeholder={meta?.placeholder||"instagram.com/yourbusiness"} style={{flex:1,background:"transparent",border:"none",color:T.black,...sans,fontSize:13,fontWeight:300,padding:"14px 16px"}}/>
                  {detected&&<div style={{display:"flex",alignItems:"center",padding:"0 14px",...mono,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:T.orange,flexShrink:0}}>{meta?.label}</div>}
                  {inputs.length>1&&<button onClick={()=>removeInput(inp.id)} style={{background:"transparent",border:"none",color:T.black,padding:"0 14px",fontSize:18,flexShrink:0}}>×</button>}
                </div>
              );
            })}
            <button onClick={addInput} style={{...mono,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",background:"transparent",border:`1px dashed ${T.sand}`,color:T.black,padding:"10px 16px",width:"100%",marginTop:2}}>+ Add another platform</button>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:36}}>
            {PLATFORMS.map(p=>(
              <button key={p.id} onClick={()=>{const empty=inputs.find(i=>!i.url);if(empty)updateInput(empty.id,`https://${p.placeholder}`);else addInput();}} style={{...mono,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",background:"rgba(255,255,255,0.6)",border:`1px solid ${T.sand}`,color:T.black,padding:"6px 14px",display:"flex",alignItems:"center",gap:6}}><span>{p.icon}</span>{p.label}</button>
            ))}
          </div>
          <button onClick={runScan} disabled={!inputs.some(i=>i.url.trim())} style={{background:inputs.some(i=>i.url.trim())?T.orange:T.sand,border:"none",color:"#fff",...mono,fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",padding:"18px 48px",width:"100%",maxWidth:400}}>Run Social Diagnostic →</button>
          <div style={{...mono,fontSize:9,letterSpacing:"0.12em",color:T.black,marginTop:12,textTransform:"uppercase"}}>Reads publicly visible data only · No login · Free</div>
          <div style={{marginTop:56,border:`1px solid ${T.sand}`,textAlign:"left"}}>
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.sand}`,background:"rgba(255,255,255,0.4)"}}><span style={{...mono,fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:T.black}}>What this diagnostic assesses</span></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:T.sand}}>
              {[{icon:"✅",label:"Can assess",items:["Follower & post counts","Bio and description quality","Link in bio destination","Profile completeness","Content strategy signals","CTA presence in visible posts","Cross-platform consistency","Paid ads (Facebook — Meta Ad Library)"],c:T.green},{icon:"❌",label:"Needs account access",items:["Engagement rate","Reach & impressions","Story / Reel view counts","Audience demographics","Social-to-website conversions","DM volume","Revenue attributed to social"],c:T.red}].map((col,i)=>(
                <div key={i} style={{background:"#fff",padding:"20px"}}>
                  <div style={{...mono,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:col.c,marginBottom:12}}>{col.icon} {col.label}</div>
                  {col.items.map(item=><div key={item} style={{fontSize:12,color:T.black,fontWeight:300,padding:"4px 0",borderBottom:`1px solid ${T.sand}`,lineHeight:1.5}}>{item}</div>)}
                </div>
              ))}
            </div>
            <div style={{padding:"14px 20px",background:"rgba(232,93,38,0.06)",borderTop:`1px solid ${T.sand}`}}>
              <span style={{fontSize:12,color:T.black,fontWeight:300,lineHeight:1.65}}><strong style={{color:T.orange}}>Deeper data requires account access.</strong> A $2,500 Strategic Diagnostic reviews your actual account insights — engagement rates, audience quality, and what's driving leads.</span>
            </div>
          </div>
        </div>
      )}
 
      {/* SCANNING */}
      {stage==="scanning"&&(
        <div style={{maxWidth:480,margin:"100px auto 0",padding:"0 32px",textAlign:"center"}} className="fade">
          <span style={{...mono,fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:T.orange,display:"block",marginBottom:52}}>Scanning</span>
          <span style={{...serif,fontSize:"clamp(52px,8vw,80px)",fontWeight:400,color:T.orange,display:"block",lineHeight:1,marginBottom:28}}>{progress}%</span>
          <div style={{height:2,background:T.sand,position:"relative",marginBottom:16}}><div style={{position:"absolute",top:0,left:0,height:"100%",background:T.orange,width:`${progress}%`,transition:"width 0.4s ease"}}/></div>
          <div style={{...mono,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:T.black,marginBottom:40}}>{scanStep}</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            {inputs.filter(i=>i.url).map(i=>{const p=detectPlatform(i.url);const m=pmeta(p||"");return<span key={i.id} style={{...mono,fontSize:9,padding:"4px 12px",background:"rgba(232,93,38,0.1)",color:T.orange}}>{m?.icon} {i.url.replace("https://","").split("/")[0]}</span>;})}
          </div>
        </div>
      )}
 
      {/* RESULTS */}
      {stage==="result"&&(
        <div style={{maxWidth:900,margin:"0 auto",padding:"52px 32px 80px"}} className="fade">
          {summary&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${results.length+1},1fr)`,gap:1,background:T.sand,marginBottom:1}}>
                <div style={{background:"#fff",padding:"22px 20px"}}>
                  <span style={{...mono,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:T.black,display:"block",marginBottom:5}}>Platforms Scanned</span>
                  <span style={{...serif,fontSize:32,fontWeight:700,color:T.orange,display:"block",lineHeight:1,marginBottom:3}}>{results.length}</span>
                  <span style={{...mono,fontSize:9,color:T.black}}>Consistency: <span style={{color:ragColor(summary.platformConsistency||"amber")}}>{ragLabel(summary.platformConsistency||"amber")}</span></span>
                </div>
                {results.map(r=>{const m=pmeta(r.platform);const overall=r.leadGenScore==="red"||r.profileScore==="red"?"red":r.leadGenScore==="amber"||r.profileScore==="amber"?"amber":"green";return(
                  <div key={r.platform} style={{background:"#fff",padding:"22px 20px"}}>
                    <span style={{...mono,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:T.black,display:"block",marginBottom:5}}>{m.icon} {m.label}</span>
                    <span style={{...serif,fontSize:22,fontWeight:700,color:ragColor(overall),display:"block",lineHeight:1,marginBottom:3}}>{ragLabel(overall)}</span>
                    <span style={{...mono,fontSize:9,color:T.black}}>{r.followers||"?"} followers</span>
                  </div>
                );})}
              </div>
              <div style={{background:"#fff",border:`1px solid ${T.sand}`,borderLeft:`4px solid ${T.orange}`,padding:"28px 32px",marginBottom:1}}>
                <span style={{...mono,fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:T.orange,display:"block",marginBottom:12}}>✦ Cross-Platform Diagnostic Summary</span>
                <h2 style={{...serif,fontSize:"clamp(16px,2.5vw,22px)",fontWeight:700,color:T.black,lineHeight:1.3,marginBottom:14}}>{summary.headline}</h2>
                <p style={{fontSize:13.5,color:T.black,fontWeight:300,lineHeight:1.8,marginBottom:16}}>{summary.overallSummary}</p>
                {summary.consistencyNote&&<div style={{padding:"12px 16px",background:"rgba(232,224,212,0.5)",borderLeft:`3px solid ${T.orange}`}}><span style={{...mono,fontSize:9,color:T.orange,letterSpacing:"0.12em",textTransform:"uppercase",display:"block",marginBottom:4}}>Cross-platform consistency</span><span style={{fontSize:12.5,color:T.black,fontWeight:300}}>{summary.consistencyNote}</span></div>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,marginBottom:1,background:T.sand}}>
                <div style={{background:"#fff",padding:"22px 24px"}}><span style={{...mono,fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:T.amber,display:"block",marginBottom:8}}>Biggest Gap</span><p style={{fontSize:13.5,color:T.black,fontWeight:400,lineHeight:1.65}}>{summary.biggestGap}</p></div>
                <div style={{background:"#fff",padding:"22px 24px"}}><span style={{...mono,fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:T.green,display:"block",marginBottom:8}}>Priority Action</span><p style={{fontSize:13.5,color:T.black,fontWeight:400,lineHeight:1.65}}>{summary.priorityAction}</p></div>
              </div>
            </>
          )}
 
          {/* Platform tabs */}
          <div style={{display:"flex",gap:1,background:T.sand}}>
            {results.map(r=>{const m=pmeta(r.platform);const active=expanded===r.platform;return(
              <button key={r.platform} onClick={()=>setExpanded(active?null:r.platform)} style={{flex:1,background:active?"rgba(232,93,38,0.08)":"#fff",border:"none",padding:"14px 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,borderBottom:active?`2px solid ${T.orange}`:"2px solid transparent",transition:"all 0.15s"}}>
                <span style={{fontSize:18}}>{m.icon}</span>
                <span style={{...mono,fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:active?T.orange:T.black}}>{m.label}</span>
                {r.followers&&<span style={{...mono,fontSize:8,color:T.black}}>{r.followers}</span>}
              </button>
            );})}
          </div>
 
          {results.map(r=>{
            if(expanded!==r.platform)return null;
            const cats=groupChecks(r.checkDefs,r.checks);
            const notAssessable=(r.checkDefs||[]).filter(c=>!c.canAssess);
            if(r.error)return<div key={r.platform} style={{border:`1px solid ${T.sand}`,padding:"32px",textAlign:"center",background:"#fff"}}><span style={{...mono,fontSize:10,color:T.red,display:"block",marginBottom:8}}>Scan failed</span><p style={{fontSize:13.5,color:T.black,fontWeight:300}}>{r.error}</p></div>;
            return(
              <div key={r.platform} className="fade">
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:T.sand,borderTop:`1px solid ${T.sand}`}}>
                  {[{label:"Handle",value:`@${r.handle||"—"}`},{label:"Followers",value:r.followers||"Not visible"},{label:"Posts",value:r.postCount||"Not visible"}].map(c=>(
                    <div key={c.label} style={{background:"#fff",padding:"18px 20px"}}>
                      <span style={{...mono,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:T.black,display:"block",marginBottom:4}}>{c.label}</span>
                      <span style={{...mono,fontSize:13,color:T.black}}>{c.value}</span>
                    </div>
                  ))}
                </div>
                {r.bio&&r.bio!=="not found"&&<div style={{padding:"16px 20px",background:"rgba(255,255,255,0.7)",borderTop:`1px solid ${T.sand}`,borderBottom:`1px solid ${T.sand}`}}><span style={{...mono,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:T.black,display:"block",marginBottom:6}}>Bio</span><p style={{fontSize:13,color:T.black,fontWeight:300,lineHeight:1.65,fontStyle:"italic"}}>"{r.bio}"</p></div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:T.sand}}>
                  {[{label:"Profile Optimisation",score:r.profileScore},{label:"Content Strategy",score:r.contentScore},{label:"Lead Generation",score:r.leadGenScore}].map(s=>(
                    <div key={s.label} style={{background:"#fff",padding:"16px 20px"}}>
                      <span style={{...mono,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:T.black,display:"block",marginBottom:6}}>{s.label}</span>
                      <span style={{...mono,fontSize:11,padding:"3px 10px",background:ragBg(s.score||"amber"),color:ragColor(s.score||"amber"),borderRadius:2}}>{ragLabel(s.score||"amber")}</span>
                    </div>
                  ))}
                </div>
                {Object.entries(cats).map(([cat,catChecks])=>(
                  <div key={cat}>
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 20px",background:"rgba(232,224,212,0.6)",borderTop:`1px solid ${T.sand}`}}>
                      <span style={{...mono,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:T.black,fontWeight:600}}>{cat}</span>
                      <span style={{...mono,fontSize:9,color:T.black,marginLeft:"auto"}}>{catChecks.filter(c=>c.canAssess&&c.status==="green").length}/{catChecks.filter(c=>c.canAssess).length} passing</span>
                    </div>
                    {catChecks.map(check=>(
                      <div key={check.id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"11px 20px 11px 32px",borderTop:`1px solid ${T.sand}`,background:!check.canAssess?"rgba(232,224,212,0.2)":check.status==="red"?"rgba(192,57,43,0.05)":"#fff"}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:check.finding?4:0}}>
                            <span style={{fontSize:12.5,color:T.black,fontWeight:300}}>{check.label}</span>
                            {!check.canAssess&&<span style={{...mono,fontSize:7,letterSpacing:"0.1em",textTransform:"uppercase",color:T.black,padding:"1px 6px",border:`1px solid ${T.sand}`}}>needs account access</span>}
                          </div>
                          {check.canAssess&&check.finding&&<div style={{fontSize:11.5,color:T.black,fontWeight:300,lineHeight:1.55}}>{check.finding}</div>}
                        </div>
                        {check.canAssess?(
                          <span style={{...mono,fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",padding:"3px 10px",background:ragBg(check.status),color:ragColor(check.status),flexShrink:0,marginTop:2,borderRadius:2}}>{ragLabel(check.status)}</span>
                        ):(
                          <span style={{...mono,fontSize:8,letterSpacing:"0.1em",textTransform:"uppercase",padding:"3px 8px",background:"rgba(107,95,82,0.1)",color:T.black,flexShrink:0,marginTop:2,borderRadius:2}}>Private</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                {(r.topStrengths?.length||r.criticalGaps?.length||r.quickWins?.length)&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:T.sand,borderTop:`1px solid ${T.sand}`}}>
                    {[{label:"Strengths",color:T.green,items:r.topStrengths||[],prefix:"✓"},{label:"Critical Gaps",color:T.red,items:r.criticalGaps||[],prefix:"→"},{label:"Quick Wins This Week",color:T.amber,items:r.quickWins||[],prefix:"⚡"}].map(col=>(
                      <div key={col.label} style={{background:"#fff",padding:"20px"}}>
                        <span style={{...mono,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:col.color,display:"block",marginBottom:10}}>{col.label}</span>
                        {col.items.map((s,i)=><div key={i} style={{fontSize:12,color:T.black,fontWeight:300,padding:"5px 0",borderBottom:`1px solid ${T.sand}`,lineHeight:1.5}}>{col.prefix} {s}</div>)}
                        {!col.items.length&&<div style={{fontSize:12,color:T.black,fontWeight:300}}>None identified</div>}
                      </div>
                    ))}
                  </div>
                )}
                {notAssessable.length>0&&<div style={{padding:"14px 20px",background:"rgba(232,224,212,0.3)",borderTop:`1px solid ${T.sand}`}}><span style={{...mono,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:T.black,display:"block",marginBottom:8}}>Not assessable without account access</span><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{notAssessable.map(c=><span key={c.id} style={{...mono,fontSize:8,padding:"2px 8px",background:"rgba(107,95,82,0.1)",color:T.black,borderRadius:2}}>{c.label}</span>)}</div></div>}
                {r.additionalObservations&&<div style={{padding:"16px 20px",background:"rgba(232,93,38,0.05)",borderTop:`1px solid ${T.sand}`}}><span style={{...mono,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:T.orange,display:"block",marginBottom:6}}>Additional Observations</span><p style={{fontSize:12.5,color:T.black,fontWeight:300,lineHeight:1.65}}>{r.additionalObservations}</p></div>}
              </div>
            );
          })}
 
          {summary?.roiLine&&<div style={{padding:"20px 24px",background:"rgba(192,57,43,0.06)",border:`1px solid rgba(192,57,43,0.15)`,marginTop:1}}><span style={{...mono,fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:T.red,display:"block",marginBottom:6}}>Lead Generation Impact</span><p style={{fontSize:13.5,color:T.black,fontWeight:300,lineHeight:1.75}}>{summary.roiLine}</p></div>}
 
          {/* CTA */}
          <div style={{background:T.dark,padding:"40px 36px",textAlign:"center",marginTop:1}}>
            <span style={{...mono,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(245,240,235,0.7)",display:"block",marginBottom:14}}>What a full diagnostic includes</span>
            <h3 style={{...serif,fontSize:"clamp(18px,3vw,26px)",fontWeight:700,color:T.cream,marginBottom:12,lineHeight:1.3}}>{summary?.diagnosticCTA||`Gaps found across ${results.length} platform${results.length>1?"s":""}. A Strategic Diagnostic maps the full picture.`}</h3>
            <p style={{fontSize:13.5,color:"rgba(245,240,235,0.9)",fontWeight:300,marginBottom:32,lineHeight:1.7,maxWidth:520,margin:"0 auto 32px"}}>The $2,500 Strategic Diagnostic reviews your actual account insights — engagement rates, audience quality, content performance, and what's driving enquiries.</p>
            {!emailSent?(
              <>
                <div style={{...mono,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(245,240,235,0.7)",marginBottom:14}}>Send this report to my inbox</div>
                <div style={{display:"flex",maxWidth:400,margin:"0 auto 20px",border:"1px solid rgba(245,240,235,0.2)"}}>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{flex:1,background:"rgba(245,240,235,0.08)",border:"none",color:T.cream,...sans,fontSize:13,fontWeight:300,padding:"13px 16px"}}/>
                  <button onClick={()=>email&&setEmailSent(true)} style={{background:T.orange,border:"none",color:"#fff",...mono,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",padding:"13px 18px",flexShrink:0}}>Send →</button>
                </div>
                <div style={{...mono,fontSize:9,color:"rgba(245,240,235,0.5)",marginBottom:20}}>or</div>
                <a href="https://ti-strategy.com.au/book-a-call" target="_blank" rel="noreferrer" style={{display:"inline-block",background:T.orange,color:"#fff",...mono,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",padding:"16px 40px",textDecoration:"none"}}>Book a Free 20-Min Strategy Call →</a>
                <div style={{...mono,fontSize:9,color:"rgba(245,240,235,0.5)",marginTop:12}}>tenille@ti-strategy.com · No pitch · 20 minutes</div>
              </>
            ):(
              <div>
                <div style={{...serif,fontSize:20,color:T.cream,marginBottom:8}}>Report sent to {email}</div>
                <p style={{fontSize:13,color:"rgba(245,240,235,0.9)",fontWeight:300,marginBottom:28}}>Check your inbox — then book a call to discuss your results.</p>
                <a href="https://ti-strategy.com.au/book-a-call" target="_blank" rel="noreferrer" style={{display:"inline-block",background:T.orange,color:"#fff",...mono,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",padding:"16px 40px",textDecoration:"none"}}>Book a Free Strategy Call →</a>
              </div>
            )}
          </div>
          <button onClick={reset} style={{...mono,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",background:"transparent",border:`1px solid ${T.sand}`,color:T.black,padding:"10px 20px",display:"block",margin:"24px auto 0"}}>← Scan different profiles</button>
        </div>
      )}
 
      <div style={{borderTop:`1px solid ${T.sand}`,padding:"20px 40px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginTop:40}}>
        <span style={{...mono,fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:T.black}}>TI Strategy Co · <span style={{color:T.orange}}>tenille@ti-strategy.com</span> · ABN 44 507 322 727</span>
        <span style={{...mono,fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:T.black}}>Reads publicly visible signals only · Engagement data requires account access</span>
      </div>
    </div>
  );
}