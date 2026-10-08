import Gear from '../components/Gear.jsx'
export default function Home({events}){return <>
 <section className="hero"><Gear size={56} color="#004898" className="spin"/>
  <h2>WELCOME TO THE<br/><em>HALL OF FAME</em></h2><p className="hand">Every event. Every hero. All our memories in one notebook.</p></section>
 <div className="grid">{events.filter(e=>e.id!=='home').map(e=>
  <a key={e.id} href={'#/'+e.id} className={'ecard'+(e.status==='soon'?' dim':'')} style={{background:e.color}}>
   <span>{e.label}</span><span className="px">{e.status==='live'?'LIVE NOW':'COMING SOON'}</span></a>)}</div></>}
