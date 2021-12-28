// произойдет зацикливание
// function sleep(time){
//     let flRunning = true
//     setTimeout(()=>flRunning=false, time)
//     while(flRunning){

//     }
// }

function sleep(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
 }
 async function sleepTest() {
    console.log('My func start');
       await sleep(3000);
    console.log('My func finished')       
 }
 sleepTest().then(()=>console.log('bye'));
