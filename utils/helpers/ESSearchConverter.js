// replace column label from colunm name
export const labelToField = (expression, columns) => {
  return expression.map(d => {

      if(d.element && d.element.category) {
        for(let key in columns) {

          if(columns.hasOwnProperty(key)) {
            const column = columns[key];
            if(column.label === d.element.category || column.column === d.element.category) {
              d.element.category = column.column;
              d.element.nested = column.nested || false;
              break;
            }
          }
        }
      }

      return d;
  })
}

const getRandomNumber = () => Math.floor(Math.random() * 900000000);

const isNestedElement = (elem) => {
  return elem && elem.element && elem.element.nested;
}

// Get the nested path of the element after removing the field name
const getNestedBasePath = (element) => {
  return element.category.substr(0, element.category.lastIndexOf("."));
}

// Add element to already created nested element in must section
const addToExistingNestedPath = (nestedObjects, elem) => {
  const path = getNestedBasePath(elem.element);
  nestedObjects[path].nested.query.bool.must.push(convertElementToElastic(elem));
}

// Create the nested template if path does't exists otherwise will return true
const checkAndCreateNestedTemplate = (nestedObjects, elem) => {
  const path = getNestedBasePath(elem.element);
  if (nestedObjects[path]) {
    return false;
  }

  // Will push the elments latter (Baic Template is created)
  const template = getNestedTemplate(elem.element);
  nestedObjects[path] = template;
  return template;
}

const getNestedTemplate = (element) => {
  const path = element.category.substr(0, element.category.lastIndexOf("."));
  return {
    nested: {
      path,
      query: {
        bool: {
          must: []
        }
      },
      inner_hits: {
        name: `${path}-${getRandomNumber()}`
      }
    }
  };
}

// handling OR or Single element
const convertElementToNestedElastic = (elem) => {
  const query = getNestedTemplate(elem.element);
  query.nested.query.bool.must.push(convertElementToElastic(elem))
  return query;
}

const getOrBasedElement = (elem) => {
  if (isNestedElement(elem)) {
    return convertElementToNestedElastic(elem);
  }
  return convertElementToElastic(elem);
}

export const convertElementToElastic = (elem) => {
  if(elem.element && elem.element.operator) {
    const element = elem.element;
    switch (element.operator) {
      case '==':
      case '=':
        return {
          term: {
            [element.category]: element.value
          }
        };

      case 'contains':
        return {
          regexp: {
            [element.category]: `.*${element.value}.*`
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

      case '<=':
        return {
          range: {
            [element.category]: {
              lte: element.value
            }
          }
        };

      case '>=':
        return {
          range: {
            [element.category]: {
              gte: element.value
            }
          }
        };

      case '<':
        return {
          range: {
            [element.category]: {
              lt: element.value
            }
          }
        };

      case '>':
        return {
          range: {
            [element.category]: {
              gt: element.value
            }
          }
        };

      default:
        break;

    }
  }

  return elem;
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
            if((pop.operator && pop.operator === 'OR') || pop.bracket ) {
              stack.push(pop);  
            } else {
              postfix.push(pop);
            }
            break;

          default: // (for `OR` operator)
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

    } else if(elem.bracket === ')') {
      // POP elements from stack while element is not '('
      pop = stack.pop();

      while(pop && (!pop.bracket || pop.bracket !== '(')) {
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

  if (postfix.length === 1) {
    const elem = postfix[0]
    return {
      'bool': {
        'must': [
          getOrBasedElement(elem)
        ]
      }
    };
  }

  let nestedObjects = {};

  postfix.forEach(elem => {
    if (elem.element) {
      stack.push(elem);
    } else {

      const elem1 = stack.pop(),
        elem2 = stack.pop(),
        operator = elem.operator.toUpperCase() === 'AND' ? 'must' : 'should',
        expressions = [];

      if (operator === 'must') {
        // If AND then then all the nested members must be grouped together.
        if (isNestedElement(elem1)) {
          // Creating the nested template
          const template = checkAndCreateNestedTemplate(nestedObjects, elem1);
          if(template) {
            expressions.push(template)
          }

          // Pushing the element to template.
          addToExistingNestedPath(nestedObjects, elem1);
        } else {
          // Directly create the mapping in case of "Non Nested Element"
          expressions.push(convertElementToElastic(elem1))
        }

        if (isNestedElement(elem2)) {
          const template = checkAndCreateNestedTemplate(nestedObjects, elem2);
          if(template) {
            expressions.push(template)
          }

          addToExistingNestedPath(nestedObjects, elem2);
        } else {
          expressions.push(convertElementToElastic(elem2))
        }
      } else {
        // Reset the Nested Objects in case of "OR" and will push the elements again
        nestedObjects = {};
        expressions.push(getOrBasedElement(elem1));
        expressions.push(getOrBasedElement(elem2));
      }

      if (expressions.length) {
        stack.push({
          bool: {
            [operator]: [...expressions]
          }
        })
      }
    }
  });

  return stack[0];
}

export default (expressions) => {
    const postfix = convertToPosfix(expressions);
    return evaluateToElastic(postfix);
}
