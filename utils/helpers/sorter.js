/**
 * To sort array of objects by provided column and sorting order
 */

export default ({
    column,
    order,
    sequence = null
  }) => {

    return (a, b) => {
    let sortOrder = `${sequence ? 'SEQ' : ''}${order || 'ASC'}`
    
    const operations = {
      'ASC': () => +(a[column] > b[column]),
      'DESC': () => +(a[column] < b[column]),
      'SEQASC': () => {
        if(sequence.indexOf(a[column]) >= 0 && sequence.indexOf(b[column]) >= 0) {
          return sequence.indexOf(a[column]) - sequence.indexOf(b[column]);
        }

        if(sequence.indexOf(a[column]) >= 0) {
          return -1;
        }

        if(sequence.indexOf(b[column]) >= 0) {
          return 1;
        }

        return +(a[column] > b[column]);
      },
      'SEQDESC': () => {
        if(sequence.indexOf(a[column]) >= 0 && sequence.indexOf(b[column]) >= 0) {
          return sequence.indexOf(a[column]) - sequence.indexOf(b[column]);
        }

        if(sequence.indexOf(a[column]) >= 0) {
          return -1;
        }

        if(sequence.indexOf(b[column]) >= 0) {
          return 1;
        }

        return +(a[column] < b[column]);
      }
    }

    return a[column] === b[column]
      ? 0
      : operations[sortOrder]() || -1
  }
}
