import { WebGLRenderer } from "three";

function createRenderer() {
    const renderer = new WebGLRenderer({ 
        alpha: true,
        antialias: true
    })

    return renderer
}

export { createRenderer }