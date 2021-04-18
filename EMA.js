const getEMA = (arr, options) => {
  if (!Array.isArray(arr)) throw new TypeError("expected an array");
  if (typeof options === "number") options = { range: options };

  let defaults = { range: Math.round(arr.length / 2), format: toFixed };
  let opts = { ...defaults, ...options };
  let range = opts.range;

  if (arr.length < range) throw new RangeError("expected range to be greater than array length");

  let c = smooth(range);
  let num = avg(arr.slice(0, range), opts);
  let acc = [opts.format(num)];
  for (let i = range; i < arr.length; i++) {
    num = c * Number(arr[i]) + (1 - c) * num;
    acc.push(opts.format(num));
  }
  return acc;
};

function avg(arr) {
  let len = arr.length,
    i = -1;
  let num = 0;
  while (++i < len) num += Number(arr[i]);
  return num / len;
}

function smooth(n) {
  return 2 / (n + 1);
}

function toFixed(n) {
  return n.toFixed(2);
}
