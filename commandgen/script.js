// === COMMON ENCHANTMENTS & ITEMS ===
const ENCHANTMENTS = [
  "protection","fire_protection","feather_falling","blast_protection","projectile_protection",
  "respiration","aqua_affinity","thorns","depth_strider","frost_walker","binding_curse",
  "sharpness","smite","bane_of_arthropods","knockback","fire_aspect","looting","sweeping",
  "efficiency","silk_touch","unbreaking","fortune","power","punch","flame","infinity",
  "luck_of_the_sea","lure","mending","vanishing_curse","soul_speed","swift_sneak"
];
const ITEMS = [
  "diamond_sword","diamond_pickaxe","diamond_axe","diamond_shovel","diamond_hoe",
  "diamond_helmet","diamond_chestplate","diamond_leggings","diamond_boots",
  "netherite_sword","netherite_pickaxe","netherite_axe","netherite_shovel","netherite_hoe",
  "netherite_helmet","netherite_chestplate","netherite_leggings","netherite_boots",
  "bow","crossbow","trident","shield","elytra","turtle_helmet","golden_apple","totem_of_undying"
];
const ATTRIBUTES = [
  {id:"attack_damage",label:"Attack Damage"},
  {id:"attack_speed",label:"Attack Speed"},
  {id:"max_health",label:"Max Health"},
  {id:"movement_speed",label:"Movement Speed"},
  {id:"armor",label:"Armor"},
  {id:"armor_toughness",label:"Armor Toughness"},
  {id:"knockback_resistance",label:"Knockback Resistance"},
  {id:"luck",label:"Luck"}
];
const ATTRIBUTE_OPERATIONS = [
  {id:"add_value",label:"Add Value"},
  {id:"add_multiplied_base",label:"Multiply Base"},
  {id:"add_multiplied_total",label:"Multiply Total"}
];
const ATTRIBUTE_SLOTS = [
  "mainhand","offhand","head","chest","legs","feet"
];

// DOM Elements
const itemInput = document.getElementById('itemInput');
const enchantmentsList = document.getElementById('enchantmentsList');
const addEnchantmentBtn = document.getElementById('addEnchantmentBtn');
const commandOutput = document.getElementById('commandOutput');
const errorMessage = document.getElementById('errorMessage');
const itemAutocomplete = document.getElementById('itemAutocomplete');
const attributesList = document.getElementById('attributesList');
const addAttributeBtn = document.getElementById('addAttributeBtn');

// NBT Elements
const nbtName = document.getElementById('nbtName');
const nbtColor = document.getElementById('nbtColor');
const nbtBold = document.getElementById('nbtBold');
const nbtItalic = document.getElementById('nbtItalic');
const nbtUnder = document.getElementById('nbtUnder');
const nbtStrike = document.getElementById('nbtStrike');
const nbtObfus = document.getElementById('nbtObfus');
const nbtLore = document.getElementById('nbtLore');

let enchantments = [];
let attributes = [];
let nbtFormat = {bold:false,italic:false,underlined:false,strikethrough:false,obfuscated:false};

function hasWhitespace(str) {
  return /\s/.test(str);
}

function formatEnchantmentId(id) {
  if (!id) return '';
  if (id.includes(':')) return id;
  return 'minecraft:' + id;
}

// === AUTOCOMPLETE LOGIC ===
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

