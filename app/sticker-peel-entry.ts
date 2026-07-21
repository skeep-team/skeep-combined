import {
  AmbientLight,
  Bone,
  BoxGeometry,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  FrontSide,
  Group,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  RGBAFormat,
  Scene,
  ShadowMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Texture,
  Uint16BufferAttribute,
  Vector3,
  WebGLRenderer,
} from "three";

const CAMERA_DISTANCE = 1200;
const CAMERA_NEAR = 100;
const CAMERA_FAR = 2000;
const STICKER_DEPTH = 0.003;
const CANVAS_SCALE = 4;
const BONE_GRID_X = 30;
const BONE_GRID_Y = 30;
const SEGMENTS_W = 80;
const SEGMENTS_H = 60;
const FIXED_CURL_RADIUS = 0.15;
const FIXED_CURL_FACTOR = 0.6;

const scratchQuat = new Quaternion();
const scratchRotAxis = new Vector3();

type PeelOptions = {
  image: string;
  curlRotation?: number;
  hoverPeel?: number;
  pressPeel?: number;
  duration?: number;
  backColor?: string;
  shadowOpacity?: number;
  shadowColor?: string;
  shadowX?: number;
  shadowY?: number;
};

function calculateCameraFov(width: number, height: number, distance: number) {
  const aspect = width / height;
  return (2 * Math.atan(width / aspect / (2 * distance)) * 180) / Math.PI;
}

function mapLinear(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function mapInternalRadiusToUIValue(ui: number) {
  const clamped = Math.max(0.1, Math.min(1, ui));
  return mapLinear(clamped, 0.1, 1, 0.05, 1 / Math.PI);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function createStickerGeometry(width: number, height: number) {
  const geometry = new BoxGeometry(
    width,
    height,
    STICKER_DEPTH,
    SEGMENTS_W,
    SEGMENTS_H,
    1,
  );
  const position = geometry.attributes.position;
  const vertex = new Vector3();
  const skinIndexes: number[] = [];
  const skinWeights: number[] = [];

  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    const normalizedX = (vertex.x + width / 2) / width;
    const normalizedY = (vertex.y + height / 2) / height;
    const gridXPos = normalizedX * (BONE_GRID_X - 1);
    const gridYPos = normalizedY * (BONE_GRID_Y - 1);
    const x0 = Math.floor(gridXPos);
    const y0 = Math.floor(gridYPos);
    const x1 = Math.min(x0 + 1, BONE_GRID_X - 1);
    const y1 = Math.min(y0 + 1, BONE_GRID_Y - 1);
    const tx = gridXPos - x0;
    const ty = gridYPos - y0;

    skinIndexes.push(
      y0 * BONE_GRID_X + x0,
      y0 * BONE_GRID_X + x1,
      y1 * BONE_GRID_X + x0,
      y1 * BONE_GRID_X + x1,
    );
    skinWeights.push(
      (1 - tx) * (1 - ty),
      tx * (1 - ty),
      (1 - tx) * ty,
      tx * ty,
    );
  }

  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
  geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));
  geometry.computeVertexNormals();
  return geometry;
}

class StickerPeel {
  private host: HTMLElement;
  private options: Required<PeelOptions>;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private mesh: SkinnedMesh;
  private bones: Bone[] = [];
  private initialPositions: Vector3[] = [];
  private amount = 0;
  private tweenFrame = 0;
  private peeled = false;
  private canvas: HTMLCanvasElement;
  private disposed = false;

