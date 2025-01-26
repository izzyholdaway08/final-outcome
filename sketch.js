let connectBtn;
let port;
let buildings = [];
let smells = [];
let numBuildings = 10;
let numSmells = 20;

let timeSlider;
let moodDropdown;
let dayCycleToggle;
let isAnimating = false;
let timeOfDay = 0;

let smellNameInput;
let intensitySlider;
let font;

function preload() {
  font = loadFont('FunnelSans-Italic-VariableFont_wght.ttf');
}

function setup() {
  createCanvas(800, 800, WEBGL);

  // buildings 
  for (let i = 0; i < numBuildings; i++) {
    let building = {
      x: random(-500, 500),
      y: random(-500, 500),
      z: random(-500, 500),
      width: random(50, 150),
      height: random(100, 300),
      depth: random(50, 150),
    };
    buildings.push(building);
  }

  // smells
  for (let i = 0; i < numSmells; i++) {
    smells.push({
      x: random(-500, 500),
      y: random(-500, 500),
      z: random(-500, 500),

      size: random(20, 50),

      color: color(random(100, 255), random(100, 255), random(100, 255), 150),
      speed: random(0.5, 2),
      name: "Unknown",
      intensity: random(0, 1),
    });
  }

  // arduino set up
  port = createSerial();

  // Button to connect Arduino
  connectBtn = createButton('Connect Arduino');
  connectBtn.position(20, 20);
  connectBtn.mousePressed(() => {
    if (!port.opened()) {
      port.open('Arduino', 9600);
    } else {
      port.close();
    }
  });

  // creating sliders 
  timeSlider = createSlider(0, 100, 0);
  timeSlider.position(20, 50);

  moodDropdown = createSelect();
  moodDropdown.position(20, 80);
  moodDropdown.option('Calm');
  moodDropdown.option('Energetic');
  moodDropdown.option('Nostalgic');
  moodDropdown.selected('Calm');

  dayCycleToggle = createButton('Toggle Day Cycle');
  dayCycleToggle.position(20, 110);
  dayCycleToggle.mousePressed(() => {
    isAnimating = !isAnimating;
  });
 // smell name 
  smellNameInput = createInput();
  smellNameInput.position(20, 140);
  smellNameInput.attribute('placeholder', 'Enter smell name');

  intensitySlider = createSlider(0, 1, 0.5, 0.01);
  intensitySlider.position(20, 170);

  
  console.log(smellNameInput);  
  console.log(intensitySlider); 
}

function draw() {
  if (isAnimating) {

    timeOfDay = (timeOfDay + 0.1) % 100;
    timeSlider.value(timeOfDay);

  } else {
    timeOfDay = timeSlider.value();
  }

  // background colour
  let bgColor = lerpColor(color(255, 223, 186), color(10, 10, 40), timeOfDay / 100);
  background(bgColor);

  orbitControl();

  let mood = moodDropdown.value();
  let buildingColor;
  switch (mood) {
    case 'Calm':
      buildingColor = color(150, 200, 255);
      break;
    case 'Energetic':
      buildingColor = color(255, 100, 100);
      break;
    case 'Nostalgic':
      buildingColor = color(255, 200, 150);
      break;
    default:
      buildingColor = color(255); 
  }

  // Read Arduino data 
  let sensorValue = port.readUntil("\n");
  if (sensorValue) {
    sensorValue = int(sensorValue.trim()); 

    
    console.log("Sensor Value: ", sensorValue);

    // colour red to green 
    let red = map(sensorValue, 0, 1023, 255, 0); 
    let green = map(sensorValue, 0, 1023, 0, 255); 
    let blue = 0; 

   
    for (let smell of smells) {
      smell.color = color(red, green, blue);
    }
  }

  // Draw buildings
  for (let building of buildings) {
    push();
    translate(building.x, building.y, building.z);
    fill(buildingColor);
    noStroke();
    box(building.width, building.height, building.depth);
    pop();
  }
 // smells
  for (let smell of smells) {
    drawSmell(smell);
    updateSmell(smell);
  }

  // Display text
  fill(255);
  textSize(16);
  textFont(font);
  textAlign(CENTER, CENTER);
  text('Smell Name: ' + smellNameInput.value(), 20, height - 40);
  text('Intensity: ' + nf(intensitySlider.value(), 1, 2), 20, height - 20);
}

function drawSmell(smell) {
  push();
  noStroke();

  
  fill(smell.color);
  translate(smell.x, smell.y, smell.z);
  sphere(smell.size);

  push();
  translate(0, smell.size + 10, 0); 
  fill(255); 
  textSize(12);
  textFont(font);
  textAlign(CENTER, CENTER);
  text(smell.name + " - Intensity: " + nf(smell.intensity, 1, 2), 0, 0);
  pop();

  pop();
}

function updateSmell(smell) {
  smell.y += sin(frameCount * 0.01 * smell.speed) * 2; // Floating effect
  smell.x += cos(frameCount * 0.01 * smell.speed) * 1; 
  smell.z += sin(frameCount * 0.01 * smell.speed) * 1; 
}

// 
function mousePressed() {
 
  console.log(smellNameInput.value());
  console.log(intensitySlider.value());
  
  // click for new smells
  let smell = {
    x: mouseX - width / 2, 
    y: mouseY - height / 2, 
    z: random(-500, 500), 
    size: random(20, 50),
    color: color(random(100, 255), random(100, 255), random(100, 255), 150),
    speed: random(0.5, 2),
    name: smellNameInput.value(),
    intensity: intensitySlider.value(), 
  };
  smells.push(smell); // Add the new smell to the smells array
}
