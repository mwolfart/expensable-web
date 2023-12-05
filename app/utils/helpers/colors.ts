const SIMILAR_THRESHOLD = 70

export const generateRandomColors = (amount?: number) => {
  const colors: string[] = []
  const numColors = amount || 50

  for (let i = 0; i < numColors; i++) {
    const color = getRandomColor(colors)
    colors.push(color)
  }

  return colors
}

const getRandomColor = (usedColors: string[]) => {
  const maxAttempts = 100
  let attempts = 0
  let color

  do {
    color = generateColor()
    attempts++
  } while (isColorTooSimilar(color, usedColors) && attempts < maxAttempts)

  return color
}

const generateColor = () => {
  const letters = '0123456789ABCDEF'
  let color = '#'

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }

  return color
}

const isColorTooSimilar = (color: string, usedColors: string[]) => {
  const threshold = SIMILAR_THRESHOLD

  for (const usedColor of usedColors) {
    if (colorDistance(color, usedColor) < threshold) {
      return true
    }
  }

  return false
}

const colorDistance = (color1: string, color2: string) => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const dr = rgb1.r - rgb2.r
  const dg = rgb1.g - rgb2.g
  const db = rgb1.b - rgb2.b

  return Math.sqrt(dr * dr + dg * dg + db * db)
}

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}