  constructor(host: HTMLElement, options: PeelOptions) {
    this.host = host;
    this.options = {
      image: options.image,
      curlRotation: options.curlRotation ?? 240,
      hoverPeel: options.hoverPeel ?? 45,
      pressPeel: options.pressPeel ?? 64,
      duration: options.duration ?? 0.6,
      backColor: options.backColor ?? "#000000",
      shadowOpacity: options.shadowOpacity ?? 30,
      shadowColor: options.shadowColor ?? "#000000",
      shadowX: options.shadowX ?? -300,
      shadowY: options.shadowY ?? 140,
    };

    this.canvas = document.createElement("canvas");
    this.canvas.className = "wm-peel-canvas";
    this.canvas.setAttribute("aria-hidden", "true");
    this.host.appendChild(this.canvas);

    const meshW = 240;
    const meshH = 240;
    const canvasWidth = meshW * CANVAS_SCALE;
    const canvasHeight = meshH * CANVAS_SCALE;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.camera = new PerspectiveCamera(
      calculateCameraFov(canvasWidth, canvasHeight, CAMERA_DISTANCE),
      canvasWidth / canvasHeight,
      CAMERA_NEAR,
      CAMERA_FAR,
    );
    this.camera.position.set(0, 0, CAMERA_DISTANCE);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    this.renderer.setSize(
      Math.round(canvasWidth * dpr),
      Math.round(canvasHeight * dpr),
      false,
    );
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    const geometry = createStickerGeometry(meshW, meshH);
    const boneSpacingX = meshW / (BONE_GRID_X - 1);
    const boneSpacingY = meshH / (BONE_GRID_Y - 1);
    for (let y = 0; y < BONE_GRID_Y; y += 1) {
      for (let x = 0; x < BONE_GRID_X; x += 1) {
        const bone = new Bone();
        bone.position.set(
          -meshW / 2 + x * boneSpacingX,
          -meshH / 2 + y * boneSpacingY,
          0,
        );
        this.bones.push(bone);
      }
    }
    this.initialPositions = this.bones.map((bone) => bone.position.clone());

    const frontMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      side: FrontSide,
      transparent: true,
      roughness: 0.2,
      metalness: 0.4,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
    });
    const backMaterial = new MeshStandardMaterial({
      color: new Color(this.options.backColor),
      side: FrontSide,
      transparent: true,
      roughness: 0.3,
      metalness: 0,
      emissive: new Color(this.options.backColor),
      emissiveIntensity: 0.3,
    });
    const sideMaterial = new MeshStandardMaterial({
      color: new Color(this.options.backColor),
      transparent: true,
      roughness: 0.1,
      metalness: 0,
    });

    this.mesh = new SkinnedMesh(geometry, [
      sideMaterial,
      sideMaterial,
      sideMaterial,
      sideMaterial,
      frontMaterial,
      backMaterial,
    ]);
    this.mesh.frustumCulled = false;
    this.bones.forEach((bone) => {
      this.mesh.add(bone);
      bone.updateMatrixWorld(true);
    });
    this.mesh.bind(new Skeleton(this.bones));
    this.mesh.castShadow = true;

    const group = new Group();
    group.add(this.mesh);
    this.scene.add(group);

    const ambientLight = new AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    const directionalLight = new DirectionalLight(0xffffff, 2);
    directionalLight.position.set(this.options.shadowX, this.options.shadowY, 400);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.bias = -0.00001;
    directionalLight.shadow.radius = 8;
    const shadowCameraSize = Math.max(canvasWidth, canvasHeight);
    directionalLight.shadow.camera.left =
      -shadowCameraSize / 2 + this.options.shadowX * 0.3;
    directionalLight.shadow.camera.right =
      shadowCameraSize / 2 + this.options.shadowX * 0.3;
    directionalLight.shadow.camera.top =
      shadowCameraSize / 2 + this.options.shadowY * 0.3;
    directionalLight.shadow.camera.bottom =
      -shadowCameraSize / 2 + this.options.shadowY * 0.3;
    this.scene.add(directionalLight);

    const shadowMaterial = new ShadowMaterial({
      opacity: this.options.shadowOpacity / 100,
      color: new Color(this.options.shadowColor),
    });
    const shadowPlane = new Mesh(
      new PlaneGeometry(shadowCameraSize, shadowCameraSize),
      shadowMaterial,
    );
    shadowPlane.receiveShadow = true;
    shadowPlane.position.set(0, 0, -1);
    this.scene.add(shadowPlane);

    this.bindEvents();
    this.loadTexture(frontMaterial);
    this.updateBones();
    this.render();
  }

  private loadTexture(frontMaterial: MeshStandardMaterial) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (this.disposed) return;
      const texture = new Texture(img);
      texture.needsUpdate = true;
      texture.minFilter = LinearFilter;
      texture.colorSpace = SRGBColorSpace;
      texture.format = RGBAFormat;
      frontMaterial.map = texture;
      frontMaterial.emissiveMap = texture;
      frontMaterial.alphaTest = 0.01;
      frontMaterial.needsUpdate = true;
      this.host.classList.add("is-ready");
      this.host.classList.add("is-webgl-ready");
      this.render();
    };
    img.src = this.options.image;
  }

  private bindEvents() {
    this.host.setAttribute("aria-pressed", "false");
    this.host.addEventListener("click", this.onClick);
  }

  private onClick = () => {
    this.peeled = !this.peeled;
    this.host.setAttribute("aria-pressed", String(this.peeled));
    this.animateTo(this.peeled ? this.options.hoverPeel / 100 : 0);
  };

  private animateTo(target: number) {
    cancelAnimationFrame(this.tweenFrame);
    const from = this.amount;
    const started = performance.now();
    const duration = this.options.duration * 1000;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      this.amount = from + (target - from) * easeInOut(progress);
      this.updateBones();
      this.render();
      if (progress < 1) this.tweenFrame = requestAnimationFrame(tick);
    };
    this.tweenFrame = requestAnimationFrame(tick);
  }

  private updateBones() {
    const amount = Math.min(1, Math.max(0, this.amount));
    const curlStart = 1 - amount;
    const curlFactor = amount <= 0 ? 1e-4 : FIXED_CURL_FACTOR;
    const radius = mapInternalRadiusToUIValue(FIXED_CURL_RADIUS);
    const width = 240;
    const height = 240;
    const curlRotationRad = (this.options.curlRotation * Math.PI) / 180;
    const dirX = Math.cos(curlRotationRad);
    const dirY = Math.sin(curlRotationRad);
    scratchRotAxis.set(-dirY, dirX, 0).normalize();

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const maxDistAlongDir = Math.max(
      halfWidth * dirX + halfHeight * dirY,
      halfWidth * dirX - halfHeight * dirY,
      -halfWidth * dirX + halfHeight * dirY,
      -halfWidth * dirX - halfHeight * dirY,
    );
    const maxDistFromCenter = Math.sqrt(width * width + height * height) / 2;
    const foldOffset = -maxDistAlongDir + curlStart * 2 * maxDistAlongDir;
    const radiusWorld = radius * maxDistFromCenter;
    const radiusPrime = radiusWorld / curlFactor;
    const arcLimit = Math.PI * radiusWorld;

    for (let i = 0; i < this.bones.length; i += 1) {
      const bone = this.bones[i];
      const initialPos = this.initialPositions[i];
      const distOnDir = initialPos.x * dirX + initialPos.y * dirY;
      const signedDist = distOnDir - foldOffset;
      if (signedDist <= 0) {
        bone.position.copy(initialPos);
        bone.quaternion.identity();
        continue;
      }

      const angle = (signedDist * curlFactor) / radiusWorld;
      let xRel: number;
      let zRel: number;
      let finalAngle: number;
      if (signedDist <= arcLimit) {
        xRel = radiusPrime * Math.sin(angle);
        zRel = radiusPrime * (1 - Math.cos(angle));
        finalAngle = angle;
      } else {
        const phi = Math.PI * curlFactor;
        const xArcEnd = radiusPrime * Math.sin(phi);
        const zArcEnd = radiusPrime * (1 - Math.cos(phi));
        const extra = signedDist - arcLimit;
        xRel = xArcEnd + extra * Math.cos(phi);
        zRel = zArcEnd + extra * Math.sin(phi);
        finalAngle = phi;
      }

      const dx = xRel - signedDist;
      bone.position.x = initialPos.x + dx * dirX;
      bone.position.y = initialPos.y + dx * dirY;
      bone.position.z = initialPos.z + zRel;
      scratchQuat.setFromAxisAngle(scratchRotAxis, -finalAngle);
      bone.quaternion.copy(scratchQuat);
    }
    this.mesh.skeleton.update();
  }

  private render() {
    if (this.renderer.getContext().isContextLost()) return;
    this.mesh.updateMatrixWorld(true);
    this.mesh.skeleton.bones.forEach((bone) => bone.updateMatrixWorld(true));
    this.mesh.skeleton.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.tweenFrame);
    this.host.removeEventListener("click", this.onClick);
    this.mesh.geometry.dispose();
    const materials = this.mesh.material as MeshStandardMaterial[];
    materials.forEach((material) => {
      material.map?.dispose();
      material.dispose();
    });
    this.renderer.dispose();
    this.canvas.remove();
  }
}

declare global {
  interface Window {
    SkeepStickerPeel?: {
      mount: (host: HTMLElement, options: PeelOptions) => StickerPeel;
    };
  }
}

window.SkeepStickerPeel = {
  mount(host, options) {
    return new StickerPeel(host, options);
  },
};
