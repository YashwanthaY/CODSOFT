document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display");
  const history = document.getElementById("history");
  const keys = document.querySelectorAll(".key");
  const liveRegion = document.getElementById("live-region");

  let expr = "0";
  let lastAns = "";

  function updateDisplay() {
    display.textContent = expr || "0";
  }

  function updateHistory() {
    history.textContent = lastAns !== "" ? "Ans = " + lastAns : "";
    liveRegion.textContent = display.textContent;
  }

  function clearAll() {
    expr = "0";
    updateDisplay();
  }

  function deleteLast() {
    if (expr.length > 1) {
      expr = expr.slice(0, -1);
    } else {
      expr = "0";
    }
    updateDisplay();
  }

  function appendToken(token) {
    const isDigitOrDot = /^[0-9.]$/.test(token);
    const startsWithLetter = /^[a-zA-Z]/.test(token); // sin(, cos(, log(, ln(, sqrt(
    const isFunctionOrConst =
      startsWithLetter || token === "π" || token === "(";

    if (expr === "0") {
      // if current expression is just 0, decide whether to replace or append
      if (isDigitOrDot || isFunctionOrConst) {
        // replace 0 with number, decimal, function, π, or (
        expr = token;
      } else {
        // operators like + - × ÷ ^ % after 0 => keep 0 and append operator
        expr += token;
      }
    } else {
      expr += token;
    }
    updateDisplay();
  }

  function useAns() {
    if (lastAns === "") return;

    if (expr === "0") {
      expr = lastAns;
    } else {
      expr += lastAns;
    }
    updateDisplay();
  }

  function evaluateExpression() {
    if (!expr) return;

    let toEval = expr;

    toEval = toEval
      .replace(/π/g, "Math.PI")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .replace(/\^/g, "**");

    try {
      const result = Function('"use strict";return (' + toEval + ")")();
      if (result === undefined || isNaN(result)) {
        display.textContent = "Error";
        return;
      }

      lastAns = String(result);
      history.textContent = expr + " =";
      expr = lastAns;
      updateDisplay();
      updateHistory();
    } catch {
      display.textContent = "Error";
    }
  }

  function handleKeyClick(btn) {
    const action = btn.dataset.action;
    const token = btn.dataset.token;

    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 120);

    if (action === "ans") {
      useAns();
      return;
    }

    if (action === "ac") {
      clearAll();
      return;
    }

    if (action === "del") {
      deleteLast();
      return;
    }

    if (action === "equals") {
      evaluateExpression();
      return;
    }

    if (token) {
      appendToken(token);
    }
  }

  keys.forEach(btn => {
    btn.addEventListener("click", () => handleKeyClick(btn));
  });

  // keyboard support
  document.addEventListener("keydown", e => {
    const key = e.key;

    if ((key >= "0" && key <= "9") || key === ".") {
      appendToken(key);
      return;
    }
    if (key === "+") appendToken("+");
    else if (key === "-") appendToken("-");
    else if (key === "*") appendToken("×");
    else if (key === "/") appendToken("÷");
    else if (key === "(") appendToken("(");
    else if (key === ")") appendToken(")");
    else if (key === "^") appendToken("^");
    else if (key === "Enter" || key === "=") evaluateExpression();
    else if (key === "Backspace") deleteLast();
    else if (key === "Delete") clearAll();
  });

  updateDisplay();
  updateHistory();
});
