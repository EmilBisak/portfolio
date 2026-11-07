// WebGL "gravity field": glossy spheres that float in the hero, drop under gravity,
// assemble into the "E" logo and finally fly past the camera. Driven by scroll
// progress and the cursor (state shared through window.gravity from main.js).
import * as THREE from "three";

const G = window.gravity;
if (G && !G.disabled) {
    try {
        init();
    } catch (error) {
        console.warn("Sphere field disabled:", error);
        document.querySelector("[data-scene]")?.remove();
        G.onReady();
    }
}

function init() {
    const container = document.querySelector("[data-scene]");
    const canvas = container.querySelector("canvas");
    const control = G.control;
    const mousePos = G.mouse;

    const isMobile = window.innerWidth < 768;

    /* ---------- Renderer, camera, lights ---------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 11);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const hemiLight = new THREE.HemisphereLight(0xffffff, new THREE.Color("#18212a"), 1.6);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(-6, 10, 8);
    keyLight.castShadow = !isMobile;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 12.0;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbff3fb, 1.5);
    rimLight.position.set(8, 7, -8);
    scene.add(rimLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 0.4);
    frontLight.position.set(0, 0, 11);
    scene.add(frontLight);

    const sideBounceLight = new THREE.DirectionalLight(0x4fd1e8, 0.45);
    sideBounceLight.position.set(-9, -2, 4);
    scene.add(sideBounceLight);

    /* ---------- Viewport bounds ---------- */
    let viewportWidth = 10;
    let viewportHeight = 6;
    const updateFrustumBounds = () => {
        const fovRad = THREE.MathUtils.degToRad(camera.fov);
        viewportHeight = 2 * Math.tan(fovRad / 2) * camera.position.z;
        viewportWidth = viewportHeight * (container.clientWidth / container.clientHeight);
    };
    updateFrustumBounds();

    const ballCount = isMobile ? 40 : 84;
    const sizeScale = isMobile ? 0.74 : 0.9;

    /* ---------- Palettes: dark graphite with a colored glass accent ---------- */
    const pal = (pastel, light, medium, deep, glass) => ({
        pastel: new THREE.Color(pastel),
        light: new THREE.Color(light),
        medium: new THREE.Color(medium),
        deep: new THREE.Color(deep),
        glass: new THREE.Color(glass),
    });
    const palHero = pal("#bfeaf3", "#3a4b56", "#18212a", "#080b0f", "#4fd1e8"); // graphite + cyan
    const palDrop = pal("#d6d1ff", "#4a4478", "#221e3e", "#0b0a17", "#8f80ff"); // ink + violet
    const palShape = pal("#f4f8fa", "#9aa7b1", "#2b333b", "#0d1013", "#bff3fb"); // silver + ice
    const ROLES = ["pastel", "light", "medium", "deep", "glass"];
    const curPal = pal("#000", "#000", "#000", "#000", "#000");

    /* ---------- Spheres ---------- */
    const sphereGeometry = new THREE.SphereGeometry(1, 48, 48);
    const balls = [];
    for (let i = 0; i < ballCount; i++) {
        let radius;
        const rand = Math.random();
        if (rand < 0.3) radius = 0.27 + Math.random() * 0.12;
        else if (rand < 0.8) radius = 0.42 + Math.random() * 0.18;
        else radius = 0.66 + Math.random() * 0.21;

        radius *= sizeScale;
        const mass = Math.pow(radius, 3);
        const isGlass = Math.random() < 0.22;
        let role = "medium";
        let material;

        if (isGlass) {
            role = "glass";
            material = new THREE.MeshPhysicalMaterial({
                color: palHero.glass,
                roughness: 0.08,
                metalness: 0.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.03,
                transmission: 0.95,
                ior: 1.485,
                thickness: 2.2,
                specularColor: new THREE.Color("#ffffff"),
                specularIntensity: 1.0,
                attenuationColor: palHero.pastel,
                attenuationDistance: 1.0,
                emissive: palHero.glass,
                emissiveIntensity: 0.22,
                transparent: true,
            });
        } else {
            const colorRand = Math.random();
            if (colorRand < 0.12) role = "pastel";
            else if (colorRand < 0.4) role = "light";
            else if (colorRand < 0.75) role = "medium";
            else role = "deep";

            material = new THREE.MeshPhysicalMaterial({
                color: palHero[role],
                roughness: 0.38,
                metalness: 0.0,
                clearcoat: 0.6,
                clearcoatRoughness: 0.25,
                emissive: palHero[role],
                emissiveIntensity: 0.06,
                transparent: true,
            });
        }

        const group = new THREE.Group();
        const sphereMesh = new THREE.Mesh(sphereGeometry, material);
        sphereMesh.scale.setScalar(radius);
        sphereMesh.castShadow = !isMobile;
        sphereMesh.receiveShadow = !isMobile;
        group.add(sphereMesh);
        scene.add(group);

        balls.push({
            id: i,
            radius,
            mass,
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            meshGroup: group,
            sphere: sphereMesh,
            material,
            role,
            isGlass,
            visualScale: radius,
            shapeTarget: new THREE.Vector3(),
        });
    }

    const meanRadius = balls.reduce((sum, b) => sum + b.radius, 0) / balls.length;

    /* ---------- Hero cluster center (right of the headline on wide screens) ---------- */
    const cluster = { x: 0, y: 0 };
    const updateCluster = () => {
        const wide = container.clientWidth >= 900;
        cluster.x = wide ? viewportWidth * 0.17 : 0;
        cluster.y = wide ? viewportHeight * 0.1 : viewportHeight * 0.24;
    };
    updateCluster();

    /* ---------- "E" logo targets: a block letter packed on a hex grid ---------- */
    // Unit letter, origin at bottom-left, height 1. Spine plus three arms.
    const E_W = 0.7;
    const E_T = 0.2;
    const eRects = [
        [0, 0, E_T, 1], // spine
        [E_T, 1 - E_T, E_W, 1], // top arm
        [E_T, 0.5 - E_T / 2, E_W * 0.86, 0.5 + E_T / 2], // middle arm (a bit shorter)
        [E_T, 0, E_W, E_T], // bottom arm
    ];
    const insideE = (x, y) => eRects.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
    const hexPoints = (d) => {
        const pts = [];
        const rowH = d * 0.866;
        let row = 0;
        for (let y = d / 2; y <= 1 - d / 2 + 1e-6; y += rowH, row++) {
            for (let x = d / 2 + (row % 2 ? d / 2 : 0); x <= E_W - d / 2 + 1e-6; x += d) {
                if (insideE(x, y)) pts.push(x, y);
            }
        }
        return pts;
    };
    let slotSpacing = 0.1;

    // Each sphere gets a fixed slot, so resizes (e.g. the mobile URL bar) only rescale the letter.
    // Spare spheres sit right behind a filled slot, adding depth without breaking the outline.
    const buildSlots = () => {
        // Tightest spacing that does not need more slots than spheres, so no slot is left empty
        let lo = 0.02, hi = 0.4, pts = hexPoints(hi);
        for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2;
            const p = hexPoints(mid);
            if (p.length / 2 <= balls.length) { hi = mid; pts = p; } else lo = mid;
        }
        slotSpacing = hi;
        const slotCount = pts.length / 2;

        const order = balls.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        order.forEach((ballIndex, i) => {
            const k = (i % slotCount) * 2;
            balls[ballIndex].slot = { x: pts[k], y: pts[k + 1], spare: i >= slotCount, z: (Math.random() - 0.5) * 0.15 };
        });
    };
    buildSlots();

    let shapeRadius = meanRadius;
    const assignShapeTargets = () => {
        const wide = container.clientWidth >= 900;
        const maxW = wide ? viewportWidth * 0.34 : viewportWidth * 0.62;
        const maxH = wide ? viewportHeight * 0.66 : viewportHeight * 0.36;
        const scale = Math.min(maxH, maxW / E_W);
        const offX = wide ? viewportWidth * 0.2 : 0;
        const offY = wide ? 0 : viewportHeight * 0.22;
        shapeRadius = slotSpacing * scale * 0.5;

        for (const b of balls) {
            const { x, y, spare, z } = b.slot;
            b.shapeTarget.set((x - E_W / 2) * scale + offX, (y - 0.5) * scale + offY, spare ? -shapeRadius * 2.1 : z);
        }
    };
    assignShapeTargets();

    /* ---------- Entrance scatter ---------- */
    const scatterFar = (withInwardVelocity) => {
        const R = Math.max(viewportWidth, viewportHeight) * 1.5;
        for (const b of balls) {
            const a = Math.random() * Math.PI * 2;
            const px = Math.cos(a) * R * 1.25;
            const py = Math.sin(a) * R * 0.85;
            const pz = (Math.random() - 0.5) * 4;
            b.position.set(px, py, pz);
            b.meshGroup.position.copy(b.position);
            if (withInwardVelocity) {
                b.velocity.set(cluster.x - px, cluster.y - py, -pz).normalize().multiplyScalar(0.08 + Math.random() * 0.05);
            } else {
                b.velocity.set(0, 0, 0);
            }
        }
    };
    scatterFar(false);

    /* ---------- Simulation parameters ---------- */
    const params = {
        rebound: -0.3,
        mouseRepelForce: 0.05,
        mouseRepelRadius: 4.4,
        centerAttractForce: 0.0035,
        bounciness: 0.02,
    };

    const mouseProjVec = new THREE.Vector3();
    const mouseWorld3D = new THREE.Vector3();
    const updateMouse3D = () => {
        mouseProjVec.set(mousePos.x, mousePos.y, 0.5);
        mouseProjVec.unproject(camera);
        const dir = mouseProjVec.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        mouseWorld3D.copy(camera.position).add(dir.multiplyScalar(distance));
    };

    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const smoothstep = (a, b, x) => {
        const t = clamp01((x - a) / (b - a));
        return t * t * (3 - 2 * t);
    };
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    /* ---------- Loop ---------- */
    let localStarted = false;
    let entranceStart = 0;
    let reportedReady = false;
    let parked = false;

    const diffVec = new THREE.Vector3();
    const collideDiff = new THREE.Vector3();
    const relVel = new THREE.Vector3();
    const deltaPos = new THREE.Vector3();
    const rotAxis = new THREE.Vector3();
    const prevMouseWorld = new THREE.Vector3();
    let mouseSpeed = 0;

    const report = () => {
        if (!reportedReady) {
            reportedReady = true;
            G.onReady();
        }
    };

    /* ---------- Adaptive quality ---------- */
    // Watches real frame times while the field is moving. On a device that can't keep up it
    // first drops shadows and render resolution, then thins out the spheres.
    let quality = 2;
    let frameTimes = [];

    const degrade = () => {
        quality--;
        G.quality = quality;
        if (quality === 1) {
            renderer.setPixelRatio(1);
            renderer.shadowMap.enabled = false;
            keyLight.castShadow = false;
            for (const b of balls) {
                b.sphere.castShadow = false;
                b.sphere.receiveShadow = false;
                b.material.needsUpdate = true;
            }
        } else {
            const keep = Math.max(24, Math.round(balls.length * 0.6));
            for (const b of balls.splice(keep)) {
                scene.remove(b.meshGroup);
                b.material.dispose();
            }
            buildSlots();
            assignShapeTargets();
        }
    };

    // Judge in windows of ~2 s (or 90 frames), so a very slow device is caught quickly too
    let windowMs = 0;
    const watchFrame = (frameMs) => {
        if (quality === 0 || G.noAdapt) return;
        frameTimes.push(frameMs);
        windowMs += frameMs;
        if (frameTimes.length < 90 && (windowMs < 2000 || frameTimes.length < 8)) return;
        const median = frameTimes.sort((a, b) => a - b)[frameTimes.length >> 1];
        frameTimes = [];
        windowMs = 0;
        if (median > 26) degrade(); // below roughly 38 fps
    };

    // Physics runs at a fixed 60 Hz step so it feels the same on 60/120/144 Hz screens
    const STEP = 1 / 60;
    let simTime = 0;
    let accumulator = 0;
    let lastFrame = performance.now();

    // A hidden tab pauses rAF: the gap when it comes back is not a slow frame
    document.addEventListener("visibilitychange", () => {
        lastFrame = performance.now();
        frameTimes = [];
        windowMs = 0;
    });

    const simulateAndRender = () => {
        requestAnimationFrame(simulateAndRender);

        const now = performance.now();
        const frameMs = now - lastFrame;
        accumulator += Math.min(0.25, frameMs / 1000);
        lastFrame = now;

        if (control.started && !localStarted) {
            localStarted = true;
            entranceStart = simTime;
            accumulator = STEP;
            scatterFar(true);
        }

        if (!localStarted) {
            accumulator = 0;
            renderer.render(scene, camera);
            report();
            return;
        }

        // Once the field has flown away and we're deep in the content, stop working
        if (control.progress > 3.15) {
            accumulator = 0;
            if (!parked) {
                renderer.clear();
                parked = true;
            }
            return;
        }
        parked = false;

        updateMouse3D();
        const maxSteps = G.maxSteps || 3;
        let steps = 0;
        while (accumulator >= STEP && steps < maxSteps) {
            simTime += STEP;
            step(simTime);
            accumulator -= STEP;
            steps++;
        }
        if (steps === maxSteps) accumulator = 0;

        // Sync meshes with the simulation
        for (let i = 0; i < balls.length; i++) {
            const b = balls[i];
            deltaPos.copy(b.position).sub(b.meshGroup.position);
            if (deltaPos.lengthSq() > 0.000001) {
                rotAxis.set(deltaPos.y, -deltaPos.x, 0).normalize();
                b.meshGroup.rotateOnWorldAxis(rotAxis, (deltaPos.length() / b.radius) * 0.95);
            }
            b.meshGroup.position.copy(b.position);
        }

        renderer.render(scene, camera);
        report();
        // Skip the first seconds after the entrance (shader warm-up is always a bit choppy)
        if (simTime - entranceStart > 1.5) watchFrame(frameMs);
    };

    const step = (time) => {
        const progress = control.progress;

        // Mode blend factors
        const heroF = 1 - smoothstep(0.3, 0.8, progress);
        const dropRaw = smoothstep(0.4, 0.95, progress);
        const flyF = smoothstep(2.45, 3.0, progress);
        const shapeF = smoothstep(1.4, 2.05, progress) * (1 - smoothstep(2.35, 2.75, progress));
        const dropF = dropRaw * (1 - smoothstep(1.25, 1.75, progress));

        // Palette morph: cyan -> violet -> silver
        const bDrop = smoothstep(0.55, 1.05, progress);
        const bShape = smoothstep(1.4, 1.95, progress);
        for (const role of ROLES) {
            curPal[role].copy(palHero[role]).lerp(palDrop[role], bDrop).lerp(palShape[role], bShape);
        }
        hemiLight.groundColor.copy(curPal.medium);

        const entranceT = easeOutCubic(clamp01((time - entranceStart) / 2.2));
        const attractionBoost = lerp(7.5, 1, entranceT);

        const isMouseInteracting = Math.abs(mousePos.x) < 0.99 || Math.abs(mousePos.y) < 0.99;
        mouseSpeed = isMouseInteracting ? Math.min(3, mouseWorld3D.distanceTo(prevMouseWorld)) : 0;
        prevMouseWorld.copy(mouseWorld3D);

        let damping = 0.91;
        damping = lerp(damping, 0.992, dropF);
        damping = lerp(damping, 0.9, shapeF);
        damping = lerp(damping, 0.985, flyF);

        const camZ = camera.position.z;
        const clusterActive = Math.max(heroF, entranceT < 1 ? 1 : 0);

        // 1. Accelerations
        for (let i = 0; i < balls.length; i++) {
            const b = balls[i];

            if (heroF > 0.01) {
                b.velocity.x += Math.sin(time * 0.4 + b.id * 1.5) * 0.0004 * b.radius * heroF;
                b.velocity.y += Math.cos(time * 0.5 + b.id * 1.2) * 0.0004 * b.radius * heroF;
                b.velocity.z += Math.sin(time * 0.35 + b.id) * 0.0001 * heroF;
            }

            const clusterStrength = params.centerAttractForce * attractionBoost * clusterActive;
            if (clusterStrength > 0.00001) {
                b.velocity.x += (cluster.x - b.position.x) * clusterStrength * 0.62;
                b.velocity.y += (cluster.y - b.position.y) * clusterStrength * 1.85;
                b.velocity.z += (0 - b.position.z) * clusterStrength * 1.8;
            }

            if (dropF > 0.001) b.velocity.y -= 0.011 * dropF;

            if (shapeF > 0.001) {
                const k = 0.06 * shapeF;
                b.velocity.x += (b.shapeTarget.x - b.position.x) * k;
                b.velocity.y += (b.shapeTarget.y - b.position.y) * k;
                b.velocity.z += (b.shapeTarget.z - b.position.z) * k;
            }

            if (flyF > 0.001) {
                const stagger = (b.id * 0.6180339887) % 1;
                const local = smoothstep(stagger * 0.55, stagger * 0.55 + 0.45, flyF);
                b.velocity.z += 0.05 * local;
                b.velocity.x += b.position.x * 0.006 * local;
                b.velocity.y += b.position.y * 0.006 * local;
            }

            if (isMouseInteracting) {
                diffVec.subVectors(b.position, mouseWorld3D);
                const rawDist = diffVec.length();
                const down = mousePos.isDown;
                const radius = down ? params.mouseRepelRadius * 1.4 : params.mouseRepelRadius;
                const force = down ? params.mouseRepelForce * 1.7 : params.mouseRepelForce;
                if (rawDist < radius && rawDist > 0.0001) {
                    const ratio = rawDist / radius;
                    const smoothFactor = 1.0 - ratio * ratio * (3.0 - 2.0 * ratio);
                    const push = smoothFactor * force * (1 + mouseSpeed * 3.2);
                    diffVec.normalize();
                    diffVec.z *= 0.12;
                    diffVec.normalize();
                    b.velocity.addScaledVector(diffVec, push);
                }
            }

            b.velocity.multiplyScalar(damping);
            b.position.addScaledVector(b.velocity, 1);

            const c = curPal[b.role];
            b.material.color.copy(c);
            b.material.emissive.copy(c);

            b.material.opacity = flyF > 0.001 ? 1 - smoothstep(camZ - 2.6, camZ - 0.3, b.position.z) : 1;

            // In the logo phase every sphere takes the same size so the letter reads cleanly
            const targetVis = b.radius + (shapeRadius * 0.97 - b.radius) * shapeF;
            b.visualScale += (targetVis - b.visualScale) * 0.12;
            b.sphere.scale.setScalar(b.visualScale);
        }

        // 2. Pairwise collisions (mostly off in shape mode so the letter stays crisp)
        const collideScale = 0.28 * (1 - 0.93 * shapeF) * (1 - flyF);
        if (collideScale > 0.0005) {
            for (let step = 0; step < 4; step++) {
                for (let i = 0; i < balls.length; i++) {
                    const b1 = balls[i];
                    for (let j = i + 1; j < balls.length; j++) {
                        const b2 = balls[j];
                        collideDiff.subVectors(b2.position, b1.position);
                        const dist = collideDiff.length();
                        const minDist = b1.visualScale + b2.visualScale;
                        if (dist < minDist && dist > 0.001) {
                            const overlap = minDist - dist;
                            collideDiff.multiplyScalar(1 / dist);
                            const totalMass = b1.mass + b2.mass;
                            b1.position.addScaledVector(collideDiff, -overlap * (b2.mass / totalMass) * collideScale);
                            b2.position.addScaledVector(collideDiff, overlap * (b1.mass / totalMass) * collideScale);

                            relVel.subVectors(b2.velocity, b1.velocity);
                            const velAlongNormal = relVel.dot(collideDiff);
                            if (velAlongNormal < -0.0001) {
                                const impulse = (-(1 + params.bounciness) * velAlongNormal) / (1 / b1.mass + 1 / b2.mass);
                                b1.velocity.addScaledVector(collideDiff, -impulse / b1.mass);
                                b2.velocity.addScaledVector(collideDiff, impulse / b2.mass);
                            }
                        }
                    }
                }
            }
        }

        // 3. Viewport walls + bouncy floor
        const xBound = viewportWidth / 2 - 0.2;
        const topY = viewportHeight / 2 - 0.05;
        const floorY = -viewportHeight / 2 + 0.05;
        const zBound = 2.0;
        const restitution = 0.3 + 0.35 * dropF;
        const contain = flyF < 0.5;
        const zContain = flyF < 0.02;

        for (let i = 0; i < balls.length; i++) {
            const b = balls[i];
            const r = b.visualScale;

            if (contain) {
                if (b.position.x < -xBound - r) {
                    b.position.x = -xBound - r;
                    b.velocity.x *= params.rebound;
                } else if (b.position.x > xBound + r) {
                    b.position.x = xBound + r;
                    b.velocity.x *= params.rebound;
                }
                if (b.position.y - r < floorY) {
                    b.position.y = floorY + r;
                    if (b.velocity.y < 0) b.velocity.y = -b.velocity.y * restitution;
                    if (dropF > 0.3) {
                        b.velocity.x *= 0.86;
                        b.velocity.z *= 0.86;
                    }
                }
                if (b.position.y + r > topY) {
                    b.position.y = topY - r;
                    if (b.velocity.y > 0) b.velocity.y *= params.rebound;
                }
            }

            if (zContain) {
                if (b.position.z < -zBound) {
                    b.position.z = -zBound;
                    b.velocity.z *= params.rebound;
                } else if (b.position.z > zBound) {
                    b.position.z = zBound;
                    b.velocity.z *= params.rebound;
                }
            }
        }
    };

    simulateAndRender();

    /* ---------- Resize ---------- */
    const handleResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        updateFrustumBounds();
        updateCluster();
        assignShapeTargets();
    };
    new ResizeObserver(handleResize).observe(container);
}
