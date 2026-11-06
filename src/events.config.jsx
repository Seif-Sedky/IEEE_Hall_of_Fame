import Home from './events/Home.jsx'
import Booth from './events/Booth.jsx'
import DishParty from './events/DishParty.jsx'
import ComingSoon from './events/ComingSoon.jsx'
// Registry of tabs. To launch an event: build its component and set status:'live'.
export const EVENTS=[
 {id:'home',label:'Home',status:'live',Component:Home},
 {id:'booth',label:'Booth',status:'live',color:'#f8a808',Component:Booth},
 {id:'dish-party',label:'Dish Party',status:'live',color:'#f81840',Component:DishParty},
 {id:'opening',label:'Opening',status:'soon',color:'#3888e8',Component:ComingSoon},
 {id:'outings',label:'Outings',status:'soon',color:'#58a0b0',Component:ComingSoon},
 {id:'closing',label:'Closing',status:'soon',color:'#f8a808',Component:ComingSoon}]
