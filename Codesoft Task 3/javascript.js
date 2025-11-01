// Simple, safe calculator logic

const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons button');

let expr = '';              // current expression shown
let lastType = '';          // "digit", "op", "dot" - used to prevent invalid sequences

function updateDisplay() {
  display.value = expr || '0';
}

function isOperator(ch) {
  return ['+', '-', '*', '/'].includes(ch);
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-action');
    const text = btn.textContent.trim();

    if (action === 'digit') {
      // append digit
      expr += text;
      lastType = 'digit';
      updateDisplay();
    }

    else if (action === 'dot') {
      // prevent multiple dots in the same number
      if (lastType === 'dot') return;
      // check last number segment doesn't already contain .
      const segments = expr.split(/[\+\-\*\/]/);
      const lastSeg = segments[segments.length - 1];
      if (lastSeg.includes('.')) return;
      // if expression empty or last was operator, allow "0."
      if (!expr || isOperator(expr.slice(-1))) expr += '0';
      expr += '.';
      lastType = 'dot';
      updateDisplay();
    }

    else if (action === 'op') {
      // operator handling: disallow two operators in a row
      if (!expr) {
        // allow leading minus for negative numbers
        if (text === '-') {
          expr = '-';
          lastType = 'op';
          updateDisplay();
        }
        return;
      }
      const lastChar = expr.slice(-1);
      if (isOperator(lastChar)) {
        // replace previous operator with new one
        expr = expr.slice(0, -1) + text;
      } else {
        expr += text;
      }
      lastType = 'op';
      updateDisplay();
    }

    else if (action === 'clear') {
      expr = '';
      lastType = '';
      updateDisplay();
    }

    else if (action === 'back') {
      // remove last char
      expr = expr.slice(0, -1);
      // update lastType
      const lastChar = expr.slice(-1);
      if (!lastChar) lastType = '';
      else if (isOperator(lastChar)) lastType = 'op';
      else if (lastChar === '.') lastType = 'dot';
      else lastType = 'digit';
      updateDisplay();
    }

    else if (action === 'eval') {
      // evaluate expression safely
      try {
        // avoid evaluation if ends with operator
        if (!expr) return;
        const lastChar = expr.slice(-1);
        if (isOperator(lastChar)) {
          // remove trailing operator
          expr = expr.slice(0, -1);
        }
        // Basic safety: only allow digits, operators and dot
        if (!/^[0-9+\-*/.() ]+$/.test(expr)) {
          display.value = 'Error';
          expr = '';
          lastType = '';
          return;
        }
        // Use Function constructor instead of eval - slightly safer
        const result = Function('"use strict";return (' + expr + ')')();
        // format result: if integer show as int else show upto 8 decimals trimming trailing zeros
        expr = Number.isFinite(result) ? (Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(8)).toString()) : '';
        lastType = 'digit';
        updateDisplay();
      } catch (e) {
        display.value = 'Error';
        expr = '';
        lastType = '';
      }
    }
  });
});

// initialize
updateDisplay();

// Optional: allow keyboard input
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if ((/^[0-9]$/).test(key)) document.querySelector(`button[data-action="digit"]:not([disabled])[data-key="${key}"]`)?.click();
  if (key === '.') document.querySelector('button[data-action="dot"]')?.click();
  if (key === '+' || key === '-' || key === '*' || key === '/') {
    document.querySelectorAll('button[data-action="op"]').forEach(b => { if (b.textContent.trim() === key) b.click(); });
  }
  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    document.querySelector('button[data-action="eval"]')?.click();
  }
  if (key === 'Backspace') document.querySelector('button[data-action="back"]')?.click();
  if (key.toLowerCase() === 'c') document.querySelector('button[data-action="clear"]')?.click();
});
