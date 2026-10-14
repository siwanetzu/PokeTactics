export type Role='Tank'|'Bruiser'|'Carry'|'Caster'|'Support'|'Disruptor';
export const roles:Record<number,Role>={45:'Support',135:'Carry',59:'Bruiser',131:'Tank',81:'Support',100:'Disruptor',26:'Carry',1:'Disruptor',3:'Caster',4:'Caster',6:'Caster',7:'Tank',9:'Tank',23:'Disruptor',25:'Carry',43:'Support',52:'Carry',54:'Disruptor',58:'Bruiser',63:'Caster',74:'Tank',92:'Caster',94:'Disruptor',95:'Tank',133:'Carry',143:'Tank',147:'Carry'};
export const roleDescriptions:Record<Role,string>={Tank:'Takes 12% less direct damage. Builds mana from direct hits and attacks.',Bruiser:'Recovers 12% of damage dealt as health.',Carry:'Attacks 12% faster. Builds steady damage.',Caster:'Starts with 15 mana unless its ability specifies otherwise; regenerates 2 mana/s. Prioritizes healthy targets in range.',Support:'Healing abilities heal nearby injured allies; other casts heal the most injured ally within 2 hexes for 90% of attack.',Disruptor:'Prioritizes enemies with the most mana in range.'};
export const traits={
 Grass:{tiers:[2,3],summaries:['2.5% HP/s; +15% cast healing; 25% spell resistance; control 45% shorter','3% HP/s; +15% cast healing; 35% spell resistance; control 60% shorter'],name:'Living canopy'},
 Water:{tiers:[2,3],summaries:['15% opening shield; 25% burn / 15% poison resistance; +10% damage while shielded','22% opening shield; 45% burn / 25% poison resistance; +15% damage while shielded'],name:'Tidal guard'},
 Fire:{tiers:[2,3],summaries:['3s burns: 42% attack/tick, reduce healing 40%','4s burns: 55% attack/tick, reduce healing 60%'],name:'Wildfire'},
 Electric:{tiers:[2,3],summaries:['+5 mana/attack; abilities deal 30% extra shield damage','+9 mana/attack; abilities deal 50% extra shield damage'],name:'Overcharge'},
 Poison:{tiers:[2,3],summaries:['Abilities poison for 4s; poison reduces healing by 25%','Abilities poison for 6s; poison reduces healing by 50%'],name:'Toxic bloom'},
 Normal:{tiers:[2,3],summaries:['Attack 12% faster','Attack 24% faster'],name:'Pack instinct'},
 Psychic:{tiers:[2,3],summaries:['Abilities deal 18% more damage','Abilities deal 32% more damage'],name:'Mind surge'},
 Rock:{tiers:[2],summaries:['Take 14% less direct damage'],name:'Stonewall'},
} as const;
export type TraitKind=keyof typeof traits;
export function traitTier(kind:TraitKind,count:number){return traits[kind].tiers.filter(threshold=>count>=threshold).length;}
export function traitText(kind:TraitKind,count:number){const tier=traitTier(kind,count);return tier?traits[kind].summaries[tier-1]:`Deploy 2 distinct ${kind} Pokémon to activate.`;}

export const elementGuides:Partial<Record<TraitKind,{identity:string;counter:string;positioning:string}>>={
 Fire:{identity:'Area pressure and healing suppression',counter:'Favored into Grass; Water resists burns. Electric versus Fire depends on formation.',positioning:'Put Growlithe ahead of your casters. Flank with Charmander to catch several targets in its cone; spread against enemy blasts.'},
 Water:{identity:'Shielded damage and burn resistance',counter:'Favored into Fire; Electric abilities break shields faster.',positioning:'Screen Psyduck with Squirtle or Blastoise. Offset your backline so enemy beams and chains cannot hit the whole team.'},
 Electric:{identity:'Fast casts and shield breaking',counter:'Favored into Water; Grass resists ability damage and shortens control.',positioning:'Put Voltorb in front and protect Pikachu and Raichu on separate lanes. Angle Raichu toward the enemy backline.'},
 Grass:{identity:'Sustain and resistance to spells and control',counter:'Favored into Electric; Fire burns suppress healing.',positioning:'Keep Oddish and Venusaur within two hexes of the ally that needs healing. Spread against Fire; stagger units to avoid piercing beams.'},
};

export const roleMana:Record<Role,{attack:number;regen:number;damage:boolean}>={Tank:{attack:5,regen:0,damage:true},Bruiser:{attack:10,regen:0,damage:false},Carry:{attack:10,regen:0,damage:false},Caster:{attack:7,regen:2,damage:false},Support:{attack:10,regen:0,damage:false},Disruptor:{attack:10,regen:0,damage:false}};

export function manaRules(role:Role){const rule=roleMana[role];return `${rule.attack} mana per basic attack${rule.regen?`; +${rule.regen} mana/s`:''}${rule.damage?'; damage to health also grants mana (1 per 1% max HP lost, up to 8 per hit)':''}. Full mana triggers a separate ability after the current action; mana gain pauses during its cast.`;}
