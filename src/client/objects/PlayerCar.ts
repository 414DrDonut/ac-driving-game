import * as THREE from 'three';

export class PlayerCar {
  private mesh: THREE.Group;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private boostActive: boolean = false;
  private boostDuration: number = 0;

  constructor(scene: THREE.Scene) {
    this.position = new THREE.Vector3(0, 0.5, 0);
    this.velocity = new THREE.Vector3(0, 0, 60);

    // Create car mesh
    this.mesh = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(1.5, 0.8, 3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
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

  public update(deltaTime: number, input: any, boostActive: boolean) {
    const moveSpeed = 15;
    const maxX = 4.5;

    // Handle lateral movement
    if (input.moveLeft) {
      this.position.x = Math.max(this.position.x - moveSpeed * deltaTime, -maxX);
    }
    if (input.moveRight) {
      this.position.x = Math.min(this.position.x + moveSpeed * deltaTime, maxX);
    }

    // Handle boost
    if (boostActive) {
      this.velocity.z = 120;
      this.boostActive = true;
      this.boostDuration = 5;
    } else if (this.boostDuration > 0) {
      this.boostDuration -= deltaTime;
    } else {
      this.velocity.z = 60;
      this.boostActive = false;
    }

    this.position.z += this.velocity.z * deltaTime;
    this.mesh.position.copy(this.position);
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public setBoostActive(active: boolean) {
    this.boostActive = active;
    this.boostDuration = 5;
  }

  public reset() {
    this.position.set(0, 0.5, 0);
    this.velocity.set(0, 0, 60);
    this.boostActive = false;
    this.boostDuration = 0;
    this.mesh.position.copy(this.position);
  }

  public getMesh(): THREE.Group {
    return this.mesh;
  }
}
