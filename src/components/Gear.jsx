const G=["...###...",".#.###.#.","#########","###...###","###...###","###...###","#########",".#.###.#.","...###..."]
export default function Gear({size=48,color='currentColor',className=''}){
 return <svg viewBox="0 0 9 9" width={size} height={size} className={className} shapeRendering="crispEdges" aria-hidden="true">
  {G.flatMap((r,y)=>[...r].map((c,x)=>c==='#'&&<rect key={x+'-'+y} x={x} y={y} width="1" height="1" fill={color}/>))}</svg>}
