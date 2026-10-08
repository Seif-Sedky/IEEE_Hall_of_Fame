import Gear from '../components/Gear.jsx'
export default function ComingSoon({ev}){return <div className="soonbox">
 <Gear size={64} color="#f8a808" className="spin"/><h2>{ev.label.toUpperCase()}</h2>
 <p className="px">COMING SOON</p><div className="bar"><span/></div><p className="hand">Still being cooked. Check back after the event!</p></div>}
