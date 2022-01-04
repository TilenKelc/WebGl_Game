import { mat4, vec3 } from '../../lib/gl-matrix-module.js';

import { WebGL } from '../../common/engine/WebGL.js';
import { Light } from './Light.js';
import { shaders } from './shaders.js';

// This class prepares all assets for use with WebGL
// and takes care of rendering.

export class Renderer {

    constructor(gl) {
        this.gl = gl;
        this.glObjects = new Map();
        this.programs = WebGL.buildPrograms(gl, shaders);

        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.DEPTH_TEST);
        //gl.enable(gl.CULL_FACE);
    }

    prepareBufferView(bufferView) {
        if (this.glObjects.has(bufferView)) {
            return this.glObjects.get(bufferView);
        }

        const buffer = new DataView(
            bufferView.buffer,
            bufferView.byteOffset,
            bufferView.byteLength);
        const glBuffer = WebGL.createBuffer(this.gl, {
            target : bufferView.target,
            data   : buffer
        });
        this.glObjects.set(bufferView, glBuffer);
        return glBuffer;
    }

    prepareSampler(sampler) {
        if (this.glObjects.has(sampler)) {
            return this.glObjects.get(sampler);
        }

        const glSampler = WebGL.createSampler(this.gl, sampler);
        this.glObjects.set(sampler, glSampler);
        return glSampler;
    }

    prepareImage(image) {
        if (this.glObjects.has(image)) {
            return this.glObjects.get(image);
        }

        const glTexture = WebGL.createTexture(this.gl, { image });
        this.glObjects.set(image, glTexture);
        return glTexture;
    }

    prepareTexture(texture) {
        const gl = this.gl;

        this.prepareSampler(texture.sampler);
        const glTexture = this.prepareImage(texture.image);

        const mipmapModes = [
            gl.NEAREST_MIPMAP_NEAREST,
            gl.NEAREST_MIPMAP_LINEAR,
            gl.LINEAR_MIPMAP_NEAREST,
            gl.LINEAR_MIPMAP_LINEAR,
        ];

        if (!texture.hasMipmaps && mipmapModes.includes(texture.sampler.min)) {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.generateMipmap(gl.TEXTURE_2D);
            texture.hasMipmaps = true;
        }
    }

    prepareMaterial(material) {
        if (material.baseColorTexture) {
            this.prepareTexture(material.baseColorTexture);
        }
        if (material.metallicRoughnessTexture) {
            this.prepareTexture(material.metallicRoughnessTexture);
        }
        if (material.normalTexture) {
            this.prepareTexture(material.normalTexture);
        }
        if (material.occlusionTexture) {
            this.prepareTexture(material.occlusionTexture);
        }
        if (material.emissiveTexture) {
            this.prepareTexture(material.emissiveTexture);
        }
    }

    preparePrimitive(primitive) {
        if (this.glObjects.has(primitive)) {
            return this.glObjects.get(primitive);
        }

        this.prepareMaterial(primitive.material);

        const gl = this.gl;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        if (primitive.indices) {
            const bufferView = primitive.indices.bufferView;
            bufferView.target = gl.ELEMENT_ARRAY_BUFFER;
            const buffer = this.prepareBufferView(bufferView);
            gl.bindBuffer(bufferView.target, buffer);
        }

        // this is an application-scoped convention, matching the shader
        const attributeNameToIndexMap = {
            POSITION   : 0,
            NORMAL     : 1,
            TEXCOORD_0 : 2
        };

        for (const name in primitive.attributes) {
            const accessor = primitive.attributes[name];
            const bufferView = accessor.bufferView;
            const attributeIndex = attributeNameToIndexMap[name];

            if (attributeIndex !== undefined) {
                bufferView.target = gl.ARRAY_BUFFER;
                const buffer = this.prepareBufferView(bufferView);
                gl.bindBuffer(bufferView.target, buffer);
                gl.enableVertexAttribArray(attributeIndex);
                gl.vertexAttribPointer(
                    attributeIndex,
                    accessor.numComponents,
                    accessor.componentType,
                    accessor.normalized,
                    bufferView.byteStride,
                    accessor.byteOffset);
            }
        }

        this.glObjects.set(primitive, vao);
        return vao;
    }

    prepareMesh(mesh) {
        for (const primitive of mesh.primitives) {
            this.preparePrimitive(primitive);
        }
    }

    prepareNode(node) {
        if (node.mesh) {
            this.prepareMesh(node.mesh);
        }
        for (const child of node.children) {
            this.prepareNode(child);
        }
    }

    prepareScene(scene) {
        for (const node of scene.nodes) {
            this.prepareNode(node);
        }
    }

    getViewMatrix(camera) {
        const mvMatrix = mat4.clone(camera.matrix);
        let parent = camera.parent;
        while (parent) {
            mat4.mul(mvMatrix, parent.matrix, mvMatrix);
            parent = parent.parent;
        }
        mat4.invert(mvMatrix, mvMatrix);
        //mat4.mul(mvpMatrix, camera.camera.matrix, mvpMatrix);
        return mvMatrix;
    }

    render(scene, camera, lights) {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const program = this.programs.simple;
        gl.useProgram(program.program);

        const defaultTexture = this.defaultTexture;
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(program.uniforms.uTexture, 0);

        let matrix = mat4.create();

        const viewMatrix = this.getViewMatrix(camera);
        mat4.copy(matrix, viewMatrix);
        gl.uniformMatrix4fv(program.uniforms.uProjection, false, camera.projection);

        let colorArray = [];
        let color = vec3.clone(lights[0].ambientColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[0] = [...color];
        color = vec3.clone(lights[1].ambientColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[1] = [...color];
        color = vec3.clone(lights[2].ambientColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[2] = [...color],
        color = vec3.clone(lights[3].ambientColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[3] = [...color];
        let location = gl.getUniformLocation(program.program, "uAmbientColor");
        gl.uniform3fv(location, [...colorArray[0], ...colorArray[1], ...colorArray[2], ...colorArray[3]]);
       
        
        colorArray = [];
        color = vec3.clone(lights[0].diffuseColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[0] = [...color];
        color = vec3.clone(lights[1].diffuseColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[1] = [...color];
        color = vec3.clone(lights[2].diffuseColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[2] = [...color];
        color = vec3.clone(lights[3].diffuseColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[3] = [...color];
        location = gl.getUniformLocation(program.program, "uDiffuseColor");
        gl.uniform3fv(location, [...colorArray[0], ...colorArray[1], ...colorArray[2], ...colorArray[3]]);
       

        colorArray = [];
        color = vec3.clone(lights[0].specularColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[0] = [...color];
        color = vec3.clone(lights[1].specularColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[1] = [...color];
        color = vec3.clone(lights[2].specularColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[2] = [...color];
        color = vec3.clone(lights[3].specularColor);
        vec3.scale(color, color, 1.0 / 255.0);
        colorArray[3] = [...color];
        location = gl.getUniformLocation(program.program, "uSpecularColor");
        gl.uniform3fv(location, [...colorArray[0], ...colorArray[1], ...colorArray[2], ...colorArray[3]]);

        
        colorArray = [];
        let position = [0, 0, 0];
        mat4.getTranslation(position, lights[0].matrix);
        colorArray[0] = [...position];
        position = [0, 0, 0];
        mat4.getTranslation(position, lights[1].matrix);
        colorArray[1] = [...position];
        position = [0, 0, 0];
        mat4.getTranslation(position, lights[2].matrix);
        colorArray[2] = [...position];
        position = [0, 0, 0];
        mat4.getTranslation(position, lights[3].matrix);
        colorArray[3] = [...position];
        location = gl.getUniformLocation(program.program, "uLightPosition");
        gl.uniform3fv(location, [...colorArray[0], ...colorArray[1], ...colorArray[2], ...colorArray[3]]);
       

        colorArray = [];
        colorArray[0] = lights[0].shininess;
        colorArray[1] = lights[1].shininess;
        colorArray[2] = lights[2].shininess;
        colorArray[3] = lights[3].shininess;
        location = gl.getUniformLocation(program.program, "uShininess");
        gl.uniform1fv(location, colorArray);
       

        colorArray = [];
        color = vec3.clone(lights[0].attenuatuion);
        colorArray[0] = [...color];
        color = vec3.clone(lights[1].attenuatuion);
        colorArray[1] = [...color];
        color = vec3.clone(lights[2].attenuatuion);
        colorArray[2] = [...color];
        color = vec3.clone(lights[3].attenuatuion);
        colorArray[3] = [...color];
        location = gl.getUniformLocation(program.program, "uLightAttenuation");
        gl.uniform3fv(location, [...colorArray[0], ...colorArray[1], ...colorArray[2], ...colorArray[3]]);

        for (const node of scene.nodes) {
            this.renderNode(node, matrix);
        }
    }

    renderNode(node, mvMatrix) {
        const gl = this.gl;

        mvMatrix = mat4.clone(mvMatrix);
        mat4.mul(mvMatrix, mvMatrix, node.matrix);

        if (node.mesh) {
            const program = this.programs.simple;
            gl.uniformMatrix4fv(program.uniforms.uViewModel, false, mvMatrix);
            for (const primitive of node.mesh.primitives) {
                this.renderPrimitive(primitive);
            }
        }

        for (const child of node.children) {
            this.renderNode(child, mvMatrix);
        }
    }

    renderPrimitive(primitive) {
        const gl = this.gl;

        const vao = this.glObjects.get(primitive);
        const material = primitive.material;
        const texture = material.baseColorTexture;
        const glTexture = this.glObjects.get(texture.image);
        const glSampler = this.glObjects.get(texture.sampler);

        gl.bindVertexArray(vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, glTexture);
        gl.bindSampler(0, glSampler);

        if (primitive.indices) {
            const mode = primitive.mode;
            const count = primitive.indices.count;
            const type = primitive.indices.componentType;
            gl.drawElements(mode, count, type, 0);
        } else {
            const mode = primitive.mode;
            const count = primitive.attributes.POSITION.count;
            gl.drawArrays(mode, 0, count);
        }
    }

}