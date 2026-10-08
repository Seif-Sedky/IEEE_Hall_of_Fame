import {useState,useEffect} from 'react'
import {createPortal} from 'react-dom'
import {EVENTS} from './events.config.jsx'
import Gear from './components/Gear.jsx'
const getId=()=>location.hash.replace('#/','')||'home'
const T=['#181020','#f81840','#3888e8','#f8a808','#3888e8','#f8a808','#f8f8f8','#f81840']
function Loader({out}){return <div className={'loader'+(out?' out':'')}>
 <div className="tiles">{T.map((c,i)=><i key={i} style={{background:c,animationDelay:i*90+'ms'}}/>)}</div>
 <Gear size={72} color="#f8a808" className="spin"/><p className="px">LOADING HALL OF FAME</p><div className="bar"><span/></div></div>}
export default function App(){
 const [id,setId]=useState(getId)
 const [ph,setPh]=useState(()=>{try{return sessionStorage.getItem('seen')?2:0}catch{return 0}})
 useEffect(()=>{const f=()=>{setId(getId());scrollTo(0,0)};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[])
 useEffect(()=>{if(ph===2)return
  const a=setTimeout(()=>setPh(1),1700),b=setTimeout(()=>{setPh(2);try{sessionStorage.setItem('seen','1')}catch{}},2200)
  return()=>{clearTimeout(a);clearTimeout(b)}},[])
 useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return
  const r=document.documentElement,s=r.style,m=e=>{s.setProperty('--cx',e.clientX+'px');s.setProperty('--cy',e.clientY+'px')},l=()=>s.setProperty('--cx','-999px')
  addEventListener('pointermove',m);r.addEventListener('mouseleave',l)
  return()=>{removeEventListener('pointermove',m);r.removeEventListener('mouseleave',l)}},[])
 const ev=EVENTS.find(e=>e.id===id)||EVENTS[0],Page=ev.Component
 return <>{ph<2&&<Loader out={ph===1}/>}
 {createPortal(<div className="fx"/>, document.body)}
 <div className="app">
  <header className="card head"><img src={import.meta.env.BASE_URL+'logo.png'} alt="IEEE GUC"/><div><h1>IEEE x GUC</h1><span className="px">HALL OF FAME</span></div></header>
  <nav className="tabs">{EVENTS.map(e=><a key={e.id} href={'#/'+e.id} className={'tab'+(e.id===ev.id?' on':'')+(e.status==='soon'?' soon':'')}>{e.label}</a>)}</nav>
  <main key={ev.id} className="panel"><Page ev={ev} events={EVENTS}/></main>
 </div></>}
