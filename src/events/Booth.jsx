import {useState} from 'react'
import members from '../data/members.json'
import booth from '../data/booth.json'
import rec from '../data/recruitment.json'
const B=import.meta.env.BASE_URL, w=booth.weights
const byId=Object.fromEntries(members.map(m=>[m.id,m]))
const rows=[...booth.tiers].sort((a,b)=>b.minScore-a.minScore).map(t=>({...t,list:[]}))
;[...booth.scores].sort((a,b)=>b.score-a.score).forEach(s=>{const r=rows.find(r=>s.score>=r.minScore);r&&r.list.push({...byId[s.memberId],...s})})
const Modal=({close,children})=><div className="overlay" onClick={close}><div className="note" onClick={e=>e.stopPropagation()}><button className="x" onClick={close}>X</button>{children}</div></div>
const MEDALS=['🥇','🥈','🥉']
const RANK_COLORS=['#f8a808','#c0c0c0','#cd7f32']
function RecruitBoard(){
 const sorted=[...rec.teams].sort((a,b)=>b.recruits-a.recruits)
 const max=Math.max(...sorted.map(t=>t.recruits),1)
 const allTied=sorted.every(t=>t.recruits===sorted[0].recruits)
 return <div className="recruit-board">
  {sorted.map((t,i)=>{
   const pct=allTied?0:Math.round((t.recruits/max)*100)
   const medal=!allTied&&i<3?MEDALS[i]:null
   const rankColor=!allTied&&i<3?RANK_COLORS[i]:null
   return <div key={i} className={'rrow'+(i===0&&!allTied?' rrow-top':'')} style={{'--delay':i*60+'ms'}}>
    <div className="rrank" style={rankColor?{color:rankColor,borderColor:rankColor}:{}}>
     {medal||<span className="px" style={{fontSize:8}}>{i+1}</span>}
    </div>
    <div className="rinfo">
     <div className="rname-row">
      <span className="rname">{t.name}</span>
      <span className="rscore px">{t.recruits}</span>
     </div>
     <div className="rmembers">
      {t.memberIds.map(id=>{const m=byId[id];return m?<span key={id} className="ravatar" title={m.name}><img src={B+m.photo} alt={m.name}/></span>:null})}
     </div>
     <div className="rbar-wrap">
      <div className="rbar" style={{width:pct+'%',background:rankColor||'var(--sky)'}}/>
     </div>
    </div>
   </div>
  })}
 </div>
}
export default function Booth(){
 const [sel,setSel]=useState(null),[about,setAbout]=useState(false)
 return <>
  <div className="bar-title"><h2>BOOTH TIER LIST</h2><button className="btn" onClick={()=>setAbout(true)}>? ABOUT</button></div>
  {rows.map((r,ri)=><section key={r.id} className={'tier t-'+r.id} style={{'--c':r.color}}>
   <div className="tlabel"><b>{r.title}</b><small>{r.minScore}+ POINTS</small></div>
   <div className="tbody">{r.list.map((m,i)=><button key={m.id} className="chip" style={{animationDelay:ri*250+i*60+'ms'}} onClick={()=>setSel(m)}>
    <img src={B+m.photo} alt=""/><span>{m.name}</span></button>)}</div></section>)}
  <h2 className="sec">RECRUITMENT RACE</h2>
  {rec.teams.some(t=>t.recruits>0)
   ?<RecruitBoard/>
   :<><RecruitBoard/><div className="ph" style={{marginTop:12}}><p className="px">RACE IN PROGRESS</p><p className="hand">Scores are all tied at zero — the hunt has just begun!</p></div></>}
  <h2 className="sec">BOOTH OUTING</h2><div className="ph"><p className="px">COMING SOON</p></div>
  <p style={{textAlign:'center',marginTop:34}}><a className="btn big" href={booth.driveUrl} target="_blank" rel="noreferrer">MEMORIES</a></p>
  {sel&&<Modal close={()=>setSel(null)}><img src={B+sel.photo} alt={sel.name}/><h3>{sel.name}</h3><p className="role">{sel.role}</p>
   {sel.statement&&<p className="quote">"{sel.statement}"</p>}
   <ul className="stats"><li>Slots attended<b>{sel.slots} x {w.slot}</b></li><li>TikToks<b>{sel.tiktoks} x {w.tiktok}</b></li>
    {sel.special&&<li>{sel.special}<b>+{w.special}</b></li>}{sel.bonus>0&&<li>{sel.bonusName||'Bonus'}<b>+{sel.bonus}</b></li>}<li className="tot">Total<b>{sel.score}</b></li></ul></Modal>}
  {about&&<Modal close={()=>setAbout(false)}><h3>HOW IT WORKS</h3>
   <p className="quote">Every slot you showed up for earns you points. Appearing in TikToks earns even more, and so does running a fun event to liven up the booth.</p>
   <p className="quote">Add it all up and your total decides your tier: Heroes, Soldiers or Ghosts.</p></Modal>}
 </>}

