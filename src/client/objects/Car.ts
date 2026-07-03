import * as THREE from 'three';

const CAR_COLORS = [0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500];

export class Car {
  private mesh: THREE.Group;
  private position: THREE.Vector3;
  private isDodgedFlag: boolean = false;
  private color: number;

  constructor(scene: THREE.Scene, x: number, z: number) {
    this.position = new THREE.Vector3(x, 0.5, z);
    this.color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];

    // Create car mesh
    this.mesh = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    this.mesh.add(body);

    // Windows
    const windowGeometry = new THREE.BoxGeometry(1.2, 0.5, 1.5);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.8 });
    const windows = new THREE.Mesh(windowGeometry, windowMaterial);
    windows.position.z = -0.3;
    windows.position.y = 0.3;
    windows.castShadow = true;
    this.mesh.add(windows);

    // Wheels
    this.createWheel(-0.6, -0.4, 0.8);
    this.createWheel(0.6, -0.4, 0.8);
    this.createWheel(-0.6, -0.4, -0.8);
    this.createWheel(0.6, -0.4, -0.8);

    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  private createWheel(x: number, y: number, z: number) {
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    this.mesh.add(wheel);
  }

  public update(deltaTime: number, speed: number) {
    this.position.z += speed * deltaTime;
    this.mesh.position.z = this.position.z;
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public markDodged() {
    this.isDodgedFlag = true;
  }

  public isDodged(): boolean {
    return this.isDodgedFlag;
  }

  public getMesh(): THREE.Group {
    return this.mesh;
  }
}
