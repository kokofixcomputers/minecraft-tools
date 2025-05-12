const explosionTypes = [
  {id: "small_ball", name: "Small Ball"},
  {id: "large_ball", name: "Large Ball"},
  {id: "star", name: "Star"},
  {id: "creeper", name: "Creeper"},
  {id: "burst", name: "Burst"}
];

const flight = document.getElementById('flight');
const explosionsList = document.getElementById('explosionsList');
const addExplosionBtn = document.getElementById('addExplosionBtn');
const commandOutput = document.getElementById('commandOutput');
const errorMessage = document.getElementById('errorMessage');

let explosions = [
  {
    shape: "small_ball",
    colors: ['#ff0000'],
    fade: [],
    has_twinkle: false,
    has_trail: false
  }
];

function renderExplosions() {
  explosionsList.innerHTML = '';
  explosions.forEach((exp, idx) => {
    const row = document.createElement('div');
    row.className = 'attribute-row';
    row.style.flexWrap = "wrap";
    row.style.alignItems = "flex-start";
    row.style.borderBottom = "1px solid #333";
    row.style.marginBottom = "0.7em";
    row.style.paddingBottom = "0.5em";

    // Shape (type)
    const typeSelect = document.createElement('select');
    explosionTypes.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      typeSelect.appendChild(opt);
    });
    typeSelect.value = exp.shape;
    typeSelect.onchange = (e) => {
      explosions[idx].shape = e.target.value;
      updateCommand();
    };

    // Colors
    const colorsDiv = document.createElement('div');
    colorsDiv.style.display = "flex";
    colorsDiv.style.alignItems = "center";
    colorsDiv.style.gap = "0.3em";
    colorsDiv.style.flexWrap = "wrap";
    colorsDiv.style.marginLeft = "1em";
    colorsDiv.style.marginBottom = "0.2em";
    const colorsLabel = document.createElement('span');
    colorsLabel.style.color = "#a7ffeb";
    colorsLabel.textContent = "Colors:";
    colorsDiv.appendChild(colorsLabel);

    exp.colors.forEach((col, cidx) => {
      const colorInput = document.createElement('input');
      colorInput.type = "color";
      colorInput.value = col;
      colorInput.style.width = "2em";
      colorInput.style.height = "2em";
      colorInput.oninput = (e) => {
        explosions[idx].colors[cidx] = e.target.value;
        updateCommand();
      };
      colorsDiv.appendChild(colorInput);

      // Remove button for color
      if (exp.colors.length > 1) {
        const remBtn = document.createElement('button');
        remBtn.className = 'delete-btn';
        remBtn.style.padding = "0.2em 0.5em";
        remBtn.style.fontSize = "1em";
        remBtn.textContent = "–";
        remBtn.title = "Remove color";
        remBtn.onclick = () => {
          explosions[idx].colors.splice(cidx, 1);
          renderExplosions();
          updateCommand();
        };
        colorsDiv.appendChild(remBtn);
      }
    });

    // Add color button
    const addColorBtn = document.createElement('button');
    addColorBtn.className = 'add-btn';
    addColorBtn.style.padding = "0.2em 0.5em";
    addColorBtn.style.fontSize = "1em";
    addColorBtn.textContent = "+";
    addColorBtn.title = "Add color";
    addColorBtn.onclick = () => {
      explosions[idx].colors.push('#ffffff');
      renderExplosions();
      updateCommand();
    };
    colorsDiv.appendChild(addColorBtn);

    // Fade Colors
    const fadeDiv = document.createElement('div');
    fadeDiv.style.display = "flex";
    fadeDiv.style.alignItems = "center";
    fadeDiv.style.gap = "0.3em";
    fadeDiv.style.flexWrap = "wrap";
    fadeDiv.style.marginLeft = "1em";
    fadeDiv.style.marginBottom = "0.2em";
    const fadeLabel = document.createElement('span');
    fadeLabel.style.color = "#a7ffeb";
    fadeLabel.textContent = "Fade:";
    fadeDiv.appendChild(fadeLabel);

    exp.fade.forEach((col, fidx) => {
      const fadeInput = document.createElement('input');
      fadeInput.type = "color";
      fadeInput.value = col;
      fadeInput.style.width = "2em";
      fadeInput.style.height = "2em";
      fadeInput.oninput = (e) => {
        explosions[idx].fade[fidx] = e.target.value;
        updateCommand();
      };
      fadeDiv.appendChild(fadeInput);

      // Remove button for fade
      const remBtn = document.createElement('button');
      remBtn.className = 'delete-btn';
      remBtn.style.padding = "0.2em 0.5em";
      remBtn.style.fontSize = "1em";
      remBtn.textContent = "–";
      remBtn.title = "Remove fade color";
      remBtn.onclick = () => {
        explosions[idx].fade.splice(fidx, 1);
        renderExplosions();
        updateCommand();
      };
      fadeDiv.appendChild(remBtn);
    });

    // Add fade color button
    const addFadeBtn = document.createElement('button');
    addFadeBtn.className = 'add-btn';
    addFadeBtn.style.padding = "0.2em 0.5em";
    addFadeBtn.style.fontSize = "1em";
    addFadeBtn.textContent = "+";
    addFadeBtn.title = "Add fade color";
    addFadeBtn.onclick = () => {
      explosions[idx].fade.push('#ffffff');
      renderExplosions();
      updateCommand();
    };
    fadeDiv.appendChild(addFadeBtn);

    // Flicker (has_twinkle)
    const flickerLabel = document.createElement('label');
    flickerLabel.className = 'nbt-checkbox-label';
    const flickerChk = document.createElement('input');
    flickerChk.type = 'checkbox';
    flickerChk.className = 'nbt-checkbox';
    flickerChk.checked = !!exp.has_twinkle;
    flickerChk.onchange = (e) => {
      explosions[idx].has_twinkle = e.target.checked;
      updateCommand();
    };
    flickerLabel.appendChild(flickerChk);
    flickerLabel.appendChild(document.createTextNode('Flicker'));
    flickerLabel.style.marginLeft = "1em";

    // Trail (has_trail)
    const trailLabel = document.createElement('label');
    trailLabel.className = 'nbt-checkbox-label';
    const trailChk = document.createElement('input');
    trailChk.type = 'checkbox';
    trailChk.className = 'nbt-checkbox';
    trailChk.checked = !!exp.has_trail;
    trailChk.onchange = (e) => {
      explosions[idx].has_trail = e.target.checked;
      updateCommand();
    };
    trailLabel.appendChild(trailChk);
    trailLabel.appendChild(document.createTextNode('Trail'));
    trailLabel.style.marginLeft = "1em";

    // Delete explosion
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '✕';
    delBtn.title = "Remove Explosion";
    delBtn.onclick = () => {
      explosions.splice(idx, 1);
      renderExplosions();
      updateCommand();
    };

    // Assemble row
    row.appendChild(typeSelect);
    row.appendChild(colorsDiv);
    row.appendChild(fadeDiv);
    row.appendChild(flickerLabel);
    row.appendChild(trailLabel);
    if (explosions.length > 1) row.appendChild(delBtn);

    explosionsList.appendChild(row);
  });
}

