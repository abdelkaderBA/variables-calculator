class VariableCalculator {
  constructor() {
    this.variables = new Map();
    this.hyperFormula = HyperFormula.buildFromArray([]);
    this.setupEventListeners();
    this.nextId = 1;
  }

  setupEventListeners() {
    const tableBody = document.getElementById("tableBody");
    const addButton = document.getElementById("addVariableBtn");

    if (!tableBody || !addButton) return;
    addButton.addEventListener("click", () => this.addNewVariable());

    tableBody.addEventListener("click", (e) => {
      const cell = e.target.closest("td");
      if (!cell) return;

      const row = cell.parentElement;
      const code = row.dataset.code;

      if (cell.classList.contains("value-cell")) {
        this.showFormulaInput(cell, code);
      } else if (cell.classList.contains("code-cell")) {
        this.showCodeInput(cell, code);
      } else if (e.target.classList.contains("delete-btn")) {
        this.deleteVariable(code);
      }
    });

    tableBody.addEventListener(
      "blur",
      (e) => {
        if (e.target.tagName === "INPUT") {
          const cell = e.target.parentElement;
          if (cell.classList.contains("value-cell")) {
            this.handleFormulaChange(e.target);
          } else if (cell.classList.contains("code-cell")) {
            this.handleCodeChange(e.target);
          }
        }
      },
      true
    );

    tableBody.addEventListener("keypress", (e) => {
      if (e.target.tagName === "INPUT" && e.key === "Enter") {
        const cell = e.target.parentElement;
        if (cell.classList.contains("value-cell")) {
          this.handleFormulaChange(e.target);
        } else if (cell.classList.contains("code-cell")) {
          this.handleCodeChange(e.target);
        }
        e.target.blur();
      }
    });
  }

  addNewVariable() {
    const code = `VAR_${this.nextId++}`;
    this.variables.set(code, {
      code,
      formula: "0",
      value: null,
    });
    this.renderTable();
    this.recalculateAll();
  }

  showCodeInput(cell, code) {
    const variable = this.variables.get(code);
    if (!variable) return;

    const input = document.createElement("input");
    input.type = "text";
    input.value = variable.code;
    input.dataset.originalCode = code;

    cell.textContent = "";
    cell.appendChild(input);
    input.focus();
  }

  handleCodeChange(input) {
    const originalCode = input.dataset.originalCode;
    const newCode = input.value.trim().toUpperCase();
    const variable = this.variables.get(originalCode);

    if (!variable || originalCode === newCode) {
      this.renderTable();
      return;
    }

    if (this.variables.has(newCode)) {
      alert("Ce code existe déjà");
      this.renderTable();
      return;
    }

    if (this.isCodeUsedInFormulas(originalCode)) {
      alert("Ce code est utilisé dans la formule d'autres variables");
      this.renderTable();
      return;
    }

    this.variables.delete(originalCode);
    variable.code = newCode;
    this.variables.set(newCode, variable);

    this.updateFormulasWithNewCode(originalCode, newCode);
    this.renderTable();
    this.recalculateAll();
  }

  isCodeUsedInFormulas(code) {
    for (const variable of this.variables.values()) {
      if (variable.code !== code && variable.formula.includes(code)) {
        return true;
      }
    }
    return false;
  }

  updateFormulasWithNewCode(oldCode, newCode) {
    this.variables.forEach((variable) => {
      if (variable.formula.includes(oldCode)) {
        variable.formula = variable.formula.replace(
          new RegExp(oldCode, "g"),
          newCode
        );
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

    if (!variable || variable.formula === newFormula) {
      this.renderTable();
      return;
    }

    if (this.wouldCreateCircularReference(code, newFormula)) {
      alert("Cette formule créerait une référence circulaire");
      this.renderTable();
      return;
    }

    variable.formula = newFormula;
    this.recalculateFromVariable(code);
    this.renderTable();
  }

  wouldCreateCircularReference(variableCode, formula) {
    const referencedCodes = this.extractReferencedCodes(formula);
    const visited = new Set();

    const checkCircular = (code) => {
      if (visited.has(code)) return true;
      visited.add(code);

      const variable = this.variables.get(code);
      if (!variable) return false;

      const refs = this.extractReferencedCodes(variable.formula);
      return refs.some((ref) => ref === variableCode || checkCircular(ref));
    };

    return referencedCodes.some((code) => checkCircular(code));
  }

  extractReferencedCodes(formula) {
    const matches = formula.match(/VAR_\d+/g);
    return matches ? matches : [];
  }

  deleteVariable(code) {
    if (this.isCodeUsedInFormulas(code)) {
      alert("Cette variable est utilisée dans la formule d'autres variables");
      return;
    }

    this.variables.delete(code);
    this.renderTable();
    this.recalculateAll();
  }

  renderTable() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    this.variables.forEach((variable, code) => {
      const row = document.createElement("tr");
      row.dataset.code = code;

      const codeCell = document.createElement("td");
      codeCell.className = "code-cell";
      codeCell.textContent = code;
      row.appendChild(codeCell);

      const valueCell = document.createElement("td");
      valueCell.className = "value-cell";
      valueCell.dataset.code = code;
      valueCell.textContent = variable.value !== null ? variable.value : "";
      row.appendChild(valueCell);

      const actionsCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete delete-btn";
      deleteButton.textContent = "Supprimer";
      actionsCell.appendChild(deleteButton);
      row.appendChild(actionsCell);

      tableBody.appendChild(row);
    });
  }

  recalculateFromVariable(startCode) {
    const affectedVariables = this.findAffectedVariables(startCode);
    this.recalculateVariables(affectedVariables);
  }

  findAffectedVariables(startCode) {
    const affected = new Set();

    const addDependentVariables = (code) => {
      this.variables.forEach((variable, varCode) => {
        if (variable.formula.includes(code) && !affected.has(varCode)) {
          affected.add(varCode);
          addDependentVariables(varCode);
        }
      });
    };

    affected.add(startCode);
    addDependentVariables(startCode);

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
