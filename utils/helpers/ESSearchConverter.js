// replace column label from colunm name
export const labelToField = (expression, columns) => {
  return expression.map(d => {

      if(d.element && d.element.category) {
        for(let key in columns) {

          if(columns.hasOwnProperty(key)) {
            const column = columns[key];
            if(column.label === d.element.category || column.column === d.element.category) {
              d.element.category = column.column
              break;
            }
          }
        }
      }

      return d;
  })
}

// Expanding Exprassion with Paraenthesis
export const expandExpression = (obj) => {
  let expressions = [];
  obj.forEach(element => {
    if(element.expressions) {
      if(element.conditionType) {
        expressions.push({operator: element.conditionType});
      }

      expressions = [...expressions, {bracket: '('}, ...expandExpression(element.expressions), {bracket: ')'}];
    } else {
      if (element.conditionType) {
        expressions.push({operator: element.conditionType});
      }

      expressions.push({element});
    }
  });

  return expressions;
}

export const convertToPosfix = (expression) => {
  const postfix = [];
  const stack = [];
  let pop = null;

  expression.forEach(elem => {
    // if Operator or Opening push it to stack
    if(elem.bracket && elem.bracket === '(') {
      stack.push({...elem});
    } else if(elem.operator) {
      // Operator precedence is important
      pop = stack.pop();

      if(pop) {
        switch (elem.operator) {
          case 'AND': 
            if(pop.operator && pop.operator === 'OR' || pop.bracket ) {
              stack.push(pop);  
            } else {
              postfix.push(pop);
            }
            break;

          case 'OR': 
            if(pop.operator) {
              if(pop.operator === 'AND') {
                postfix.push(pop);
                pop = stack.pop();
              }

              if(pop) {
                postfix.push(pop);
              }

            } else {
              stack.push(pop);
            }
            break;
        }
      }

      stack.push({...elem});

    } else if(elem.bracket == ')') {
      // POP elements from stack while element is not '('
      pop = stack.pop();

      while(pop && (!pop.bracket || pop.bracket != '(')) {
        postfix.push({...pop});
        pop = stack.pop();
      }
    } else {
      // Push element into stack
      postfix.push({...elem});
    }
  });

  // Finishing Stack

  pop = stack.pop();
  while(pop) {
    postfix.push({...pop});
    pop = stack.pop();
  }

  return postfix;
}

export const evaluateToElastic = (postfix) => {
  const stack = [];

  if(postfix.length == 1) {
    return {
      'bool': {
        'must': [
          convertElementToElastic(postfix[0])
        ]
      }
    };
  }

  postfix.forEach(elem => {
    if(elem.element) {
      stack.push(elem);
    } else {
      const elem1 = stack.pop();
      const elem2 = stack.pop();

      const operator = elem.operator === 'AND' ? 'must' : 'should';
      stack.push({
        bool: {
          [operator]: [convertElementToElastic(elem1), convertElementToElastic(elem2)]
        }
      })
    }
  });

  return stack[0];
}

export const convertElementToElastic = (elem) => {
  if(elem.element && elem.element.operator) {
    const element = elem.element;
    switch (element.operator) {
      case '==':
        return {
          term: {
            [element.category]: element.value 
          }
        };

      case 'contains':
        return {
          match: {
            [element.category]: element.value 
          }
        };
        
      case 'startsWith':
        return {
          prefix: {
            [element.category]: element.value 
          }
        };

      case '!=': 
        return {
          bool: {
            must_not: {
              term: {
                [element.category]: element.value 
              }
            }
          }
        };

      case 'notContains': 
        return {
          bool: {
            must_not: {
              match: {
                [element.category]: element.value 
              }
            }
          }
        };
    }
  }

  return elem;
}

export default (expressions) => {
    const postfix = convertToPosfix(expressions);
    return evaluateToElastic(postfix);
}
