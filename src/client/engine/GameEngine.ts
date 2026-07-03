import * as THREE from 'three';
import { Car } from '../objects/Car';
import { PlayerCar } from '../objects/PlayerCar';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private playerCar: PlayerCar;
  private traffic: Car[] = [];
  private gameTime: number = 0;
  private difficulty: number = 1;
  private boostActive: boolean = false;
  private dodgedCars: Car[] = [];

  constructor() {
    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 500, 1000);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 3, 10);
    this.camera.lookAt(0, 0, 50);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Create road
    this.createRoad();

    // Create player car
    this.playerCar = new PlayerCar(this.scene);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Start animation loop
    this.animate();

    // Generate initial traffic
    this.generateTraffic();
  }

  private createRoad() {
    // Road surface
    const roadGeometry = new THREE.PlaneGeometry(10, 10000);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    this.scene.add(road);

    // Road markings
    const lineGeometry = new THREE.PlaneGeometry(0.2, 5000);
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = -Math.PI / 2;
    line.position.z = 2500;
    line.position.y = 0.01;
    this.scene.add(line);

    // Side barriers
    const barrierGeometry = new THREE.BoxGeometry(0.5, 1, 10000);
    const barrierMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    const leftBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    leftBarrier.position.x = -5.5;
    leftBarrier.castShadow = true;
    this.scene.add(leftBarrier);

    const rightBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    rightBarrier.position.x = 5.5;
    rightBarrier.castShadow = true;
    this.scene.add(rightBarrier);
  }

  private generateTraffic() {
    const lanesX = [-2.5, 0, 2.5];
    for (let i = 0; i < 5; i++) {
      const lane = lanesX[Math.floor(Math.random() * lanesX.length)];
      const car = new Car(this.scene, lane, -200 - i * 60);
      this.traffic.push(car);
    }
  }

  public update(deltaTime: number, input: any) {
    this.gameTime += deltaTime;

    // Update player car
    this.playerCar.update(deltaTime, input, this.boostActive);
    this.camera.position.lerp(
      new THREE.Vector3(this.playerCar.getPosition().x, 3, this.playerCar.getPosition().z + 10),
      0.1
    );

    // Update traffic
    const baseSpeed = 50 + this.difficulty * 5;
    this.traffic.forEach((car, index) => {
      car.update(deltaTime, baseSpeed + (this.boostActive ? 30 : 0));

      // Check if car is off-screen
      if (car.getPosition().z > 20) {
        this.traffic.splice(index, 1);
        this.scene.remove(car.getMesh());
      }

      // Check if dodged
      if (!car.isDodged() && car.getPosition().z > this.playerCar.getPosition().z) {
        car.markDodged();
        this.dodgedCars.push(car);
      }
    });

    // Generate new traffic
    if (this.traffic.length < 8) {
      this.generateTraffic();
    }

    // Reset boost
    if (this.boostActive && input.boost) {
      this.boostActive = false;
    }
  }

  public checkCollisions(): boolean {
    const playerPos = this.playerCar.getPosition();
    
    for (const car of this.traffic) {
      const carPos = car.getPosition();
      const distance = Math.abs(playerPos.x - carPos.x);
      
      if (distance < 2 && Math.abs(playerPos.z - carPos.z) < 3) {
        return true;
      }
    }
    return false;
  }

  public getAndClearDodgedCars(): Car[] {
    const result = this.dodgedCars;
    this.dodgedCars = [];
    return result;
  }

  public activateBoost() {
    this.boostActive = true;
    this.playerCar.setBoostActive(true);
  }

  public increaseDifficulty(survivalTime: number) {
    this.difficulty = 1 + survivalTime / 30;
  }

  public reset() {
    this.gameTime = 0;
    this.difficulty = 1;
    this.boostActive = false;
    this.dodgedCars = [];
    this.playerCar.reset();
    
    // Clear traffic
    this.traffic.forEach(car => {
      this.scene.remove(car.getMesh());
    });
    this.traffic = [];
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
