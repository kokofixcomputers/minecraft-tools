// === DATA ===
const MOBS = [
  "zombie","skeleton","creeper","spider","enderman","witch","villager","iron_golem","warden",
  "slime","blaze","piglin","hoglin","zombified_piglin","drowned","phantom","pillager","ravager",
  "evoker","vindicator","shulker","stray","wither_skeleton","magma_cube","ghast","guardian","elder_guardian",
  "bee","wolf","cat","fox","rabbit","cow","pig","sheep","chicken","horse","donkey","llama","camel","goat",
  "axolotl","frog","turtle","dolphin","parrot","bat","ocelot","polar_bear","panda","mooshroom"
];
const ATTRIBUTES = [
  {id:"generic.max_health",label:"Max Health"},
  {id:"generic.movement_speed",label:"Movement Speed"},
  {id:"generic.attack_damage",label:"Attack Damage"},
  {id:"generic.armor",label:"Armor"},
  {id:"generic.armor_toughness",label:"Armor Toughness"},
  {id:"generic.knockback_resistance",label:"Knockback Resistance"},
  {id:"generic.luck",label:"Luck"},
  {id:"generic.attack_speed",label:"Attack Speed"}
];
const ATTRIBUTE_OPERATIONS = [
  {id:0,label:"Add (Base)"},
  {id:1,label:"Multiply Base"},
  {id:2,label:"Multiply Total"}
];
const EFFECTS = [
  "speed","slowness","haste","mining_fatigue","strength","instant_health","instant_damage","jump_boost",
  "nausea","regeneration","resistance","fire_resistance","water_breathing","invisibility","blindness",
  "night_vision","hunger","weakness","poison","wither","health_boost","absorption","saturation","glowing",
  "levitation","luck","unluck","slow_falling","conduit_power","dolphins_grace","bad_omen","hero_of_the_village"
];

// === DOM ELEMENTS ===
const mobType = document.getElementById('mobType');
const mobTypeAutocomplete = document.getElementById('mobTypeAutocomplete');
const mobName = document.getElementById('mobName');
const mobNameColor = document.getElementById('mobNameColor');
const mobNameBold = document.getElementById('mobNameBold');
const mobNameItalic = document.getElementById('mobNameItalic');
const mobNameUnder = document.getElementById('mobNameUnder');
const mobNameStrike = document.getElementById('mobNameStrike');
const mobNameObfus = document.getElementById('mobNameObfus');
const mainHand = document.getElementById('mainHand');
const offHand = document.getElementById('offHand');
const helmet = document.getElementById('helmet');
const chestplate = document.getElementById('chestplate');
const leggings = document.getElementById('leggings');
const boots = document.getElementById('boots');
const addAttributeBtn = document.getElementById('addAttributeBtn');
const attributesList = document.getElementById('attributesList');
const addEffectBtn = document.getElementById('addEffectBtn');
const effectsList = document.getElementById('effectsList');
const passengerType = document.getElementById('passengerType');
const noAI = document.getElementById('noAI');
const invulnerable = document.getElementById('invulnerable');
const silent = document.getElementById('silent');
const persistent = document.getElementById('persistent');
const errorMessage = document.getElementById('errorMessage');
const commandOutput = document.getElementById('commandOutput');

// === STATE ===
let attributes = [];
let effects = [];
let mobNameFormat = {bold:false,italic:false,underlined:false,strikethrough:false,obfuscated:false};

