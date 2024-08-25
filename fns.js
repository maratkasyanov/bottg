function getRandomNumber(min, max) {
  // Убедимся, что min и max — целые числа
  min = Math.ceil(min);
  max = Math.floor(max);
  // Возвращаем случайное число в диапазоне [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = getRandomNumber;