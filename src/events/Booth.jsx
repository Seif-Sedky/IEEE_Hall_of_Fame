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
const CARD_TILTS=['-1.5deg','1deg','-0.8deg','1.5deg','-1.2deg','0.5deg','-1.8deg','1.2deg','-0.6deg','1.8deg','-1deg','0.8deg']
const CARD_PALETTES=[
 'linear-gradient(135deg,#f81840,#f8a808)',
 'linear-gradient(135deg,#3888e8,#58a0b0)',
 'linear-gradient(135deg,#f8a808,#f8f8f8)',
 'linear-gradient(135deg,#181020,#3888e8)',
 'linear-gradient(135deg,#f81840,#181020)',
 'linear-gradient(135deg,#58a0b0,#f8a808)',
 'linear-gradient(135deg,#3888e8,#f81840)',
 'linear-gradient(135deg,#f8a808,#181020)',
 'linear-gradient(135deg,#f81840,#58a0b0)',
 'linear-gradient(135deg,#004898,#f8a808)',
 'linear-gradient(135deg,#58a0b0,#f81840)',
 'linear-gradient(135deg,#f8a808,#3888e8)',
]
function RecruitBoard({onSelect}){
 const sorted=[...rec.teams].map((t,origIdx)=>({...t,origIdx})).sort((a,b)=>b.recruits-a.recruits)
 const allTied=sorted.every(t=>t.recruits===sorted[0].recruits)
 return <div className="rboard-grid">
  {sorted.map((t,rank)=>{
   const medal=!allTied&&rank<3?MEDALS[rank]:null
   return <button key={t.origIdx} className={'rcard'+(rank===0&&!allTied?' rcard-top':'')}
     style={{'--tilt':CARD_TILTS[t.origIdx%CARD_TILTS.length],'--delay':rank*55+'ms'}}
     onClick={()=>onSelect({...t,rank,medal,palette:CARD_PALETTES[t.origIdx%CARD_PALETTES.length]})}>
    {medal&&<span className="rcard-medal">{medal}</span>}
    <div className="rcard-photo" style={{background:CARD_PALETTES[t.origIdx%CARD_PALETTES.length]}}>
     {t.photo
      ?<img src={B+t.photo} alt={t.name}/>
      :<div className="rcard-ph"><span className="px" style={{fontSize:7,color:'#fff',opacity:.7,textAlign:'center',lineHeight:1.6}}>TEAM<br/>PHOTO</span></div>}
    </div>
    <div className="rcard-body">
     <span className="rcard-name">{t.name}</span>
     <span className="rcard-members">{t.memberIds.map(id=>byId[id]?.name.split(' ')[0]).join(' · ')}</span>
     <span className="rcard-score px">{t.recruits} <span style={{opacity:.6,fontSize:7}}>RECRUITS</span></span>
    </div>
   </button>
  })}
 </div>
}
function TeamModal({team,close}){
 const memberData=team.memberIds.map(id=>byId[id]).filter(Boolean)
 return <Modal close={close}>
  <div className="rmodal-photo" style={{background:team.palette}}>
   {team.photo?<img src={B+team.photo} alt={team.name}/>:<span className="px" style={{fontSize:8,color:'#fff',opacity:.8}}>TEAM PHOTO</span>}
   {team.medal&&<span className="rmodal-medal">{team.medal}</span>}
  </div>
  <h3 style={{marginTop:14}}>{team.name}</h3>
  <p className="px" style={{fontSize:9,color:'var(--cherry)',margin:'4px 0 14px'}}>{team.recruits} RECRUITS</p>
  <ul className="rmodal-list">
   {memberData.map(m=><li key={m.id} className="rmodal-member">
    <img src={B+m.photo} alt={m.name}/>
    <div><strong>{m.name}</strong><span>{m.role}</span></div>
   </li>)}
  </ul>
 </Modal>
}
export default function Booth(){
 const [sel,setSel]=useState(null),[about,setAbout]=useState(false),[selTeam,setSelTeam]=useState(null)
 return <>
  <div className="bar-title"><h2>BOOTH TIER LIST</h2><button className="btn" onClick={()=>setAbout(true)}>? ABOUT</button></div>
  {rows.map((r,ri)=><section key={r.id} className={'tier t-'+r.id} style={{'--c':r.color}}>
   <div className="tlabel"><b>{r.title}</b><small>{r.minScore}+ POINTS</small></div>
   <div className="tbody">{r.list.map((m,i)=><button key={m.id} className="chip" style={{animationDelay:ri*250+i*60+'ms'}} onClick={()=>setSel(m)}>
    <img src={B+m.photo} alt=""/><span>{m.name}</span></button>)}</div></section>)}
  <h2 className="sec">RECRUITMENT RACE</h2>
  {rec.teams.some(t=>t.recruits>0)
   ?<RecruitBoard onSelect={setSelTeam}/>
   :<><RecruitBoard onSelect={setSelTeam}/><div className="ph" style={{marginTop:12}}><p className="px">RACE IN PROGRESS</p><p className="hand">Scores are all tied at zero — the hunt has just begun!</p></div></>}
  <h2 className="sec">BOOTH OUTING</h2><div className="ph"><p className="px">COMING SOON</p></div>
  <p style={{textAlign:'center',marginTop:34}}><a className="btn big" href={booth.driveUrl} target="_blank" rel="noreferrer">MEMORIES</a></p>
  {sel&&<Modal close={()=>setSel(null)}><img src={B+sel.photo} alt={sel.name}/><h3>{sel.name}</h3><p className="role">{sel.role}</p>
   {sel.statement&&<p className="quote">"{sel.statement}"</p>}
   <ul className="stats"><li>Slots attended<b>{sel.slots} x {w.slot}</b></li><li>TikToks<b>{sel.tiktoks} x {w.tiktok}</b></li>
    {sel.special&&<li>{sel.special}<b>+{w.special}</b></li>}{sel.bonus>0&&<li>{sel.bonusName||'Bonus'}<b>+{sel.bonus}</b></li>}<li className="tot">Total<b>{sel.score}</b></li></ul></Modal>}
  {selTeam&&<TeamModal team={selTeam} close={()=>setSelTeam(null)}/>}
  {about&&<Modal close={()=>setAbout(false)}><h3>HOW IT WORKS</h3>
   <p className="quote">Every slot you showed up for earns you points. Appearing in TikToks earns even more, and so does running a fun event to liven up the booth.</p>
   <p className="quote">Add it all up and your total decides your tier: Heroes, Soldiers or Ghosts.</p></Modal>}
 </>}


