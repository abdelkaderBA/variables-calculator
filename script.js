class VariableCalculator {
  constructor() {
    this.variables = new Map();
    this.hyperFormula = HyperFormula.buildFromArray([]);
    this.initializeVariables();
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

    this.renderTable();
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
}

document.addEventListener("DOMContentLoaded", () => {
  new VariableCalculator();
});
