import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const args=process.argv.slice(2),publish=args.includes('--publish');
const option=(name,fallback)=>{const index=args.indexOf(name);return index<0?fallback:args[index+1];};
const name=option('--name','PokeTactics'),notBefore=option('--not-before',null),expectedOwner=option('--owner',null);
if(!/^[A-Za-z0-9_.-]+$/.test(name))throw new Error('Invalid GitHub repository name.');
function git(args,input,allowFailure=false){const result=spawnSync('git',args,{cwd:root,encoding:'utf8',input,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'}});if(result.status!==0&&!allowFailure)throw new Error(`Git command failed: ${args[0]}`);return result.status===0?result.stdout.trim():null;}
const credentialText=git(['credential','fill'],'protocol=https\nhost=github.com\n\n');
const credential=Object.fromEntries(credentialText.split(/\r?\n/).filter(line=>line.includes('=')).map(line=>{const at=line.indexOf('=');return [line.slice(0,at),line.slice(at+1)];}));
if(!credential.password)throw new Error('GitHub HTTPS authentication is unavailable.');
const headers={Authorization:`Bearer ${credential.password}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'PokeTactics-publication'};
async function api(route,method='GET',body){const response=await fetch(`https://api.github.com${route}`,{method,headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});if(response.status===404&&method==='GET')return null;if(!response.ok)throw new Error(`GitHub ${method} ${route} failed (${response.status}).`);return response.json();}
const profile=await api('/user'),owner=profile.login,route=`/repos/${owner}/${name}`;
if(expectedOwner&&owner!==expectedOwner)throw new Error(`Authenticated account differs from requested owner ${expectedOwner}.`);
console.log(`Authenticated GitHub owner: ${owner}`);
let repo=await api(route);
if(!publish){console.log(repo?`Name already exists: ${owner}/${name} (${repo.private?'private':'public'})`:`Repository name available: ${owner}/${name}`);console.log('Access check only. No repository was created or changed.');process.exit(0);}
if(notBefore){const earliest=Date.parse(notBefore);if(!Number.isFinite(earliest)||Date.now()<earliest)throw new Error(`Publication is not allowed before ${notBefore}.`);}
if(git(['status','--porcelain']))throw new Error('Commit or resolve outstanding changes before publication.');
if(git(['branch','--show-current'])!=='main')throw new Error('Publication expects the prepared main branch.');
if(!process.env.npm_execpath)throw new Error('Invoke through npm run publish:github so validation uses the configured npm runtime.');
for(const task of ['test','build']){const result=spawnSync(process.execPath,[process.env.npm_execpath,'run',task],{cwd:root,stdio:'inherit'});if(result.status!==0)throw new Error(`${task} failed; publication stopped.`);}
const head=git(['rev-parse','HEAD']),remote=`https://github.com/${owner}/${name}.git`,origin=git(['remote','get-url','origin'],undefined,true);
if(origin&&origin!==remote)throw new Error('An unrelated origin is configured; publication stopped.');
if(repo){
 if(repo.private)throw new Error('A private repository with this name already exists. Inspect it before changing visibility.');
 const remoteMain=git(['ls-remote',remote,'refs/heads/main']);
 if(remoteMain){if(remoteMain.split(/\s+/)[0]===head){if(!origin)git(['remote','add','origin',remote]);console.log(`Already published and verified: ${repo.html_url} (${head})`);process.exit(0);}throw new Error('Existing main contains different history. No history was overwritten.');}
 if(git(['ls-remote',remote]))throw new Error('Existing repository is not empty; publication stopped.');
}else repo=await api('/user/repos','POST',{name,description:'Pokémon autobattler with seeded combat, trainer leagues, items and an island arena',private:false,auto_init:false});
if(!origin)git(['remote','add','origin',remote]);
git(['push','-u','origin','main']);
if(repo.default_branch!=='main')await api(route,'PATCH',{default_branch:'main'});
const verified=await api(route),remoteHead=git(['ls-remote','origin','refs/heads/main']);
if(verified.private||remoteHead.split(/\s+/)[0]!==head)throw new Error('Public visibility or published commit could not be verified.');
console.log(`Published and verified: ${verified.html_url}`);
console.log(`Commit: ${head}`);
