export const encounters=[
 {name:'Rocket Scout',identity:'Poison skirmishers',hint:'Protect your carry; healing is less effective under poison.',ids:[52,23,43],slots:[8,10,12]},
 {name:'Rocket Arsonist',identity:'Fire pressure',hint:'Separate your supports to avoid flame cones. Water resists burns.',ids:[58,4,74],slots:[17,9,15]},
 {name:'Rocket Engineer',identity:'Water and shields',hint:'Electric abilities break shields faster. Offset your frontline.',ids:[7,54,81],slots:[17,9,3]},
 {name:'Canopy Keeper',identity:'Grass sustain',hint:'Fire burns reduce healing. Catch the healer before the fight drags on.',ids:[1,43,45,74],slots:[17,9,3,15]},
 {name:'Power Station Guard',identity:'Electric carries',hint:'Grass resists spells; split your backline to limit lightning chains.',ids:[100,26,25,74],slots:[17,9,3,15]},
 {name:'Garden Duelist',identity:'Fire / Grass sustain',hint:'Its healers follow Growlithe. Stagger your tanks and split your carries.',ids:[58,3,4,43],slots:[11,4,1,5]},
 {name:'Shield Captain',identity:'Electric / Water shield',hint:'Scout the staggered tanks. Move your support cluster to a different lane.',ids:[9,7,25,81],slots:[18,16,4,9]},
 {name:'Rocket Commander',identity:'Fire bruisers',hint:'Water shields buy time against the fire frontline. Spread against Fire Fang.',ids:[59,58,4,74,43],slots:[17,15,9,19,3]},
 {name:'Tidal Warden',identity:'Water fortress',hint:'Bring shield pressure or sustained damage; avoid lining up for Hydro Pump.',ids:[131,9,7,54,81],slots:[17,15,19,9,3]},
 {name:'Giovanni',identity:'Elite mixed squad',hint:'A final test of economy and scouting: upgrade carries, strengthen your frontline, and offset your healers.',ids:[143,59,131,94,3,26],slots:[17,15,19,8,4,12]},
];
export function encounter(round:number){return encounters[Math.max(0,Math.min(encounters.length-1,round-1))];}
