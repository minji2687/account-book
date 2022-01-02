export function addDotToAmount(number) {
  let str = number.toString();
  let arr = [];
  let n = 0;

  for (let i = str.length - 1; i >= 0; i--) {
    if (n !== 0 && n % 3 === 0) {
      arr.unshift(",");
    }
    arr.unshift(str[i]);
    n += 1;
  }
  return arr.join("");
}

export function randomRGB() {
  const randomBetween = (min, max) =>
    min + Math.floor(Math.random() * (max - min + 1));
  const r = randomBetween(0, 255);
  const g = randomBetween(0, 255);
  const b = randomBetween(0, 255);
  const rgb = `rgb(${r},${g},${b})`;
  return rgb;
}
