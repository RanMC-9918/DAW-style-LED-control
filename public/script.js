
let ws = new WebSocket("ws://192.168.12.232:8080"); //local IP addy
ws.onopen = () => {
  console.log("Connected to WebSocket server");
  ws.send("client");
};

let cursor = document.getElementById("cursor");

let inputs = [];

let res = 10;

let keys = {};


let idling = true;

let time_G = 0;

let loopTime = 5;

let bpm = 100;

let sbb = 60.0 / bpm;

document.getElementById("bpm-input").addEventListener("change", () => {
  bpm = Number(document.getElementById("bpm-input").value);
  sbb = 60.0 / bpm;
  clearInterval(tick);
  tick = setInterval(tickFunc, sbb*1000);
})

let tick = setInterval(tickFunc, sbb*1000);

function tickFunc(){
  cursor.style.top = res * time_G + 50 + "px";
  time_G++;
  if (time_G > sbb * 4 * 33) {
    time_G = 0;
    //burst(1);
  }
  if (keys["j"]) {
    burst(0);
  }
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  for (let i = 0; i < inputs.length; i++) {
    rSum += Math.floor(
      inputs[i].red *
        inputs[i].falloff(time_G - inputs[i].startTime - inputs[i].duration)
    );
    gSum += Math.floor(
      inputs[i].green *
        inputs[i].falloff(time_G - inputs[i].startTime - inputs[i].duration)
    );
    bSum += Math.floor(
      inputs[i].blue *
        inputs[i].falloff(time_G - inputs[i].startTime - inputs[i].duration)
    );
  }

  rSum = Math.min(255, rSum);
  gSum = Math.min(255, gSum);
  bSum = Math.min(255, bSum);
  if (rSum > 0 || gSum > 0 || bSum > 0) {
    idling = false;
    changeColor(rSum, gSum, bSum);
  } else {
    if (!idling) {
      changeColor(0, 0, 0);
      idling = true;
    }
  }
}

function burst(hue) {
  let mag = 100;
  let red = mag * hue;
  let green = mag * (1 - hue);
  let blue = mag;
  let foundInput = inputs.find(
    (e) => e.red == red && e.green == green && e.blue == green && time_G == e.startTime + e.duration + 1
  );
  if (!foundInput) {
    inputs.push({
      red,
      green,
      blue,
      startTime: time_G,
      duration: 0,
      falloff: function (time) {
        if (time <= 0) {
          if (-time > this.duration) {
            let attackTime = -time - this.duration;
            return 0;
          } else {
            return 1;
          }
        }
        time = time / 2.0;
        if(time > 1){
          return 0;
        }
        return 1 - time;
      },
    });
  } else {
    foundInput.duration++;
  }
}

function changeColor(red, green, blue) {
  ws.send(
    red.toString().padStart(3, "0") +
      green.toString().padStart(3, "0") +
      blue.toString().padStart(3, "0")
  );
}
