// Convert Expression to Query String for VSD
export default (expressions) => {
  let expression = '';

  expressions.forEach(e => {
    if(e.operator) {
      expression += ` ${e.operator} `;
    } else if(e.bracket) {
      expression += `${e.bracket}`;
    } else {
      expression += `${e.element.category} ${e.element.operator} "${e.element.value}"`
    }
  });

  return expression;
}