// === AUTOCOMPLETE ===
function showAutocomplete(inputElem, listElem, suggestions, onSelect) {
  const value = inputElem.value.replace(/\s/g, '').toLowerCase();
  if (!value) {
    listElem.style.display = "none";
    return;
  }
  const filtered = suggestions.filter(s => s.startsWith(value));
  if (filtered.length === 0) {
    listElem.style.display = "none";
    return;
  }
  listElem.innerHTML = '';
  filtered.forEach((s) => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.textContent = s;
    item.onclick = () => {
      onSelect(s);
      listElem.style.display = "none";
    };
    listElem.appendChild(item);
  });
  listElem.style.display = "block";
}
function hideAutocomplete(listElem) {
  setTimeout(() => { listElem.style.display = "none"; }, 120);
}
mobType.addEventListener('input', (e) => {
  const cleaned = e.target.value.replace(/\s/g, '');
  if (cleaned !== e.target.value) {
    e.target.value = cleaned;
  }
  showAutocomplete(
    mobType,
    mobTypeAutocomplete,
    MOBS,
    (selected) => {
      mobType.value = selected;
      updateCommand();
    }
  );
  updateCommand();
});
mobType.addEventListener('focus', () => {
  showAutocomplete(
    mobType,
    mobTypeAutocomplete,
    MOBS,
    (selected) => {
      mobType.value = selected;
      updateCommand();
    }
  );
});
mobType.addEventListener('blur', () => hideAutocomplete(mobTypeAutocomplete));

// === FORMAT BUTTONS ===
function updateNameFormatBtn(btn, key) {
  btn.classList.toggle('active', mobNameFormat[key]);
}
function setupNameFormatBtns() {
  mobNameBold.onclick = () => { mobNameFormat.bold = !mobNameFormat.bold; updateNameFormatBtn(mobNameBold, 'bold'); updateCommand(); }
  mobNameItalic.onclick = () => { mobNameFormat.italic = !mobNameFormat.italic; updateNameFormatBtn(mobNameItalic, 'italic'); updateCommand(); }
  mobNameUnder.onclick = () => { mobNameFormat.underlined = !mobNameFormat.underlined; updateNameFormatBtn(mobNameUnder, 'underlined'); updateCommand(); }
  mobNameStrike.onclick = () => { mobNameFormat.strikethrough = !mobNameFormat.strikethrough; updateNameFormatBtn(mobNameStrike, 'strikethrough'); updateCommand(); }
  mobNameObfus.onclick = () => { mobNameFormat.obfuscated = !mobNameFormat.obfuscated; updateNameFormatBtn(mobNameObfus, 'obfuscated'); updateCommand(); }
}
setupNameFormatBtns();

// === ATTRIBUTE HANDLING ===
function renderAttributes() {
  attributesList.innerHTML = '';
  attributes.forEach((attr, idx) => {
    const row = document.createElement('div');
    row.className = 'attribute-row';

    // Attribute select
    const attrSelect = document.createElement('select');
    ATTRIBUTES.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.label;
      attrSelect.appendChild(opt);
    });
    attrSelect.value = attr.type || ATTRIBUTES[0].id;
    attrSelect.onchange = (e) => {
      attributes[idx].type = e.target.value;
      updateCommand();
    };

    // Amount input
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.placeholder = 'Value';
    amountInput.value = attr.amount || '';
    amountInput.oninput = (e) => {
      attributes[idx].amount = e.target.value;
      updateCommand();
    };

    // Operation select
    const opSelect = document.createElement('select');
    ATTRIBUTE_OPERATIONS.forEach(op => {
      const opt = document.createElement('option');
      opt.value = op.id;
      opt.textContent = op.label;
      opSelect.appendChild(opt);
    });
    opSelect.value = attr.operation || 0;
    opSelect.onchange = (e) => {
      attributes[idx].operation = Number(e.target.value);
      updateCommand();
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '✕';
    delBtn.onclick = () => {
      attributes.splice(idx, 1);
      renderAttributes();
      updateCommand();
    };

    row.appendChild(attrSelect);
    row.appendChild(amountInput);
    row.appendChild(opSelect);
    row.appendChild(delBtn);

    attributesList.appendChild(row);
  });
}
addAttributeBtn.addEventListener('click', () => {
  attributes.push({ type: ATTRIBUTES[0].id, amount: '', operation: 0 });
  renderAttributes();
  updateCommand();
});

