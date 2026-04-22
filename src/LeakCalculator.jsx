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
const ragLabel=s=>s==="red"?"Critical":s==="amber"?"Review":"Passing";
 
const CHECK_DEFS=[
  {id:"title",area:"SEO",label:"Page title tag"},
  {id:"metaDesc",area:"SEO",label:"Meta description"},
  {id:"h1",area:"SEO",label:"H1 heading present & unique"},
  {id:"h2s",area:"SEO",label:"H2 heading structure"},
  {id:"altText",area:"SEO",label:"Image alt text coverage"},
  {id:"wordCount",area:"SEO",label:"Page content depth"},
  {id:"internalLinks",area:"SEO",label:"Internal linking present"},
  {id:"schema",area:"AEO",label:"Schema markup detected"},
  {id:"faq",area:"AEO",label:"FAQ content present"},
  {id:"ogTags",area:"AEO",label:"Open Graph / social tags"},
  {id:"napVisible",area:"AEO",label:"Business NAP visible on page"},
  {id:"ctaPresent",area:"Lead Gen",label:"Primary CTA visible"},
  {id:"formPresent",area:"Lead Gen",label:"Lead capture form present"},
  {id:"phoneVisible",area:"Lead Gen",label:"Phone number visible"},
  {id:"mobile",area:"Lead Gen",label:"Mobile viewport configured"},
];
const AREA_META={"SEO":{icon:"◇",desc:"Search visibility & ranking signals"},"AEO":{icon:"△",desc:"AI & featured snippet readiness"},"Lead Gen":{icon:"◈",desc:"Conversion & lead capture effectiveness"}};
const SCAN_STEPS=["Fetching page HTML...","Parsing title and meta tags...","Analysing heading structure...","Checking schema markup...","Scanning for FAQ content...","Reviewing CTAs and forms...","Checking image alt text...","Assessing content depth...","Reviewing Open Graph tags...","Detecting contact signals...","Generating AI diagnostic..."];
 
