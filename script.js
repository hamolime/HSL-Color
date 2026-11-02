// =================================
// 1. SELECT ELEMENTS
// =================================

const hue = document.getElementById("hue");
const saturation = document.getElementById("saturation");
const lightness = document.getElementById("lightness");

const hueValue = document.getElementById("hueValue");
const saturationValue = document.getElementById("saturationValue");
const lightnessValue = document.getElementById("lightnessValue");

const colorPreview = document.getElementById("colorPreview");
const hslOutput = document.getElementById("hslOutput");

const colorPicker = document.getElementById("colorPicker");

const copyButton = document.getElementById("copyColor");
const saveButton = document.getElementById("saveColor");

const savedColors = document.getElementById("savedColors");


// =================================
// 2. CURRENT COLOR
// =================================

function getHSL() {

    return {
        h: Number(hue.value),
        s: Number(saturation.value),
        l: Number(lightness.value)
    };

}


// =================================
// 3. UPDATE COLOR
// =================================

function updateColor() {

    const color = getHSL();

    const hsl = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;

    colorPreview.style.backgroundColor = hsl;

    hslOutput.textContent = hsl;

    hueValue.textContent = color.h;
    saturationValue.textContent = color.s;
    lightnessValue.textContent = color.l;

    colorPicker.value = hslToHex(
        color.h,
        color.s,
        color.l
    );

}


// =================================
// 4. HSL TO HEX
// =================================

function hslToHex(h, s, l) {

    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;

    const a = s * Math.min(l, 1 - l);

    const f = n => {

        const color = l - a * Math.max(
            -1,
            Math.min(
                k(n) - 3,
                Math.min(9 - k(n), 1)
            )
        );

        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0");

    };

    return `#${f(0)}${f(8)}${f(4)}`;

}


// =================================
// 5. HEX TO HSL
// =================================

function hexToHSL(hex) {

    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;

    let l = (max + min) / 2;

    if (max !== min) {

        const d = max - min;

        s = l > 0.5
            ? d / (2 - max - min)
            : d / (max + min);

        switch (max) {

            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;

            case g:
                h = (b - r) / d + 2;
                break;

            case b:
                h = (r - g) / d + 4;
                break;

        }

        h *= 60;

    }

    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };

}


// =================================
// 6. SLIDERS EVENTS
// =================================

hue.addEventListener("input", updateColor);

saturation.addEventListener("input", updateColor);

lightness.addEventListener("input", updateColor);


// =================================
// 7. COLOR PICKER EVENT
// =================================

colorPicker.addEventListener("input", () => {

    const color = hexToHSL(colorPicker.value);

    hue.value = color.h;
    saturation.value = color.s;
    lightness.value = color.l;

    updateColor();

});


// =================================
// 8. COPY HSL
// =================================

copyButton.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(
            hslOutput.textContent
        );

        copyButton.textContent = "Copied!";

        setTimeout(() => {
            copyButton.textContent = "Copy HSL";
        }, 1200);

    } catch (error) {

        alert("Could not copy color. Use HTTPS or localhost.");

    }

});


// =================================
// 9. LOAD SAVED COLORS
// =================================

let favorites = JSON.parse(
    localStorage.getItem("favoriteColors") || "[]"
);


// =================================
// 10. SAVE COLOR
// =================================

saveButton.addEventListener("click", () => {

    const color = hslOutput.textContent;

    if (favorites.includes(color)) {
        return;
    }

    favorites.push(color);

    localStorage.setItem(
        "favoriteColors",
        JSON.stringify(favorites)
    );

    renderFavorites();

});


// =================================
// 11. DISPLAY FAVORITES
// =================================

function renderFavorites() {

    savedColors.innerHTML = "";

    if (favorites.length === 0) {

        savedColors.innerHTML =
            "<p>No saved colors yet.</p>";

        return;

    }

    favorites.forEach((color, index) => {

        const item = document.createElement("div");

        item.className = "saved-color";

        item.style.backgroundColor = color;

        item.title = color;

        const label = document.createElement("span");

        label.textContent = color;

        item.appendChild(label);

        item.addEventListener("click", () => {

            const match = color.match(
                /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/
            );

            if (!match) return;

            hue.value = match[1];
            saturation.value = match[2];
            lightness.value = match[3];

            updateColor();

        });

        item.addEventListener("contextmenu", event => {

            event.preventDefault();

            favorites.splice(index, 1);

            localStorage.setItem(
                "favoriteColors",
                JSON.stringify(favorites)
            );

            renderFavorites();

        });

        savedColors.appendChild(item);

    });

}


// =================================
// 12. ADD HSL TO PALETTE CARDS
// =================================

document.querySelectorAll(".color-section").forEach(section => {

    const cards = section.querySelectorAll(".card");

    const hueValue = Number(
        getComputedStyle(section)
            .getPropertyValue("--hue")
            .trim()
    );

    cards.forEach(card => {

        let l;

        if (card.classList.contains("light")) {
            l = 85;
        }

        else if (card.classList.contains("medium")) {
            l = 50;
        }

        else {
            l = 20;
        }

        const color = `hsl(${hueValue}, 80%, ${l}%)`;

        const code = document.createElement("span");

        code.className = "color-code";
        code.textContent = color;

        const button = document.createElement("button");

        button.className = "copy-card";
        button.textContent = "Copy";

        button.addEventListener("click", async event => {

            event.stopPropagation();

            try {

                await navigator.clipboard.writeText(color);

                button.textContent = "Copied!";

                setTimeout(() => {
                    button.textContent = "Copy";
                }, 1000);

            } catch (error) {

                alert("Copy failed. Use HTTPS or localhost.");

            }

        });

        card.appendChild(code);
        card.appendChild(button);

        card.addEventListener("click", () => {

            hue.value = hueValue;
            saturation.value = 80;
            lightness.value = l;

            updateColor();

            window.scrollTo({
                top: document.querySelector(".studio").offsetTop,
                behavior: "smooth"
            });

        });

    });

});


// =================================
// 13. INITIALIZE
// =================================

updateColor();

renderFavorites();

