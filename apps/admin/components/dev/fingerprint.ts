/**
 * Browser Fingerprint Generation
 *
 * Generates a unique fingerprint based on browser characteristics.
 * Used for session binding to detect session hijacking attempts.
 */

export interface BrowserFingerprint {
  canvas?: string
  webgl?: string
  audio?: string
  timezone?: string
  language?: string
  platform?: string
  screenResolution?: string
  colorDepth?: number
}

/**
 * Generate a canvas fingerprint.
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    canvas.width = 200
    canvas.height = 50

    // Draw text with various styles
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 4, 17)

    return canvas.toDataURL()
  } catch {
    return ''
  }
}

/**
 * Generate a WebGL fingerprint.
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return ''

    const webglCtx = gl as WebGLRenderingContext

    const debugInfo = webglCtx.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return ''

    const vendor = webglCtx.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = webglCtx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

    return `${vendor}~${renderer}`
  } catch {
    return ''
  }
}

/**
 * Generate an audio fingerprint.
 */
async function getAudioFingerprint(): Promise<string> {
  try {
    const audioContext = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )()
    const oscillator = audioContext.createOscillator()
    const analyser = audioContext.createAnalyser()
    const gainNode = audioContext.createGain()
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)

    gainNode.gain.value = 0 // Mute the output

    oscillator.type = 'triangle'
    oscillator.connect(analyser)
    analyser.connect(scriptProcessor)
    scriptProcessor.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(0)

    const fingerprint = await new Promise<string>((resolve) => {
      scriptProcessor.onaudioprocess = (event) => {
        const output = event.inputBuffer.getChannelData(0)
        let sum = 0
        for (let i = 0; i < output.length; i++) {
          sum += Math.abs(output[i])
        }
        oscillator.disconnect()
        scriptProcessor.disconnect()
        gainNode.disconnect()
        audioContext.close()
        resolve(sum.toString())
      }
    })

    return fingerprint
  } catch {
    return ''
  }
}

/**
 * Generate a complete browser fingerprint.
 */
export async function generateFingerprint(): Promise<BrowserFingerprint> {
  const fingerprint: BrowserFingerprint = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
  }

  // Canvas fingerprint
  fingerprint.canvas = getCanvasFingerprint()

  // WebGL fingerprint
  fingerprint.webgl = getWebGLFingerprint()

  // Audio fingerprint (async)
  try {
    fingerprint.audio = await getAudioFingerprint()
  } catch {
    fingerprint.audio = ''
  }

  return fingerprint
}
