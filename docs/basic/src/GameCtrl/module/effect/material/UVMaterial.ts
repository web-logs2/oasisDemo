import { BaseMaterial, BlendMode, Color, Engine, Shader, Texture2D, Vector4 } from "oasis-engine";

Shader.create(
  "particle-uv",
  `
#include <common>
#include <common_vert>
#include <blendShape_input>
#include <uv_share>
#include <color_share>
uniform float u_time;

void main() {

    #include <begin_position_vert>
    #include <blendShape_vert>
    #include <skinning_vert>
    #include <color_vert>
#ifdef O3_HAS_UV
    v_uv = TEXCOORD_0;
#else
    // may need this calculate normal
    v_uv = vec2( 0., 0. );
#endif

#ifdef O3_HAS_UV1
    v_uv1 = TEXCOORD_1;
#endif

#ifdef O3_NEED_TILINGOFFSET
    v_uv = v_uv * u_tilingOffset.xy + u_tilingOffset.zw * u_time;
#endif

    #include <position_vert>
}`,
  `
#include <common>
#include <uv_share>
#include <color_share>

uniform vec4 u_baseColor;
uniform float u_alphaBreath;
uniform float u_time;

#ifdef BASETEXTURE
    uniform sampler2D u_baseTexture;
#endif

void main() {
     vec4 baseColor = u_baseColor;

    #ifdef BASETEXTURE
        vec4 textureColor = texture2D(u_baseTexture, v_uv);
        #ifndef OASIS_COLORSPACE_GAMMA
            textureColor = gammaToLinear(textureColor);
        #endif
        baseColor *= textureColor;
    #endif

#ifdef O3_HAS_VERTEXCOLOR
    baseColor.rgb *= v_color.rbg;
#endif

    baseColor.a = baseColor.a * (cos(u_time * u_alphaBreath) * 0.4 + 0.6);

    #ifndef OASIS_COLORSPACE_GAMMA
        baseColor = linearToGamma(baseColor);
    #endif

    gl_FragColor = baseColor;
}`
);

/**
 * UV Material.
 */
export class UVMaterial extends BaseMaterial {
  private static _alphaBreathProp = Shader.getPropertyByName("u_alphaBreath");

  /**
   * Base color.
   */
  get baseColor(): Color {
    return this.shaderData.getColor(UVMaterial._baseColorProp);
  }

  set baseColor(value: Color) {
    const baseColor = this.shaderData.getColor(UVMaterial._baseColorProp);
    if (value !== baseColor) {
      baseColor.copyFrom(value);
    }
  }

  /**
   * Base texture.
   */
  get baseTexture(): Texture2D {
    return <Texture2D>this.shaderData.getTexture(UVMaterial._baseTextureProp);
  }

  set baseTexture(value: Texture2D) {
    this.shaderData.setTexture(UVMaterial._baseTextureProp, value);
    if (value) {
      this.shaderData.enableMacro(UVMaterial._baseTextureMacro);
    } else {
      this.shaderData.disableMacro(UVMaterial._baseTextureMacro);
    }
  }

  /**
   * Tiling and offset of main textures.
   */
  get tilingOffset(): Vector4 {
    return this.shaderData.getVector4(UVMaterial._tilingOffsetProp);
  }

  set tilingOffset(value: Vector4) {
    const tilingOffset = this.shaderData.getVector4(UVMaterial._tilingOffsetProp);
    if (value !== tilingOffset) {
      tilingOffset.copyFrom(value);
    }
  }

  /**
   * alpha breath
   */
  get alphaBreath(): number {
    return this.shaderData.getFloat(UVMaterial._alphaBreathProp);
  }

  set alphaBreath(value: number) {
    this.shaderData.setFloat(UVMaterial._alphaBreathProp, value);
  }

  /**
   * Create a unlit material instance.
   * @param engine - Engine to which the material belongs
   */
  constructor(engine: Engine) {
    super(engine, Shader.find("particle-uv"));
    this.isTransparent = true;
    this.blendMode = BlendMode.Additive;
    const shaderData = this.shaderData;

    shaderData.enableMacro("OMIT_NORMAL");
    shaderData.enableMacro("O3_NEED_TILINGOFFSET");

    shaderData.setColor(UVMaterial._baseColorProp, new Color(1, 1, 1, 1));
    shaderData.setVector4(UVMaterial._tilingOffsetProp, new Vector4(1, 1, 0, 0));
    shaderData.setFloat(UVMaterial._alphaBreathProp, 0.0);
  }

  /**
   * @override
   */
  clone(): UVMaterial {
    const dest = new UVMaterial(this._engine);
    this.cloneTo(dest);
    return dest;
  }
}
