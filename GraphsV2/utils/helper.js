export const sortAscendingOnKey = (array, key) => {
  return array.sort(function (first, second) {
      var x = first[key]; var y = second[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}