// === EFFECT HANDLING ===
function renderEffects() {
  effectsList.innerHTML = '';
  // Sort effects alphabetically by type for neatness
  effects.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
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
    effSelect.value = eff.type || EFFECTS[0];
    effSelect.onchange = (e) => {
      effects[idx].type = e.target.value;
      updateCommand();
    };

    // Amplifier
    const ampInput = document.createElement('input');
    ampInput.type = 'number';
    ampInput.placeholder = 'Amplifier';
    ampInput.min = 0;
    ampInput.value = eff.amp || 0;
    ampInput.oninput = (e) => {
      effects[idx].amp = e.target.value;
      updateCommand();
    };

    // Duration
    const durInput = document.createElement('input');
    durInput.type = 'number';
    durInput.placeholder = 'Duration (ticks)';
    durInput.min = 1;
    durInput.value = eff.dur || 600;
    durInput.oninput = (e) => {
      effects[idx].dur = e.target.value;
      updateCommand();
    };

    // Modern Hide particles checkbox
    const hidePart = document.createElement('label');
    hidePart.className = 'nbt-checkbox-label';
    hidePart.style.marginLeft = '0.3em';
    const hideChk = document.createElement('input');
    hideChk.type = 'checkbox';
    hideChk.className = 'nbt-checkbox';
    hideChk.checked = !!eff.hide;
    hideChk.onchange = (e) => {
      effects[idx].hide = e.target.checked;
      updateCommand();
    };
    hidePart.appendChild(hideChk);
    hidePart.appendChild(document.createTextNode('Hide'));

    // Delete
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '✕';
    delBtn.onclick = () => {
      effects.splice(idx, 1);
      renderEffects();
      updateCommand();
    };

    row.appendChild(effSelect);
    row.appendChild(ampInput);
    row.appendChild(durInput);
    row.appendChild(hidePart);
    row.appendChild(delBtn);

    effectsList.appendChild(row);
  });
}

addEffectBtn.addEventListener('click', () => {
  effects.push({ type: EFFECTS[0], amp: 0, dur: 600, hide: false });
  renderEffects();
  updateCommand();
});

// === NBT BUILDERS ===
function buildCustomNameComponent() {
  const name = mobName.value;
  if (!name) return null;
  let obj = { text: name };
  obj.color = mobNameColor.value;
  obj.bold = !!mobNameFormat.bold;
  obj.italic = !!mobNameFormat.italic;
  obj.underlined = !!mobNameFormat.underlined;
  obj.strikethrough = !!mobNameFormat.strikethrough;
  obj.obfuscated = !!mobNameFormat.obfuscated;
  return JSON.stringify(obj);
}
function buildEquipmentComponent() {
  // HandItems: [mainhand, offhand]
  // ArmorItems: [boots, leggings, chestplate, helmet]
  function itemObj(id) {
    if (!id) return {};
    return {id: "minecraft:"+id, Count: 1};
  }
  const hand = [mainHand.value, offHand.value].map(itemObj);
  const armor = [boots.value, leggings.value, chestplate.value, helmet.value].map(itemObj);
  return {hand, armor};
}
function buildAttributesComponent() {
  if (attributes.length === 0) return null;
  let arr = [];
  attributes.forEach(a => {
    if (a.type && a.amount !== '' && !isNaN(a.amount)) {
      arr.push({
        Name: a.type,
        Base: Number(a.amount),
        Operation: Number(a.operation)
      });
    }
  });
  if (arr.length === 0) return null;
  return arr;
}
function buildEffectsComponent() {
  if (effects.length === 0) return null;
  let arr = [];
  effects.forEach(e => {
    if (e.type && e.dur && !isNaN(e.dur)) {
      arr.push({
        Id: effectNameToId(e.type),
        Amplifier: Number(e.amp) || 0,
        Duration: Number(e.dur) || 600,
        ShowParticles: e.hide ? 0 : 1
      });
    }
  });
  if (arr.length === 0) return null;
  return arr;
}
function effectNameToId(name) {
  // 1.21+ uses string IDs, but NBT still uses numeric IDs for effects
  // We'll use a lookup for common effects
  const map = {
    speed:1, slowness:2, haste:3, mining_fatigue:4, strength:5, instant_health:6, instant_damage:7, jump_boost:8, nausea:9,
    regeneration:10, resistance:11, fire_resistance:12, water_breathing:13, invisibility:14, blindness:15, night_vision:16,
    hunger:17, weakness:18, poison:19, wither:20, health_boost:21, absorption:22, saturation:23, glowing:24, levitation:25,
    luck:26, unluck:27, slow_falling:28, conduit_power:29, dolphins_grace:30, bad_omen:31, hero_of_the_village:32
  };
  return map[name] || 1;
}

