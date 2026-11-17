import Home from './events/Home.jsx'
import Booth from './events/Booth.jsx'
import DishParty from './events/DishParty.jsx'
import Opening from './events/Opening.jsx'
import ComingSoon from './events/ComingSoon.jsx'
// Registry of tabs. To launch an event: build its component and set status:'live'.
export const EVENTS=[
 {id:'home',label:'Home',status:'live',Component:Home},
 {id:'dish-party',label:'Dish Party',status:'live',color:'#f81840',Component:DishParty},
 {id:'booth',label:'Booth',status:'live',color:'#f8a808',Component:Booth},
 {id:'opening',label:'Opening',status:'live',color:'#1a3a8c',Component:Opening},
 {id:'outings',label:'Outings',status:'soon',color:'#58a0b0',Component:ComingSoon},
 {id:'closing',label:'Closing',status:'soon',color:'#f8a808',Component:ComingSoon}]
