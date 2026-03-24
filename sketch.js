// 全域變數
let corals = [];
let leftFishSchool = [];
let rightFishSchool = [];
let scatteredFish = [];
let bubbles = [];
let time = 0;
let iframe;

function setup() {
  // 建立全螢幕畫布，並放置於指定的 DIV 中（可選，通常留空）
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('position', 'fixed');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('z-index', '10');          // 確保畫布在最上層
  canvas.style('pointer-events', 'none'); // 重要：讓滑鼠點擊可以「穿透」畫布去操作網頁
  
  // 產生 iframe 並指向指定網站
  iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('width', '100vw');
  iframe.style('height', '100vh');
  iframe.style('border', 'none');
  iframe.style('position', 'fixed');
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.style('z-index', '1');           // 網頁放在底層
  
  // 1. 初始化多彩珊瑚 (像示意圖那樣，保持頂端圓潤)
  let palette = [
    color(112, 198, 240, 150),   // 淺藍 (增加透明度)
    color(239, 137, 187, 150),  // 粉紅
    color(249, 238, 146, 150),  // 淺黃
    color(158, 114, 219, 150),  // 淺紫
    color(127, 236, 199, 150)   // 嫩綠
  ];
  
  for (let i = 0; i < 35; i++) { // 稍微減少數量，避免背景太雜
    corals.push(new Coral(random(-50, width + 50), random(25, 55), height * random(0.2, 0.5), random(palette)));
  }
  
  // 2. 初始化小魚群 (有大有小，簡化外型，增加透明度)
  // 左側藍色魚群
  for (let i = 0; i < 12; i++) {
    let size = random(4, 9);
    leftFishSchool.push(new SimpleFish(random(width * 0.1, width * 0.4), random(height * 0.3, height * 0.6), color(3, 169, 244, 100), size));
  }
  // 右側黃色魚群
  for (let i = 0; i < 12; i++) {
    let size = random(4, 9);
    rightFishSchool.push(new SimpleFish(random(width * 0.6, width * 0.9), random(height * 0.4, height * 0.7), color(255, 193, 7, 100), size));
  }
  // 散落的小魚 (在珊瑚間)
  for (let i = 0; i < 6; i++) {
    let size = random(4, 9);
    scatteredFish.push(new SimpleFish(random(width), random(height * 0.7, height * 0.95), color(200, 200, 200, 80), size));
  }
}

function draw() {
  // 每次重繪前清除畫布，並設定透明度 0.3 的背景
  clear();
  background('rgba(227, 242, 253, 0.3)');

  // 1. 繪製珊瑚 (底部柔軟飄動，圓潤頂端)
  for (let c of corals) {
    c.display();
  }

  // 2. 處理氣泡
  if (frameCount % 20 === 0) bubbles.push(new Bubble());
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].y < -20) bubbles.splice(i, 1);
  }

  // 3. 處理小魚群游動 (簡化外型)
  for (let f of leftFishSchool) f.moveAndDisplay();
  for (let f of rightFishSchool) f.moveAndDisplay();
  for (let f of scatteredFish) f.moveAndDisplay();

  time += 0.005; // 稍微減慢時間流逝，讓擺動更自然
}

// 珊瑚類別定義 (封裝為物件導向)
class Coral {
  constructor(x, w, h, col) {
    this.x = x;
    this.w = w;
    this.h = h;
    this.col = col;
    this.noiseOff = random(1000);
    this.segments = 15;
  }

  display() {
    fill(this.col);
    noStroke();
    beginShape();
    // 左側邊緣
    for (let i = 0; i <= this.segments; i++) {
      let t = i / this.segments;
      let sway = map(noise(this.noiseOff, time + t), 0, 1, -60, 60) * t;
      curveVertex(this.x - this.w / 2 + sway, height - (t * this.h));
      if (i === 0) curveVertex(this.x - this.w / 2 + sway, height - (t * this.h));
    }
    // 右側邊緣 (加上頂端圓潤處理)
    for (let i = this.segments; i >= 0; i--) {
      let t = i / this.segments;
      let sway = map(noise(this.noiseOff, time + t), 0, 1, -60, 60) * t;
      curveVertex(this.x + this.w / 2 + sway, height - (t * this.h));
      if (i === 0) curveVertex(this.x + this.w / 2 + sway, height - (t * this.h)); // 控制點
    }
    endShape(CLOSE);
  }
}

// 小魚類別定義 (簡化版)
class SimpleFish {
  constructor(x, y, col, r) {
    this.x = x;
    this.y = y;
    this.speed = random(1.0, 2.5);
    this.col = col;
    this.noiseOff = random(1000);
    this.r = r;
  }

  moveAndDisplay() {
    // 魚群游動邏輯 (微幅擺動前進)
    this.x -= this.speed;
    this.y += map(noise(this.noiseOff, time * 0.5), 0, 1, -1, 1);

    // 互動優化：當滑鼠靠近時，魚會避開滑鼠 (受驚嚇)
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < 100 && (mouseX !== 0 || mouseY !== 0)) {
      let angle = atan2(this.y - mouseY, this.x - mouseX);
      this.x += cos(angle) * 3;
      this.y += sin(angle) * 3;
    }

    // 當魚游出螢幕，回到右側重新游入
    if (this.x < -30) {
      this.x = width + random(30, 80);
      this.y = random(height * 0.3, height * 0.95);
    }

    // 繪製簡化且帶透明度的小魚
    push();
    translate(this.x, this.y);
    fill(this.col);
    noStroke();
    // 魚身 (橢圓)
    ellipse(0, 0, this.r * 3, this.r * 1.5);
    // 魚尾 (簡單三角形)
    triangle(this.r * 1.2, 0, this.r * 2.5, -this.r * 1.0, this.r * 2.5, this.r * 1.0);
    pop();
  }
}

// 氣泡類別定義
class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 20;
    this.r = random(5, 12);
    this.speed = random(1, 3);
  }

  update() {
    this.y -= this.speed; // 向上飄
    this.x += sin(frameCount * 0.05 + this.x) * 0.5; // 左右微幅晃動
    
    // 互動優化：滑鼠點擊可以戳破泡泡
    if (mouseIsPressed && dist(mouseX, mouseY, this.x, this.y) < this.r * 2) {
      this.y = -50; // 直接移到畫面外觸發回收
    }
  }

  display() {
    stroke(255, 150);
    strokeWeight(1);
    fill(255, 80); // 半透明白色
    circle(this.x, this.y, this.r * 2);
  }
}

// 確保視窗縮放時畫布跟著調整
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}