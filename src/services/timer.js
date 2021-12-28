export default class Timer{
    #timerElement
    #minutes
    #seconds
    #event
    #timer
    constructor(idTimer){
        this.#timerElement = document.getElementById(idTimer)
        if (!this.#timerElement) {
            throw "Wrong timer id"
        }
        
        this.#event = new Event('finish')
    }

    start(minutes){
        this.#minutes = minutes
        this.#seconds = 0
        this.#timer = setInterval(()=>this.#tick(), 1000)
    }

    #tick(){
        if(this.#seconds>0){
            this.#seconds--
            this.#timerElement.innerHTML = `${this.#minutes}:${this.#seconds}`
        } else if(this.#minutes>0){
            this.#minutes--
            this.#seconds = 59
            this.#timerElement.innerHTML = `${this.#minutes}:${this.#seconds}`
        } else if(this.#seconds===0 && this.#minutes===0){
            document.dispatchEvent(this.#event)
            clearInterval(this.#timer)
        }
    }
}




// class Timer {

//     constructor({ seconds, minutes, timerSeconds, timerMinutes, interval, counter }) {
//         this.seconds = seconds;
//         this.minutes = minutes;
//         this.timerSeconds = timerSeconds;
//         this.timerMinutes = timerMinutes;
//         this.interval = interval;
//         this.counter = counter;
//     }


//     runTimer() {

//         this.seconds--;
//         //condition if seconds reach 60 - turn to 0 and add minutes by one
//         if (this.seconds === 0) {
//             this.seconds = 59;
//             this.minutes--;


//         }

//         //add zero to the value for seconds
//         if (this.seconds < 10) {
//             this.timerSeconds = "0" + this.seconds.toString();
//         } else {
//             this.timerSeconds = this.seconds;
//         }

//         //add zero to the value for minutes
//         if (this.minutes < 10) {
//             this.timerMinutes = "0" + this.minutes.toString();
//         } else {
//             this.timerMinutes = this.minutes;
//         }
//         document.getElementById("timer").innerHTML = this.timerMinutes + ':' + this.timerSeconds;
//     }


//     startTimer() {

//         if (this.counter === false) {
//             this.interval = window.setInterval(() => this.runTimer(), 1000);
//             document.getElementById("startTimer").innerHTML = "Stop";
//             this.counter = true;

//         } else {
//             window.clearInterval(this.interval);
//             document.getElementById("startTimer").innerHTML = "Start";
//             this.counter = false;
//         }
//     }

//     /* resetTime() {
//       window.clearInterval(this.interval);
//       this.seconds = 0;
//       this.minutes = 0;
//       document.getElementById("timer").innerHTML = "00:00";
//       document.getElementById("startTimer").innerHTML = "Start"
//      } */
// }

// const timer = new Timer({

//     seconds: 0,
//     minutes: 0,
//     timerSeconds: 0,
//     timerMinutes: 0,
//     interval: null,
//     counter: false,
// });

// startTimer = () => timer.startTimer();