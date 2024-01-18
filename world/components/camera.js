import { PerspectiveCamera } from "three";

function createPCamera() {
    const fov = 75;
    const near = 0.1
    const far = 1000
    const camera = new PerspectiveCamera(fov, 1, near, far)
    camera.position.set(1.07, 1.43, 2.32)

    return camera
}

export { createPCamera }