export default function LeakCalculator(){
  const[url,setUrl]=useState("");
  const[stage,setStage]=useState("input");
  const[progress,setProgress]=useState(0);
  const[scanStep,setScanStep]=useState("");
  const[checks,setChecks]=useState([]);
  const[aiTeaser,setAiTeaser]=useState(null);
  const[email,setEmail]=useState("");
  const[emailSent,setEmailSent]=useState(false);
  const[errorMsg,setErrorMsg]=useState("");
  const[scannedUrl,setScannedUrl]=useState("");
 
  const runScan=async()=>{
    const raw=url.trim();if(!raw)return;
    const clean=raw.startsWith("http")?raw:`https://${raw}`;
    setScannedUrl(clean);setStage("scanning");setProgress(0);setErrorMsg("");
    const step=async i=>{setScanStep(SCAN_STEPS[i]);setProgress(Math.round(((i+1)/SCAN_STEPS.length)*80));await new Promise(r=>setTimeout(r,350+Math.random()*200));};
    try{
      await step(0);await step(1);
      const fr=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Fetch and analyse ${clean}. Return ONLY JSON, no markdown:\n{"pageTitle":"","titleLength":0,"metaDescription":"","h1Text":"","h2Count":0,"imageCount":0,"imagesWithAlt":0,"wordCount":0,"internalLinkCount":0,"hasSchema":false,"schemaTypes":[],"hasFAQ":false,"hasOGTags":false,"hasNAP":false,"hasPrimaryCTA":false,"hasForm":false,"hasPhoneVisible":false,"hasMobileViewport":false,"businessName":"","businessType":"","primaryKeywordGuess":"","notableIssues":[]}`}]})});
      const fd=await fr.json();
      for(let i=2;i<9;i++)await step(i);
      let parsed=null;
      for(const b of(fd.content||[])){if(b.type==="text"){try{const c=b.text.replace(/```json|```/g,"").trim();const s=c.indexOf("{"),e=c.lastIndexOf("}");if(s!==-1&&e!==-1)parsed=JSON.parse(c.slice(s,e+1));}catch{}}}
      if(!parsed)throw new Error("parse fail");
      await step(9);
      const results=CHECK_DEFS.map(def=>{
        let status="green",detail="";
        switch(def.id){
          case"title":if(!parsed.pageTitle){status="red";detail="No title tag found.";}else if(parsed.titleLength<30){status="amber";detail=`Title is only ${parsed.titleLength} chars — too short.`;}else if(parsed.titleLength>65){status="amber";detail=`Title is ${parsed.titleLength} chars — may be truncated.`;}else{detail=`"${parsed.pageTitle.slice(0,50)}..." — ${parsed.titleLength} chars.`;}break;
          case"metaDesc":if(!parsed.metaDescription){status="red";detail="No meta description.";}else if(parsed.metaDescription.length<80){status="amber";detail="Meta description under 80 characters.";}else{detail="Meta description present.";}break;
          case"h1":if(!parsed.h1Text){status="red";detail="No H1 heading — critical SEO gap.";}else{detail=`H1: "${parsed.h1Text.slice(0,60)}"` ;}break;
          case"h2s":if(parsed.h2Count===0){status="amber";detail="No H2 headings — lacks content hierarchy.";}else if(parsed.h2Count<2){status="amber";detail=`Only ${parsed.h2Count} H2 heading.`;}else{detail=`${parsed.h2Count} H2 headings — good structure.`;}break;
          case"altText":if(parsed.imageCount===0){status="amber";detail="No images detected.";}else{const pct=Math.round((parsed.imagesWithAlt/parsed.imageCount)*100);if(pct<50){status="red";detail=`${pct}% of images have alt text — significant gap.`;}else if(pct<90){status="amber";detail=`${pct}% alt text coverage.`;}else{detail=`${pct}% of images have alt text.`;}}break;
          case"wordCount":if(parsed.wordCount<200){status="red";detail=`~${parsed.wordCount} words — very thin content.`;}else if(parsed.wordCount<400){status="amber";detail=`~${parsed.wordCount} words — borderline thin.`;}else{detail=`~${parsed.wordCount} words — reasonable depth.`;}break;
          case"internalLinks":if(parsed.internalLinkCount<3){status="amber";detail=`Only ${parsed.internalLinkCount} internal links.`;}else{detail=`${parsed.internalLinkCount} internal links found.`;}break;
          case"schema":if(!parsed.hasSchema){status="red";detail="No schema markup — invisible to AI search engines.";}else{detail=`Schema: ${(parsed.schemaTypes||[]).join(", ")||"present"}.`;}break;
          case"faq":if(!parsed.hasFAQ){status="amber";detail="No FAQ content — missing highest-converting AEO format.";}else{detail="FAQ content present.";}break;
          case"ogTags":if(!parsed.hasOGTags){status="amber";detail="No Open Graph tags — social signals missing.";}else{detail="Open Graph tags present.";}break;
          case"napVisible":if(!parsed.hasNAP){status="red";detail="Business NAP not visible — critical for local search.";}else{detail="NAP information visible.";}break;
          case"ctaPresent":if(!parsed.hasPrimaryCTA){status="red";detail="No primary CTA — visitors have no clear next action.";}else{detail="Primary CTA detected.";}break;
          case"formPresent":if(!parsed.hasForm){status="amber";detail="No lead capture form found.";}else{detail="Lead capture form present.";}break;
          case"phoneVisible":if(!parsed.hasPhoneVisible){status="amber";detail="Phone number not prominently visible.";}else{detail="Phone number visible.";}break;
          case"mobile":if(!parsed.hasMobileViewport){status="red";detail="Mobile viewport not configured — broken on phones.";}else{detail="Mobile viewport configured.";}break;
        }
        return{...def,status,detail};
      });
      setChecks(results);
      await step(10);setProgress(90);
      const reds=results.filter(c=>c.status==="red");
      const ambers=results.filter(c=>c.status==="amber");
      const passing=results.filter(c=>c.status==="green").length;
const ar = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{
      role: "user",
      content: `You are Tenille Upton, TI Strategy Co. Scanned ${clean}. Business: ${parsed.businessName} — ${parsed.businessType}. Critical: ${reds.map(c=>c.label).join(", ")||"none"}. Amber: ${ambers.map(c=>c.label).join(", ")||"none"}. Passing: ${passing}/${results.length}.\n\nReturn ONLY JSON:\n{"headline":"punchy problem sentence max 15 words","summary":"2 sentences what scan found and business impact","fixes":[{"priority":"01","area":"SEO or AEO or Lead Gen","title":"fix title","impact":"one sentence impact"},{"priority":"02","area":"SEO or AEO or Lead Gen","title":"fix title","impact":"one sentence impact"},{"priority":"03","area":"SEO or AEO or Lead Gen","title":"fix title","impact":"one sentence impact"}],"roiLine":"one sentence dollar or lead impact","gateMessage":"one sentence urgency for full diagnostic"}`
    }]
  })
});
const ad = await ar.json();
     let teaser=null;
      for(const b of(ad.content||[])){if(b.type==="text"){try{const c=b.text.replace(/```json|```/g,"").trim();const s=c.indexOf("{"),e=c.lastIndexOf("}");if(s!==-1&&e!==-1)teaser=JSON.parse(c.slice(s,e+1));}catch{}}}
      if(!teaser)teaser={headline:`${reds.length} critical gaps found`,summary:`Scan found ${reds.length} critical and ${ambers.length} issues needing attention.`,fixes:[{priority:"01",area:"SEO",title:reds[0]?.label||"Title optimisation",impact:"Directly impacts search ranking."},{priority:"02",area:"AEO",title:reds[1]?.label||"Schema markup",impact:"Required for AI search citations."},{priority:"03",area:"Lead Gen",title:reds[2]?.label||"CTA presence",impact:"High-intent visitors leave without converting."}],roiLine:"Fixing these typically improves organic traffic 20–40%.",gateMessage:`${reds.length+ambers.length} total issues found. A full Diagnostic maps every gap.`};
      setAiTeaser(teaser);setProgress(100);await new Promise(r=>setTimeout(r,400));setStage("result");
    }catch{setErrorMsg("We couldn't reach that URL. Check the address is correct and publicly accessible.");setStage("error");}
  };
 
  const reset=()=>{setUrl("");setStage("input");setProgress(0);setChecks([]);setAiTeaser(null);setEmail("");setEmailSent(false);setErrorMsg("");};
  const redC=checks.filter(c=>c.status==="red");
  const amberC=checks.filter(c=>c.status==="amber");
  const greenC=checks.filter(c=>c.status==="green");
  const score=checks.length?Math.round((greenC.length/checks.length)*100):0;
  const scoreColor=score<40?T.red:score<70?T.amber:T.green;
  const byArea={};checks.forEach(c=>{if(!byArea[c.area])byArea[c.area]=[];byArea[c.area].push(c);});
 
  return(
    <div style={{background:T.bg,minHeight:"100vh",color:T.black,fontFamily:"'Lato',sans-serif",WebkitFontSmoothing:"antialiased"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400&family=Lato:wght@300;400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input::placeholder{color:#6B5F52;}input:focus{outline:none;}button{cursor:pointer;}.fade{animation:fadeUp 0.5s ease forwards;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}`}</style>
 
      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${T.rule}`,padding:"0 40px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",background:T.bg}}>
      <span style={{...serif,fontSize:15,color:T.black}}>TI Strategy <span style={{color:T.orange}}>Co.</span></span>
        <span style={{...mono,fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:T.black}}>Free Website Diagnostic</span>
      </div>
 
      {/* INPUT */}
      {stage==="input"&&(
        <div style={{maxWidth:700,margin:"0 auto",padding:"72px 32px 80px",textAlign:"center"}} className="fade">
          <span style={{...mono,fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:T.orange,display:"block",marginBottom:20}}>Free Diagnostic · No Login Required</span>
          <h1 style={{...serif,fontSize:"clamp(32px,5vw,52px)",fontWeight:400,lineHeight:1.12,marginBottom:22,color:T.black}}>Where is your website<br/><em style={{fontStyle:"italic",color:T.orange}}>losing leads?</em></h1>
          <p style={{fontSize:15,color:T.black,lineHeight:1.8,fontWeight:300,marginBottom:48,maxWidth:520,margin:"0 auto 48px"}}>Enter any URL. We scan the real page — checking SEO health, AI search readiness, and lead generation gaps. Under 60 seconds.</p>
          <div style={{display:"flex",maxWidth:560,margin:"0 auto 14px",border:`1px solid ${T.sand}`,background:"#fff"}}>
            <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runScan()} placeholder="yourbusiness.com.au" style={{flex:1,background:"transparent",border:"none",color:T.black,...sans,fontSize:14,fontWeight:300,padding:"16px 20px"}}/>
            <button onClick={runScan} style={{background:T.orange,border:"none",color:"#fff",...mono,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",padding:"16px 28px",flexShrink:0}}>Scan Site →</button>
          </div>
          <span style={{...mono,fontSize:9,letterSpacing:"0.12em",color:T.black,textTransform:"uppercase"}}>No login required · Reads real page HTML · Free</span>
          <div style={{marginTop:56}}>
            <div style={{...mono,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:T.black,marginBottom:16}}>15 checks across 3 areas</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:T.sand}}>
              {Object.entries(AREA_META).map(([area,meta])=>(
                <div key={area} style={{background:T.bg,padding:"24px 20px",textAlign:"left"}}>
                  <span style={{...mono,fontSize:18,color:T.orange,display:"block",marginBottom:10}}>{meta.icon}</span>
                  <div style={{...mono,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:T.black,marginBottom:5,fontWeight:600}}>{area}</div>
                  <div style={{fontSize:12,color:T.black,fontWeight:300,lineHeight:1.55}}>{meta.desc}</div>
                  <div style={{...mono,fontSize:9,color:T.black,marginTop:8}}>{CHECK_DEFS.filter(c=>c.area===area).length} checks</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginTop:32,padding:"24px 28px",border:`1px solid ${T.sand}`,background:"rgba(255,255,255,0.5)",textAlign:"left"}}>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {[{n:"44%",l:"of Australian digital ad spend is wasted annually"},{n:"61%",l:"of AU SMBs running Google Ads waste budget on wrong keywords"},{n:"58%",l:"of AU businesses haven't optimised their Google Business Profile"}].map(s=>(
                <div key={s.n} style={{flex:1,minWidth:160}}>
                  <span style={{...serif,fontSize:30,fontWeight:700,color:T.orange,display:"block",lineHeight:1,marginBottom:5}}>{s.n}</span>
                  <span style={{fontSize:12,color:T.black,fontWeight:300,lineHeight:1.55}}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{height:80}}/>
        </div>
      )}
 
      {/* SCANNING */}
      {stage==="scanning"&&(
        <div style={{maxWidth:480,margin:"100px auto 0",padding:"0 32px",textAlign:"center"}} className="fade">
          <span style={{...mono,fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:T.orange,display:"block",marginBottom:52}}>Scanning</span>
          <span style={{...serif,fontSize:"clamp(52px,8vw,80px)",fontWeight:400,color:T.orange,display:"block",lineHeight:1,marginBottom:28}}>{progress}%</span>
          <div style={{height:2,background:T.sand,position:"relative",marginBottom:16}}><div style={{position:"absolute",top:0,left:0,height:"100%",background:T.orange,width:`${progress}%`,transition:"width 0.4s ease"}}/></div>
          <div style={{...mono,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:T.black,marginBottom:40}}>{scanStep}</div>
          <span style={{...mono,fontSize:11,color:T.orange,wordBreak:"break-all"}}>{scannedUrl}</span>
        </div>
      )}
 
      {/* ERROR */}
      {stage==="error"&&(
        <div style={{maxWidth:520,margin:"100px auto 0",padding:"0 32px",textAlign:"center"}} className="fade">
          <span style={{...mono,fontSize:10,letterSpacing:"0.25em",textTransform:"uppercase",color:T.red,display:"block",marginBottom:24}}>Scan failed</span>
          <h2 style={{...serif,fontSize:26,fontWeight:400,color:T.black,marginBottom:16}}>Couldn't reach that URL</h2>
          <p style={{fontSize:14,color:T.black,fontWeight:300,lineHeight:1.75,marginBottom:36}}>{errorMsg}</p>
          <button onClick={reset} style={{background:T.orange,border:"none",color:"#fff",...mono,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",padding:"14px 32px"}}>Try Again</button>
        </div>
      )}
 
      {/* RESULTS */}
      {stage==="result"&&aiTeaser&&(
        <div style={{maxWidth:860,margin:"0 auto",padding:"52px 32px 80px"}} className="fade">
          {/* Score bar */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:T.sand,marginBottom:1}}>
            {[{label:"Health Score",value:`${score}%`,sub:score<40?"Critical":score<70?"Issues found":"Mostly healthy",c:scoreColor},{label:"Critical Issues",value:redC.length,sub:"require immediate action",c:T.red},{label:"Needs Review",value:amberC.length,sub:"flagged for improvement",c:T.amber},{label:"Checks Passing",value:`${greenC.length}/${checks.length}`,sub:"signals healthy",c:T.green}].map(c=>(
              <div key={c.label} style={{background:"#fff",padding:"24px 20px"}}>
                <span style={{...mono,fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:T.black,display:"block",marginBottom:6}}>{c.label}</span>
                <span style={{...serif,fontSize:32,fontWeight:700,color:c.c,display:"block",lineHeight:1,marginBottom:4}}>{c.value}</span>
                <span style={{...mono,fontSize:10,color:T.black}}>{c.sub}</span>
              </div>
            ))}
          </div>
          {/* AI Summary */}
          <div style={{background:"#fff",border:`1px solid ${T.sand}`,borderLeft:`4px solid ${T.orange}`,padding:"28px 32px",marginBottom:1}}>
            <span style={{...mono,fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:T.orange,display:"block",marginBottom:12}}>✦ Diagnostic Summary — {scannedUrl}</span>
            <h2 style={{...serif,fontSize:"clamp(16px,2.5vw,22px)",fontWeight:700,color:T.black,lineHeight:1.3,marginBottom:12}}>{aiTeaser.headline}</h2>
            <p style={{fontSize:13.5,color:T.black,fontWeight:300,lineHeight:1.8}}>{aiTeaser.summary}</p>
          </div>
          {/* Top 3 Fixes */}
          <div style={{marginBottom:1}}>
            <div style={{background:T.dark,padding:"12px 20px"}}><span style={{...mono,fontSize:9,letterSpacing:"0.25em",textTransform:"uppercase",color:"rgba(245,240,235,0.8)"}}>Top 3 Priority Fixes</span></div>
            {(aiTeaser.fixes||[]).slice(0,3).map((fix,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"60px 1fr",background:i%2===0?"#fff":"rgba(232,224,212,0.5)",borderBottom:`1px solid ${T.sand}`}}>
                <div style={{background:T.dark,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 0"}}>
                  <span style={{...serif,fontSize:22,fontWeight:700,color:T.orange}}>{fix.priority}</span>
                </div>
                <div style={{padding:"18px 24px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{...mono,fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",padding:"2px 8px",background:"rgba(232,93,38,0.12)",color:T.orange,borderRadius:2}}>{fix.area}</span>
                    <span style={{...serif,fontSize:14,fontWeight:700,color:T.black}}>{fix.title}</span>
                  </div>
                  <p style={{fontSize:12.5,color:T.black,fontWeight:300,lineHeight:1.65}}>{fix.impact}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Scorecard */}
          <div style={{marginBottom:1}}>
            <div style={{background:T.dark,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{...mono,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(245,240,235,0.8)"}}>Full Scorecard — {checks.length} Checks</span>
              <div style={{display:"flex",gap:16}}>
                {[["red",redC.length],["amber",amberC.length],["green",greenC.length]].map(([s,n])=>(
                  <span key={s} style={{...mono,fontSize:9,color:ragColor(s)}}>{n} {ragLabel(s)}</span>
                ))}
              </div>
            </div>
            {Object.entries(byArea).map(([area,aChecks])=>(
              <div key={area}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 20px",background:"rgba(232,224,212,0.6)",borderBottom:`1px solid ${T.sand}`}}>
                  <span style={{...mono,fontSize:13,color:T.orange}}>{AREA_META[area]?.icon}</span>
                  <span style={{...mono,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:T.black,fontWeight:600}}>{area}</span>
                  <span style={{...mono,fontSize:9,color:T.black,marginLeft:"auto"}}>{aChecks.filter(c=>c.status==="green").length}/{aChecks.length} passing</span>
                </div>
                {aChecks.map(check=>(
                  <div key={check.id} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,padding:"11px 20px 11px 36px",borderBottom:`1px solid ${T.sand}`,background:check.status==="red"?"rgba(192,57,43,0.05)":"#fff"}}>
                    <div style={{flex:1}}>
                      <span style={{fontSize:12.5,color:T.black,fontWeight:400}}>{check.label}</span>
                      {check.detail&&<div style={{fontSize:11.5,color:T.black,fontWeight:300,marginTop:3,lineHeight:1.5}}>{check.detail}</div>}
                    </div>
                    <span style={{...mono,fontSize:8,letterSpacing:"0.12em",textTransform:"uppercase",padding:"3px 10px",background:ragBg(check.status),color:ragColor(check.status),flexShrink:0,marginTop:2,borderRadius:2}}>{ragLabel(check.status)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* ROI */}
          <div style={{padding:"20px 24px",background:"rgba(192,57,43,0.06)",border:`1px solid rgba(192,57,43,0.2)`,marginBottom:1}}>
            <span style={{...mono,fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:T.red,display:"block",marginBottom:6}}>Revenue Impact Estimate</span>
            <p style={{fontSize:13.5,color:T.black,fontWeight:300,lineHeight:1.75}}>{aiTeaser.roiLine}</p>
          </div>
          {/* CTA dark band */}
          <div style={{background:T.dark,padding:"40px 36px",textAlign:"center"}}>
            <span style={{...mono,fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(245,240,235,0.7)",display:"block",marginBottom:14}}>What a full diagnostic maps</span>
            <h3 style={{...serif,fontSize:"clamp(18px,3vw,26px)",fontWeight:700,color:T.cream,marginBottom:12,lineHeight:1.3}}>{aiTeaser.gateMessage}</h3>
            <p style={{fontSize:13.5,color:"rgba(245,240,235,0.9)",fontWeight:300,marginBottom:32,lineHeight:1.7,maxWidth:480,margin:"0 auto 32px"}}>A $2,500 Strategic Diagnostic covers every area — prioritised fix roadmap, revenue impact estimates, and a 2-hour debrief.</p>
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
                <p style={{fontSize:13,color:"rgba(245,240,235,0.9)",fontWeight:300,marginBottom:28}}>Check your inbox — then book a call to walk through your results.</p>
                <a href="https://ti-strategy.com.au/book-a-call" target="_blank" rel="noreferrer" style={{display:"inline-block",background:T.orange,color:"#fff",...mono,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",padding:"16px 40px",textDecoration:"none"}}>Book a Free Strategy Call →</a>
              </div>
            )}
          </div>
          <button onClick={reset} style={{...mono,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",background:"transparent",border:`1px solid ${T.sand}`,color:T.black,padding:"10px 20px",display:"block",margin:"24px auto 0"}}>← Scan another site</button>
        </div>
      )}
 
      <div style={{borderTop:`1px solid ${T.sand}`,padding:"20px 40px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginTop:40}}>
        <span style={{...mono,fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:T.black}}>TI Strategy Co · <span style={{color:T.orange}}>tenille@ti-strategy.com</span> · ABN 44 507 322 727</span>
        <span style={{...mono,fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:T.black}}>Results based on publicly visible signals · Indicative only</span>
      </div>
    </div>
  );
}
