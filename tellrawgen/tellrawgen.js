const NAMED_COLORS = [
  "black","dark_blue","dark_green","dark_aqua","dark_red","dark_purple","gold",
  "gray","dark_gray","blue","green","aqua","red","light_purple","yellow","white"
];

function defaultMsgPart() {
  return {
    text: "",
    color: "#ffffff",
    colorType: "hex", // or "named"
    namedColor: "white",
    bold: false,
    italic: false,
    underlined: false,
    strikethrough: false,
    obfuscated: false
  };
}

let messages = [defaultMsgPart()];

const messagesList = document.getElementById('messagesList');
const addMsgBtn = document.getElementById('addMsgBtn');
const commandOutput = document.getElementById('commandOutput');
const preview = document.getElementById('preview');
const errorMessage = document.getElementById('errorMessage');

function renderMessages() {
  messagesList.innerHTML = '';
  messages.forEach((msg, idx) => {
    const row = document.createElement('div');
    row.className = 'enchantment-row'; // Matches your flex row style

    // Text input
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Message text';
    textInput.value = msg.text;
    textInput.spellcheck = false;
    textInput.autocomplete = "off";
    textInput.oninput = e => { messages[idx].text = e.target.value; updateCommand(); };

    // Color picker
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = msg.color;
    colorInput.title = "Pick a color";
    colorInput.style.width = "2.2em";
    colorInput.style.height = "2.2em";
    colorInput.style.background = "none";
    colorInput.oninput = e => {
      messages[idx].color = e.target.value;
      messages[idx].colorType = "hex";
      updateCommand();
    };

    // Named color dropdown
    const namedColorSelect = document.createElement('select');
    namedColorSelect.className = "nbt-color";
    NAMED_COLORS.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c.charAt(0).toUpperCase() + c.slice(1).replace('_',' ');
      namedColorSelect.appendChild(opt);
    });
    namedColorSelect.value = msg.namedColor;
    namedColorSelect.onchange = e => {
      messages[idx].namedColor = e.target.value;
      messages[idx].colorType = "named";
      updateCommand();
    };

    // Color mode toggle
    const modeToggle = document.createElement('button');
    modeToggle.textContent = msg.colorType === "hex" ? "Hex" : "Named";
    modeToggle.className = 'nbt-format-btn';
    modeToggle.title = "Toggle color mode";
    modeToggle.style.minWidth = "3.5em";
    modeToggle.onclick = () => {
      messages[idx].colorType = msg.colorType === "hex" ? "named" : "hex";
      renderMessages();
      updateCommand();
    };

    // Format buttons
    function makeFmtBtn(label, key, title, style) {
      const btn = document.createElement('button');
      btn.className = 'nbt-format-btn' + (msg[key] ? ' active' : '');
      btn.textContent = label;
      btn.title = title;
      if (style) btn.style = style;
      btn.onclick = () => {
        messages[idx][key] = !messages[idx][key];
        renderMessages();
        updateCommand();
      };
      return btn;
    }
    const boldBtn = makeFmtBtn('B', 'bold', 'Bold');
    const italicBtn = makeFmtBtn('I', 'italic', 'Italic', 'font-style:italic;');
    const underBtn = makeFmtBtn('U', 'underlined', 'Underline', 'text-decoration:underline;');
    const strikeBtn = makeFmtBtn('S', 'strikethrough', 'Strikethrough', 'text-decoration:line-through;');
    const obfusBtn = makeFmtBtn('?', 'obfuscated', 'Obfuscated', 'font-family:monospace;');

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '✕';
    delBtn.title = "Remove";
    delBtn.onclick = () => {
      if (messages.length > 1) {
        messages.splice(idx, 1);
        renderMessages();
        updateCommand();
      }
    };

    // Assemble row
    row.appendChild(textInput);
    if (msg.colorType === "hex") {
      row.appendChild(colorInput);
    } else {
      row.appendChild(namedColorSelect);
    }
    row.appendChild(modeToggle);
    row.appendChild(boldBtn);
    row.appendChild(italicBtn);
    row.appendChild(underBtn);
    row.appendChild(strikeBtn);
    row.appendChild(obfusBtn);
    row.appendChild(delBtn);

    messagesList.appendChild(row);
  });
}

addMsgBtn.onclick = () => {
  messages.push(defaultMsgPart());
  renderMessages();
  updateCommand();
};

function buildTellrawJSON() {
  return messages.map(msg => {
    let comp = { text: msg.text };
    if (msg.colorType === "hex") {
      comp.color = msg.color;
    } else {
      comp.color = msg.namedColor;
    }
    if (msg.bold) comp.bold = true;
    if (msg.italic) comp.italic = true;
    if (msg.underlined) comp.underlined = true;
    if (msg.strikethrough) comp.strikethrough = true;
    if (msg.obfuscated) comp.obfuscated = true;
    return comp;
  });
}

function updateCommand() {
  let hasError = false;
  let errorMsg = '';
  if (messages.some(m => !m.text)) {
    hasError = true;
    errorMsg = 'No empty message parts allowed!';
  }
  if (hasError) {
    commandOutput.textContent = '';
    errorMessage.textContent = errorMsg;
    preview.textContent = '';
    return;
  } else {
    errorMessage.textContent = '';
  }
  // Build tellraw JSON
  const json = buildTellrawJSON();
  const cmd = `/tellraw @a ${JSON.stringify(json)}`;
  commandOutput.textContent = cmd;

  // Preview (basic, not Minecraft-accurate but gives an idea)
  preview.innerHTML = json.map(comp => {
    let style = '';
    if (comp.color) style += `color:${comp.color.startsWith('#') ? comp.color : mcColorToHex(comp.color)};`;
    if (comp.bold) style += 'font-weight:bold;';
    if (comp.italic) style += 'font-style:italic;';
    if (comp.underlined) style += 'text-decoration:underline;';
    if (comp.strikethrough) style += 'text-decoration:line-through;';
    if (comp.obfuscated) style += 'filter: blur(1px);';
    return `<span style="${style}">${escapeHTML(comp.text)}</span>`;
  }).join('');
}

// Convert Minecraft named color to hex for preview
function mcColorToHex(name) {
  const colors = {
    black: "#000000", dark_blue: "#0000aa", dark_green: "#00aa00", dark_aqua: "#00aaaa",
    dark_red: "#aa0000", dark_purple: "#aa00aa", gold: "#ffaa00", gray: "#aaaaaa",
    dark_gray: "#555555", blue: "#5555ff", green: "#55ff55", aqua: "#55ffff",
    red: "#ff5555", light_purple: "#ff55ff", yellow: "#ffff55", white: "#ffffff"
  };
  return colors[name] || "#ffffff";
}
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

// Initial render
renderMessages();
updateCommand();
