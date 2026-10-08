import {useState} from 'react'
import members from '../data/members.json'
import booth from '../data/booth.json'
import rec from '../data/recruitment.json'
const B=import.meta.env.BASE_URL, w=booth.weights
const byId=Object.fromEntries(members.map(m=>[m.id,m]))
const rows=[...booth.tiers].sort((a,b)=>b.minScore-a.minScore).map(t=>({...t,list:[]}))
;[...booth.scores].sort((a,b)=>b.score-a.score).forEach(s=>{const r=rows.find(r=>s.score>=r.minScore);r&&r.list.push({...byId[s.memberId],...s})})
const Modal=({close,children})=><div className="overlay" onClick={close}><div className="note" onClick={e=>e.stopPropagation()}><button className="x" onClick={close}>X</button>{children}</div></div>
export default function Booth(){
 const [sel,setSel]=useState(null),[about,setAbout]=useState(false)
 const teams=[...rec.teams].sort((a,b)=>b.recruits-a.recruits)
 return <>
  <div className="bar-title"><h2>BOOTH TIER LIST</h2><button className="btn" onClick={()=>setAbout(true)}>? ABOUT</button></div>
  {rows.map((r,ri)=><section key={r.id} className={'tier t-'+r.id} style={{'--c':r.color}}>
   <div className="tlabel"><b>{r.title}</b><small>{r.minScore>0?r.minScore+'+ PTS':'THE REST'}</small></div>
   <div className="tbody">{r.list.map((m,i)=><button key={m.id} className="chip" style={{animationDelay:ri*250+i*60+'ms'}} onClick={()=>setSel(m)}>
    <img src={B+m.photo} alt=""/><span>{m.name}</span><em>{m.score}</em></button>)}</div></section>)}
  <h2 className="sec">RECRUITMENT RACE</h2>
  {teams.length?<ol className="teams">{teams.map((t,i)=><li key={t.name} className={'team p'+(i+1)}><b>{['1st','2nd','3rd'][i]||i+1}</b>
   <span>{t.name}<small>{t.memberIds.map(id=>byId[id]?.name.split(' ')[0]).join(', ')}</small></span><em>{t.recruits}</em></li>)}</ol>
  :<div className="ph"><p className="px">RACE IN PROGRESS</p><p className="hand">Teams are out recruiting. Standings land here soon.</p></div>}
  <h2 className="sec">BOOTH OUTING</h2><div className="ph"><p className="px">COMING SOON</p></div>
  <p style={{textAlign:'center',marginTop:34}}><a className="btn big" href={booth.driveUrl} target="_blank" rel="noreferrer">MEMORIES</a></p>
  {sel&&<Modal close={()=>setSel(null)}><img src={B+sel.photo} alt={sel.name}/><h3>{sel.name}</h3><p className="role">{sel.role}</p>
   {sel.statement&&<p className="quote">"{sel.statement}"</p>}
   <ul className="stats"><li>Slots attended<b>{sel.slots} x {w.slot}</b></li><li>TikToks<b>{sel.tiktoks} x {w.tiktok}</b></li>
    {sel.special&&<li>{sel.special}<b>+{w.special}</b></li>}<li className="tot">Total<b>{sel.score}</b></li></ul></Modal>}
  {about&&<Modal close={()=>setAbout(false)}><h3>HOW IT WORKS</h3>
   <ul className="stats"><li>Each slot attended<b>{w.slot} pt</b></li><li>Each TikTok you appeared in<b>{w.tiktok} pts</b></li><li>Each fun event you ran<b>{w.special} pts</b></li></ul>
   <p className="quote">Your total decides your tier:</p>
   <ul className="stats">{rows.map(r=><li key={r.id}>{r.title}<b>{r.minScore>0?r.minScore+'+ pts':'everyone else'}</b></li>)}</ul></Modal>}
 </>}
