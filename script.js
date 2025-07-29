// threejs_infinite_road.js
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// 1. Cena, câmera e renderizador
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 2. Luzes
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 3. Piso asfaltado (pista)
const textureLoader = new THREE.TextureLoader();
const backgroundTexture = textureLoader.load("ceu.jpeg");
scene.background = backgroundTexture;

const planeGeometry = new THREE.PlaneGeometry(25, 1000);

const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x333333, // cor sólida da pista
  roughness: 1,
  side: THREE.DoubleSide,
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0;
plane.receiveShadow = true;
scene.add(plane);

// --- Faixas amarelas ---
const faixaLength = 5;
const faixaWidth = 0.6;
const espacamento = 10;
const faixaColor = 0xf2f433;

// Usar MeshStandardMaterial para resposta à luz e emissive para destaque
const faixaMaterial = new THREE.MeshStandardMaterial({
  color: faixaColor,
  emissive: faixaColor,
  emissiveIntensity: 0.8,
});

const faixaGeometry = new THREE.PlaneGeometry(faixaWidth, faixaLength);

for (let z = -500; z <= 500; z += faixaLength + espacamento) {
  const faixa = new THREE.Mesh(faixaGeometry, faixaMaterial);
  faixa.rotation.x = -Math.PI / 2;
  faixa.position.set(0, 0.05, z); // ligeiramente acima do plano para evitar z-fighting
  faixa.receiveShadow = false;
  faixa.castShadow = false;
  scene.add(faixa);
}

// 3.1 Calçadas
const pistaMetade = 12.5;
const sidewalkWidth = 250;
const sidewalkLength = 1000;
const sidewalkAltura = 0.02;
const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
const sidewalkGeometry = new THREE.BoxGeometry(
  sidewalkWidth,
  sidewalkAltura,
  sidewalkLength
);

const sidewalkLeftX = -pistaMetade - 13 / 2;
const sidewalkRightX = pistaMetade + 13 / 2;

const leftSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
leftSidewalk.position.set(sidewalkLeftX, sidewalkAltura / 2, 0);
leftSidewalk.receiveShadow = true;
scene.add(leftSidewalk);

const rightSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
rightSidewalk.position.set(sidewalkRightX, sidewalkAltura / 2, 0);
rightSidewalk.receiveShadow = true;
scene.add(rightSidewalk);

// Casas e árvores
const casaMetade = 5;
const calcadaEstreita = 3;
const casaLeftX = -pistaMetade - calcadaEstreita - casaMetade;
const casaRightX = pistaMetade + calcadaEstreita + casaMetade;

function criarCasa(x, z) {
  const casa = new THREE.Group();

  const corpo = new THREE.Mesh(
    new THREE.BoxGeometry(10, 7.2, 10),
    new THREE.MeshStandardMaterial({ color: 0xffcc99 })
  );
  corpo.position.y = 3.6;

  const telhado = new THREE.Mesh(
    new THREE.ConeGeometry(7.2, 3.6, 4),
    new THREE.MeshStandardMaterial({ color: 0x993333 })
  );
  telhado.position.y = 8.4;
  telhado.rotation.y = Math.PI / 4;

  casa.add(corpo);
  casa.add(telhado);
  casa.position.set(x, 0, z);
  casa.castShadow = true;
  casa.receiveShadow = true;
  scene.add(casa);
}

function criarArvore(x, z) {
  const arvore = new THREE.Group();

  const tronco = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  );
  tronco.position.y = 6;

  const copa = new THREE.Mesh(
    new THREE.SphereGeometry(7, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  copa.position.y = 15;

  arvore.add(tronco);
  arvore.add(copa);
  arvore.position.set(x, 0, z);
  arvore.castShadow = true;
  arvore.receiveShadow = true;
  scene.add(arvore);
}

function criarPredio(x, z) {
  const texturaPredio = textureLoader.load("texturaPredio.jpg");
  const altura = Math.random() * 30 + 20;
  const corpo = new THREE.Mesh(
    new THREE.BoxGeometry(
      Math.random() * 10 + 10,
      altura,
      Math.random() * 10 + 10
    ),
    new THREE.MeshStandardMaterial({
      map: texturaPredio,
      roughness: 0.8,
      metalness: 0.1,
    })
  );
  corpo.position.y = altura / 2 + sidewalkAltura;

  const predio = new THREE.Group();
  predio.add(corpo);
  predio.position.set(x, 0, z);
  predio.castShadow = true;
  predio.receiveShadow = true;
  scene.add(predio);
}
// 3.2 Gerar casas, árvores e prédios ao longo da pista
for (let z = -1000; z <= 1000; z += 40) {
  criarCasa(casaLeftX, z);
  criarCasa(casaRightX, z);

  criarArvore(casaLeftX - 5, z + 5);
  criarArvore(casaRightX + 5, z + 5);

  // Linha 1 de prédios
  criarPredio(casaLeftX - 20, z + 10);
  criarPredio(casaRightX + 20, z + 10);

  // Linha 2 de prédios mais afastada
  criarPredio(casaLeftX - 35, z + 20);
  criarPredio(casaRightX + 35, z + 20);
}

// 4. Jogador
let player = null;
const loader = new GLTFLoader();
loader.load("carro.glb", (gltf) => {
  player = gltf.scene;
  player.rotation.y = Math.PI / 360;
  player.scale.set(1, 1, 1);
  player.position.set(0, 0, 0);
  player.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      // Otimização: use BufferGeometry se não estiver usando ainda
      if (!(child.geometry instanceof THREE.BufferGeometry)) {
        child.geometry = new THREE.BufferGeometry().fromGeometry(
          child.geometry
        );
      }
    }
  });
  player.position.set(0, 0, 0);
  scene.add(player);
  camera.position.copy(player.position).add(cameraOffset);
  camera.lookAt(player.position);
  animate();
});

