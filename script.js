function generateHarmoniousColors(baseColor, harmony) {
    const hsl = hexToHSL(baseColor);
    let colors = [];

    switch (harmony) {
        case 'monochromatic':
            colors = [
                hsl,
                { ...hsl, l: clamp(hsl.l - 20, 0, 100) },
                { ...hsl, l: clamp(hsl.l + 20, 0, 100) }
            ];
            break;
        case 'analogous':
            colors = [
                hsl,
                { ...hsl, h: (hsl.h + 30) % 360 },
                { ...hsl, h: (hsl.h - 30 + 360) % 360 }
            ];
            break;
        case 'triadic':
            colors = [
                hsl,
                { ...hsl, h: (hsl.h + 120) % 360 },
                { ...hsl, h: (hsl.h + 240) % 360 }
            ];
            break;
        case 'complementary':
            colors = [
                hsl,
                { ...hsl, h: (hsl.h + 180) % 360 }
            ];
            break;
    }

    return colors.map(HSLToHex);
}

function generateColorPalette(baseColor, harmony) {
    const harmoniousColors = generateHarmoniousColors(baseColor, harmony);
    const primary = harmoniousColors[0];
    const primaryHSL = hexToHSL(primary);
    const palette = {
        primary: primary,
        secondary: adjustLightness(primary, primaryHSL.l > 50 ? -15 : 15),
        accent: harmoniousColors[1] || adjustHue(primary, 180),
        neutral: desaturate(primary, 80),
        'primary text': getTextColor(primary),
        CTA: '#000000',
        'CTA text': '#FFFFFF',
        background: '#FFFFFF'  // Default background is white
    };
    // Derive other colors
    palette['secondary text'] = lightenColor(palette['primary text'], 30);
    // Negative color logic
    const isRedish = primaryHSL.h >= 330 || primaryHSL.h <= 30;
    palette.negative = isRedish ? adjustHue(primary, 180) : '#FF3B30';
    // Warning color logic
    const isOrangeish = primaryHSL.h >= 20 && primaryHSL.h <= 50;
    palette.warning = isOrangeish ? adjustHue(primary, 180) : '#FF9500';
    return palette;
}



function hexToHSL(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function HSLToHex({ h, s, l }) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function adjustLightness(color, amount) {
    const hsl = hexToHSL(color);
    return HSLToHex({ ...hsl, l: clamp(hsl.l + amount, 0, 100) });
}

function adjustHue(color, amount) {
    const hsl = hexToHSL(color);
    return HSLToHex({ ...hsl, h: (hsl.h + amount) % 360 });
}

function desaturate(color, amount) {
    const hsl = hexToHSL(color);
    return HSLToHex({ ...hsl, s: clamp(hsl.s - amount, 0, 100) });
}

function getTextColor(bgColor) {
    const hsl = hexToHSL(bgColor);
    return hsl.l > 60 ? '#000000' : '#FFFFFF';
}

function lightenColor(color, amount) {
    const hsl = hexToHSL(color);
    const newLightness = clamp(hsl.l + amount, 0, 100);
    return HSLToHex({ ...hsl, l: newLightness });
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function updatePalette() {
    const baseColor = document.getElementById('colorPicker').value;
    const harmony = document.getElementById('harmonySelect').value;
    const palette = generateColorPalette(baseColor, harmony);
    const paletteDiv = document.getElementById('palette');
    paletteDiv.innerHTML = '';

    for (const [name, color] of Object.entries(palette)) {
        const textColor = name === 'CTA' ? palette['CTA text'] : getTextColor(color);
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.innerHTML = `
            <div class="color-preview" style="background-color: ${color}; color: ${textColor}">
                <span>${name}</span>
                <span>${color}</span>
            </div>
            <div class="color-info">
                <div class="color-name">${name}</div>
                <div class="color-value">${color}</div>
            </div>
        `;
        paletteDiv.appendChild(colorBox);
    }
}

document.getElementById('colorPicker').addEventListener('input', updatePalette);
document.getElementById('harmonySelect').addEventListener('change', updatePalette);
updatePalette(); // Initial update