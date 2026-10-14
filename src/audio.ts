import {abilityEffects} from './effects';
/** Synthesized local spell sounds, with limited polyphony for busy fights. */
export class BattleAudio {
 private context:AudioContext|null=null;
 private active=0;
 enabled=false;
 setEnabled(enabled:boolean){this.enabled=enabled;if(enabled){this.context??=new AudioContext();void this.context.resume();}}
 play(species:number,cast:boolean,impact=false){
  const ctx=this.context;if(!this.enabled||!ctx||ctx.state!=='running'||this.active>=5)return;
  this.active++;const profile=abilityEffects[species];const shape=profile?.shape??'bolt';
  const heavy=['rock','rockslide','slam','fireblast','hydro'].includes(shape);
  const electric=shape==='lightning';const duration=cast?(impact?.24:.3):.07;
  const gain=ctx.createGain();gain.gain.setValueAtTime(.001,ctx.currentTime);gain.gain.linearRampToValueAtTime(cast?.045:.014,ctx.currentTime+.015);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);gain.connect(ctx.destination);
  const oscillator=ctx.createOscillator();oscillator.type=electric?'sawtooth':heavy?'triangle':'sine';
  const base=heavy?95:electric?650:250+(species%8)*45;
  oscillator.frequency.setValueAtTime(impact?base*1.6:base*.6,ctx.currentTime);oscillator.frequency.exponentialRampToValueAtTime(impact?base*.45:base*2.4,ctx.currentTime+duration);
  const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=electric?2500:heavy?550:1700;oscillator.connect(filter);filter.connect(gain);oscillator.start();oscillator.stop(ctx.currentTime+duration);
  let noise:AudioBufferSourceNode|null=null,noiseGain:GainNode|null=null,noiseFilter:BiquadFilterNode|null=null;
  if(cast&&(impact||['flame','wheel','water','hydro'].includes(shape))){const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*(1-i/samples.length);noise=ctx.createBufferSource();noise.buffer=buffer;noiseFilter=ctx.createBiquadFilter();noiseFilter.type='lowpass';noiseFilter.frequency.value=heavy?650:electric?3500:1800;noiseGain=ctx.createGain();noiseGain.gain.value=.35;noise.connect(noiseFilter);noiseFilter.connect(noiseGain);noiseGain.connect(gain);noise.start();}
  oscillator.onended=()=>{oscillator.disconnect();filter.disconnect();noise?.disconnect();noiseFilter?.disconnect();noiseGain?.disconnect();gain.disconnect();this.active--;};
 }
}
