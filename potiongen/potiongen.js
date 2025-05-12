const EFFECTS = [
  "absorption","bad_omen","blindness","conduit_power","darkness","dolphins_grace","fire_resistance",
  "glowing","haste","health_boost","hero_of_the_village","hunger","instant_damage","instant_health",
  "invisibility","jump_boost","levitation","luck","mining_fatigue","nausea","night_vision","poison",
  "regeneration","resistance","saturation","sculk_sensors","slow_falling","slowness","speed","strength",
  "unluck","water_breathing","weakness","wither"
];

const potionType = document.getElementById('potionType');
const potionColor = document.getElementById('potionColor');
const potionColorHex = document.getElementById('potionColorHex');
const count = document.getElementById('count');
const effectsList = document.getElementById('effectsList');
const addEffectBtn = document.getElementById('addEffectBtn');
const commandOutput = document.getElementById('commandOutput');
const errorMessage = document.getElementById('errorMessage');

let effects = [
  {type: "speed", amp: 0, dur: 600}
];

function renderEffects() {
  effectsList.innerHTML = '';
  effects.forEach((eff, idx) => {
    const row = document.createElement('div');
    row.className = 'attribute-row';

    // Effect select
    const effSelect = document.createElement('select');
    EFFECTS.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e;
      opt.textContent = e.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      effSelect.appendChild(opt);
    });
    effSelect.value = eff.type;
    effSelect.onchange = (e) => {
      effects[idx].type = e.target.value;
      updateCommand();
    };

    // Amplifier
    const ampInput = document.createElement('input');
    ampInput.type = 'number';
    ampInput.placeholder = 'Amplifier';
    ampInput.min = 0;
    ampInput.max = 255;
    ampInput.value = eff.amp;
    ampInput.style.maxWidth = "70px";
    ampInput.oninput = (e) => {
      effects[idx].amp = e.target.value;
      updateCommand();
    };

    // Duration
    const durInput = document.createElement('input');
    durInput.type = 'number';
    durInput.placeholder = 'Duration (t)';
    durInput.min = 1;
    durInput.max = 1000000;
    durInput.value = eff.dur;
    durInput.style.maxWidth = "90px";
    durInput.oninput = (e) => {
      effects[idx].dur = e.target.value;
      updateCommand();
    };

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '✕';
    delBtn.title = "Remove";
    delBtn.onclick = () => {
      effects.splice(idx, 1);
      renderEffects();
      updateCommand();
    };

    row.appendChild(effSelect);
    row.appendChild(ampInput);
    row.appendChild(durInput);
    if (effects.length > 1) row.appendChild(delBtn);

    effectsList.appendChild(row);
  });
}

addEffectBtn.addEventListener('click', () => {
  effects.push({type: "speed", amp: 0, dur: 600});
  renderEffects();
  updateCommand();
});

potionType.addEventListener('change', updateCommand);
potionColor.addEventListener('input', () => {
  potionColorHex.value = potionColor.value;
  updateCommand();
});
potionColorHex.addEventListener('input', () => {
  let val = potionColorHex.value.trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(val)) {
    if (val[0] !== "#") val = "#" + val;
    potionColor.value = val;
  }
  updateCommand();
});
count.addEventListener('input', updateCommand);

function updateCommand() {
  let hasError = false;
  let errorMsg = '';
  const pt = potionType.value;
  const color = potionColor.value;
  const colorHex = potionColorHex.value.trim();
  const cnt = parseInt(count.value, 10);

  if (cnt < 1 || cnt > 64) {
    hasError = true;
    errorMsg = "Count must be 1-64.";
  }
  for (let eff of effects) {
    if (!eff.type) {
      hasError = true;
      errorMsg = "Select an effect for each row.";
      break;
    }
    if (isNaN(eff.amp) || eff.amp < 0 || eff.amp > 255) {
      hasError = true;
      errorMsg = "Amplifier must be 0-255.";
      break;
    }
    if (isNaN(eff.dur) || eff.dur < 1) {
      hasError = true;
      errorMsg = "Duration must be at least 1 tick.";
      break;
    }
  }
  if (hasError) {
    commandOutput.textContent = '';
    errorMessage.textContent = errorMsg;
    return;
  }
  errorMessage.textContent = '';

  // NBT for 1.21+: potion[potion_contents={custom_color:...,custom_effects:[{id:"minecraft:...",amplifier:...,duration:...},...]}]
  let nbt = [];

  // Custom effects
  if (effects.length > 0) {
    const arr = effects.map(eff => {
      return `{id:"minecraft:${eff.type}",amplifier:${parseInt(eff.amp,10)},duration:${parseInt(eff.dur,10)}}`;
    });
    nbt.push(`custom_effects:[${arr.join(",")}]`);
  }

  // Color
  let colorInt = "";
  if (colorHex && /^#?[0-9a-fA-F]{6}$/.test(colorHex)) {
    colorInt = parseInt(colorHex.replace("#",""),16);
  } else if (color && /^#?[0-9a-fA-F]{6}$/.test(color)) {
    colorInt = parseInt(color.replace("#",""),16);
  }
  if (colorInt) nbt.push(`custom_color:${colorInt}`);

  let cmd = `/give @p ${pt}[potion_contents={${nbt.join(",")}}] ${cnt}`;
  commandOutput.textContent = cmd;
}

// Initial setup
renderEffects();
updateCommand();