// 5. Paredes laterais
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const wallLength = 1000;
const wallHeight = 2;
const wallThickness = 0.5;

const leftWall = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, wallHeight, wallLength),
  wallMaterial
);
leftWall.position.set(-pistaMetade, wallHeight / 2, 0);
leftWall.castShadow = true;
scene.add(leftWall);

const rightWall = new THREE.Mesh(
  new THREE.BoxGeometry(wallThickness, wallHeight, wallLength),
  wallMaterial
);
rightWall.position.set(pistaMetade, wallHeight / 2, 0);
rightWall.castShadow = true;
scene.add(rightWall);

// 6. Obstáculos
const obstacles = [];
let obstacleSpawnInterval = 60;
let obstacleSpawnCounter = 0;

// 7. Movimento
let gameSpeed = 0.1;
let playerSpeed = 0.2;
let moveLeft = false,
  moveRight = false,
  moveForward = false,
  moveBackward = false;

// 8. Teclado
const cameraOffset = new THREE.Vector3(0, 5, 10);

const loopLimiteZ = -400;
let tempo = 0;

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
    case "a":
      moveLeft = true;
      break;
    case "ArrowRight":
    case "d":
      moveRight = true;
      break;
    case "ArrowUp":
    case "w":
      moveForward = true;
      break;
    case "ArrowDown":
    case "s":
      moveBackward = true;
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowLeft":
    case "a":
      moveLeft = false;
      break;
    case "ArrowRight":
    case "d":
      moveRight = false;
      break;
    case "ArrowUp":
    case "w":
      moveForward = false;
      break;
    case "ArrowDown":
    case "s":
      moveBackward = false;
      break;
  }
});

function animate() {
  requestAnimationFrame(animate);
  if (!player) {
    renderer.render(scene, camera);
    return;
  }

  tempo++;
  if (tempo % 600 === 0) {
    gameSpeed += 0.01;
    playerSpeed += 0.01;
  }

  const pistaLimiteX = 12.5 - 0.5;

  if (moveLeft && player.position.x > -pistaLimiteX)
    player.position.x -= playerSpeed;
  if (moveRight && player.position.x < pistaLimiteX)
    player.position.x += playerSpeed;
  if (moveForward) player.position.z -= playerSpeed;
  if (moveBackward) player.position.z += playerSpeed;

  // Loop infinito - reseta posição do player e move mundo
  if (player.position.z < loopLimiteZ) {
    const deltaZ = player.position.z;
    player.position.z = 0;
    for (let obs of obstacles) obs.position.z -= deltaZ;
    obstacles.forEach((obs, i) => {
      if (obs.position.z > 100) {
        scene.remove(obs);
        obstacles.splice(i, 1);
      }
    });
  }
  let distanciaPercorrida = 0;

  // Dentro do animate, depois do movimento do player:
  distanciaPercorrida = Math.abs(player.position.z).toFixed(1);
  document.getElementById("distancia").textContent = `${distanciaPercorrida} m`;

  // Função para reiniciar:
  function reiniciarJogo() {
    player.position.set(0, 0, 0);
    for (const obs of obstacles) {
      scene.remove(obs);
    }
    obstacles.length = 0;
    gameSpeed = 0.1;
    playerSpeed = 0.2;
    tempo = 0;
    obstacleSpawnCounter = 0;
    distanciaPercorrida = 0;
    document.getElementById("distancia").textContent = `0 m`;
  }
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.position.x += (0.07 + gameSpeed * 0.3) * obs.userData.direction;
    if (obs.position.x < -12 || obs.position.x > 12)
      obs.userData.direction *= -1;
    if (
      Math.abs(obs.position.x - player.position.x) < 1.7 &&
      Math.abs(obs.position.z - player.position.z) < 1.7
    ) {
      reiniciarJogo();
      return;
    }
  }

  obstacleSpawnCounter++;
  if (obstacleSpawnCounter >= obstacleSpawnInterval) {
    obstacleSpawnCounter = 0;
    const numObstacles = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < numObstacles; i++) {
      const width = Math.random() * 2 + 1.5;
      const height = Math.random() * 2 + 1.5;
      const depth = Math.random() * 2 + 1.2;
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({
        color: 0x000000,
      });
      const obs = new THREE.Mesh(geometry, material);
      obs.position.set(
        (Math.random() - 0.5) * 24,
        height / 2,
        player.position.z - 60
      );
      obs.castShadow = true;
      obs.userData.direction = Math.random() < 0.5 ? -1 : 1;
      scene.add(obs);
      obstacles.push(obs);
    }
  }

  camera.position.copy(player.position).add(cameraOffset);
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
