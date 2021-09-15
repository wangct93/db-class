

const babel = require('@wangct/babel');

babel({
  src: 'es',
  output: 'lib',
  success() {
    console.log(`success，用时：${+new Date() - t}ms`);
  }
});
