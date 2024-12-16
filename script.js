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
    this.recalculateVariables();
  }

  setupEventListeners() {
    const tableBody = document.getElementById("tableBody");
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

  handleFormulaChange(input) {
    const code = input.dataset.code;
    const newFormula = input.value;
    const variable = this.variables.get(code);

    if (variable && variable.formula !== newFormula) {
      variable.formula = newFormula;
      this.recalculateFromVariable(code);
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

      const formulaCell = document.createElement("td");
      const formulaInput = document.createElement("input");
      formulaInput.type = "text";
      formulaInput.value = variable.formula;
      formulaInput.dataset.code = code;
      formulaCell.appendChild(formulaInput);
      row.appendChild(formulaCell);

      const valueCell = document.createElement("td");
      valueCell.id = `value-${code}`;
      valueCell.textContent = variable.value !== null ? variable.value : "";
      row.appendChild(valueCell);

      tableBody.appendChild(row);
    });
  }

  recalculateFromVariable(startCode) {
    this.findAffectedVariables(startCode);
    this.recalculateVariables();
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

  convertFormulaToHyperFormula(formula) {
    if (!isNaN(formula)) return formula;
    return "=" + formula.replace(/VAR_(\d+)/g, (match, num) => `A${num}`);
  }

  updateHyperFormula() {
    const data = Array.from(this.variables.values()).map((v) => {
      return [this.convertFormulaToHyperFormula(v.formula)];
    });

    this.hyperFormula = HyperFormula.buildFromArray(data, {
      licenseKey: "gpl-v3",
    });
  }

  recalculateVariables() {
    this.updateHyperFormula();

    this.variables.forEach((variable, code) => {
      const index = parseInt(code.split("_")[1]) - 1;
      const value = this.hyperFormula.getCellValue({
        sheet: 0,
        row: index,
        col: 0,
      });
      variable.value = value;

      const valueCell = document.getElementById(`value-${code}`);
      if (valueCell) {
        valueCell.textContent =
          value !== null && value !== "#NAME?" ? value.toString() : "";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new VariableCalculator();
});
