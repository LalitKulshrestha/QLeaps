const assert=require('node:assert/strict');
(async()=>{
 const {evaluateHR,readinessHR,hrQuestions}=await import('../src/data/hr-check.mjs');
 assert.equal(evaluateHR({}).answered,0);
 const weak={team:'10-49',owner:'none',posh:'not-set-up',drop:'high'};
 assert.equal(evaluateHR(weak).stage,1);
 assert.deepEqual(evaluateHR(weak).codes,['health','handbook','workplace','hiring']);
 const uncertain={team:'1-9',owner:'lead',posh:'unsure',drop:'low'};
 assert.equal(evaluateHR(uncertain).stage,2);
 assert.deepEqual(evaluateHR(uncertain).codes,['workplace']);
 const strong={team:'1-9',owner:'lead',posh:'reviewed',drop:'low'};
 assert.equal(evaluateHR(strong).stage,3);
 assert.equal(evaluateHR({...strong,team:'150-plus'}).stage,3);
 assert.equal(evaluateHR({...weak,team:'150-plus'}).stage,1);
 const hiring=evaluateHR({...strong,drop:'unknown'});assert.equal(hiring.service,'hiring-support');assert.deepEqual(hiring.codes,['hiring']);
 assert.equal(evaluateHR({...strong,posh:'tampered'}).answered,3);
 assert.match(evaluateHR(uncertain).signals[0],/cannot determine compliance/);
 const empty=readinessHR({});assert.equal(empty.score,0);assert.equal(empty.band,'neutral');assert.equal(empty.answered,0);
 assert.equal(readinessHR(strong).score,100);assert.equal(readinessHR(strong).band,'green');
 assert.equal(readinessHR({...strong,team:'150-plus'}).score,100);
 assert.equal(readinessHR({owner:'lead'}).score,40);assert.equal(readinessHR({owner:'lead'}).band,'amber');
 assert.equal(readinessHR({owner:'founder'}).band,'red');
 assert.equal(readinessHR({...strong,drop:'unknown'}).score,70);
 assert.equal(readinessHR({owner:'__proto__',posh:'constructor',drop:'toString'}).score,0);
 let combinations=0;
 for(const team of hrQuestions[0].options)for(const owner of hrQuestions[1].options)for(const posh of hrQuestions[2].options)for(const drop of hrQuestions[3].options){
  const r=readinessHR({team:team.value,owner:owner.value,posh:posh.value,drop:drop.value});
  assert.equal(r.answered,4);assert(Number.isFinite(r.score)&&r.score>=0&&r.score<=100);
  assert.equal(r.band,r.score<40?'red':r.score<75?'amber':'green');combinations++;
 }
 assert.equal(combinations,320);
 console.log('PASS: readiness rubric, 320 combinations, thresholds, partial answers, full score and invalid inputs.');
 console.log('PASS: diagnostic stage logic, independent gaps, non-scoring team size, unknown/dropout cases and invalid values.');
})().catch(error=>{console.error(error);process.exit(1)});
