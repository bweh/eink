const editor = document.getElementById('editor');
const cursor = document.getElementById('custom-cursor');
const placeholder = document.getElementById('placeholder');
const storageKey = 'editorContent';

let typingTimeout;
let isTyping = false;

function noText() {
  const brElements = editor.getElementsByTagName('br');
  return (editor.textContent.trim() === '') && (brElements.length < 2);
  // return (editor.textContent.trim() === '');
}

function isContentEmpty(content) {
  const strippedContent = content.replace(/<[^>]+>/g, '').trim();
  return strippedContent === '';
}

function getCaretPosition() {
  const editor = document.getElementById('editor');
  const selection = window.getSelection();

  // console.log('get caret position');

  // if (!selection.rangeCount) {
  //   console.log('no selection, no caret');
  //   return null;
  // }

  const range = selection.getRangeAt(0);
  let anchor = selection.anchorNode
  // const startContainer = range.startContainer;

  let row;
  let column;

  // console.log('anchor:', anchor);
  // console.log('parent:', anchor.parentNode);

  // row 1, col 0
  if (anchor === editor) {
    return { row: 0, column: 0 };
  }

  // row 2 - end
  let newAnchor = anchor;
  let index = Array.from(editor.childNodes).indexOf(newAnchor);
  if (index !== -1) {
    row = index
  } else {
    newAnchor = newAnchor.parentNode;
    row = Array.from(editor.childNodes).indexOf(newAnchor);
  }
  column = range.startOffset;

  // console.log(row, column);
  return { row, column };
}

function setCursor() {
  // console.log('setting cursor');
  cursor.style.left = `10px`;
  cursor.style.top = `10px`;
}

function activateCursor() {
  // if (placeholder && editor.textContent.trim() === '') {
  //   placeholder.textContent = '';
  // }

  if (!isTyping) {
    cursor.style.display = 'block';
    updateCursor();
  }
}

function deactivateCursor() {
  placeholder.textContent = 'Start typing...';
  cursor.style.display = 'none';
}

function updateCursor() {
  let cursorHeight = getComputedStyle(document.documentElement).getPropertyValue("--cursor-line-height");
  let lineHeight = parseFloat(cursorHeight);

  const selection = window.getSelection();
  if (selection.rangeCount > 0 && !selection.isCollapsed) {
    cursor.style.display = 'none';
    return;
  }

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    // console.log('start offset', range.startOffset);
    const pos = getCaretPosition()
    const row = pos.row;
    const col = pos.column;

    // console.log(rect);
    cursor.style.left = `${(col === 0) ? 10 : rect.left}px`;
    cursor.style.top = `${10 + lineHeight * (row)}px`;
    // console.log(selection);

    if (!isTyping) {
      cursor.style.display = 'block';
    }
  }
}

editor.addEventListener('input', () => {
  isTyping = true;
  cursor.style.display = 'none';
  placeholder.textContent = noText() ? 'Start typing...' : ''

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    if (noText()) {
      deactivateCursor();
    } else {
      cursor.style.display = 'block';
      updateCursor();
    }
  }, 350);

  if (!document.body.contains(cursor)) {
    console.log('reattaching');
    editor.appendChild(cursor);
  }

  localStorage.setItem(storageKey, editor.innerHTML);
});

editor.addEventListener('keyup', updateCursor);
editor.addEventListener('click', updateCursor);

editor.addEventListener('focus', () => {
  // console.log('editor is focused!');

  if (noText()) {
    placeholder.textContent = '';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // setCursor()
  const savedContent = localStorage.getItem(storageKey);
  // console.log(savedContent);
  if (savedContent && !isContentEmpty(savedContent)) {
    console.log('there is content');
    placeholder.innerHTML = '';
    editor.innerHTML = savedContent;
  } else {
    console.log('there is no content');
    placeholder.textContent = 'Start typing...';
  }
})

document.onkeyup = function (e) {
  if (e.ctrlKey && e.which == 187) { // Ctrl + '+'
    let textFontSize = getComputedStyle(document.documentElement).getPropertyValue("--text-font-size");
    let textFontSizeValue = parseFloat(textFontSize);
    textFontSizeValue += 1;
    document.documentElement.style.setProperty('--text-font-size', `${textFontSizeValue}px`);

    let cursorLineHeightSize = getComputedStyle(document.documentElement).getPropertyValue("--cursor-line-height");
    let cursorLineHeightSizeValue = parseFloat(cursorLineHeightSize);
    cursorLineHeightSizeValue += 1;
    document.documentElement.style.setProperty('--cursor-line-height', `${cursorLineHeightSizeValue}px`);

    updateCursor();
  } else if (e.ctrlKey && e.which == 189) { // Ctrl + '-'
    let textFontSize = getComputedStyle(document.documentElement).getPropertyValue("--text-font-size");
    let textFontSizeValue = parseFloat(textFontSize);
    textFontSizeValue -= 1;
    document.documentElement.style.setProperty('--text-font-size', `${textFontSizeValue}px`);

    let cursorLineHeightSize = getComputedStyle(document.documentElement).getPropertyValue("--cursor-line-height");
    let cursorLineHeightSizeValue = parseFloat(cursorLineHeightSize);
    cursorLineHeightSizeValue -= 1;
    document.documentElement.style.setProperty('--cursor-line-height', `${cursorLineHeightSizeValue}px`);

    updateCursor();
  }
};