// === ENCHANTMENTS RENDERING & AUTOCOMPLETE ===
function renderEnchantments() {
  enchantmentsList.innerHTML = '';
  enchantments.forEach((ench, idx) => {
    const row = document.createElement('div');
    row.className = 'enchantment-row';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enchantment (e.g. protection)';
    nameInput.value = ench.name;
    nameInput.spellcheck = false;
    nameInput.autocomplete = "off";
    nameInput.setAttribute('data-idx', idx);

    // Autocomplete dropdown
    const acList = document.createElement('div');
    acList.className = 'autocomplete-list';
    acList.style.display = 'none';
    acList.style.top = '2.2em';
    acList.style.left = '0';
    acList.style.right = '0';

    nameInput.oninput = (e) => {
      const cleaned = e.target.value.replace(/\s/g, '');
      if (cleaned !== e.target.value) {
        e.target.value = cleaned;
      }
      enchantments[idx].name = cleaned;
      showAutocomplete(
        nameInput,
        acList,
        ENCHANTMENTS,
        (selected) => {
          nameInput.value = selected;
          enchantments[idx].name = selected;
          updateCommand();
        }
      );
      updateCommand();
    };
    nameInput.onfocus = () => {
      showAutocomplete(
        nameInput,
        acList,
        ENCHANTMENTS,
        (selected) => {
          nameInput.value = selected;
          enchantments[idx].name = selected;
          updateCommand();
        }
      );
    };
    nameInput.onblur = () => hideAutocomplete(acList);

    if (hasWhitespace(ench.name)) {
      nameInput.classList.add('error');
    } else {
      nameInput.classList.remove('error');
    }

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.placeholder = 'Level';
    valueInput.min = 1;
    valueInput.value = ench.value;
    valueInput.oninput = (e) => {
      enchantments[idx].value = e.target.value;
      updateCommand();
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '✕';
    delBtn.onclick = () => {
      enchantments.splice(idx, 1);
      renderEnchantments();
      updateCommand();
    };

    row.appendChild(nameInput);
    row.appendChild(valueInput);
    row.appendChild(delBtn);
    row.appendChild(acList);

    enchantmentsList.appendChild(row);
  });
}

// === ATTRIBUTES RENDERING ===
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
    amountInput.placeholder = 'Amount';
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
    opSelect.value = attr.operation || "add_value";
    opSelect.onchange = (e) => {
      attributes[idx].operation = e.target.value;
      updateCommand();
    };

    // Slot select
    const slotSelect = document.createElement('select');
    ATTRIBUTE_SLOTS.forEach(slot => {
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = slot.charAt(0).toUpperCase() + slot.slice(1);
      slotSelect.appendChild(opt);
    });
    slotSelect.value = attr.slot || 'mainhand';
    slotSelect.onchange = (e) => {
      attributes[idx].slot = e.target.value;
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
    row.appendChild(slotSelect);
    row.appendChild(delBtn);

    attributesList.appendChild(row);
  });
}

// === NBT FORMAT BUTTONS ===
function updateNBTFormatBtn(btn, key) {
  btn.classList.toggle('active', nbtFormat[key]);
}
function setupNBTFormatBtns() {
  nbtBold.onclick = () => { nbtFormat.bold = !nbtFormat.bold; updateNBTFormatBtn(nbtBold, 'bold'); updateCommand(); }
  nbtItalic.onclick = () => { nbtFormat.italic = !nbtFormat.italic; updateNBTFormatBtn(nbtItalic, 'italic'); updateCommand(); }
  nbtUnder.onclick = () => { nbtFormat.underlined = !nbtFormat.underlined; updateNBTFormatBtn(nbtUnder, 'underlined'); updateCommand(); }
  nbtStrike.onclick = () => { nbtFormat.strikethrough = !nbtFormat.strikethrough; updateNBTFormatBtn(nbtStrike, 'strikethrough'); updateCommand(); }
  nbtObfus.onclick = () => { nbtFormat.obfuscated = !nbtFormat.obfuscated; updateNBTFormatBtn(nbtObfus, 'obfuscated'); updateCommand(); }
}

// === Custom Name as JSON Array String, with Italics Handling ===
function buildCustomNameComponent() {
  const name = nbtName.value;
  const color = nbtColor.value;
  if (!name) return null;
  let obj = { text: name };
  if (color) obj.color = color;
  // Always set italic (true/false) explicitly
  obj.italic = !!nbtFormat.italic;
  for (const key in nbtFormat) {
    if (key !== "italic" && nbtFormat[key]) obj[key] = true;
  }
  // The custom_name must be a JSON array string, starting with an empty string as first element.
  return `[\"\",${JSON.stringify(obj)}]`;
}

// === Lore as JSON Array String, with Italics Handling ===
function buildLoreComponent() {
  const loreRaw = nbtLore.value;
  if (!loreRaw) return null;
  const color = nbtColor.value;
  const loreLines = loreRaw.split('\n').filter(line => line.trim().length > 0);
  if (loreLines.length === 0) return null;

  // Each line is a stringified JSON array, wrapped in single quotes
  return '[' + loreLines.map(line => {
    let obj = { text: line };
    if (color) obj.color = color;
    obj.italic = !!nbtFormat.italic;
    for (const key in nbtFormat) {
      if (key !== "italic" && nbtFormat[key]) obj[key] = true;
    }
    // Wrap each stringified array in single quotes
    return `'${JSON.stringify(["", obj])}'`;
  }).join(',') + ']';
}