// === COMMAND GENERATION ===
function updateCommand() {
  let hasError = false;
  let errorMsg = '';

  // Validate mob type
  const mob = mobType.value.trim();
  if (!mob) {
    hasError = true;
    errorMsg = 'Please enter a valid mob type!';
    mobType.classList.add('error');
  } else if (/\s/.test(mob)) {
    hasError = true;
    errorMsg = 'No spaces allowed in mob type!';
    mobType.classList.add('error');
  } else {
    mobType.classList.remove('error');
  }

  if (hasError) {
    commandOutput.textContent = '';
    errorMessage.textContent = errorMsg;
    return;
  } else {
    errorMessage.textContent = '';
  }

  // Build NBT
  let nbt = [];

  // Custom Name
  const customName = buildCustomNameComponent();
  if (customName) nbt.push(`CustomName:'${customName}'`);

  // Equipment
  const eq = buildEquipmentComponent();
  // Only include if at least one slot is filled
  if (eq.hand.some(i => Object.keys(i).length) || eq.armor.some(i => Object.keys(i).length)) {
    // HandItems: [mainhand, offhand], ArmorItems: [boots, leggings, chestplate, helmet]
    nbt.push(`HandItems:[${JSON.stringify(eq.hand[0])},${JSON.stringify(eq.hand[1])}]`);
    nbt.push(`ArmorItems:[${JSON.stringify(eq.armor[0])},${JSON.stringify(eq.armor[1])},${JSON.stringify(eq.armor[2])},${JSON.stringify(eq.armor[3])}]`);
  }

  // Attributes
  const attrComp = buildAttributesComponent();
  if (attrComp) nbt.push(`Attributes:${JSON.stringify(attrComp)}`);

  // Effects
  const effComp = buildEffectsComponent();
  if (effComp) nbt.push(`ActiveEffects:${JSON.stringify(effComp)}`);

  // Flags
  if (noAI.checked) nbt.push('NoAI:1b');
  if (invulnerable.checked) nbt.push('Invulnerable:1b');
  if (silent.checked) nbt.push('Silent:1b');
  if (persistent.checked) nbt.push('PersistenceRequired:1b');

  // Passenger
  const passenger = passengerType.value.trim();
  if (passenger) {
    nbt.push(`Passengers:[{id:"minecraft:${passenger}"}]`);
  }

  // Compose full command
  let command = `/summon minecraft:${mob} ~ ~ ~`;
  if (nbt.length > 0) {
    command += ` {${nbt.join(',')}}`;
  }

  commandOutput.textContent = command;
}

// === EVENT LISTENERS ===
mobName.addEventListener('input', updateCommand);
mobNameColor.addEventListener('input', updateCommand);
mainHand.addEventListener('input', updateCommand);
offHand.addEventListener('input', updateCommand);
helmet.addEventListener('input', updateCommand);
chestplate.addEventListener('input', updateCommand);
leggings.addEventListener('input', updateCommand);
boots.addEventListener('input', updateCommand);
passengerType.addEventListener('input', updateCommand);
noAI.addEventListener('change', updateCommand);
invulnerable.addEventListener('change', updateCommand);
silent.addEventListener('change', updateCommand);
persistent.addEventListener('change', updateCommand);

// Initial render
renderAttributes();
renderEffects();
updateCommand();
