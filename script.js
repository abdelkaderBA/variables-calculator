class VariableCalculator {
  constructor() {
    this.variables = new Map();
    this.hyperFormula = HyperFormula.buildFromArray([]);
    this.initializeVariables();
    this.setupEventListeners();
  }

  initializeVariables() {
    const data = [];
    for (let i = 1; i <= 1000; i++) {
      const code = `VAR_${i}`;
      let formula = "";

      if (i === 1) {
        formula = "1";
      } else if (i === 2) {
        formula = "2";
      } else {
        formula = `VAR_${i - 1} + VAR_${i - 2}`;
      }

      this.variables.set(code, {
        code,
        formula,
        value: null,
      });
      data.push([formula]);
    }

    this.updateHyperFormula();
    this.renderTable();
    this.recalculateAll();
  }

  setupEventListeners() {
    const tableBody = document.getElementById("tableBody");

    tableBody.addEventListener("click", (e) => {
      const cell = e.target.closest("td.value-cell");
      const code = cell?.dataset.code;

      this.showFormulaInput(cell, code);
    });

    tableBody.addEventListener(
      "blur",
      (e) => {
        if (e.target.tagName === "INPUT") {
          this.handleFormulaChange(e.target);
        }
      },
      true
    );

    tableBody.addEventListener("keypress", (e) => {
      if (e.target.tagName === "INPUT" && e.key === "Enter") {
        this.handleFormulaChange(e.target);
        e.target.blur();
      }
    });
  }

  showFormulaInput(cell, code) {
    const variable = this.variables.get(code);
    if (!variable) return;
    const input = document.createElement("input");
    input.type = "text";
    input.value = variable?.formula;
    input.dataset.code = code;

    cell.textContent = "";
    cell.appendChild(input);
    input.focus();
  }

  handleFormulaChange(input) {
    const code = input.dataset.code;
    const newFormula = input.value;
    const variable = this.variables.get(code);

    if (variable && variable.formula !== newFormula) {
      variable.formula = newFormula;
      this.recalculateFromVariable(code);
    }

    const cell = input.parentElement;
    if (cell) {
      cell.textContent = variable.value !== null ? variable.value : "";
    }
  }

  renderTable() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    this.variables.forEach((variable, code) => {
      const row = document.createElement("tr");

      const codeCell = document.createElement("td");
      codeCell.textContent = code;
      row.appendChild(codeCell);

      const valueCell = document.createElement("td");
      valueCell.className = "value-cell";
      valueCell.dataset.code = code;
      valueCell.textContent = variable.value !== null ? variable.value : "";

      row.appendChild(valueCell);
      tableBody.appendChild(row);
    });
  }

  recalculateFromVariable(startCode) {
    const affectedVariables = this.findAffectedVariables(startCode);
    this.recalculateVariables(affectedVariables);
  }

  findAffectedVariables(startCode) {
    const affected = new Set();
    const startIndex = parseInt(startCode.split("_")[1]);

    for (let i = startIndex; i <= 1000; i++) {
      const code = `VAR_${i}`;
      affected.add(code);
    }

    return Array.from(affected);
  }

  recalculateAll() {
    this.recalculateVariables(Array.from(this.variables.keys()));
  }

  convertFormulaToHyperFormula(formula) {
    if (!isNaN(formula)) return formula;
    return "=" + formula.replace(/VAR_(\d+)/g, (match, num) => `A${num}`);
  }

  updateHyperFormula() {
    const data = Array.from(this.variables.values()).map((v) => {
      return [this.convertFormulaToHyperFormula(v.formula)];
    });

    this.hyperFormula = HyperFormula.buildFromArray(data);
  }

  recalculateVariables(variableCodes) {
    this.updateHyperFormula();

    variableCodes.forEach((code) => {
      const variable = this.variables.get(code);
      const index = parseInt(code.split("_")[1]) - 1;
      const value = this.hyperFormula.getCellValue({
        sheet: 0,
        row: index,
        col: 0,
      });
      variable.value = value;

      const valueCell = document.querySelector(
        `td.value-cell[data-code="${code}"]`
      );
      if (valueCell && !valueCell.querySelector("input")) {
        valueCell.textContent =
          value !== null && value !== "#NAME?" ? value.toString() : "";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new VariableCalculator();
});