function buildEnchantmentsComponent() {
  if (enchantments.length === 0) return null;
  let levels = {};
  enchantments.forEach(e => {
    if (e.name && e.value) {
      levels[formatEnchantmentId(e.name)] = Number(e.value);
    }
  });
  if (Object.keys(levels).length === 0) return null;
  return {levels};
}

function randomID() {
  return 'id_' + Math.random().toString(36).slice(2,10);
}

function buildAttributesComponent() {
  if (attributes.length === 0) return null;
  let arr = [];
  attributes.forEach(a => {
    if (a.type && a.amount && a.operation && a.slot) {
      arr.push({
        type: "generic." + a.type,
        amount: Number(a.amount),
        operation: a.operation,
        slot: a.slot,
        id: randomID()
      });
    }
  });
  if (arr.length === 0) return null;
  return arr;
}

function updateCommand() {
  let hasError = false;
  let errorMsg = '';

  // Validate item name
  const itemName = itemInput.value.trim();
  if (!itemName) {
    hasError = true;
    errorMsg = 'Please enter a valid item name!';
    itemInput.classList.add('error');
  } else if (hasWhitespace(itemName)) {
    hasError = true;
    errorMsg = 'No spaces allowed in item name or enchantment IDs!';
    itemInput.classList.add('error');
  } else {
    itemInput.classList.remove('error');
  }

  // Validate enchantments
  enchantments.forEach((e) => {
    if (hasWhitespace(e.name)) {
      hasError = true;
      errorMsg = 'No spaces allowed in item name or enchantment IDs!';
    }
  });

  if (hasError) {
    commandOutput.textContent = '';
    errorMessage.textContent = errorMsg;
    return;
  } else {
    errorMessage.textContent = '';
  }

  // Build components for 1.21+ syntax
  let components = [];
  // Custom name
  const customName = buildCustomNameComponent();
  if (customName) {
    components.push(`custom_name='${customName}'`);
  }
  // Lore
  const loreComp = buildLoreComponent();
  if (loreComp) {
    components.push(`lore=${loreComp}`);
  }
  // Enchantments
  const enchComp = buildEnchantmentsComponent();
  if (enchComp) {
    components.push(`minecraft:enchantments=${JSON.stringify(enchComp)}`);
  }
  // Attributes
  const attrComp = buildAttributesComponent();
  if (attrComp) {
    components.push(`minecraft:attribute_modifiers=${JSON.stringify(attrComp)}`);
  }

  // Compose full command
  let command = `/give @p minecraft:${itemName}`;
  if (components.length > 0) {
    command += "[" + components.join(",") + "]";
  }

  commandOutput.textContent = command;
}

// === ITEM AUTOCOMPLETE ===
itemInput.addEventListener('input', (e) => {
  const cleaned = e.target.value.replace(/\s/g, '');
  if (cleaned !== e.target.value) {
    e.target.value = cleaned;
  }
  showAutocomplete(
    itemInput,
    itemAutocomplete,
    ITEMS,
    (selected) => {
      itemInput.value = selected;
      updateCommand();
    }
  );
  updateCommand();
});
itemInput.addEventListener('focus', () => {
  showAutocomplete(
    itemInput,
    itemAutocomplete,
    ITEMS,
    (selected) => {
      itemInput.value = selected;
      updateCommand();
    }
  );
});
itemInput.addEventListener('blur', () => hideAutocomplete(itemAutocomplete));

addEnchantmentBtn.addEventListener('click', () => {
  enchantments.push({ name: '', value: '' });
  renderEnchantments();
  updateCommand();
});

addAttributeBtn.addEventListener('click', () => {
  attributes.push({ type: ATTRIBUTES[0].id, amount: '', operation: "add_value", slot: 'mainhand' });
  renderAttributes();
  updateCommand();
});

// NBT Listeners
nbtName.addEventListener('input', updateCommand);
nbtColor.addEventListener('change', updateCommand);
nbtLore.addEventListener('input', updateCommand);

setupNBTFormatBtns();

// Initial render
renderEnchantments();
renderAttributes();
updateCommand();