addExplosionBtn.addEventListener('click', () => {
  explosions.push({
    shape: "small_ball",
    colors: ['#ffffff'],
    fade: [],
    has_twinkle: false,
    has_trail: false
  });
  renderExplosions();
  updateCommand();
});

flight.addEventListener('input', updateCommand);

function colorToInt(hex) {
  // "#ff0000" => 16711680
  return parseInt(hex.replace("#",""), 16);
}

function updateCommand() {
  let hasError = false;
  let errorMsg = '';
  const fl = parseInt(flight.value, 10);
  if (isNaN(fl) || fl < 1 || fl > 3) {
    hasError = true;
    errorMsg = "Flight must be 1-3.";
  }
  if (explosions.length === 0) {
    hasError = true;
    errorMsg = "Add at least one explosion.";
  }
  for (let exp of explosions) {
    if (!Array.isArray(exp.colors) || exp.colors.length === 0) {
      hasError = true;
      errorMsg = "Each explosion needs at least one color.";
      break;
    }
  }
  if (hasError) {
    commandOutput.textContent = '';
    errorMessage.textContent = errorMsg;
    return;
  } else {
    errorMessage.textContent = '';
  }

  // Build Fireworks NBT for 1.21+
  const expsNBT = explosions.map(exp => {
    let nbt = [];
    nbt.push(`shape:"${exp.shape}"`);
    nbt.push(`colors:[${exp.colors.map(c=>colorToInt(c)).join(",")}]`);
    if (exp.fade && exp.fade.length > 0) {
      nbt.push(`fade_colors:[${exp.fade.map(c=>colorToInt(c)).join(",")}]`);
    }
    if (exp.has_trail) nbt.push("has_trail:1b");
    if (exp.has_twinkle) nbt.push("has_twinkle:1b");
    return `{${nbt.join(",")}}`;
  });
  const nbt = `fireworks={flight_duration:${fl},explosions:[${expsNBT.join(",")}]}`;
  const cmd = `/give @p minecraft:firework_rocket[${nbt}] 1`;
  commandOutput.textContent = cmd;
}

// Initial render
renderExplosions();
updateCommand();
